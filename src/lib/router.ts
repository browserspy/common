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
  method: string;
  url: string;
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

  const routes : IController[] = [];

  glob(`${dir}/**/*.*`)
    .forEach((file) => {
      const controller = require(file);

      const name = file.replace(dir, '')
        .replace(/^\//, '')
        .replace(/\..+$/, '')
        .replace(/\/index$/, '');

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
            if (controller.before) { middlewareParser(handler, controller.before); }
            handler.push(controller[key]);
            if (controller.after) { middlewareParser(handler, controller.after); }

            routes.push(obj);

            app[obj.method](obj.url, handler);
          }
        });
    });

  /* Add in a ping/pong route - can be overridden if a file specified */
  routes.push({
    method: 'GET',
    url: '/ping',
  });
  app.get('/ping', (req: express.Request, res: express.Response) => {
    res.send('pong');
  });

  if (!logger) {
    console.log('--- Routes ---');
    routes.forEach((route) => {
      console.log(`${route.method.toUpperCase()}: ${route.url}`);
    });
    console.log('--------------');
  } else {
    logger.info('Routes', routes);
  }

  parent.use(app);
};
