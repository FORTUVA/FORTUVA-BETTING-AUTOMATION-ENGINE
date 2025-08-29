import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
import idl from "../idl.json";
import { Config, Round, UserBet } from "../config/types";

export const getRoundPda = (roundNumber: number, programId: PublicKey) =>
  PublicKey.findProgramAddressSync(
    [
      Buffer.from("round"),
      new anchor.BN(roundNumber).toArrayLike(Buffer, "le", 8),
    ],
    programId
  )[0];

export const getUserBetPda = (user: PublicKey, roundNumber: number, programId: PublicKey) =>
  PublicKey.findProgramAddressSync(
    [
      Buffer.from("user_bet"),
      user.toBuffer(),
      new anchor.BN(roundNumber).toArrayLike(Buffer, "le", 8),
    ],
    programId
  )[0];

export const getConfigPda = (programId: PublicKey) =>
  PublicKey.findProgramAddressSync(
    [Buffer.from("config")],
    programId
  )[0];

export const getTreasuryPda = (programId: PublicKey) =>
  PublicKey.findProgramAddressSync(
    [Buffer.from("treasury")],
    programId
  )[0];

export const getConfig = async (program: anchor.Program): Promise<Config | null> => {
  try {
    const configPda = getConfigPda(program.programId);
    const config = await program.account.config.fetch(configPda) as Config;
    return config;
  }
  catch(error) {
    return null;
  }
}

export const getRound = async (roundNumber: number, program: anchor.Program): Promise<Round | null> => {
  try {
    const roundPda = getRoundPda(roundNumber, program.programId)
    const round = await program.account.round.fetch(roundPda) as Round;
    return round;
  }
  catch (error) {
    return null;
  }
}

export const getBet = async (user: PublicKey, roundNumber: number, program: anchor.Program): Promise<UserBet | null> => {
  try {
    const betPda = getUserBetPda(user, roundNumber, program.programId);
    const bet = await program.account.userBet.fetch(betPda) as UserBet;
    return bet;
  }
  catch (error) {
    return null;
  }
}

export const getCurrentTime = async (connection: Connection): Promise<number | null> => {
  const slot = await connection.getSlot();
  const blockTime = await connection.getBlockTime(slot);
  return blockTime;
}

export const getBalance = async (walletAddress: PublicKey, connection: Connection): Promise<number> => {
  const balance = await connection.getBalance(walletAddress);
  return balance / LAMPORTS_PER_SOL;
}

export const placeBet = async (
  connection: Connection,
  programId: PublicKey,
  userPubkey: PublicKey,
  signTransaction: (transaction: Transaction) => Promise<Transaction>,
  roundId: number,
  direction: boolean,
  amount: number
): Promise<string | null> => {
  try {
    const configPda = getConfigPda(programId)
    const treasuryPda = getTreasuryPda(programId)

    const provider = new anchor.AnchorProvider(
      connection,
      { publicKey: userPubkey, signTransaction } as any,
      { commitment: "confirmed" }
    );

    const program = new anchor.Program(idl as any, programId, provider);

    const roundPda = getRoundPda(roundId, programId);
    const userBetPda = getUserBetPda(userPubkey, roundId, programId);
    const betAccountInfo = await connection.getAccountInfo(userBetPda);
    if (betAccountInfo) {
      return null;
    }
    const tx = await program.methods
      .placeBet(
        new anchor.BN(amount * anchor.web3.LAMPORTS_PER_SOL),
        direction,
        new anchor.BN(roundId)
      )
      .accounts({
        config: configPda,
        round: roundPda,
        userBet: userBetPda,
        user: userPubkey,
        treasury: treasuryPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .transaction();

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');
    tx.recentBlockhash = blockhash;
    tx.feePayer = userPubkey;

    const signedTx = await signTransaction(tx);
    
    try {
      const signature = await connection.sendRawTransaction(
        signedTx.serialize(),
        {
          skipPreflight: false,
          preflightCommitment: "processed",
        }
      );

      const result = await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight
      }, "confirmed");

      if (result.value.err) {
        console.error("❌ Error in placeBet:", result.value.err);
        return null;
      }

      console.log("✅ Bet placed successfully. Tx Signature:", signature);
      return signature;
    } catch (sendError: any) {
      if (sendError.message?.includes("This transaction has already been processed")) {
        console.log("Transaction already processed, checking if it was successful");
        return null;
      }
      throw sendError;
    }

  } catch (error: any) {
    console.error("❌ Error in placeBet:", error);
    return null;
  }
}

export const claimPayout = async (
  connection: Connection,
  programId: PublicKey,
  userPubkey: PublicKey,
  signTransaction: (transaction: Transaction) => Promise<Transaction>,
  roundId: number
): Promise<string | null> => {
  try {
    const configPda = getConfigPda(programId);
    const treasuryPda = getTreasuryPda(programId);

    const provider = new anchor.AnchorProvider(
      connection,
      { publicKey: userPubkey, signTransaction } as any,
      { commitment: "confirmed" }
    );

    const program = new anchor.Program(idl as any, programId, provider);

    const roundPda = getRoundPda(roundId, programId);
    const userBetPda = getUserBetPda(userPubkey, roundId, programId);

    const tx = await program.methods
      .claimPayout(new anchor.BN(roundId))
      .accounts({
        config: configPda,
        round: roundPda,
        userBet: userBetPda,
        user: userPubkey,
        treasury: treasuryPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .transaction();

    const { blockhash } = await connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = userPubkey;

    const signedTx = await signTransaction(tx);
    const signature = await connection.sendRawTransaction(
      signedTx.serialize(),
      {
        preflightCommitment: "processed",
      }
    );

    await connection.confirmTransaction(signature, "confirmed");

    console.log("✅ Claim payout successful. Tx Signature:", signature);
    return signature;
  } catch (error: any) {
    console.error("❌ Error in claimRewards:", error);
    if (error.logs) console.error("🔍 Anchor logs:\n", error.logs.join("\n"));
    return null;
  }
}

export const cancelBet = async (
  connection: Connection,
  programId: PublicKey,
  userPubkey: PublicKey,
  signTransaction: (transaction: Transaction) => Promise<Transaction>,
  roundId: number
): Promise<string | null> => {
  try {
    const configPda = getConfigPda(programId);
    const treasuryPda = getTreasuryPda(programId);

    const provider = new anchor.AnchorProvider(
      connection,
      { publicKey: userPubkey, signTransaction } as any,
      { commitment: "confirmed" }
    );

    const program = new anchor.Program(idl as any, programId, provider);

    const roundPda = getRoundPda(roundId, programId);
    const userBetPda = getUserBetPda(userPubkey, roundId, programId);

    const tx = await program.methods
      .cancelBet(new anchor.BN(roundId))
      .accounts({
        config: configPda,
        round: roundPda,
        userBet: userBetPda,
        user: userPubkey,
        treasury: treasuryPda,
      })
      .transaction();

    const { blockhash } = await connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = userPubkey;

    const signedTx = await signTransaction(tx);
    const signature = await connection.sendRawTransaction(
      signedTx.serialize(),
      {
        preflightCommitment: "processed",
      }
    );

    await connection.confirmTransaction(signature, "confirmed");

    console.log("✅ Cancel bet successful. Tx Signature:", signature);
    return signature;
  } catch (error: any) {
    console.error("❌ Error in cancelBet:", error);
    if (error.logs) console.error("🔍 Anchor logs:\n", error.logs.join("\n"));
    return null;
  }
}

export const closeBet = async (
  connection: Connection,
  programId: PublicKey,
  userPubkey: PublicKey,
  signTransaction: (transaction: Transaction) => Promise<Transaction>,
  roundId: number
): Promise<string | null> => {
  try {

    const provider = new anchor.AnchorProvider(
      connection,
      { publicKey: userPubkey, signTransaction } as any,
      { commitment: "confirmed" }
    );

    const program = new anchor.Program(idl as any, programId, provider);

    const roundPda = getRoundPda(roundId, programId);
    const userBetPda = getUserBetPda(userPubkey, roundId, programId);
    
    const tx = await program.methods
      .closeBet(new anchor.BN(roundId))
      .accounts({
        userBet: userBetPda,
        round: roundPda,
        user: userPubkey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .transaction();

    const { blockhash } = await connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = userPubkey;

    const signedTx = await signTransaction(tx);
    const signature = await connection.sendRawTransaction(
      signedTx.serialize(),
      {
        preflightCommitment: "processed",
      }
    );

    await connection.confirmTransaction(signature, "confirmed");

    console.log("✅ Close bet successful. Tx Signature:", signature);
    return signature;
  } catch (error: any) {
    console.error("❌ Error in closeBet:", error);
    if (error.logs) console.error("🔍 Anchor logs:\n", error.logs.join("\n"));
    return null;
  }
}