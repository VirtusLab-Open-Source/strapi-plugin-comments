/*
 *
 * SanitizeHTML
 *
 */

// @ts-nocheck
import sanitizeHtml from 'sanitize-html';

// Options for the lib can be found here https://www.npmjs.com/package/sanitize-html
const defaultOptions = {
  ...sanitizeHtml.defaults,
  allowedTags: false,
  allowedAttributes: {
    '*': ['href', 'align', 'alt', 'center', 'width', 'height', 'type', 'controls', 'target'],
    img: ['src', 'alt'],
    source: ['src', 'type'],
  },
};

const clean = (dirty, options = defaultOptions) => sanitizeHtml(dirty, options);

export default clean;
