import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import incidentsRouter from './routes/incidents';
import dotenv from 'dotenv';
import AppDataSource from './db/data-source';
import rateLimit from 'express-rate-limit';
import { env } from './config';

dotenv.config();
const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(cors());
app.use(helmet());
app.use(
  rateLimit({
    windowMs: 60_000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

// Handle malformed JSON body errors
app.use((err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({
      type: 'https://httpstatuses.com/400',
      title: 'Invalid JSON',
      status: 400,
      detail: 'Malformed JSON body',
      code: 'REQ_400_INVALID_JSON',
    });
  }
  return next(err);
});

app.get('/healthz', (_req, res) =>
  res.json({ status: 'ok', demo: !AppDataSource.isInitialized, uptime: process.uptime() }),
);
app.get('/readyz', async (_req, res) => {
  try {
    await AppDataSource.query('SELECT 1');
    res.json({ ready: true });
  } catch (e) {
    res.status(503).json({ ready: false });
  }
});

app.get('/', (_req, res) => res.send('SIH API Gateway up'));

// Mount routes regardless of DB status; routes handle demo mode if DB is not initialized
app.use('/incidents', incidentsRouter);

// Initialize DB asynchronously
AppDataSource.initialize()
  .then(() => {
    console.log('Database initialized');
  })
  .catch((err) => {
    console.error('Database initialization failed', err);
  });

// HTTP server + Socket.IO
const server = http.createServer(app);
const io = new SocketIOServer(server, { cors: { origin: '*' } });
io.on('connection', (socket) => {
  console.log('socket connected', socket.id);
});

const port = Number(env.PORT) || 4000;
server.listen(port, () => {
  console.log(`API Gateway listening on http://localhost:${port}`);
});
