require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { createClient } = require('@supabase/supabase-js');

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id,
    '⚽ VorScore Bot is running!\n\nUse /today to get today\'s matches.');
});

bot.onText(/\/today/, async (msg) => {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('fixtures')
    .select('home_team, away_team, kickoff_time, prediction_selection')
    .eq('match_date', today)
    .order('kickoff_time');

  if (error || !data?.length) {
    return bot.sendMessage(msg.chat.id, 'No matches found for today.');
  }

  const text = data.map(m =>
    `🕒 ${m.kickoff_time}\n${m.home_team} vs ${m.away_team}\nTip: ${m.prediction_selection || 'N/A'}`
  ).join('\n\n');

  bot.sendMessage(msg.chat.id, `📅 *Today Picks*\n\n${text}`, {
    parse_mode: 'Markdown'
  });
});

console.log('🤖 VorScore Telegram Bot is running...');
