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

const MAX_HISTORY = 4;

export function savePastEvents(events: PastEvents) {
  if (events.responded.length > MAX_HISTORY)
    events.responded.shift()
  if (events.created.length > MAX_HISTORY)
    events.created.shift()
  globalThis?.localStorage?.setItem("pastEvents", JSON.stringify(events));
}

export function getOrSetName(): string | undefined {
  if (localStorage?.name)
    return localStorage.name;
  const newName = prompt("What is your name + last initial?");
  if (!newName) {
    alert("You need a username to save your availability");
    return;
  }
  return (localStorage.name = newName);
}
