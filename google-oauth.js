import { google } from 'googleapis';
import http from 'http';
import { parse } from 'url';
import open from 'open';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:3000/oauth2callback';

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
];

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
  prompt: 'consent',
});

console.log('Opening browser for Google OAuth authorization...');
console.log('Auth URL:', authUrl);

const server = http.createServer(async (req, res) => {
  const parsedUrl = parse(req.url, true);

  if (parsedUrl.pathname === '/oauth2callback') {
    const code = parsedUrl.query.code;

    if (!code) {
      res.writeHead(400);
      res.end('No authorization code received.');
      server.close();
      return;
    }

    try {
      const { tokens } = await oauth2Client.getToken(code);
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end('<h1>Authorization successful! You can close this tab.</h1>');
      server.close();

      console.log('\n=== OAuth Tokens ===');
      console.log('access_token:', tokens.access_token);
      console.log('refresh_token:', tokens.refresh_token);
      console.log('token_type:', tokens.token_type);
      console.log('expiry_date:', tokens.expiry_date);
      console.log('\n=== Copy this refresh_token ===');
      console.log(tokens.refresh_token);
    } catch (err) {
      console.error('Error exchanging code for tokens:', err);
      res.writeHead(500);
      res.end('Error exchanging authorization code.');
      server.close();
    }
  }
});

server.listen(3000, () => {
  console.log('Listening on http://localhost:3000');
  open(authUrl);
});
