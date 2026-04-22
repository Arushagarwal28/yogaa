const nodemailer = require("nodemailer");

/* ── Transporter ─────────────────────────────────────────────────────────────
   Reads SMTP credentials from environment variables.
   For Gmail: enable "App Passwords" (not your regular password).
   For development without real SMTP: set SMTP_HOST=smtp.ethereal.email
   and run `node -e "const n=require('nodemailer');n.createTestAccount().then(console.log)"`
   to get free test credentials. ─────────────────────────────────────────── */
const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_PORT === "465", // true only for port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * sendOtpEmail({ to, name, otp })
 * Sends a branded OTP verification email.
 * Returns nodemailer's info object on success, throws on failure.
 */
async function sendOtpEmail({ to, name, otp }) {
  const expiryMins = 10;
  const from       = process.env.FROM_EMAIL || `"YogaAI" <noreply@yogaai.in>`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#f0fdf4;font-family:'DM Sans',Helvetica,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 16px">
        <table width="480" cellpadding="0" cellspacing="0"
          style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#10b981,#0d9488);padding:32px;text-align:center">
              <div style="width:52px;height:52px;background:rgba(255,255,255,0.2);border-radius:14px;
                          display:inline-flex;align-items:center;justify-content:center;
                          font-size:24px;font-weight:900;color:#fff;margin-bottom:12px">Y</div>
              <h1 style="color:#fff;font-size:22px;font-weight:800;margin:0">Verify your email</h1>
              <p style="color:rgba(255,255,255,0.85);font-size:14px;margin:8px 0 0">
                Welcome to YogaAI, ${name}!
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px">
              <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 24px">
                Use the code below to verify your email address.
                It expires in <strong>${expiryMins} minutes</strong>.
              </p>

              <!-- OTP box -->
              <div style="background:#f0fdf4;border:2px dashed #10b981;border-radius:16px;
                          padding:28px;text-align:center;margin-bottom:28px">
                <div style="letter-spacing:0.35em;font-size:42px;font-weight:900;
                            color:#10b981;font-family:monospace">${otp}</div>
                <p style="color:#6b7280;font-size:12px;margin:12px 0 0">
                  One-time password · ${expiryMins} min validity
                </p>
              </div>

              <p style="color:#6b7280;font-size:13px;line-height:1.6;margin:0">
                If you didn't create a YogaAI account, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #f3f4f6;
                       text-align:center">
              <p style="color:#9ca3af;font-size:12px;margin:0">
                YogaAI · AI-Powered Wellness Platform
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();

  const text = `Hi ${name},\n\nYour YogaAI verification code is: ${otp}\n\nThis code expires in ${expiryMins} minutes.\n\nIf you didn't register, please ignore this email.`;

  return transporter.sendMail({
    from,
    to,
    subject: `${otp} — Your YogaAI verification code`,
    text,
    html,
  });
}

module.exports = { sendOtpEmail };