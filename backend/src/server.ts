import { createApp } from './app';
import { config } from './config';
import { getDb } from './db';
import { seedIfEmpty } from './startup';

getDb(); // initialize DB + run schema migration on boot
seedIfEmpty(); // auto-create admin + device on first run
const app = createApp();

app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Datalake backend listening on http://localhost:${config.port} (${config.env})`);
});
