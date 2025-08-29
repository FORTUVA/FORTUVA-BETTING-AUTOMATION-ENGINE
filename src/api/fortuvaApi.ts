import axios, { AxiosInstance } from 'axios';
import { API_URL } from '../config';
import { BetResponse, RoundResponse } from '../config/types';

export class FortuvaApi {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      timeout: 10000,
    });
  }

  async getFailedBetCount(wallet: string, roundNumber: number, startRound: number): Promise<number> {
    try {
      const { data } = await this.client.get(
        `/user/failed-bet-count/${wallet}?roundNumber=${roundNumber}&startRound=${startRound}`
      );
      return data;
    }
    catch (err) {
      return 0;
    }
  }

  async getClaimableBets(wallet: string): Promise<BetResponse[]> {
    try {
      const { data } = await this.client.get(`/user/claimable-bet/${wallet}`);
      return data.data;
    }
    catch (err) {
      return []
    }
  }

  async getCancelableBets(wallet: string): Promise<BetResponse[]> {
    try {
      const { data } = await this.client.get(`/user/cancelable-bets/${wallet}`);
      return data.data;
    }
    catch (err) {
      return []
    }
  }

  async getClosesableBets(wallet: string): Promise<BetResponse[]> {
    try {
      const { data } = await this.client.get(`/user/closeable-bets/${wallet}`);
      return data.data;
    }
    catch (err) {
      return []
    }
  }

  async getRoundInfo(roundNumber: number): Promise<RoundResponse | null> {
    try {
      const { data } = await this.client.get(`/round/${roundNumber}`);
      return data;
    }
    catch (err) {
      return null;
    }
  }
}

// Export singleton instance
export const fortuvaApi = new FortuvaApi();

// Export legacy functions for backward compatibility
export const getFailedBetCount = (wallet: string, roundNumber: number, startRound: number): Promise<number> => {
  return fortuvaApi.getFailedBetCount(wallet, roundNumber, startRound);
};

export const getClaimableBets = (wallet: string): Promise<BetResponse[]> => {
  return fortuvaApi.getClaimableBets(wallet);
};

export const getCancelableBets = (wallet: string): Promise<BetResponse[]> => {
  return fortuvaApi.getCancelableBets(wallet);
};

export const getClosesableBets = (wallet: string): Promise<BetResponse[]> => {
  return fortuvaApi.getClosesableBets(wallet);
};

export const getRoundInfo = (roundNumber: number): Promise<RoundResponse | null> => {
  return fortuvaApi.getRoundInfo(roundNumber);
};
