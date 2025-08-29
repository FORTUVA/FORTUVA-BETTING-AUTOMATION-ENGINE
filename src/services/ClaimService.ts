import { Connection, Keypair, Transaction } from '@solana/web3.js';
import * as anchor from '@project-serum/anchor';
import { Logger } from './Logger';
import { ClaimResult } from '../types/BettingTypes';
import { claimPayout, getBalance, getFormattedDateTime } from '../utils';
import { getClaimableBets } from '../api';

export class ClaimService {
  constructor(
    private logger: Logger,
    private wallet: Keypair,
    private connection: Connection,
    private program: anchor.Program,
    private signTransaction: (tx: Transaction) => Promise<Transaction>
  ) {}

  async claimAllRewards(): Promise<ClaimResult[]> {
    const results: ClaimResult[] = [];
    
    try {
      const claimableBets = await getClaimableBets(this.wallet.publicKey.toBase58());
      
      for (const bet of claimableBets) {
        try {
          const result = await this.claimSingleReward(bet.epoch);
          results.push(result);
        } catch (error) {
          this.logger.error(`Failed to claim reward for round ${bet.epoch}: ${error}`, "ClaimService");
          results.push({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            rewardAmount: 0,
            roundNumber: bet.epoch
          });
        }
      }
    } catch (error) {
      this.logger.error(`Error fetching claimable bets: ${error}`, "ClaimService");
    }

    return results;
  }

  private async claimSingleReward(roundNumber: number): Promise<ClaimResult> {
    const beforeClaimBalance = await getBalance(this.wallet.publicKey, this.connection);

    const signature = await claimPayout(
      this.connection,
      this.program.programId,
      this.wallet.publicKey,
      this.signTransaction,
      roundNumber
    );

    if (signature) {
      const afterClaimBalance = await getBalance(this.wallet.publicKey, this.connection);
      const reward = afterClaimBalance - beforeClaimBalance;

      this.logger.info(
        `✅ Claimed reward of ${reward.toFixed(4)} SOL for Round ${roundNumber} [${getFormattedDateTime()}]`,
        "ClaimService"
      );

      return {
        success: true,
        signature,
        rewardAmount: reward,
        roundNumber
      };
    }

    return {
      success: false,
      error: 'Failed to claim reward',
      rewardAmount: 0,
      roundNumber
    };
  }
}

