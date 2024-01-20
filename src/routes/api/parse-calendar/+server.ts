import OpenAI from "openai";
import { json, error } from '@sveltejs/kit';
import { RetryAfterRateLimiter } from 'sveltekit-rate-limiter/server';


const limiter = new RetryAfterRateLimiter({
  IP: [1, '15s'],
  IPUA: [1, '15s']
});

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
});

/** @type {import('./$types').RequestHandler} */
export async function POST(event) {
  const request = event.request;
  const status = await limiter.check(event);

  if (status.limited) {
    event.setHeaders({
      'Retry-After': status.retryAfter.toString()
    });
    return error(429);
  }

  const { image } = await request.json();

  const chatCompletion = await openai.chat.completions.create({
    messages: [{
      role: "user",
      content: [
        {
          type: "text",
          text: `output the date or day of week, start time, and end time in military time of all of the events on my calendar in the example JSON format below. do not list the all-day events.
                [
                {
                "date": "05/10/2024",
                "start": "12:00",
                "end": "21:00"
                },
                {
                "date/day": "05/33/2024",
                "start": "05:00",
                "end": "15:00"
                }
                ]`
        },
        {
          type: "image_url",
          image_url: {
            url: `data:image/jpeg;base64,${image}`
          }
        }
      ]
    }],
    model: "gpt-4-vision-preview",
    max_tokens: 4096
  });

  const messageContent = chatCompletion.choices[0].message.content || '';

  console.log(messageContent)

  const startIndex = messageContent.indexOf('[');
  const endIndex = messageContent.lastIndexOf(']') + 1; // +1 to include the closing bracket

  if (startIndex === -1 || endIndex === -1 || startIndex >= endIndex) {
    return error(500);
  }

  const jsonString = messageContent.substring(startIndex, endIndex);

  try {
    const jsonData = JSON.parse(jsonString);
    return json(jsonData);
  } catch (e) {
    return error(500);
  }
}