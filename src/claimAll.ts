import 'dotenv/config';
import { FortuvaBot } from './core/FortuvaBot';

const main = async () => {
  try {
    const bot = new FortuvaBot();
    await bot.initialize();
    
    console.log('Starting claim process...');
    const claimService = (bot as any).claimService; // Access the claim service
    await claimService.claimAllRewards();
    
    console.log('Claim process completed.');
    process.exit(0);
  } catch (error) {
    console.error('Failed to claim rewards:', error);
    process.exit(1);
  }
};

main();