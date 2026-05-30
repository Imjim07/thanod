require('dotenv').config();
const { Pool } = require('pg');
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

// ─────────────────────────────────────────────────────────────────────────────
// CLIENTS TO MIGRATE — fill this array before running
// ─────────────────────────────────────────────────────────────────────────────
const clients = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    tier: 'growth',             // starter | growth | premium  (must match slug in investment_tiers)
    amount_invested: 2.5,       // ETH
    deposit_wallet: '0x...',    // their assigned ETH deposit address
    transactions: [             // optional — leave as [] if none
      { type: 'deposit', amount: 2.5, currency: 'ETH', description: 'Initial deposit', date: '2025-01-15' },
    ],
    real_estate_property: null, // exact property name string, or null
  },
  // add more clients here...
];
// ─────────────────────────────────────────────────────────────────────────────

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const TIER_LABELS = {
  starter: { name: 'Starter', color: '#48BB78' },
  growth:  { name: 'Growth',  color: '#60A5FA' },
  premium: { name: 'Premium', color: '#F6AD55' },
};

async function sendMigrationEmail(client) {
  const tier = TIER_LABELS[client.tier?.toLowerCase()] || { name: client.tier || '—', color: '#60A5FA' };
  const amount = client.amount_invested ? `Ξ${client.amount_invested}` : '—';
  const firstName = client.name.split(' ')[0];
  const baseUrl = process.env.FRONTEND_URL || 'https://thanod.com';

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#050508;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#050508;padding:48px 0;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#09090F;border:1px solid rgba(37,99,235,0.2);border-radius:14px;overflow:hidden;max-width:560px;">

  <!-- TOP ACCENT BAR -->
  <tr><td style="height:3px;background:linear-gradient(90deg,#2563EB,#60A5FA,#2563EB);"></td></tr>

  <!-- HEADER -->
  <tr><td style="padding:36px 48px 0;">
    <table cellpadding="0" cellspacing="0">
      <tr>
        <td style="width:36px;height:36px;background:#2563EB;border-radius:8px;text-align:center;vertical-align:middle;">
          <span style="font-size:1.1rem;font-weight:700;color:white;line-height:36px;">T</span>
        </td>
        <td style="padding-left:12px;font-size:1.3rem;font-weight:700;color:#F0F0F8;letter-spacing:-0.02em;vertical-align:middle;">Thanod</td>
      </tr>
    </table>
  </td></tr>

  <!-- BODY -->
  <tr><td style="padding:32px 48px 0;">
    <h1 style="color:#F0F0F8;font-size:1.7rem;font-weight:700;margin:0 0 10px;letter-spacing:-0.02em;">Your account is ready.</h1>
    <p style="color:#8A8AA8;font-size:0.95rem;line-height:1.75;margin:0 0 28px;">
      Hi ${firstName},<br><br>
      Your Thanod investment account has been set up and your portfolio details have been migrated. Everything is ready to go.
    </p>

    <!-- ACCOUNT SUMMARY CARD -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#0E0E18;border:1px solid rgba(37,99,235,0.2);border-radius:10px;margin-bottom:28px;">
      <tr><td style="padding:20px 24px;border-bottom:1px solid rgba(37,99,235,0.12);">
        <span style="font-family:monospace;font-size:0.6rem;letter-spacing:0.18em;text-transform:uppercase;color:#4A4A68;">// Account Summary</span>
      </td></tr>
      <tr><td style="padding:0;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:16px 24px;border-bottom:1px solid rgba(37,99,235,0.08);border-right:1px solid rgba(37,99,235,0.08);">
              <div style="font-family:monospace;font-size:0.58rem;letter-spacing:0.14em;text-transform:uppercase;color:#4A4A68;margin-bottom:6px;">Name</div>
              <div style="font-size:0.9rem;color:#F0F0F8;font-weight:500;">${client.name}</div>
            </td>
            <td style="padding:16px 24px;border-bottom:1px solid rgba(37,99,235,0.08);">
              <div style="font-family:monospace;font-size:0.58rem;letter-spacing:0.14em;text-transform:uppercase;color:#4A4A68;margin-bottom:6px;">Email</div>
              <div style="font-size:0.9rem;color:#F0F0F8;font-weight:500;">${client.email}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 24px;border-right:1px solid rgba(37,99,235,0.08);">
              <div style="font-family:monospace;font-size:0.58rem;letter-spacing:0.14em;text-transform:uppercase;color:#4A4A68;margin-bottom:6px;">Investment Tier</div>
              <div style="display:inline-block;background:rgba(37,99,235,0.1);border:1px solid rgba(37,99,235,0.25);border-radius:20px;padding:3px 12px;font-size:0.82rem;font-weight:600;color:${tier.color};">${tier.name}</div>
            </td>
            <td style="padding:16px 24px;">
              <div style="font-family:monospace;font-size:0.58rem;letter-spacing:0.14em;text-transform:uppercase;color:#4A4A68;margin-bottom:6px;">Amount Invested</div>
              <div style="font-size:1.1rem;font-weight:700;color:#60A5FA;letter-spacing:-0.01em;">${amount}</div>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>

    <!-- PASSWORDLESS EXPLANATION -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(37,99,235,0.06);border:1px solid rgba(37,99,235,0.2);border-radius:8px;margin-bottom:28px;">
      <tr><td style="padding:18px 22px;">
        <p style="margin:0 0 6px;font-size:0.88rem;font-weight:600;color:#F0F0F8;">🔑 No password needed</p>
        <p style="margin:0;font-size:0.84rem;color:#8A8AA8;line-height:1.65;">
          Your account uses passwordless sign-in. Each time you want to log in, just enter your email on the sign-in page and we'll send you a secure link — no password to remember.
        </p>
      </td></tr>
    </table>

    <!-- CTA BUTTON -->
    <table cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
      <tr>
        <td style="background:#2563EB;border-radius:6px;">
          <a href="${baseUrl}/login.html" style="display:inline-block;padding:14px 32px;font-size:0.92rem;font-weight:600;color:white;text-decoration:none;letter-spacing:0.01em;">Sign In to Thanod →</a>
        </td>
      </tr>
    </table>

    <p style="color:#4A4A68;font-size:0.8rem;line-height:1.65;margin:0 0 32px;">
      If you have any questions about your account or investment details, reach out to us at <a href="mailto:hello@thanod.com" style="color:#60A5FA;text-decoration:none;">hello@thanod.com</a> — we're happy to help.
    </p>
  </td></tr>

  <!-- FOOTER -->
  <tr><td style="padding:24px 48px;border-top:1px solid rgba(37,99,235,0.1);margin-top:8px;">
    <p style="margin:0;font-size:0.75rem;color:#4A4A68;line-height:1.6;">
      © 2025 Thanod. All rights reserved.<br>
      <span style="font-style:italic;">Crypto investments carry risk. Thanod does not guarantee returns. Past performance is not indicative of future results.</span>
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;

  await resend.emails.send({
    from: 'Thanod <hello@thanod.com>',
    to: client.email,
    subject: 'Your Thanod account is ready',
    html,
  });
}

async function migrateClient(client) {
  const email = client.email.toLowerCase().trim();

  // 1. Skip if already exists
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    console.log(`  ⚠️  SKIPPED — already exists: ${email}`);
    return 'skipped';
  }

  // 2. Insert user — no password, pre-verified
  const userRes = await pool.query(
    `INSERT INTO users (name, email, password_hash, is_verified, deposit_wallet, created_at)
     VALUES ($1, $2, NULL, TRUE, $3, NOW())
     RETURNING id`,
    [client.name.trim(), email, client.deposit_wallet || null]
  );
  const userId = userRes.rows[0].id;

  // 3. Create empty portfolio row
  await pool.query(
    `INSERT INTO portfolio (user_id, validator_balance, bot_balance, idle_balance, total_balance)
     VALUES ($1, 0, 0, 0, 0)
     ON CONFLICT (user_id) DO NOTHING`,
    [userId]
  );

  // 4. Assign investment tier
  if (client.tier) {
    const tierRes = await pool.query(
      'SELECT id FROM investment_tiers WHERE slug = $1',
      [client.tier.toLowerCase().trim()]
    );
    if (tierRes.rows.length > 0) {
      await pool.query(
        `INSERT INTO user_tiers (user_id, tier_id, amount_invested, notes, assigned_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [userId, tierRes.rows[0].id, client.amount_invested || 0, 'Migrated from previous platform']
      );
    } else {
      console.log(`    ⚠️  Tier slug '${client.tier}' not found in investment_tiers — skipping tier assignment`);
    }
  }

  // 5. Insert transactions
  if (Array.isArray(client.transactions) && client.transactions.length > 0) {
    for (const tx of client.transactions) {
      await pool.query(
        `INSERT INTO transactions (user_id, type, amount, currency, description, created_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          userId,
          tx.type || 'deposit',
          tx.amount || 0,
          tx.currency || 'ETH',
          tx.description || '',
          tx.date ? new Date(tx.date) : new Date(),
        ]
      );
    }
    console.log(`    ↳ ${client.transactions.length} transaction(s) inserted`);
  }

  // 6. Assign real estate property
  if (client.real_estate_property) {
    const propRes = await pool.query(
      'SELECT id FROM real_estate_properties WHERE name ILIKE $1',
      [client.real_estate_property.trim()]
    );
    if (propRes.rows.length > 0) {
      await pool.query(
        `INSERT INTO user_real_estate (user_id, property_id, amount_invested, ownership_pct)
         VALUES ($1, $2, $3, 0)
         ON CONFLICT DO NOTHING`,
        [userId, propRes.rows[0].id, client.amount_invested || 0]
      );
      console.log(`    ↳ Real estate assigned: ${client.real_estate_property}`);
    } else {
      console.log(`    ⚠️  Property '${client.real_estate_property}' not found — skipping RE assignment`);
    }
  }

  console.log(`  ✅ MIGRATED: ${client.name} <${email}> — user_id: ${userId}`);
  return 'migrated';
}

async function run() {
  console.log('');
  console.log('══════════════════════════════════════════');
  console.log('  Thanod Client Migration');
  console.log(`  Clients to process: ${clients.length}`);
  console.log('══════════════════════════════════════════\n');

  let migrated = 0, skipped = 0, failed = 0;

  for (const client of clients) {
    console.log(`Processing: ${client.name} <${client.email}>`);
    try {
      const result = await migrateClient(client);
      if (result === 'migrated') {
        migrated++;
        try {
          await sendMigrationEmail(client);
          console.log(`    ↳ Welcome email sent to ${client.email}`);
        } catch (emailErr) {
          console.log(`    ⚠️  Welcome email failed: ${emailErr.message}`);
        }
      } else if (result === 'skipped') skipped++;
    } catch (err) {
      console.error(`  ❌ FAILED: ${client.email}`);
      console.error(`     ${err.message}`);
      failed++;
    }
    console.log('');
  }

  console.log('══════════════════════════════════════════');
  console.log('  Migration Summary');
  console.log('──────────────────────────────────────────');
  console.log(`  ✅ Migrated : ${migrated}`);
  console.log(`  ⚠️  Skipped  : ${skipped}`);
  console.log(`  ❌ Failed   : ${failed}`);
  console.log('══════════════════════════════════════════\n');

  await pool.end();
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
