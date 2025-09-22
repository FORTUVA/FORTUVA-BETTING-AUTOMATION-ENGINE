# FORTUVA-BETTING-AUTOMATION-ENGINE

An open-source helper tool for **Fortuva Prediction** players on Solana.  
This enginee does **not** predict market direction — it simply places bets automatically in the direction you choose, so you can focus on your own strategy.

## 🔐 Safe Private Key Handling

### ⚠️ Security Disclaimer

**IMPORTANT**: This enginee runs locally on your computer. Your private key never leaves your device, and no external services collect or store it. However, always use a dedicated wallet with only the SOL you're willing to use for betting. Never use your primary wallet for automated tools.

### 🛡️ Best Practices

#### 1. Create a Dedicated enginee Wallet
- **Generate a new Solana wallet** specifically for enginee operations
- **Never use your main wallet** or any wallet containing significant funds
- **Fund it only** with the amount you're willing to risk for betting

#### 2. Secure Private Key Storage
- **Environment Variables**: Store your private key in a `.env` file (never commit this file)
- **File Permissions**: Ensure `.env` file has restricted access (600 permissions on Unix systems)
- **Backup Securely**: Keep a secure backup of your enginee wallet's private key

#### 3. Wallet Separation Strategy

##  Features

### Core Functionality
- **Automated Betting**: Places bets automatically on prediction rounds with configurable strategies
- **Smart Betting Logic**: Implements different strategies for odd/even rounds with dynamic bet amounts
- **Automatic Reward Claiming**: Automatically claims rewards from winning bets
- **Bet Cancellation**: Automatically cancels bets that are eligible for cancellation (e.g., when rounds are cancelled)
- **Bet Closing**: Automatically closes completed bets to free up account space
- **Interactive Controls**: Real-time manual betting control via keyboard input
- **Real-time Bet Status**: Users can monitor their bets in real-time by connecting the enginee wallet to Fortuva App (https://app.fortuva.xyz)
- **Dynamic Betting Strategy**: Implements Martingale-like progression with configurable multipliers
- **Round-based Logic**: Separate strategies for odd and even numbered rounds

### Advanced Features
- **Multi-mode Betting**: Supports engineeh "GENERAL" (fixed direction) and "PAYOUT" (dynamic based on pool distribution) modes
- **Failed Bet Recovery**: Automatically increases bet amounts after consecutive losses
- **Balance Monitoring**: Real-time balance tracking and insufficient funds warnings
- **Transaction Monitoring**: Detailed transaction logging with Solana explorer links
- **API Integration**: Fetches bet history and claimable rewards from external API

## 🎯 What It Does

### Core Capabilities
- **Automates bet placement** — never miss a round due to timing
- **Supports your strategy** — run it with any algorithm, signal, or manual direction you choose
- **Automatic reward claiming** — claims your winnings for you
- **Interactive control** — change direction and bet size anytime

### Real-time Monitoring
- **Live bet tracking** — monitor all enginee activity through Fortuva App (https://app.fortuva.xyz)
- **Balance updates** — real-time wallet balance monitoring
- **Transaction logging** — detailed logs with explorer links for verification

## ❌ What It Does *Not* Do

### Important Limitations
- **No predictions** — It does **not** predict whether SOL will go up or down
- **No unfair advantage** — It does **not** give any unfair advantage — all players have the same access to this tool
- **Strategy dependent** — Win rate depends entirely on **your own strategy**

### Fair Play Assurance
- **Equal access** — All users have the same tool capabilities
- **Transparent operation** — All transactions are visible on-chain
- **No insider information** — Uses only publicly available data

## 🚀 Why Use It?

### Key Benefits
- **24/7 operation** — Keep playing while you're away from your keyboard
- **Strategy integration** — Run your own trading or market analysis scripts and connect them to the enginee
- **FN token rewards** — Earn **FN tokens** on every bet, even if your prediction is wrong
- **Reduced missed rounds** — Reduce missed rounds due to manual delays
- **Consistent execution** — Eliminate human error and timing issues

### Competitive Advantages
- **Automated efficiency** — Never miss optimal betting windows
- **Strategy consistency** — Execute your strategy without emotional interference
- **Multi-tasking** — Focus on analysis while enginee handles execution

## 📋 Prerequisites

- **Node.js**: v14 or higher
- **npm**: Package manager
- **Solana Wallet**: With SOL for betting
- **TypeScript**: For development and compilation

## 🛠️ Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd sol-prediction-simple-enginee
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `.env` file in the root directory:
   ```env
   # Solana wallet private key (base58 encoded)
   PRIVATE_KEY=your_private_key_here
   
   # Solana RPC URL (optional - defaults to devnet)
   RPC_URL=https://api.devnet.solana.com
   ```

## ⚙️ Configuration

### Core Configuration (`src/config.ts`)

```typescript
// Network Configuration
export const RPC_URL = process.env.RPC_URL || "https://api.devnet.solana.com"; // Now configurable via environment variable. Change to mainnet RPC (e.g., "https://api.mainnet-beta.solana.com") for production use
export const PROGRAM_ID = "2fW8rcHAShyHDSKdVwnLb3tuhXvxp3JUtxfAPKPgybiA";
export const API_URL = "https://engineeapi.fortuva.xyz";

// Timing Configuration
export const BET_TIME = 10; // Seconds before round lock to place bet
export const INTERVAL_TIME = 5; // Seconds between enginee checks

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
```

### Betting Modes

- **GENERAL**: Always bets in the configured direction (UP/DOWN)
- **PAYOUT**: Bets in the direction that has the bigger payout potential. When DIRECTION_TYPE is 'UP', it means bet in the direction which its payout is bigger

## 🎮 Usage

### Real-time Bet Monitoring

**Important**: Users can connect their enginee wallet to Fortuva App (https://app.fortuva.xyz) and they can see the real time bet status on the frontend in real time.

### Starting the enginee

```bash
# Start the main enginee
npm start

# Or run directly with ts-node
npx ts-node src/index.ts
```

### Interactive Controls

While the enginee is running, you can use keyboard controls:

- **Press 'S' or 's'**: Enter manual betting mode
- **Format**: `DIRECTION/AMOUNT` (e.g., `UP/0.01` or `DOWN/0.02`)
- **Type 'exit'**: Exit the interactive input mode and return to enginee mode
- **Ctrl+C**: Exit the enginee completely

### Manual Betting Example

```
[INPUT] Enter direction and amount (e.g., UP/0.01 or DOWN/0.02): UP/0.05
[INPUT] Direction set to UP, bet amount set to 0.05 SOL in Round #1234
```

**Exiting Interactive Mode:**
```
[INPUT] Enter direction and amount (e.g., UP/0.01 or DOWN/0.02): exit
[INPUT] Input cancelled.
```

### Claiming Rewards

```bash
# Run the claim script separately
npm run claim

# Or run directly
npx ts-node src/claimAll.ts
```

### Automatic Bet Management

The enginee includes comprehensive bet management features that run automatically every 60 seconds:

#### Bet Cancellation
- **Automatic Detection**: Fetches cancelable bets from the Fortuva API
- **Refund Processing**: Cancels eligible bets and processes refunds to your wallet
- **Balance Tracking**: Monitors balance changes to confirm refund amounts
- **Logging**: Detailed logs with transaction signatures and refund amounts

#### Bet Closing
- **Account Cleanup**: Automatically closes completed bets to free up account space
- **Gas Optimization**: Reduces storage costs by cleaning up old bet accounts
- **Transaction Logging**: Logs all close operations with transaction signatures

#### Reward Claiming
- **Winning Bet Detection**: Identifies all winning bets eligible for claiming
- **Automatic Payout**: Claims rewards for all winning bets automatically
- **Balance Updates**: Tracks balance increases from claimed rewards
- **Comprehensive Logging**: Logs all claim operations with amounts and signatures

### Bet Management Workflow

1. **Every 60 seconds**, the enginee automatically:
   - Claims rewards from winning bets
   - Cancels eligible bets and processes refunds
   - Closes completed bets to free account space

2. **API Integration**: Uses Fortuva's API to:
   - Fetch claimable bets (`/user/claimable-bet/{wallet}`)
   - Fetch cancelable bets (`/user/cancelable-bets/{wallet}`)
   - Fetch closeable bets (`/user/closesable-bets/{wallet}`)

3. **Transaction Processing**: Each operation:
   - Creates and signs the appropriate Solana transaction
   - Submits to the blockchain with proper error handling
   - Confirms transaction success
   - Logs results with transaction signatures

4. **Error Handling**: Robust error handling ensures:
   - Failed operations don't stop the enginee
   - Individual bet failures are logged but don't affect other operations
   - Network issues are handled gracefully

## 🔧 Project Structure

```
sol-prediction-simple-enginee/
├── src/
│   ├── api/
│   │   ├── fortuvaApi.ts  # Fortuva API integration
│   │   └── index.ts       # API exports
│   ├── config/
│   │   ├── constants.ts   # Configuration constants
│   │   ├── index.ts       # Config exports
│   │   └── types.ts       # Configuration types
│   ├── core/
│   │   └── Fortuvaenginee.ts  # Core enginee implementation
│   ├── services/
│   │   ├── BettingService.ts    # Betting logic service
│   │   ├── ClaimService.ts      # Claiming logic service
│   │   ├── InputHandler.ts      # Input handling service
│   │   ├── Logger.ts            # Logging service
│   │   └── UserInputService.ts  # User input service
│   ├── types/
│   │   └── BettingTypes.ts      # Betting-related types
│   ├── utils/
│   │   ├── blockchain.ts        # Blockchain utilities
│   │   ├── helpers.ts           # Helper functions
│   │   └── index.ts             # Utility exports
│   ├── api.ts                   # External API integration
│   ├── claimAll.ts              # Automatic reward claiming
│   ├── config.ts                # Configuration setup
│   ├── index.ts                 # Main entry point
│   ├── types.ts                 # TypeScript type definitions
│   ├── utils.ts                 # Core utility functions
│   └── idl.json                 # Solana program interface definition
├── package.json                 # Dependencies and scripts
├── package-lock.json            # Dependency lock file
├── tsconfig.json                # TypeScript configuration
└── README.md                    # This file
```

The updated folder structure now accurately reflects the current project organization with:

1. **Organized subdirectories**: `api/`, `config/`, `core/`, `services/`, `types/`, and `utils/`
2. **Service-based architecture**: Separate services for betting, claiming, input handling, logging, and user input
3. **Modular configuration**: Configuration split into constants, types, and index files
4. **Utility organization**: Blockchain utilities, helpers, and general utilities separated
5. **Type organization**: Betting-specific types in their own directory
6. **Added package-lock.json**: Included the dependency lock file

This structure shows a much more organized and maintainable codebase compared to the previous flat structure.

## 🎯 enginee Logic

### Betting Strategy

1. **Round Analysis**: Determines if current round is odd or even
2. **Strategy Selection**: Applies different strategies based on round number
3. **Bet Calculation**: 
   - Base amount from configuration
   - Multiplied by failed bet count
   - Capped at maximum bet amount
4. **Direction Decision**:
   - Uses runtime direction if manually set
   - Otherwise uses configured strategy (GENERAL/PAYOUT)
5. **Timing**: Places bet near the end of each round (configurable via BET_TIME in config.ts - can be adjusted to bet at any time during the 180-second round duration)

### Failed Bet Recovery

The enginee implements a Martingale-like strategy:
- Tracks consecutive failed bets for each round type (odd/even)
- Multiplies bet amount by configured multiplier after each loss
- Resets to base amount after a win

### Automatic Claiming

- Runs every 60 seconds
- Fetches claimable bets from API
- Claims rewards for all winning bets
- Logs claimed amounts and new balance

### Automatic Bet Management

The enginee includes comprehensive bet management features that run automatically every 60 seconds:

#### Bet Cancellation
- **Automatic Detection**: Fetches cancelable bets from the Fortuva API
- **Refund Processing**: Cancels eligible bets and processes refunds to your wallet
- **Balance Tracking**: Monitors balance changes to confirm refund amounts
- **Logging**: Detailed logs with transaction signatures and refund amounts

#### Bet Closing
- **Account Cleanup**: Automatically closes completed bets to free up account space
- **Gas Optimization**: Reduces storage costs by cleaning up old bet accounts
- **Transaction Logging**: Logs all close operations with transaction signatures

#### Reward Claiming
- **Winning Bet Detection**: Identifies all winning bets eligible for claiming
- **Automatic Payout**: Claims rewards for all winning bets automatically
- **Balance Updates**: Tracks balance increases from claimed rewards
- **Comprehensive Logging**: Logs all claim operations with amounts and signatures

### Bet Management Workflow

1. **Every 60 seconds**, the enginee automatically:
   - Claims rewards from winning bets
   - Cancels eligible bets and processes refunds
   - Closes completed bets to free account space

2. **API Integration**: Uses Fortuva's API to:
   - Fetch claimable bets (`/user/claimable-bet/{wallet}`)
   - Fetch cancelable bets (`/user/cancelable-bets/{wallet}`)
   - Fetch closeable bets (`/user/closesable-bets/{wallet}`)

3. **Transaction Processing**: Each operation:
   - Creates and signs the appropriate Solana transaction
   - Submits to the blockchain with proper error handling
   - Confirms transaction success
   - Logs results with transaction signatures

4. **Error Handling**: Robust error handling ensures:
   - Failed operations don't stop the enginee
   - Individual bet failures are logged but don't affect other operations
   - Network issues are handled gracefully

## 🌐 Network Configuration

### Devnet (Default)
RPC URL: Solana devnet endpoint

### Mainnet Setup
To switch to mainnet:

Update `RPC_URL` in your `.env` file to a mainnet endpoint:
   ```env
   RPC_URL=https://api.mainnet-beta.solana.com
```