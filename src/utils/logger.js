/**
 * Centralized logger. Debug messages appear only when NODE_ENV is not
 * 'production' or when the DEBUG environment variable is set to 'true'.
 *
 * Usage:
 *   import * as logger from './utils/logger.js';
 *   logger.info('hello');
 *   logger.debug('details'); // shown only in debug mode
 */
const isDebug = process.env.DEBUG === 'true' || process.env.NODE_ENV !== 'production';

export function debug(...args) {
  if (isDebug) {
    console.debug(...args);
  }
}

export function info(...args) {
  console.info(...args);
}

export function warn(...args) {
  console.warn(...args);
}

export function error(...args) {
  console.error(...args);
}

export default { debug, info, warn, error };
