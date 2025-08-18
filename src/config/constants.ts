import dotenv from 'dotenv';
import { DIRECTION_TYPE, MODE_TYPE } from './types';
dotenv.config();

export const RPC_URL = process.env.RPC_URL || "https://api.devnet.solana.com";
export const PROGRAM_ID = "Nova9KSMwH13y451PwUERP7oE2ZvSiLrfDjnNgBzWv9";
export const API_URL = "https://botapi.fortuva.xyz";
export const BET_TIME = 10; //SECONDS
export const INTERVAL_TIME = 5; //SECONDS;
export const CONSIDERING_OLD_BETS = false;

export const EVEN_MIN_BET_AMOUNT = 0.01;
export const EVEN_MAX_BET_AMOUNT = 1;
export const EVEN_MULTIPLIER = 2.1;
export const EVEN_MODE: MODE_TYPE = "GENERAL";
export const EVEN_DIRECTION: DIRECTION_TYPE = "DOWN";

export const ODD_MIN_BET_AMOUNT = 0.01;
export const ODD_MAX_BET_AMOUNT = 1;
export const ODD_MULTIPLIER = 2;
export const ODD_MODE: MODE_TYPE = "GENERAL";
export const ODD_DIRECTION: DIRECTION_TYPE = "UP";
