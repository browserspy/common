/**
 * index
 */

/* Node modules */

/* Third-party modules */
import express from 'express';

/* Files */

export const list = (req: express.Request, res: express.Response) => {
  res.send({
    name: 'issue-list',
    url: req.url,
    method: req.method,
  });
};

export const item = (req: express.Request, res: express.Response) => {
  res.send({
    name: 'issue-item',
    url: req.url,
    method: req.method,
    id: req.params.id,
  });
};
