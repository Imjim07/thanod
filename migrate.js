/**
 * migrate.js — Thanod migration script
 * Fill in real email addresses before running.
 * Run: node migrate.js
 * Requires: SUPABASE_URL and SUPABASE_SERVICE_KEY in .env
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY  // service role key — bypasses RLS
);

const COINGECKO_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd';

// ── Fill in real email addresses before running ──
const migratedUsers = [
  { name: 'Elisa Linton',     email: 'elisalinton81@gmail.com', eth_invested: 10.72, tier: 'premium' },
  { name: 'Vicky Katsafanas', email: 'vkat611@gmail.com',       eth_invested: 30.00, tier: 'premium' },
  { name: 'Amy Castellano',   email: 'amywasem@gmail.com',      eth_invested:  3.50, tier: 'growth'  },
  { name: 'Brandi Pidgeon',   email: 'branpidge07@gmail.com',   eth_invested: 40.08, tier: 'premium' },
  { name: 'Amanda Cerny',     email: 'caprixchange@gmail.com',  eth_invested: 20.00, tier: 'premium' },
];

async function fetchEthPrice() {
  try {
    const res = await fetch(COINGECKO_URL);
    const data = await res.json();
    return data.ethereum?.usd || 0;
  } catch {
    console.warn('Could not fetch ETH price — usd_value will be 0');
    return 0;
  }
}

async function run() {
  const ethPrice = await fetchEthPrice();
  console.log(`\nETH/USD: $${ethPrice.toLocaleString()}\n`);

  const results = { inserted: [], skipped: [], failed: [] };

  for (const u of migratedUsers) {
    console.log(`Processing ${u.name} (${u.email})…`);

    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', u.email.toLowerCase())
      .single();

    if (existing) {
      console.log(`  ⚠  Skipped — already exists (id: ${existing.id})`);
      results.skipped.push(u.name);
      continue;
    }

    try {
      const { data: newUser, error: userErr } = await supabase
        .from('users')
        .insert({
          name: u.name,
          email: u.email.toLowerCase(),
          password_hash: null,
          is_verified: true,
          is_migrated: true,
          is_activated: false,
          activation_status: null,
        })
        .select('id')
        .single();

      if (userErr) throw new Error(`User insert: ${userErr.message}`);
      const userId = newUser.id;

      const { data: tier, error: tierErr } = await supabase
        .from('investment_tiers')
        .select('id, name')
        .eq('slug', u.tier)
        .single();

      if (tierErr || !tier) throw new Error(`Tier '${u.tier}' not found`);

      const { error: utErr } = await supabase
        .from('user_tiers')
        .insert({ user_id: userId, tier_id: tier.id, amount_invested: u.eth_invested });

      if (utErr) throw new Error(`user_tiers: ${utErr.message}`);

      const { error: portErr } = await supabase
        .from('portfolio')
        .insert({ user_id: userId, validator_balance: u.eth_invested, total_balance: u.eth_invested });

      if (portErr) throw new Error(`portfolio: ${portErr.message}`);

      const usdValue = ethPrice > 0 ? u.eth_invested * ethPrice : 0;
      const { error: txErr } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: 'deposit',
          asset: 'ETH',
          amount: u.eth_invested,
          usd_value: usdValue,
          eth_rate: ethPrice,
          eth_equivalent: u.eth_invested,
          description: 'Initial portfolio migration',
          status: 'completed',
        });

      if (txErr) throw new Error(`transaction: ${txErr.message}`);

      const usdFmt = usdValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
      console.log(`  ✓  id:${userId} · ${tier.name} · ${u.eth_invested} ETH · ${usdFmt}`);
      results.inserted.push(u.name);

    } catch (err) {
      console.error(`  ✗  ${err.message}`);
      results.failed.push(u.name);
    }
  }

  console.log('\n───────────────────────────────────');
  console.log(`✓ Inserted : ${results.inserted.length}  — ${results.inserted.join(', ') || 'none'}`);
  console.log(`⚠ Skipped  : ${results.skipped.length}  — ${results.skipped.join(', ')  || 'none'}`);
  console.log(`✗ Failed   : ${results.failed.length}  — ${results.failed.join(', ')   || 'none'}`);
  console.log('───────────────────────────────────\n');
}

run().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
