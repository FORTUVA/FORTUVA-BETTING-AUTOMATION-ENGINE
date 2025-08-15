import * as anchor from '@project-serum/anchor'
import { PublicKey } from '@solana/web3.js';

export type MODE_TYPE = "GENERAL" | "PAYOUT";
export type DIRECTION_TYPE = "UP" | "DOWN";

export interface Round {
  number: anchor.BN;
  startTime: anchor.BN; 
  lockTime: anchor.BN;
  closeTime: anchor.BN; 
  lockPrice:  anchor.BN;
  endPrice: anchor.BN;
  isActive: boolean;
  totalBullAmount: anchor.BN;
  totalBearAmount:  anchor.BN;
  totalAmount:  anchor.BN; 
  rewardAmount: anchor.BN;
}

export interface Config {
  lockDuration: anchor.BN; 
  currentRound: anchor.BN;
  isPaused: boolean;
}

export interface UserBet {
  user: PublicKey,
  roundNumber: anchor.BN,
  amount: anchor.BN,
  predictBull: boolean,
}

export interface BetResponse {
  id: number,
  amount: string,
  direction: 'up' | 'down',
  epoch: number,
  status: 'lost' | 'won' | 'pending' | 'claimed' | 'cancelled'
}

export interface RoundResponse {
  number: number;
  startTime: number; 
  lockTime: number;
  closeTime: number; 
  lockPrice:  number;
  endPrice: number;
  isActive: boolean;
  totalBullAmount: number;
  totalBearAmount:  number;
  totalAmount:  number; 
  rewardAmount: number;
  upPayout: number;
  downPayout: number;
  status: number
}