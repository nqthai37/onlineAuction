import expressHandlebarsSections from 'express-handlebars-sections';
import {
  formatDate,
  formatOnlyDate,
  formatOnlyTime,
  formatDateInput,
  timeRemainingHHMMSS,
  formatTimeRemaining,
  shouldShowRelativeTime,
} from './time-utils.js';

/**
 * Tất cả Handlebars Helpers được tập trung tại đây
 * Giúp tách biệt logic khỏi file index.js
 */
export const helpersFunctions = {
  section: expressHandlebarsSections(),

  // boolean helpers
  eq(a, b) { return a === b; },



  format_number(price) {
    return new Intl.NumberFormat('en-US').format(price);
  },

  mask_name(fullname) {
    if (!fullname) return null;
    const name = fullname.trim();
    if (name.length === 0) return null;
    // replace every odd index character with *
    return name.replace(/.(?=.)/g, (ch, offset) => (offset % 2 === 1 ? '*' : ch));
  },

  truncate(str, len) {
    if (!str) return '';
    if (str.length <= len) return str;
    return str.substring(0, len) + '...';
  },

  // date/time helpers delegating to utility functions
  format_date: formatDate,
  format_only_date: formatOnlyDate,
  format_only_time: formatOnlyTime,
  format_date_input: formatDateInput,
  time_remaining: timeRemainingHHMMSS,
  format_time_remaining: formatTimeRemaining,
  should_show_relative_time: shouldShowRelativeTime,

  getPaginationRange(currentPage, totalPages) {
    const range = [];
    const maxVisible = 4;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) range.push({ number: i, type: 'number' });
    } else {
      range.push({ number: 1, type: 'number' });
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      if (start > 2) range.push({ type: 'ellipsis' });
      for (let i = start; i <= end; i++) range.push({ number: i, type: 'number' });
      if (end < totalPages - 1) range.push({ type: 'ellipsis' });
      range.push({ number: totalPages, type: 'number' });
    }
    return range;
  },

  replace(str, search, replaceWith) {
    if (!str) return '';
    return str.replace(new RegExp(search, 'g'), replaceWith);
  },

  range(start, end) {
    const result = [];
    for (let i = start; i < end; i++) {
      result.push(i);
    }
    return result;
  },

  round(value, decimals) {
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
  },

  length(arr) {
    return Array.isArray(arr) ? arr.length : 0;
  },
};
