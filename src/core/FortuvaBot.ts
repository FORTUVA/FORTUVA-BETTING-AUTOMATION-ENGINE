import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import * as anchor from '@project-serum/anchor';
import bs58 from 'bs58';
import { Logger } from '../services/Logger';
import { BettingService } from '../services/BettingService';
import { ClaimService } from '../services/ClaimService';
import { UserInputService } from '../services/UserInputService';
import { InputHandler } from '../services/InputHandler';
import { RuntimeConfig } from '../types/BettingTypes';
import { getConfig, getFormattedDateTime } from '../utils';
import { 
  RPC_URL, 
  PROGRAM_ID, 
  INTERVAL_TIME,
  CONSIDERING_OLD_BETS
} from '../config';
import idl from '../idl.json';
import { CancelService } from '../services/CancelService';
import { CloseService } from '../services/CloseService';

export class FortuvaBot {
  private logger: Logger;
  private runtimeConfig: RuntimeConfig;
  private wallet: Keypair;
  private connection: Connection;
  private program: anchor.Program;
  private signTransaction: (tx: Transaction) => Promise<Transaction>;
  private bettingService: BettingService;
  private claimService: ClaimService;
  private cancelService: CancelService;
  private closeService: CloseService;
  private userInputService: UserInputService;
  private inputHandler: InputHandler;

  constructor() {
    this.logger = new Logger();
    this.runtimeConfig = {
      direction: null,
      betAmounts: [-1, -1],
      startCalcRounds: [0, 0],
    };
    
    this.wallet = Keypair.fromSecretKey(bs58.decode(process.env.PRIVATE_KEY!));
    this.connection = new Connection(RPC_URL, { commitment: 'confirmed' });
    
    this.signTransaction = async (tx: Transaction) => {
      tx.partialSign(this.wallet);
      return tx;
    };

    const provider = new anchor.AnchorProvider(
      this.connection, 
      {
        publicKey: this.wallet.publicKey,
        signTransaction: this.signTransaction,
      } as any, 
      { commitment: 'confirmed' }
    );

    this.program = new anchor.Program(idl as anchor.Idl, new PublicKey(PROGRAM_ID), provider);
    
    this.bettingService = new BettingService(
      this.logger,
      this.runtimeConfig,
      this.wallet,
      this.connection,
      this.program,
      this.signTransaction
    );
    
    this.claimService = new ClaimService(
      this.logger,
      this.wallet,
      this.connection,
      this.program,
      this.signTransaction
    );

    this.cancelService = new CancelService(
      this.logger,
      this.wallet,
      this.connection,
      this.program,
      this.signTransaction
    );
    
    this.closeService = new CloseService(
      this.logger,
      this.wallet,
      this.connection,
      this.program,
      this.signTransaction
    );
    
    this.userInputService = new UserInputService(
      this.logger,
      this.runtimeConfig,
      this.program
    );
    
    this.inputHandler = new InputHandler(
      this.logger,
      this.userInputService
    );
  }

  async initialize(): Promise<void> {
    try {
      const config = await getConfig(this.program);
      if (!CONSIDERING_OLD_BETS && config) {
        this.runtimeConfig.startCalcRounds = [Number(config.currentRound), Number(config.currentRound)];
      }
      this.logger.info('Bot initialized successfully', 'FortuvaBot');
    } catch (error) {
      this.logger.error(`Failed to initialize bot: ${error}`, 'FortuvaBot');
      throw error;
    }
  }

  setupInputHandling(): void {
    this.inputHandler.setupInputHandling();
  }

  start(): void {
    this.logger.bot(`[${getFormattedDateTime()}] 🚀 Fortuva Auto-Bet Bot Started...`);
    
    // Start betting loop
    setInterval(async () => {
      try {
        await this.bettingService.executeBet();
      } catch (error) {
        this.logger.error(`Error in betting loop: ${error}`, 'FortuvaBot');
      }
    }, INTERVAL_TIME * 1000);
    
    // Start claiming loop
    setInterval(async () => {
      try {
        await this.claimService.claimAllRewards();
        await this.cancelService.cancelAllBets();
        await this.closeService.closeAllBets();
      } catch (error) {
        this.logger.error(`Error in claiming loop: ${error}`, 'FortuvaBot');
      }
    }, 60 * 1000); // 1 minute
  }
}

