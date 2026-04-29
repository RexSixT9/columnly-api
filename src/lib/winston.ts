// import winston from 'winston';
// import config from '@/config';

// const { combine, timestamp, json, errors, align, printf, colorize } =
//   winston.format;

// const transport: winston.transport[] = [];

// if (config.nodeEnv === 'production') {
//   transport.push(
//     new winston.transports.Console({
//       format: combine(
//         align(),
//         colorize({ all: true }),
//         timestamp({ format: 'YYYY-MM-DD hh:mm:ss A' }),
//         printf(({ timestamp, level, message, ...meta }) => {
//           const metaString = Object.keys(meta).length
//             ? JSON.stringify(meta)
//             : '';
//           return `${timestamp} [${level}]: ${message} ${metaString}`;
//         }),
//       ),
//     }),
//   );
// }

// const logger = winston.createLogger({
//   level: config.logLevel || 'info',
//   transports: transport,
//   silent: config.nodeEnv === 'test',
//   format: combine(timestamp(), errors({ stack: true }), align(), json()),
// });

// export { logger };


// This implementation ensures that the logger is always functional, with appropriate formatting for both development and production environments. It also includes error stack traces in production logs for better debugging.
import winston from 'winston';
import config from '@/config';

const { combine, timestamp, json, errors, align, printf, colorize } =
  winston.format;

// Define formats
const devFormat = combine(
  colorize(),
  align(),
  timestamp({ format: 'YYYY-MM-DD hh:mm:ss A' }),
  printf(({ timestamp, level, message, ...meta }) => {
    const metaString = Object.keys(meta).length
      ? ` ${JSON.stringify(meta)}`
      : '';
    return `${timestamp} [${level}]: ${message}${metaString}`;
  }),
);

const prodFormat = combine(
  align(),
  timestamp(),
  errors({ stack: true }),
  json(),
);

// Always include at least one transport
const transports: winston.transport[] = [
  new winston.transports.Console({
    format: config.nodeEnv === 'production' ? prodFormat : devFormat,
  }),
];

// Create logger
const logger = winston.createLogger({
  level: config.logLevel || 'info',
  transports,
  silent: config.nodeEnv === 'test',
});

export { logger };
