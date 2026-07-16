import winston from 'winston';
import { format } from 'winston';

const { combine, timestamp, colorize, printf, json, errors } = format;

const devFormat = printf(({ level, message, timestamp, stack, requestId, ...meta }) => {
  let log = `${timestamp} [${level}]`;
  if (requestId) log += ` [${requestId}]`;
  log += ` ${stack ?? message}`;
  if (Object.keys(meta).length > 0) log += ` ${JSON.stringify(meta)}`;
  return log;
});

const isDev = process.env['NODE_ENV'] !== 'production';

export const logger = winston.createLogger({
  level: process.env['LOG_LEVEL'] ?? (isDev ? 'debug' : 'info'),
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    isDev ? combine(colorize(), devFormat) : json()
  ),
  transports: [
    new winston.transports.Console(),
    ...(isDev
      ? []
      : [
          new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
          new winston.transports.File({ filename: 'logs/combined.log' }),
        ]),
  ],
  exitOnError: false,
});
