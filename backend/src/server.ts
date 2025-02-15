import express from 'express';
import session from 'express-session';
import passport from 'passport';
import bodyParser from 'body-parser';
import { Strategy as GoogleOAuthStrategy } from 'passport-google-oauth20';
const fetch = require('node-fetch');
import dotenv from 'dotenv';

declare global {
  namespace Express {
    interface User {
      profile: any;
      token: string;
    }
  }
}

dotenv.config(); // Load environment variables

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'shikkerdoodle-secret',
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Google OAuth Strategy
const GOOGLE_SCOPES = [
  "profile",
  "https://www.googleapis.com/auth/photospicker.mediaitems.readonly"
];

passport.use(
  new GoogleOAuthStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback',
      scope: GOOGLE_SCOPES,
    },
    (token: string, refreshToken: string, profile: any, done) => {
      const user = { profile, token };
      return done(null, user);
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user: Express.User, done) => done(null, user));

// Authentication Routes
app.get('/auth/google',
  passport.authenticate('google', { scope: GOOGLE_SCOPES })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/', scope: GOOGLE_SCOPES }),
  (req, res) => {
    res.redirect('/');
  }
);

// Logout
app.post('/api/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    req.session.destroy(() => {
      res.json({ message: 'Logged out' });
    });
  });
});

// Get User Info
app.get('/api/user', (req, res) => {
  console.log('/api/user invoked');
  console.log('req.user:', req.user);
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json(req.user);
});

// Create Photo Picker Session
app.get('/api/session', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const response = await fetch('https://photospicker.googleapis.com/v1/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${(req.user as any).token}`,
      },
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// Fetch Selected Images
app.get('/api/images', async (req, res) => {

  console.log('/api/images invoked');
  console.log('req.user:', req.user);
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  console.log('token', (req.user as any).token);
  
  try {
    const response = await fetch(`https://photospicker.googleapis.com/v1/mediaItems`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${(req.user as any).token}`,
      },
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

