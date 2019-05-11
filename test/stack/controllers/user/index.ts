/**
 * index
 */

/* Node modules */

/* Third-party modules */
import express from 'express';

/* Files */

export const item = (req: express.Request, res: express.Response) => {
  res.send({
    name: 'user-item',
    url: req.url,
    method: req.method,
    id: req.params.id,
  });
};
