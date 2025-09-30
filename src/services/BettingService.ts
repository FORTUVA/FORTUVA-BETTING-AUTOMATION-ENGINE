import { Connection, Keypair, LAMPORTS_PER_SOL, Transaction } from '@solana/web3.js';
import * as anchor from '@project-serum/anchor';
import { Logger } from './Logger';
import { BettingStrategy, RuntimeConfig, BettingResult } from '../types/BettingTypes';
import { Config, Round } from '../config/types';
import { 
  placeBet, 
  getConfig, 
  getCurrentTime, 
  getBalance, 
  getBet 
} from '../utils/blockchain';
import { getFormattedDateTime } from '../utils/helpers';

import { getFailedBetCount, getRoundInfo } from '../api/fortuvaApi';
import { 
  BET_TIME,
  EVEN_MIN_BET_AMOUNT, 
  EVEN_MAX_BET_AMOUNT, 
  EVEN_MODE,
  EVEN_DIRECTION,
  EVEN_MULTIPLIER,
  ODD_MIN_BET_AMOUNT, 
  ODD_MAX_BET_AMOUNT, 
  ODD_MODE,
  ODD_DIRECTION,
  ODD_MULTIPLIER,
} from '../config';

export class BettingService {
  constructor(
    private logger: Logger,
    private runtimeConfig: RuntimeConfig,
    private wallet: Keypair,
    private connection: Connection,
    private program: anchor.Program,
    private signTransaction: (tx: Transaction) => Promise<Transaction>
  ) {}

  async executeBet(): Promise<BettingResult | null> {
    try {
      const config = await getConfig(this.program);
      if (!config || !this.shouldProceedWithBet(config)) {
        this.logger.warn("No configuration available or market is paused", "BettingService");
        return null;
      }
      const currentRound = Number(config!.currentRound);
      const round = await getRoundInfo(currentRound);
      if (!round) {
        this.logger.warn("No round information available", "BettingService");
        return null;
      }
      
      const currentTime = await getCurrentTime(this.connection);
      if (!currentTime) {
        this.logger.error('Failed to get current time', "BettingService");
        return null;
      }
      
      const remainingTime = Number(round.lockTime) - currentTime;
      if (remainingTime < 0 ) {
        this.logger.debug(`Betting on this round is closed.`, "BettingService");
        return null;
      }

      const balance = await getBalance(this.wallet.publicKey, this.connection);
      const prizePool = (Number(round.totalBullAmount) + Number(round.totalBearAmount)) / LAMPORTS_PER_SOL;
      
      // Only log this information when not in input mode
      if (!this.logger.isInInputMode()) {
        this.logger.info(`Current Round: ${currentRound}, RemainingTime: ${remainingTime}s, CurrentBalance: ${balance.toFixed(4)} SOL, PrizePool: ${prizePool > 0 ? prizePool.toFixed(3) : 0} SOL, UpPayout: ${round.upPayout.toFixed(2)}x, DownPayout: ${round.downPayout.toFixed(2)}x`)
      }
      
      if (remainingTime > BET_TIME) {
        return null;
      }

      const bet = await getBet(this.wallet.publicKey, currentRound, this.program);
      if (bet) {
        this.logger.debug("Bet already placed for this round", "BettingService");
        return null;
      }

      const previousRound = await getRoundInfo(config.currentRound - 1);
      if (previousRound?.status === 4) {
        this.logger.warn(`Previous Round is cancelled, avoiding bet on round: ${config.currentRound}`, "BettingService");
        return null;
      }

      return await this.placeBetWithStrategy(currentRound, round);
    } catch (error) {
      this.logger.error(`Error executing bet: ${error}`, "BettingService");
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        betAmount: 0,
        direction: false,
        roundNumber: 0
      };
    }
  }

  private shouldProceedWithBet(config: Config | null): boolean {
    if (!config) {
      this.logger.warn("No configuration available", "BettingService");
      return false;
    }

    if (config.isPaused) {
      this.logger.warn("Market is paused", "BettingService");
      return false;
    }

    return true;
  }

  private async placeBetWithStrategy(currentRound: number, round: Round): Promise<BettingResult> {
    const balance = await getBalance(this.wallet.publicKey, this.connection);
    const strategy = this.getBettingStrategy(currentRound);
    const isBull = this.determineBetDirection(round);
    const betAmount = await this.calculateBetAmount(currentRound, strategy);

    if (betAmount > strategy.maxBetAmount) {
      this.runtimeConfig.startCalcRounds[currentRound % 2] = currentRound;
      this.logger.info("Resetting calculation due to max bet amount exceeded", "BettingService");
      return {
        success: false,
        error: 'Bet amount exceeds maximum',
        betAmount,
        direction: isBull,
        roundNumber: currentRound
      };
    }

    if (balance < betAmount + 0.0001) {
      this.logger.warn(
        `Insufficient balance. Current: ${balance.toFixed(4)} SOL, Required: ${betAmount.toFixed(4)} SOL`, 
        "BettingService"
      );
      return {
        success: false,
        error: 'Insufficient balance',
        betAmount,
        direction: isBull,
        roundNumber: currentRound
      };
    }
    
    const signature = await placeBet(
      this.connection,
      this.program.programId,
      this.wallet.publicKey,
      this.signTransaction,
      currentRound,
      isBull,
      betAmount
    );

    if (signature) {
      const newBalance = await getBalance(this.wallet.publicKey, this.connection);
      this.logger.bot(`✅ Bet ${betAmount} SOL to ${isBull ? 'UP' : 'DOWN'} at Round ${currentRound} [${getFormattedDateTime()}]`);
      this.logger.bot(`�� https://explorer.solana.com/tx/${signature}?cluster=devnet`);
      this.logger.bot(`💰 Current Balance: ${newBalance.toFixed(4)} SOL`);
      
      if (this.runtimeConfig.direction) {
        this.runtimeConfig.direction = null;
      }

      return {
        success: true,
        signature,
        betAmount,
        direction: isBull,
        roundNumber: currentRound
      };
    }

    return {
      success: false,
      error: 'Failed to place bet',
      betAmount,
      direction: isBull,
      roundNumber: currentRound
    };
  }

  private getBettingStrategy(roundNumber: number): BettingStrategy {
    const isEven = roundNumber % 2 === 0;
    return {
      minBetAmount: isEven ? EVEN_MIN_BET_AMOUNT : ODD_MIN_BET_AMOUNT,
      maxBetAmount: isEven ? EVEN_MAX_BET_AMOUNT : ODD_MAX_BET_AMOUNT,
      multiplier: isEven ? EVEN_MULTIPLIER : ODD_MULTIPLIER,
      mode: isEven ? EVEN_MODE : ODD_MODE,
      direction: isEven ? EVEN_DIRECTION : ODD_DIRECTION,
    };
  }

  private determineBetDirection(round: Round): boolean {
    if (this.runtimeConfig.direction) {
      return this.runtimeConfig.direction === 'UP';
    }

    const strategy = this.getBettingStrategy(Number(round.number));
    let isBull = false;

    if (strategy.mode === 'GENERAL') {
      isBull = (strategy.direction === 'UP');
    } else if (strategy.mode === 'PAYOUT') {
      if (Number(round.totalBullAmount) >= Number(round.totalBearAmount)) {
        isBull = !(strategy.direction === 'UP');
      } else {
        isBull = (strategy.direction === 'UP');
      }
    }

    return isBull;
  }

  private async calculateBetAmount(currentRound: number, strategy: BettingStrategy): Promise<number> {
    const failedCount = await getFailedBetCount(
      this.wallet.publicKey.toBase58(), 
      currentRound, 
      this.runtimeConfig.startCalcRounds[currentRound % 2]
    );
    const baseAmount = this.runtimeConfig.betAmounts[currentRound % 2] > 0 
      ? this.runtimeConfig.betAmounts[currentRound % 2] 
      : strategy.minBetAmount;
    
    return baseAmount * Math.pow(strategy.multiplier, failedCount);
  }
}
