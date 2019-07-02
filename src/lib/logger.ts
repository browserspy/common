/**
 * logger
 */

/* Node modules */

/* Third-party modules */
import express from 'express';
import pino, { LoggerOptions } from 'pino';
import uuid from 'uuid';

/* Files */
import hooks from './hooks';

const allowedLevels = [
  'trace',
  'debug',
  'info',
  'warn',
  'error',
  'fatal',
];

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

export const logIdKey = 'logId';

/**
 * Get Log ID
 *
 * Gets the log id stored in the hooks
 */
export const getLogId = () : string | null => hooks.get<string>(logIdKey);

const factory = (logger: any, level: string) : ILoggerFn =>
  (msg: string, obj: IKeyValue<any> = {}, ...args: any[]) : void => {
    /* Object present - put msg second */
    const logId = getLogId();

    if (logId) {
      obj.logId = logId;
    }

    logger[level](obj, msg, ...args);
  };

export const generateLogId = (logger: ILogger | undefined) => (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) : void => {
  const priority : (string | undefined)[] = [
    req.get('x-correlation-id'),
    req.get('x-log-id'),
  ];

  const incomingLogId = priority.find(fn => !!fn);

  if (incomingLogId && logger) {
    logger.debug('Log ID set via headers', {
      logId: incomingLogId,
    });
  }

  const logId = incomingLogId ? incomingLogId : uuid.v4();

  if (logger) {
    logger.debug('Log ID set to namespace', {
      logId,
      logIdKey,
    });
  }

  hooks.set<string>(logIdKey, logId);

  next();
};

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
