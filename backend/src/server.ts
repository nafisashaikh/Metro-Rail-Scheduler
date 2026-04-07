import { app } from './app.js';
import { env } from './config/env.js';
import { createServer } from 'node:http';

const MAX_PORT_ATTEMPTS = 10;

function startServer(startPort: number): void {
  const server = createServer(app);
  let attempts = 0;
  let currentPort = startPort;

  const tryListen = () => {
    server.listen(currentPort, () => {
      console.log(`Metro Rail Scheduler backend listening on http://localhost:${currentPort}`);
    });
  };

  server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE' && attempts < MAX_PORT_ATTEMPTS) {
      attempts += 1;
      currentPort += 1;
      console.warn(`Port ${currentPort - 1} is busy. Retrying on ${currentPort}...`);
      setTimeout(tryListen, 100);
      return;
    }

    throw error;
  });

  tryListen();
}

startServer(env.port);
