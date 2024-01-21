export interface EventSummary { name: string; id: string }
interface PastEvents {
  created: EventSummary[];
  responded: EventSummary[];
}

export function getPastEvents() {
  let pastEventsString = globalThis?.localStorage?.getItem?.("pastEvents");

  let pastEvents: PastEvents;

  if (!pastEventsString) {
    pastEvents = {
      created: [],
      responded: [],
    };
  } else {
    pastEvents = JSON.parse(pastEventsString);
  }
  return pastEvents;
}
