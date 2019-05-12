/**
 * Router
 *
 * MVC type route generator
 */

/* Node modules */

/* Third-party modules */
import bunyan from 'bunyan';
import express from 'express';
import { Express } from 'express-serve-static-core';
import { sync as glob } from 'glob';

/* Files */

interface IController {
  handler?: express.RequestHandler | express.RequestHandler[];
  method: string;
  url: string;
}

/**
 * Error Handler
 *
 * Converts a promise error for handling by the
 * express uncaught exception
 *
 * @param {express.RequestHandler | express.RequestHandler[]} handlers
 * @returns {express.RequestHandler[]}
 */
function errorHandler(
  handlers : express.RequestHandler | express.RequestHandler[],
) : express.RequestHandler[] {

  const fn : express.RequestHandler[] = Array.isArray(handlers) ? handlers : [handlers];

  return fn.map(item => async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      await item(req, res, next);
    } catch (err) {
      next(err);
    }
  });
}

function middlewareParser(
  handler: express.RequestHandler[],
  middleware: express.RequestHandler | express.RequestHandler[],
) {
  const arr : express.RequestHandler[] = [];
  if (Array.isArray(middleware)) {
    arr.push(...middleware);
  } else {
    arr.push(middleware);
  }

  handler.push(...arr);
}

function parseController(
  app: any,
  name: string,
  prefix: string,
  key: string,
) : IController | undefined {
  if (['name', 'prefix', 'before', 'after'].includes(key)) {
    return;
  }

  let method: string;
  let url : string = '/';
  if (prefix) {
    url += prefix;
  }
  url += `/${name}`;

  switch (key) {
    /* Show all the items */
    case 'list':
      method = 'get';
      break;

    /* Shows a single item */
    case 'item':
      method = 'get';
      url += '/:id';
      break;

    /* Creates a new item */
    case 'create':
      method = 'post';
      break;

    /* Updates an existing item */
    case 'update':
      method = 'put';
      url += '/:id';
      break;

    /* Deletes an item */
    case 'delete':
    case 'del':
      method = 'delete';
      url += '/:id';
      break;

    default:
      throw new Error(`Unrecognised route: ${name}.${key}`);
  }

  const cleanUrl : string = url.replace(/\/+/g, '/');

  return {
    method,
    url: cleanUrl,
  };
}

export default (parent: Express, dir: string, logger: bunyan | undefined = undefined) => {
  const app : any = express();

  app.set('x-powered-by', null);

  const routes : IController[] = glob(`${dir}/**/*.*`)
    .reduce(
      (result: IController[], file: string) : IController[] => {
        const controller = require(file);

        const name = file.replace(dir, '')
          .replace(/^\//, '')
          .replace(/\..+$/, '')
          .replace(/\/index$/, '');

        const { endpoints } = controller;

        if (Array.isArray(endpoints)) {
          endpoints.forEach((endpoint) => {
            const handler: express.RequestHandler[] = [];

            if (controller.before) { middlewareParser(handler, errorHandler(controller.before)); }
            handler.push(...errorHandler(endpoint.handler));
            if (controller.after) { middlewareParser(handler, errorHandler(controller.after)); }

            const method = endpoint.method.toLowerCase();
            const url = `/${name}${endpoint.url || ''}`;

            routes.push({
              method,
              url,
            });

            app[method](url, handler);
          });

          delete controller.endpoints;
        }

        Object.keys(controller)
          .forEach((key) => {
            const handler : express.RequestHandler[] = [];

            const obj = parseController(
              app,
              controller.name || name,
              controller.prefix,
              key,
            );

            if (obj) {
              if (controller.before) { middlewareParser(handler, errorHandler(controller.before)); }
              handler.push(...errorHandler(controller[key]));
              if (controller.after) { middlewareParser(handler, errorHandler(controller.after)); }

              obj.handler = handler;

              result.push(obj);
            }
          });

        return result;
      },
      [],
    )
    .sort((a: IController, b: IController) => {
      const hasEndVariable = (str: string) : boolean => /^:/.test(str.split('/').pop()!);

      if (hasEndVariable(a.url)) {
        return 1;
      }

      if (hasEndVariable(b.url)) {
        return -1;
      }

      return 0;
    });

  /* Add a ping/pong at the end - if it's defined by a route, this is ignored */
  routes.push({
    handler: (req: express.Request, res: express.Response) => {
      res.send('pong');
    },
    method: 'get',
    url: '/ping',
  });

  /* Apply the routes to express */
  routes.forEach(({ handler, method, url }) => {
    app[method](url, handler);
  });

  if (!logger) {
    console.log('--- Routes ---');
    routes.forEach((route) => {
      console.log(`${route.method.toUpperCase()}:${route.url}`);
    });
    console.log('--------------');
  } else {
    logger.info('Routes', routes.map(({ url, method }) => ({
      url,
      method,
    })));
  }

  parent.use(app);
};
