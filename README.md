
<img width="948" height="638" alt="image" src="https://github.com/user-attachments/assets/bb33832f-5e2a-44d6-86e2-b0c0f7bc6122" />


# FHEVM Tutorial 🔐

An interactive, step-by-step tutorial for building confidential applications with Fully Homomorphic Encryption (FHE) on the Zama Protocol. Learn to build private voting systems, encrypted counters, and other confidential dApps using cutting-edge cryptographic technology.

## 🌐 Live Demo

**[Try the tutorial online →](https://hello-evm-bounty.netlify.app/)**

Experience the full interactive tutorial with live contract interactions, real-time encryption, and hands-on demos on the Sepolia testnet.

## ✨ Features

- 🎓 **10 Comprehensive Steps** - From basics to advanced concepts
- 🧠 **Interactive Quizzes** - Test your knowledge at each step
- 🎮 **Live Demos** - Real contract interactions on Sepolia testnet
- 🔐 **Hands-on Encryption** - Encrypt and decrypt data in real-time
- 📚 **Rich Documentation** - Detailed explanations and code examples
- 🎨 **Modern UI** - Beautiful, responsive design with animations
- ⚡ **Real-time Feedback** - Instant validation and error handling

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/realchriswilder/hello-fhevm.git
cd hello-fhevm

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173
```

## 🎯 What You'll Learn

- **FHE Fundamentals** - How confidential computing works
- **FHEVM Architecture** - Understanding the Zama Protocol ecosystem
- **Encrypted Data Types** - Working with euint8, ebool, and more
- **Client-Side Encryption** - Encrypt data before sending to blockchain
- **Homomorphic Operations** - Compute on encrypted data without decryption
- **Smart Contract Development** - Writing FHEVM contracts in Solidity
- **Contract Deployment** - Deploying to Sepolia testnet
- **Private Voting Systems** - Build complete confidential dApps
- **Relayer SDK** - Frontend integration with encrypted operations
- **Zero-Knowledge Proofs** - Validating encrypted inputs

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS + Montserrat Alternates + Framer Motion
- **Blockchain**: Wagmi + RainbowKit + Viem
- **FHE**: fhevmjs + Zama Protocol
- **State Management**: Zustand
- **UI Components**: Radix UI + Lucide Icons
- **Testing**: Hardhat + Ethers.js

## 📖 Complete Tutorial Steps

### **Phase 1: Foundation** 🏗️
1. **Welcome** - Introduction to FHEVM and confidential computing
2. **Environment Setup** - Development tools, Node.js, npm, MetaMask
3. **Connect Wallet** - Wallet integration and Sepolia testnet setup

### **Phase 2: FHE Concepts** 🧠
4. **FHE Basics** - Understanding homomorphic encryption, FHEVM architecture
5. **Write Contract** - Writing your first FHEVM smart contract
6. **Contract Overview** - Deep dive into the SimpleVoting contract

### **Phase 3: Hands-on Development** 🛠️
7. **Deploy & Test Counter** - Deploy FHECounter contract to Sepolia
8. **Testing Playground** - Interactive FHE operations and scenarios
9. **Private Voting** - Live voting demo with encrypted tallies

### **Phase 4: Mastery** 🎓
10. **Review & Quiz** - Comprehensive assessment and next steps

## 🧠 Interactive Quiz System

Each tutorial step includes a **"Test Your IQ"** quiz with 5 technical questions:

- **Step 2**: Environment setup, Node.js, npm, development tools
- **Step 3**: Wallet security, MetaMask, Sepolia testnet
- **Step 4**: FHE concepts, FHEVM architecture, encrypted types
- **Step 5**: Smart contract development, FHE operations
- **Step 6**: Contract structure, voting logic, FHE.select()
- **Step 7**: Contract deployment, encrypted counters, homomorphic operations
- **Step 8**: Playground scenarios, vote encryption, ZK proofs
- **Step 9**: Private voting, relayer SDK, local encryption
- **Step 10**: Comprehensive final assessment

## 🔧 Environment Setup

### Prerequisites
- **Node.js** v18+ (LTS recommended)
- **npm** (Node package manager)
- **MetaMask** browser extension
- **Sepolia ETH** for gas fees

### Configuration

Create a `.env` file:

```bash
# Copy example
cp .env.example .env

# Add your configuration
VITE_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
VITE_CHAIN_ID=11155111
VITE_VOTING_CONTRACT_ADDRESS=0x...
```

### Contract Deployment

```bash
# Navigate to contract directory
cd vote-app

# Install contract dependencies
npm install

# Compile contracts
npx hardhat compile

# Deploy to Sepolia
npx hardhat run scripts/deploy.cjs --network sepolia
```

## 🎮 Live Demos

### Private Voting System
- Create encrypted voting sessions
- Cast private votes (YES/NO)
- View encrypted tallies
- Reveal final results

### Encrypted Counter
- Deploy FHECounter contract
- Increment/decrement encrypted values
- Check encrypted counts
- Understand homomorphic operations

### Testing Playground
- Basic vote encryption scenarios
- Homomorphic vote tallying
- Contract logic simulation
- Error handling & edge cases

## 🏗️ Project Structure

```
src/
├── components/
│   ├── steps/           # Tutorial step components
│   ├── quiz/            # Interactive quiz components
│   └── ui/              # Reusable UI components
├── lib/
│   ├── contracts/       # Contract types and ABI
│   └── utils/           # Utility functions
├── state/               # Zustand state management
└── App.tsx              # Main application

vote-app/                # Smart contract project
├── contracts/           # Solidity contracts
├── scripts/             # Deployment scripts
└── artifacts/           # Compiled contracts
```

## 🔐 Technical Concepts Covered

### FHEVM Fundamentals
- **Homomorphic Encryption** - Compute on encrypted data
- **Encrypted Types** - euint8, ebool, eaddress, ebytesX
- **FHE Operations** - add, sub, mul, div, eq, lt, gt, select
- **Zero-Knowledge Proofs** - Validate encrypted inputs

### Smart Contract Development
- **FHEVM Contracts** - Writing confidential Solidity
- **Permission Management** - FHE.allow(), FHE.allowThis()
- **Decryption Requests** - FHE.requestDecryption()
- **Oracle Integration** - FHE.checkSignatures()

### Frontend Integration
- **Relayer SDK** - @zama-fhe/relayer-sdk
- **Client-Side Encryption** - fhevmjs library
- **Wallet Integration** - Wagmi + RainbowKit
- **State Management** - Zustand stores

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

### Deploy to Vercel/Netlify
```bash
# Build and deploy
npm run build
# Upload dist/ folder to your hosting platform
```

## 📚 Learning Resources

### Official Documentation
- [Zama Documentation](https://docs.zama.ai) - Complete FHEVM guide
- [FHEVM Guide](https://docs.zama.ai/fhevm) - Smart contract development
- [fhevmjs Library](https://docs.zama.ai/fhevm/fundamentals/fhevmjs) - Frontend integration
- [Relayer SDK](https://docs.zama.ai/protocol/relayer-sdk-guides) - Client-side encryption

### Community & Support
- [Zama Discord](https://discord.gg/zama) - Community support
- [GitHub Issues](https://github.com/zama-ai/fhevm/issues) - Technical support
- [Twitter](https://twitter.com/zama_fhe) - Latest updates

### Additional Tutorials
- [FHEVM Hardhat Template](https://github.com/zama-ai/fhevm-hardhat-template)
- [Confidential Voting Example](https://github.com/zama-ai/fhevm-examples)
- [FHEVM Documentation](https://docs.zama.ai/fhevm)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
```bash
# Fork the repository
git clone https://github.com/your-username/hello-fhevm.git
cd hello-fhevm

# Install dependencies
npm install

# Start development server
npm run dev
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Zama Protocol** - For the amazing FHEVM technology
- **OpenZeppelin** - For smart contract security patterns
- **React Community** - For the excellent ecosystem
- **Contributors** - For making this tutorial better

---

**Built with ❤️ for confidential computing education**

*Empowering developers to build the next generation of private applications*
