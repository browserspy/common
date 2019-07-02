/**
 * index
 */

/* Node modules */

/* Third-party modules */

/* Files */
import hooks from './lib/hooks';
import logger, { pino }  from './lib/logger';
import router from './lib/router';

export = {
  hooks,
  pino,
  logger,
  router,
};
