import { events, type EventId } from './wedding.ts';

export const rsvpConfig = { maxAttendees: 20, maxNameLength: 120 };
export const rsvpEvents = events.map(({ id, rsvpLabel }) => ({ id, label: rsvpLabel }));
export type AttendanceStatus = 'attending' | 'declined';
export type EventSelection = Record<EventId, boolean>;
export interface RsvpPayload {
  name: string;
  guestCount: number;
  status: AttendanceStatus;
  events: EventSelection;
}
export interface RsvpErrors { name?: string; events?: string; guestCount?: string }

export function selectEvents(selected = false): EventSelection {
  // The shared Apps Script requires every event key, even on invitations that hide one.
  return { engagement: false, mehendi: false, haldi: false, wedding: false, reception: false,
    ...Object.fromEntries(rsvpEvents.map(event => [event.id, selected])) };
}

export function validateRsvp(value: Pick<RsvpPayload, 'name' | 'guestCount' | 'status' | 'events'>): RsvpErrors {
  const errors: RsvpErrors = {};
  if (!value.name.trim()) errors.name = 'Please tell us your name.';
  else if (value.name.trim().length > rsvpConfig.maxNameLength) errors.name = 'Please use a shorter name.';
  if (value.status === 'attending') {
    if (!Number.isInteger(value.guestCount) || value.guestCount < 1 || value.guestCount > rsvpConfig.maxAttendees)
      errors.guestCount = `Please choose between 1 and ${rsvpConfig.maxAttendees} people.`;
    if (!rsvpEvents.some(event => value.events[event.id])) errors.events = 'Choose at least one celebration you’ll be joining.';
  }
  return errors;
}

export function createRsvpPayload(form: RsvpPayload): RsvpPayload {
  return { ...form, name: form.name.trim(), guestCount: form.status === 'declined' ? 0 : form.guestCount,
    events: form.status === 'declined' ? selectEvents() : { ...form.events } };
}
