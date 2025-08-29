import { Connection, Keypair, Transaction } from '@solana/web3.js';
import * as anchor from '@project-serum/anchor';
import { Logger } from './Logger';
import { CancelResult } from '../types/BettingTypes';
import { getBalance, getFormattedDateTime, cancelBet } from '../utils';
import { getCancelableBets } from '../api';

export class CancelService {
  constructor(
    private logger: Logger,
    private wallet: Keypair,
    private connection: Connection,
    private program: anchor.Program,
    private signTransaction: (tx: Transaction) => Promise<Transaction>
  ) {}

  async cancelAllBets(): Promise<CancelResult[]> {
    const results: CancelResult[] = [];
    
    try {
      const cancelableBets = await getCancelableBets(this.wallet.publicKey.toBase58());
      
      for (const bet of cancelableBets) {
        try {
          const result = await this.cancelSingleBet(bet.epoch);
          results.push(result);
        } catch (error) {
          this.logger.error(`Failed to cancel bet for round ${bet.epoch}: ${error}`, "CancelService");
          results.push({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            refundAmount: 0,
            roundNumber: bet.epoch
          });
        }
      }
    } catch (error) {
      this.logger.error(`Error fetching cancelable bets: ${error}`, "CancelService");
    }

    return results;
  }

  private async cancelSingleBet(roundNumber: number): Promise<CancelResult> {
    const beforeCancelBalance = await getBalance(this.wallet.publicKey, this.connection);

    const signature = await cancelBet(
      this.connection,
      this.program.programId,
      this.wallet.publicKey,
      this.signTransaction,
      roundNumber
    );

    if (signature) {
      const afterCancelBalance = await getBalance(this.wallet.publicKey, this.connection);
      const refund = afterCancelBalance - beforeCancelBalance;

      this.logger.info(
        `✅ Cancelled bet and refunded ${refund.toFixed(4)} SOL for Round ${roundNumber} [${getFormattedDateTime()}]`,
        "CancelService"
      );

      return {
        success: true,
        signature,
        refundAmount: refund,
        roundNumber
      };
    }

    return {
      success: false,
      error: 'Failed to cancel bet',
      refundAmount: 0,
      roundNumber
    };
  }
}
