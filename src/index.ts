import 'dotenv/config';
import { FortuvaBot } from './core/FortuvaBot';

const main = async () => {
  try {
    const bot = new FortuvaBot();
    await bot.initialize();
    bot.setupInputHandling();
    bot.start();
  } catch (error) {
    console.error('Failed to start bot:', error);
    process.exit(1);
  }
};

main();