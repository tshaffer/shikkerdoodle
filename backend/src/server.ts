import express, { Request, Response } from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser'; // Parse cookies
import dotenv from 'dotenv';
import path from 'path';
import { Server } from 'http';
import cors from 'cors';
const bodyParser = require('body-parser');

dotenv.config(); // Load environment variables

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 8080;

app.use(cookieParser());
app.use(express.json()); // Parse JSON requests
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// === Express Session Setup ===
app.use(
  session({
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }, // 1 day
  })
);

// === Routes ===

// Serve static files from the /public directory
app.use(express.static(path.join(__dirname, '../public')));

// Serve the SPA on the root route (index.html)
app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Start the server
const server: Server<any> = app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

process.on('unhandledRejection', (err: any, promise: any) => {
  console.log(`Error: ${err.message}`);
  // Close server and exit process
  server.close(() => process.exit(1));
});
