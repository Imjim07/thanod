// ============================================================
// THANOD — 2FA BACKEND PATCH  (add to server.js)
// ============================================================
// 1. Add this near your other rate limiters at the top of the file:
//
//   const resendOtpLimiter = rateLimit({
//     windowMs: 15 * 60 * 1000,   // 15 minutes
//     max: 3,
//     message: { error: 'Too many resend attempts. Please wait 15 minutes.' }
//   });
//
// 2. Replace your existing POST /api/auth/login route with the one below.
// 3. Add the two new routes anywhere after your existing auth routes.
// ============================================================

// ── 2FA EMAIL HELPER ──
async function send2FAEmail(email, otp) {
  const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#050508;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#050508;padding:40px 20px;">
<tr><td align="center">
<table width="480" cellpadding="0" cellspacing="0" style="background:#09090F;border:1px solid rgba(37,99,235,0.2);border-radius:12px;overflow:hidden;max-width:480px;">
<tr><td style="height:2px;background:linear-gradient(90deg,#2563EB,#60A5FA,#2563EB);"></td></tr>
<tr><td style="padding:32px 40px 0;">
  <table cellpadding="0" cellspacing="0"><tr>
    <td style="width:32px;height:32px;background:#2563EB;border-radius:6px;text-align:center;vertical-align:middle;"><span style="color:white;font-weight:700;font-size:16px;line-height:32px;display:block;">T</span></td>
    <td style="padding-left:10px;font-size:18px;font-weight:700;color:#F0F0F8;letter-spacing:-0.02em;">Thanod</td>
  </tr></table>
</td></tr>
<tr><td style="padding:28px 40px 0;">
  <p style="margin:0 0 6px;font-size:22px;font-weight:700;color:#F0F0F8;letter-spacing:-0.02em;">Login verification code</p>
  <p style="margin:0 0 24px;font-size:14px;color:#8A8AA8;line-height:1.7;">You're signing in to Thanod. Use the code below — it expires in 10 minutes.</p>
  <div style="background:#0E0E18;border:2px solid rgba(37,99,235,0.4);border-radius:10px;padding:28px 20px;text-align:center;margin-bottom:24px;">
    <span style="font-family:'Courier New',monospace;font-size:42px;font-weight:700;letter-spacing:14px;color:#60A5FA;">${otp}</span>
  </div>
  <p style="margin:0 0 24px;font-size:13px;color:#8A8AA8;line-height:1.6;padding:12px 16px;background:#0E0E18;border-left:3px solid rgba(248,113,113,0.5);border-radius:0 4px 4px 0;">If you didn't request this, secure your account immediately by changing your password.</p>
</td></tr>
<tr><td style="padding:16px 40px 32px;">
  <p style="margin:0;font-size:12px;color:#4A4A68;line-height:1.5;">Sent from hello@thanod.com &nbsp;·&nbsp; Do not share this code with anyone.</p>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`;

  await resend.emails.send({
    from: 'Thanod <hello@thanod.com>',
    to: email,
    subject: 'Your Thanod login code',
    html,
  });
}

// ── REPLACE: POST /api/auth/login ──
// (Replace your entire existing login route with this)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    const user = rows[0];
    if (!user) return res.status(401).json({ error: 'Invalid email or password.' });

    if (!user.is_verified) {
      return res.status(403).json({ requiresVerification: true, email: user.email });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Invalid email or password.' });

    // Generate 2FA OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await pool.query(
      'UPDATE users SET otp_code = $1, otp_expires_at = $2 WHERE id = $3',
      [otpHash, expiresAt, user.id]
    );

    await send2FAEmail(user.email, otp);

    return res.json({ requires2FA: true, message: 'Verification code sent to your email.' });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// ── NEW: POST /api/auth/verify-login-otp ──
app.post('/api/auth/verify-login-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'Email and code are required.' });

    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    const user = rows[0];
    if (!user) return res.status(400).json({ error: 'Invalid request.' });

    if (!user.otp_code || !user.otp_expires_at) {
      return res.status(400).json({ error: 'No verification pending. Please sign in again.' });
    }

    if (new Date() > new Date(user.otp_expires_at)) {
      await pool.query('UPDATE users SET otp_code = NULL, otp_expires_at = NULL WHERE id = $1', [user.id]);
      return res.status(400).json({ error: 'Code expired. Please sign in again.' });
    }

    const valid = await bcrypt.compare(otp.trim(), user.otp_code);
    if (!valid) return res.status(400).json({ error: 'Incorrect code. Please try again.' });

    // Clear OTP and issue JWT
    await pool.query('UPDATE users SET otp_code = NULL, otp_expires_at = NULL WHERE id = $1', [user.id]);

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error('Verify login OTP error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// ── NEW: POST /api/auth/resend-login-otp ──
// Apply resendOtpLimiter middleware: app.post('/api/auth/resend-login-otp', resendOtpLimiter, async (req, res) => {
app.post('/api/auth/resend-login-otp', resendOtpLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required.' });

    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    const user = rows[0];
    if (!user) return res.json({ success: true }); // Don't reveal if email exists

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await pool.query(
      'UPDATE users SET otp_code = $1, otp_expires_at = $2 WHERE id = $3',
      [otpHash, expiresAt, user.id]
    );

    await send2FAEmail(user.email, otp);

    return res.json({ success: true });
  } catch (err) {
    console.error('Resend login OTP error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});
