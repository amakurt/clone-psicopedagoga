import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import path from 'path';
import dotenv from 'dotenv';
import routes from './routes';
import { errorHandler } from './middleware';
import configurePassport from './config/passport';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'psicopedagoga-session-secret-2026',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Configure Passport strategies
configurePassport();

// CORS configuration
app.use(cors({
  origin: (process.env.FRONTEND_URL || 'http://localhost:4200').split(',').map((u: string) => u.trim()),
  credentials: true
}));

app.use(express.json());

// Serve uploaded files
app.use('/api/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api', routes);

// Error handler
app.use(errorHandler);

// Evitar derrubar o processo inteiro por erros em handlers async
process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason);
});
process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err);
});

app.listen(PORT, () => {
  console.log(`Backend rodando na porta ${PORT}`);
});
