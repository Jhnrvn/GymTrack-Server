import { google } from "googleapis";
import "dotenv/config";
import fs from "fs";

const { app_email, CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, REFRESH_TOKEN, verify_URL } = process.env;

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

/**
 * Build and encode raw email for Gmail API
 */
const buildEmail = (to, subject, html, attachments = []) => {
  const boundary = "__boundary__";

  const messageParts = [];
  messageParts.push(`MIME-Version: 1.0`);
  messageParts.push(`To: ${to}`);
  messageParts.push(`From: ${app_email}`);
  messageParts.push(`Subject: ${subject}`);
  messageParts.push(`Content-Type: multipart/related; boundary="${boundary}"\n`);

  // HTML body
  messageParts.push(`--${boundary}`);
  messageParts.push(`Content-Type: text/html; charset=UTF-8\n`);
  messageParts.push(html);

  // Attachments (inline images with CID)
  attachments.forEach((file) => {
    const content = fs.readFileSync(file.path).toString("base64");
    messageParts.push(`--${boundary}`);
    messageParts.push(`Content-Type: image/png; name="${file.filename}"`);
    messageParts.push(`Content-ID: <${file.cid}>`);
    messageParts.push(`Content-Disposition: inline; filename="${file.filename}"`);
    messageParts.push(`Content-Transfer-Encoding: base64\n`);
    messageParts.push(content);
  });

  messageParts.push(`--${boundary}--`);

  const rawMessage = messageParts.join("\n");
  return Buffer.from(rawMessage).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

/**
 * Send verification email via Gmail API
 */
const sendMemberAccountEmail = async (email, password) => {
  const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

  const html = `
        <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8" />
                <title>Email</title>
                <style>
                @media screen and (max-width: 600px) {
                    .email-container {
                    width: 100% !important;
                    }
                    .email-body {
                    padding: 15px !important;
                    }
                    h1 {
                    font-size: 18px !important;
                    }
                    p {
                    font-size: 14px !important;
                    }
                }
                </style>
            </head>
            <body style="margin: 0; padding: 0; background-color: #f4f4f4">
                <!-- Outer full-width table -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                    <td align="center" valign="top" style="padding: 40px 10px">
                    <!-- Inner centered table (email content) -->
                    <table
                        role="presentation"
                        border="0"
                        cellpadding="0"
                        cellspacing="0"
                        class="email-container"
                        style="
                        background: #ffffff;
                        width: 800px;
                        max-width: 100%;
                        text-align: center;
                        border-radius: 8px;
                        height: 100%;
                        overflow: hidden;
                        "
                    >
                        <tr style="overflow: hidden">
                        <td align="center" valign="middle" style="background-color: #262626">
                            <!-- Logo -->
                            <img
                            src="cid:area15logo"
                            alt="Area 15 Fitness Gym Logo"
                            style="width: 200px; max-width: 100%; display: block; margin: 0 auto"
                            />
                        </td>
                        </tr>
                        <tr>
                        <td align="center" class="email-body" style="padding: 20px">
                            <h1 style="font-family: Arial, sans-serif; font-size: 20px; margin: 0">Your Account Credentials</h1>
                            <p style="font-family: Arial, sans-serif; font-size: 16px; margin: 10px 0">
                            Welcome to Area 15 Fitness Gym!
                            </p>
                            <p style="font-family: Arial, sans-serif; font-size: 12px; margin: 20px 0; text-align: justify">
                            Your account has been created successfully. Below are your login details for the admin desktop
                            application:
                            </p>

                            <!-- Credentials Section -->
                            <div
                            style="
                                font-family: Arial, sans-serif;
                                font-size: 14px;
                                margin: 20px auto;
                                background: #f9f9f9;
                                padding: 20px;
                                border-radius: 6px;
                                border: 1px solid #ddd;
                                display: inline-block;
                                text-align: left;
                                width: 80%;
                                max-width: 400px;
                            "
                            >
                            <p style="margin: 0 0 5px; font-weight: bold; text-align: center">Email:</p>
                            <p style="margin: 0 0 15px; word-break: break-word ; text-align: center">${email}</p>

                            <p style="margin: 0 0 5px; font-weight: bold ; text-align: center">Password:</p>
                            <p style="margin: 0; word-break: break-word; text-align: center">${password}</p>
                            </div>

                            <p style="font-family: Arial, sans-serif; font-size: 12px; margin: 20px 0; text-align: justify">
                            Please keep these credentials safe and do not share them with anyone. We recommend changing your
                            password after your first login.
                            </p>

                            <hr />
                            <p
                            style="
                                font-family: Arial, sans-serif;
                                font-size: 10px;
                                margin: 10px 0;
                                color: gray;
                                font-style: italic;
                            "
                            >
                            You received this email because your address was used to register an account at Area 15 Fitness Gym.
                            If you did not register, you can safely ignore this message.
                            </p>
                        </td>
                        </tr>
                    </table>
                    </td>
                </tr>
                </table>
            </body>
            </html>
  `;

  const raw = buildEmail(email, "Account Credentials", html, [
    {
      filename: "AREA_15.png",
      path: "./src/assets/AREA_15.png",
      cid: "area15logo",
    },
  ]);

  const res = await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw,
    },
  });

  return res.data;
};

export default sendMemberAccountEmail;
