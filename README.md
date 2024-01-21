# MeetAsOne

[MeetAsOne](https://www.meetas.one) is a meeting availability polling app.

It is built with [SvelteKit](https://kit.svelte.dev/), [Nhost](https://nhost.io/), [Flowbite Svelte](https://flowbite-svelte.com), [Houdini](https://houdinigraphql.com), and [GPT4 Vision](https://platform.openai.com/docs/guides/vision).

## How it works

1. Create an event (no account required)
2. Add your availability manually or by importing an image of your calendar
3. Share the event URL with the people you need to meet 
4. People fill in their own availability
5. Determine the best time to meet on the event page

## Features

* Import an image of your calendar to automatically fill in your availability
* Saves your availability in your browser for future events

## Developing

1. Install dependencies with `npm install` (or `pnpm install` or `yarn`)
2. Copy `sample.env.local` to `.env.local` and fill out the environment variables
3. Start a development server with `npm run dev`

If you are recreating the server, make sure to run this to ensure upsertion works correctly ([source](https://github.com/hasura/graphql-engine/issues/3981))
```sql
ALTER TABLE availability ADD CONSTRAINT unique_event_username UNIQUE (event_id, username);
```

## Building

To create a production version of the app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

## Deploying

[Vercel works](https://vercel.com) works great. 

Otherwise, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.
