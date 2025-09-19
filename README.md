
<img width="948" height="638" alt="image" src="https://github.com/user-attachments/assets/bb33832f-5e2a-44d6-86e2-b0c0f7bc6122" />


# FHEVM Tutorial 🔐

An interactive tutorial for building confidential applications with Fully Homomorphic Encryption (FHE) on the Zama Protocol.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173
```

## 🎯 What You'll Learn

- **FHE Fundamentals** - How confidential computing works
- **Client-Side Encryption** - Encrypt data before sending to blockchain
- **Homomorphic Operations** - Compute on encrypted data
- **Private Voting Demo** - Build a complete confidential dApp

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS + Montserrat Alternates
- **Blockchain**: Wagmi + RainbowKit
- **FHE**: fhevmjs
- **State**: Zustand

## 📖 Tutorial Steps

1. **Welcome** - Introduction to FHEVM
2. **Environment Setup** - Development tools
3. **Connect Wallet** - MetaMask integration
4. **FHE Basics** - Encryption playground
5. **Testing Playground** - Interactive FHE operations
6. **Private Voting Demo** - Live contract interaction on Sepolia
7. **Review** - Next steps and resources

## 🔧 Environment Setup

Create a `.env` file:

```bash
# Copy example
cp .env.example .env

# Add your configuration
VITE_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
VITE_CHAIN_ID=11155111
```

## 🚀 Deployment

```bash
# Build for production
npm run build

# Deploy to Vercel/Netlify
```

## 📚 Resources

- [Zama Documentation](https://docs.zama.ai)
- [FHEVM Guide](https://docs.zama.ai/fhevm)
- [fhevmjs Library](https://docs.zama.ai/fhevm/fundamentals/fhevmjs)

---

**Built with ❤️ for confidential computing education**
