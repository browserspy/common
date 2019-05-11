/**
 * issue
 */

/* Node modules */

/* Third-party modules */
import express from 'express';

/* Files */

export const list = (req: express.Request, res: express.Response) => {
  res.send({
    name: 'project-issue-list',
    url: req.url,
    method: req.method,
  });
};
