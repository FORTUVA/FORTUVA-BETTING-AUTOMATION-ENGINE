import { DIRECTION_TYPE } from "../config";

export interface RuntimeConfig {
  direction: DIRECTION_TYPE | null;
  betAmounts: number[];
  startCalcRounds: number[];
}

export interface BettingStrategy {
  minBetAmount: number;
  maxBetAmount: number;
  multiplier: number;
  mode: string;
  direction: DIRECTION_TYPE;
}

export interface BettingResult {
  success: boolean;
  signature?: string;
  error?: string;
  betAmount: number;
  direction: boolean;
  roundNumber: number;
}

export interface ClaimResult {
  success: boolean;
  signature?: string;
  error?: string;
  rewardAmount: number;
  roundNumber: number;
}
