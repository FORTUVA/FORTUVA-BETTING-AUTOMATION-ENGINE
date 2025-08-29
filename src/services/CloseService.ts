import { Connection, Keypair, Transaction } from '@solana/web3.js';
import * as anchor from '@project-serum/anchor';
import { Logger } from './Logger';
import { CloseResult } from '../types/BettingTypes';
import { getFormattedDateTime, closeBet } from '../utils';
import { getClosesableBets } from '../api';

export class CloseService {
  constructor(
    private logger: Logger,
    private wallet: Keypair,
    private connection: Connection,
    private program: anchor.Program,
    private signTransaction: (tx: Transaction) => Promise<Transaction>
  ) {}

  async closeAllBets(): Promise<CloseResult[]> {
    const results: CloseResult[] = [];
    
    try {
      const closeableBets = await getClosesableBets(this.wallet.publicKey.toBase58());
      
      for (const bet of closeableBets) {
        try {
          const result = await this.closeSingleBet(bet.epoch);
          results.push(result);
        } catch (error) {
          this.logger.error(`Failed to close bet for round ${bet.epoch}: ${error}`, "CloseService");
          results.push({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            roundNumber: bet.epoch
          });
        }
      }
    } catch (error) {
      this.logger.error(`Error fetching closeable bets: ${error}`, "CloseService");
    }

    return results;
  }

  private async closeSingleBet(roundNumber: number): Promise<CloseResult> {
    const signature = await closeBet(
      this.connection,
      this.program.programId,
      this.wallet.publicKey,
      this.signTransaction,
      roundNumber
    );

    if (signature) {
      this.logger.info(
        `✅ Closed bet for Round ${roundNumber} [${getFormattedDateTime()}]`,
        "CloseService"
      );

      return {
        success: true,
        signature,
        roundNumber
      };
    }

    return {
      success: false,
      error: 'Failed to close bet',
      roundNumber
    };
  }
}

