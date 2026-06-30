import cors from 'cors';
import express from 'express';
import routes from './routes/index.js';
import { env } from './config/env.js';

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(',').map((item) => item.trim())
    })
  );
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.get('/health', (_, res) => {
    res.json({
      success: true,
      message: 'ok'
    });
  });

  app.use(routes);

  app.use((error, _req, res, _next) => {
    console.error(error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || '服务器内部错误'
    });
  });

  return app;
}
