/**
 * hooks
 */

/* Node modules */

/* Third-party modules */
import cls from 'cls-hooked';
import express from 'express';

/* Files */

/* Randomly generated namespace key */
const namespace = '9ac4700b-2e6b-448a-86c7-2ce53c6fb208';

export default {
  middleware(req: express.Request, res: express.Response, next: express.NextFunction) : void {
    const ns = cls.getNamespace(namespace) || cls.createNamespace(namespace);

    ns.run(() => next());
  },

  get<T>(key: string) : T | null {
    const ns = cls.getNamespace(namespace);

    if (ns && ns.active) {
      return ns.get(key);
    }

    return null;
  },

  set<T>(key: string, value: T) : void {
    const ns = cls.getNamespace(namespace);

    if (ns && ns.active) {
      ns.set(key, value);
    }
  },
};
