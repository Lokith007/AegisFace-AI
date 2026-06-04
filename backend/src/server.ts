import { createApp } from './app';
import { config } from './config';
import { getDb } from './db';

getDb(); // initialize DB + run schema migration on boot
const app = createApp();

app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Datalake backend listening on http://localhost:${config.port} (${config.env})`);
});
