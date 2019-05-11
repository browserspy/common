/**
 * app
 */

/* Node modules */
import path from 'path';

/* Third-party modules */
import express from 'express';

/* Files */
import router from '../../src/lib/router';

const app = express();

router(app, path.join(__dirname, 'controllers'));

app.listen(3000, () => {
  console.log('Listening...');
});
