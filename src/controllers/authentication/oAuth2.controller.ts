import type { Request, Response } from "express";
import { google } from "googleapis";
import "dotenv/config";

// google
const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } = process.env;
const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// oAuth
const oAuth2 = async (req: Request, res: Response): Promise<void> => {
  const scopes = ["https://mail.google.com/"];
  const url = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    prompt: "consent",
  });
  res.redirect(url);
};

// callback
const callback = async (req: Request<{}, unknown, {}, { code: string }>, res: Response): Promise<void> => {
  const code = req.query.code;
  if (!code) {
    res.status(400).send("No code provided.");
    return;
  }
  try {
    const { tokens } = await oAuth2Client.getToken(code);

    // Print the refresh token in browser
    res.send(`
      <h2>OAuth2 setup complete!</h2>
      <p>Copy the refresh token below and add it to your Render Environment Variables as <strong>REFRESH_TOKEN</strong>:</p>
      <pre>${tokens.refresh_token}</pre>
      <p>After that, you can safely remove this route for security.</p>
    `);

    console.log("Refresh Token:", tokens.refresh_token);
  } catch (err) {
    console.error("Error retrieving tokens:", err);
    res.status(500).send("Error retrieving tokens.");
  }
};

export { oAuth2, callback };
