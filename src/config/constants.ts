import dotenv from 'dotenv';
import { DIRECTION_TYPE, MODE_TYPE } from './types';
dotenv.config();

// Network Configuration
export const RPC_URL = process.env.RPC_URL || "https://api.devnet.solana.com"; // Now configurable via environment variable. Change to mainnet RPC (e.g., "https://api.mainnet-beta.solana.com") for production use
export const PROGRAM_ID = "9LJu14Y1jQvCKB7zuFuwfBw2UUTYU12nckKRhaRLdwS5";
export const API_URL = "https://automation-bot-backend.onrender.com/"; //https://botapi.fortuva.xyz

// Timing Configuration
export const BET_TIME = 10; // Seconds before round lock to place bet
export const INTERVAL_TIME = 5; // Seconds between bot checks

// Betting Strategy Configuration
export const EVEN_MIN_BET_AMOUNT = 0.01; // Minimum bet for even rounds
export const EVEN_MAX_BET_AMOUNT = 1;     // Maximum bet for even rounds
export const EVEN_MULTIPLIER = 2.1;       // Multiplier for bet amount after failed bets. Set to 1 for consistent bet amounts (no increase after losses)
export const EVEN_MODE: MODE_TYPE = "GENERAL"; // Betting mode GENERAL| PAYOUT
export const EVEN_DIRECTION: DIRECTION_TYPE = "DOWN"; // Betting direction

export const ODD_MIN_BET_AMOUNT = 0.01;   // Minimum bet for odd rounds
export const ODD_MAX_BET_AMOUNT = 1;       // Maximum bet for odd rounds
export const ODD_MULTIPLIER = 2;         // Multiplier for bet amount after failed bets. Set to 1 for consistent bet amounts (no increase after losses)
export const ODD_MODE: MODE_TYPE = "PAYOUT"; // Betting mode GENERAL| PAYOUT
export const ODD_DIRECTION: DIRECTION_TYPE = "UP"; // When MODE_TYPE is "PAYOUT", 'UP' means bet in the direction which its payout is bigger


export const CONSIDERING_OLD_BETS = false; // Determines bet amount calculation strategy: true includes historical wallet bets, false starts fresh from current round