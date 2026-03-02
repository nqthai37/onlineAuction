import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration.js';

// enable duration plugin for interval formatting
dayjs.extend(duration);

/**
 * Parse a date string or object and return a Dayjs instance or null if invalid.
 * @param {*} date
 * @returns {dayjs.Dayjs|null}
 */
export function parseValidDate(date) {
  if (!date) return null;
  const d = dayjs(date);
  return d.isValid() ? d : null;
}

export function formatDate(date) {
  const d = parseValidDate(date);
  if (!d) return '';
  return d.format('HH:mm:ss DD/MM/YYYY');
}

export function formatOnlyDate(date) {
  const d = parseValidDate(date);
  if (!d) return '';
  return d.format('DD/MM/YYYY');
}

export function formatOnlyTime(date) {
  const d = parseValidDate(date);
  if (!d) return '';
  return d.format('HH:mm:ss');
}

export function formatDateInput(date) {
  const d = parseValidDate(date);
  if (!d) return '';
  return d.format('YYYY-MM-DD');
}

/**
 * Returns remaining time in milliseconds between now and target date.
 * If the date is in the past or invalid, returns 0.
 */
export function diffToNow(date) {
  const d = parseValidDate(date);
  if (!d) return 0;
  const diff = d.diff(dayjs());
  return diff > 0 ? diff : 0;
}

/**
 * Helper to format a millisecond duration as HH:MM:SS
 */
export function formatDurationHHMMSS(ms) {
  const dur = dayjs.duration(ms);
  const hours = String(Math.floor(dur.asHours())).padStart(2, '0');
  const minutes = String(dur.minutes()).padStart(2, '0');
  const seconds = String(dur.seconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

export function timeRemainingHHMMSS(date) {
  const ms = diffToNow(date);
  if (ms === 0) return '00:00:00';
  return formatDurationHHMMSS(ms);
}

/**
 * Natural language remaining time, similar to the previous helper
 */
export function formatTimeRemaining(date) {
  const ms = diffToNow(date);
  if (ms === 0) return 'Auction Ended';

  const d = parseValidDate(date);
  // days difference (integer)
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));

  if (days > 3) {
    return d.format('HH:mm:ss DD/MM/YYYY');
  }
  if (days >= 1) {
    return `${days} days left`;
  }
  const hours = Math.floor(ms / (1000 * 60 * 60));
  if (hours >= 1) {
    return `${hours} hours left`;
  }
  const minutes = Math.floor(ms / (1000 * 60));
  if (minutes >= 1) {
    return `${minutes} minutes left`;
  }
  const seconds = Math.floor(ms / 1000);
  return `${seconds} seconds left`;
}

export function shouldShowRelativeTime(date) {
  const ms = diffToNow(date);
  if (ms === 0) return true;
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  return days <= 3;
}
