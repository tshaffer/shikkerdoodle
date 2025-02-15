import express from 'express';
import path from "path";
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
// Store session IDs in memory (this will be lost if the server restarts)
const userSessions = new Map<string, string>(); // Maps user ID to session ID

app.get('/api/session', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const sessionResponse = await fetch('https://photospicker.googleapis.com/v1/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${(req.user as any).token}`,
      },
    });

    const sessionData = await sessionResponse.json();

    if (!sessionData.id) {
      return res.status(400).json({ error: 'Failed to create a valid session ID' });
    }

    // Store the session ID for this user
    userSessions.set(req.user.profile.id, sessionData.id);

    const pickerUrl = `https://photos.google.com/integration/picker/session/${sessionData.id}`;

    res.json({
      message: 'Session created. Open this URL to select media:',
      pickerUrl,
    });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

app.get('/api/images', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  // Retrieve the existing session ID for this user
  const sessionId = userSessions.get(req.user.profile.id);
  if (!sessionId) {
    return res.status(400).json({ error: 'No active session. Please start a new session first.' });
  }

  try {
    const imagesResponse = await fetch(`https://photospicker.googleapis.com/v1/mediaItems?sessionId=${sessionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${(req.user as any).token}`,
      },
    });

    const imagesData = await imagesResponse.json();

    console.log('imagesData:');
    console.log(imagesData);
    for (const mediaItem of imagesData.mediaItems) {
      console.log(mediaItem);

      const baseUrl = mediaItem.mediaFile.baseUrl;

      console.log('fetch from: ', baseUrl);
      fetch(baseUrl, {
        method: 'GET',
        headers: new Headers({
          'Authorization': `Bearer ${req.user.token}`,
        }),
      }).then((response: any) => {
          console.log('Response for imageData:', response.ok);
          console.log(response);
          response.arrayBuffer().then((buf: any) => {
            const bytes = new Uint8Array(buf)
            console.log('bytes:', bytes);
          })
      });
    }

    res.json(imagesData);
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

// ✅ Serve static files from "public"
app.use(express.static(path.join(__dirname, "../public")));

// ✅ Serve index.html for non-API requests
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "index.html"));
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

