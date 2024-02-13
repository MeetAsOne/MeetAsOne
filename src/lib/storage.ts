export interface EventSummary {
  name: string,
  id: string,
  imOwner: boolean,
  myName?: string,
}

export function getPastEvents() {
  let pastEventsString = globalThis?.localStorage?.getItem?.("pastEvents");

  let pastEvents: EventSummary[];

  if (!pastEventsString) {
    pastEvents = [];
  } else {
    pastEvents = JSON.parse(pastEventsString);
  }
  return pastEvents;
}

const MAX_HISTORY = 6;

export function savePastEvents(events: EventSummary[]) {
  // Only keep the first `MAX_HISTORY` of each created and responded events
  const created = events.filter(event => event.imOwner).slice(0, MAX_HISTORY);
  const responded = events.filter(event => !event.imOwner).slice(0, MAX_HISTORY);

  events = created.concat(responded);
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
