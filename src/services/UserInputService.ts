import readline from 'readline';
import { Logger } from './Logger';
import { RuntimeConfig } from '../types/BettingTypes';
import * as anchor from '@project-serum/anchor';
import { getConfig } from '../utils';
import { DIRECTION_TYPE } from '../config';

export class UserInputService {
  constructor(
    private logger: Logger,
    private runtimeConfig: RuntimeConfig,
    private program: anchor.Program
  ) {}

  async handleUserInput(input: string): Promise<void> {
    if (input === '\u001b' || input.toLowerCase() === 'exit') {
      this.logger.input('Input cancelled.');
      return;
    }
    
    const parsedInput = this.parseInput(input);
    if (!parsedInput) {
      this.logger.input('Invalid format. Use: DIRECTION/AMOUNT (e.g., UP/0.001)');
      return;
    }
    
    await this.updateRuntimeConfig(parsedInput);
  }

  private parseInput(input: string): { direction: DIRECTION_TYPE; amount: number } | null {
    const parts = input.split('/');
    if (parts.length !== 2) return null;
    
    const direction = parts[0].trim().toUpperCase();
    const amountStr = parts[1].trim();
    
    if (direction !== 'UP' && direction !== 'DOWN') return null;
    
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) return null;
    
    return { direction: direction as DIRECTION_TYPE, amount };
  }

  private async updateRuntimeConfig(parsedInput: { direction: DIRECTION_TYPE; amount: number }): Promise<void> {
    const config = await getConfig(this.program);
    if (!config) {
      this.logger.input("No configuration");
      return;
    }
    
    const currentRound = Number(config.currentRound);
    this.runtimeConfig.direction = parsedInput.direction;
    this.runtimeConfig.betAmounts[currentRound % 2] = parsedInput.amount;
    this.runtimeConfig.startCalcRounds[currentRound % 2] = currentRound;
    
    this.logger.input(
      `Direction set to ${parsedInput.direction}, bet amount set to ${parsedInput.amount} SOL in Round #${currentRound}`
    );
  }

  setupInteractiveMode(): void {
    process.stdin.removeAllListeners('data');
    process.stdin.setRawMode(false);
    this.logger.setUserInputActive(true);

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.on('SIGINT', () => {
      this.logger.input('Input cancelled by Ctrl+C.');
      rl.close();
      process.exit();
    });

    const restoreInput = () => {
      this.logger.setUserInputActive(false);
      rl.close();
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.on('data', (key: string) => {
        const strKey = key.toString().trim();
        if (strKey === 'S' || strKey === 's') {
          this.setupInteractiveMode();
        } else if (key === '\u0003') {
          process.exit();
        }
      });
    };

    rl.question('Enter direction and amount (e.g., UP/0.01 or DOWN/0.02): ', async (input) => {
      await this.handleUserInput(input);
      restoreInput();
    });
  }
}
