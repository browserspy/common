/**
 * logger
 */

/* Node modules */

/* Third-party modules */
import pino, { LoggerOptions } from 'pino';

/* Files */

const allowedLevels = [
  'trace',
  'debug',
  'info',
  'warn',
  'error',
  'fatal',
];

const factory = (logger: any, level: string) : ILoggerFn =>
  (msg: string, obj: IKeyValue<any> = {}, ...args: any[]) : void => {
    /* Object present - put msg second */
    logger[level](obj, msg, ...args);
  };

export {
  pino,
};

export interface IKeyValue<V> {
  [key: string]: V;
}

export interface ILoggerFn {
  (msg: string, obj?: IKeyValue<any>, ...args: any[]) : void;
}

export interface ILogger {
  fatal: ILoggerFn;
  error: ILoggerFn;
  warn: ILoggerFn;
  info: ILoggerFn;
  debug: ILoggerFn;
  trace: ILoggerFn;
}

export default (name: string, level: string, opts: LoggerOptions = {}) : ILogger => {
  if (!allowedLevels.includes(level)) {
    throw new Error(`Invalid log level: ${level}`);
  }

  opts.name = name;
  opts.level = level;
  if (!opts.serializers) { opts.serializers = pino.stdSerializers; }

  const logger = pino(opts);

  return {
    fatal: factory(logger, 'fatal'),
    error: factory(logger, 'error'),
    warn: factory(logger, 'warn'),
    info: factory(logger, 'info'),
    debug: factory(logger, 'debug'),
    trace: factory(logger, 'trace'),
  };
};
