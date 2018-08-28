/**
 * logger
 */

/* Node modules */

/* Third-party modules */
import bunyan from 'bunyan';

/* Files */

const allowedLevels = [
  'trace',
  'debug',
  'info',
  'warn',
  'error',
  'fatal',
];

export default (name: string, level: string | number) => {
  if (typeof level === 'string' && !allowedLevels.includes(level)) {
    throw new Error(`Invalid log level: ${level}`);
  }

  return bunyan.createLogger({
    name,
    level: <bunyan.LogLevel> level,
    serializers: bunyan.stdSerializers,
  });
};
