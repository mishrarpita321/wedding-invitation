import type { RsvpPayload } from '../data/rsvp';

let pending: { key: string; id: string } | undefined;

export async function submitRsvp(payload: RsvpPayload): Promise<void> {
  const url = import.meta.env.VITE_RSVP_SCRIPT_URL;
  if (!url) throw new Error('Missing VITE_RSVP_SCRIPT_URL');
  const branch = import.meta.env.VITE_RSVP_BRANCH;
  if (!['main', 'bride', 'groom'].includes(branch)) throw new Error('Invalid RSVP branch');
  const key = JSON.stringify({ branch, ...payload });
  if (pending?.key !== key) pending = { key, id: crypto.randomUUID() };
  const response = await fetch(url, {
    method: 'POST',
    // Avoid a CORS preflight, which Apps Script does not support.
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ ...payload, branch, submissionId: pending.id }),
    signal: AbortSignal.timeout(30000),
    credentials: 'omit',
    redirect: 'follow',
  });
  if (!response.ok || (await response.json()).ok !== true) throw new Error('RSVP was not saved');
  pending = undefined;
}
