import type { RsvpPayload } from '../data/rsvp';

// Set to 1 locally to fail the first submission; Try Again then succeeds.
// Failures are disabled in production builds. Reload to restart the counter.
const MOCK_FAILURES = 0;
let failuresRemaining = import.meta.env.DEV ? MOCK_FAILURES : 0;

// TODO: Replace mock RSVP submission with production persistence API.
// The typed payload is intentionally neither stored, sent nor logged.
export async function submitRsvp(_payload: RsvpPayload): Promise<void> {
  await new Promise<void>(resolve => window.setTimeout(resolve, 850));
  if (failuresRemaining > 0) {
    failuresRemaining--;
    throw new Error('Simulated RSVP submission failure');
  }
}
