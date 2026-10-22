import { useRef, useState, type FormEvent } from 'react';
import Dialog from '@mui/material/Dialog';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { createRsvpPayload, rsvpConfig, rsvpEvents, selectEvents, validateRsvp, type AttendanceStatus, type RsvpErrors } from '../../data/rsvp';
import type { EventId } from '../../data/wedding';
import { wedding } from '../../data/wedding';
import { submitRsvp } from '../../utils/rsvp';
import { pressFeedback } from '../../utils/press';
import { Lotus } from '../shared/Ornaments';
import './rsvp.css';

export default function RsvpDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const reduced = useReducedMotion();
  const [name, setName] = useState('');
  const [guestCount, setGuestCount] = useState(1);
  const [selected, setSelected] = useState(selectEvents);
  const [status, setStatus] = useState<AttendanceStatus>('attending');
  const [attempted, setAttempted] = useState(false);
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const [success, setSuccess] = useState(false);
  const lock = useRef(false);
  const nameInput = useRef<HTMLInputElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const eventsHeading = useRef<HTMLLegendElement>(null);
  const confirmation = useRef<HTMLHeadingElement>(null);
  const form = { name, guestCount, status, events: selected };
  const errors: RsvpErrors = attempted ? validateRsvp(form) : {};
  const feedback = { whileHover: reduced ? undefined : { y: -1 }, whileTap: pressFeedback(reduced, 0.98) };
  // Selection colors come from aria-pressed; avoid an inline press color overriding a new selection.
  const selectionFeedback = { whileHover: reduced ? undefined : { y: -1 },
    whileTap: { scale: reduced ? 1 : 0.98, y: reduced ? 0 : 1, transition: { duration: reduced ? 0 : 0.12 } } };

  function close() {
    if (lock.current) return;
    onClose();
  }

  function resetAfterClose() {
    setName(''); setGuestCount(1); setSelected(selectEvents()); setStatus('attending');
    setAttempted(false); setFailed(false); setSuccess(false); setSending(false);
  }

  function toggleEvent(id: EventId) {
    setStatus('attending');
    setSelected(current => ({ ...current, [id]: !current[id] }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (lock.current || success) return;
    setAttempted(true);
    const validation = validateRsvp(form);
    if (Object.keys(validation).length) {
      if (validation.name) nameInput.current?.focus();
      else eventsHeading.current?.focus();
      return;
    }
    lock.current = true;
    setSending(true); setFailed(false);
    try {
      await submitRsvp(createRsvpPayload(form));
      setSuccess(true);
    } catch {
      setFailed(true);
    } finally {
      lock.current = false;
      setSending(false);
    }
  }

  return (
    <Dialog open={open} onClose={(_event, reason) => { if (reason === 'escapeKeyDown') close(); }}
      transitionDuration={reduced ? 0 : 225}
      disableEscapeKeyDown={sending} aria-labelledby="rsvp-dialog-title" aria-describedby="rsvp-dialog-intro"
      PaperProps={{ className: 'rsvp-dialog-paper' }} TransitionProps={{ onEntered: () => closeButton.current?.focus(), onExited: resetAfterClose }}>
      <motion.div className="rsvp-dialog-inner" initial={reduced ? false : { opacity: 0, scale: 0.97, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: reduced ? 0 : 0.25, ease: 'easeOut' }}>
        <button ref={closeButton} type="button" className="rsvp-close" aria-label="Close RSVP" onClick={close} disabled={sending}>×</button>
        <AnimatePresence mode="wait" initial={false}>
          {success ? (
            <motion.div key="confirmation" className="rsvp-confirmation"
              initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduced ? 0 : 0.35 }} onAnimationComplete={() => confirmation.current?.focus()}>
              <div className="rsvp-success-ornament" aria-hidden="true">
                <Lotus />
                {status === 'attending' && !reduced && <div className="rsvp-sparkles">
                  {[-60, -35, 0, 35, 60].map((x, index) => <motion.span key={x}
                    initial={{ opacity: 0, x: 0, y: 12, scale: 0.5 }}
                    animate={{ opacity: [0, 0.8, 0], x, y: [-4, -35 - index % 2 * 12], scale: [0.5, 1, 0.6] }}
                    transition={{ duration: 1.5, delay: index * 0.07, ease: 'easeOut' }}>✦</motion.span>)}
                </div>}
              </div>
              <h2 id="rsvp-dialog-title" ref={confirmation} tabIndex={-1}>{status === 'attending' ? 'RSVP received' : 'Response received'}</h2>
              <p id="rsvp-dialog-intro" style={{marginBottom: "20px"}}>{status === 'attending' ? 'Looking forward to celebrating with you.' : <>Thank you for letting us know.<br />You’ll be missed.</>}</p>
              {/* <p className="rsvp-signature">{wedding.bride.firstName} & {wedding.groom.firstName}</p> */}
              <motion.button type="button" className="invitation-action invitation-action-primary cta-polish" onClick={close} {...feedback}>Done</motion.button>
            </motion.div>
          ) : (
            <motion.form key="form" className="rsvp-form" onSubmit={submit} noValidate
              exit={reduced ? undefined : { opacity: 0, y: -6 }} transition={{ duration: reduced ? 0 : 0.18 }} aria-busy={sending}>
              <header className="rsvp-header"><Lotus /><h2 id="rsvp-dialog-title">RSVP</h2>
                <p id="rsvp-dialog-intro">Let us save a place for you.</p></header>
              <fieldset className="rsvp-fields" disabled={sending}>
                <div className="rsvp-name-field">
                  <label htmlFor="rsvp-name">Your name</label>
                  <input id="rsvp-name" ref={nameInput} value={name} onChange={event => setName(event.target.value)}
                    placeholder="Enter your name" autoComplete="name" required maxLength={rsvpConfig.maxNameLength}
                    aria-invalid={!!errors.name} aria-describedby={errors.name ? 'rsvp-name-error' : undefined} />
                  {errors.name && <p className="rsvp-error" id="rsvp-name-error">{errors.name}</p>}
                </div>
                <div className={`rsvp-count ${status === 'declined' ? 'is-irrelevant' : ''}`}>
                  <p id="rsvp-count-label">Number attending, including you</p>
                  <div className="rsvp-stepper" role="group" aria-labelledby="rsvp-count-label">
                    <motion.button type="button" aria-label="Decrease number attending" disabled={status === 'declined' || guestCount <= 1}
                      onClick={() => setGuestCount(count => Math.max(1, count - 1))} {...selectionFeedback}>−</motion.button>
                    <output aria-live="polite" aria-atomic="true" aria-label="Number attending">
                      <motion.span key={status === 'declined' ? 0 : guestCount} initial={reduced ? false : { opacity: 0.5, scale: 0.94 }}
                        animate={{ opacity: 1, scale: 1 }} transition={{ duration: reduced ? 0 : 0.15 }}>{status === 'declined' ? '—' : guestCount}</motion.span>
                    </output>
                    <motion.button type="button" aria-label="Increase number attending" disabled={status === 'declined' || guestCount >= rsvpConfig.maxAttendees}
                      onClick={() => setGuestCount(count => Math.min(rsvpConfig.maxAttendees, count + 1))} {...selectionFeedback}>+</motion.button>
                  </div>
                  {errors.guestCount && <p className="rsvp-error">{errors.guestCount}</p>}
                </div>
                <fieldset className="rsvp-celebrations" aria-describedby={errors.events ? 'rsvp-events-error' : undefined}>
                  <legend ref={eventsHeading} tabIndex={-1}>Which celebrations will you join?</legend>
                  <div className="rsvp-selection-tools">
                    <button type="button" onClick={() => { setSelected(selectEvents(true)); setStatus('attending'); }}>Select all</button>
                    <button type="button" onClick={() => setSelected(selectEvents())}>Clear</button>
                  </div>
                  <div className="rsvp-event-grid">
                    {rsvpEvents.map(event => <motion.button key={event.id} type="button" className="rsvp-event"
                      aria-pressed={selected[event.id]} onClick={() => toggleEvent(event.id)} {...selectionFeedback}>
                      <span className="rsvp-check" aria-hidden="true"><motion.span animate={{ opacity: selected[event.id] ? 1 : 0, scale: selected[event.id] ? 1 : 0.8 }}
                        transition={{ duration: reduced ? 0 : 0.16 }}>✓</motion.span></span>{event.label}
                    </motion.button>)}
                  </div>
                  {errors.events && <p className="rsvp-error" id="rsvp-events-error">{errors.events}</p>}
                </fieldset>
                <motion.button type="button" className="rsvp-decline" aria-pressed={status === 'declined'}
                  onClick={() => { setStatus(current => current === 'declined' ? 'attending' : 'declined'); setSelected(selectEvents()); }} {...selectionFeedback}>
                  {status === 'declined' && <span aria-hidden="true">✓ </span>}Can’t make it this time
                </motion.button>
              </fieldset>
              {failed && <p className="rsvp-error rsvp-send-error" role="alert">We couldn’t send your RSVP just yet. Please try again.</p>}
              <div className="rsvp-form-actions">
                <motion.button className="invitation-action invitation-action-primary cta-polish" type="submit" disabled={sending}
                  {...feedback}>{sending ? <><span className="rsvp-loader" aria-hidden="true" />Sending…</> : failed ? 'Try Again' : status === 'declined' ? 'Send Response' : 'Send RSVP'}</motion.button>
                <button className="rsvp-cancel" type="button" onClick={close} disabled={sending}>Cancel</button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </Dialog>
  );
}
