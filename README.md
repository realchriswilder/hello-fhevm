# Hello FHEVM Tutorial 🔐

An interactive, educational tutorial for building your first confidential application on the Zama Protocol. Learn Fully Homomorphic Encryption (FHE) through hands-on development of a private voting dApp.

![Hello FHEVM Tutorial](https://via.placeholder.com/800x400/FFD200/000000?text=Hello+FHEVM+Tutorial)

## 🎯 What You'll Learn

- **FHE Fundamentals**: Understand how confidential computing works
- **Client-Side Encryption**: Encrypt data using fhevmjs before sending to blockchain
- **Homomorphic Operations**: Perform computations on encrypted data onchain
- **Controlled Decryption**: Reveal results while keeping individual inputs private
- **Complete dApp Development**: Build a functional confidential voting application

## 🚀 Quick Start (5 minutes)

### Prerequisites
- Node.js 18+ installed
- MetaMask browser extension
- Basic JavaScript/TypeScript knowledge

### Installation

1. **Clone and install**
   ```bash
   git clone https://github.com/zama-ai/hello-fhevm-tutorial.git
   cd hello-fhevm-tutorial
   pnpm install
   ```

2. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env and add your Comicy font URL if available
   ```

3. **Start development server**
   ```bash
   pnpm dev
   ```

4. **Open tutorial**
   Navigate to `http://localhost:8080` and start learning!

## 🏗️ Architecture

This tutorial demonstrates a complete FHEVM development stack:

```
Frontend (React + TypeScript)
├── fhevmjs (Client-side encryption)
├── Wagmi + Viem (Blockchain interaction) 
├── Zustand (State management)
└── Tailwind CSS (Zama-branded UI)

Backend (Smart Contracts)
├── FHEVM-compatible Solidity
├── Zama Devnet deployment
└── Mock services for offline learning
```

## 📖 Tutorial Structure

### Step 1: Welcome
- Introduction to confidential computing
- Overview of what you'll build
- Learning objectives

### Step 2: Environment Setup  
- Development tools installation
- Dependency management
- Environment configuration

### Step 3: Connect Wallet & Network
- MetaMask integration with Wagmi
- Zama Devnet configuration
- Account and balance monitoring

### Step 4: FHE Basics
- Interactive encryption playground
- Understanding ciphertext properties
- Homomorphic operations demo

### Step 5: Private Voting Demo
- Complete voting dApp implementation
- Encrypted vote submission
- Tally computation and decryption

### Step 6: Review & Next Steps
- Concepts recap
- Production deployment guidance
- Advanced patterns and resources

## 🛠️ Technology Stack

- **Framework**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS with Zama brand colors
- **UI Components**: Headless UI + shadcn/ui
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Blockchain**: Wagmi + Viem + RainbowKit
- **FHE Integration**: fhevmjs
- **Testing**: Vitest + React Testing Library

## 🎨 Design System

The tutorial uses Zama's signature yellow (`#FFD200`) with a beautiful, educational design:

- **Typography**: Comicy display font + Inter body text
- **Colors**: Zama Yellow with accessible contrast ratios
- **Animations**: Smooth micro-interactions with reduced-motion support
- **Responsive**: Mobile-first design principles

## 🔧 Configuration

### Environment Variables

```bash
# Network Configuration
VITE_RPC_URL=https://devnet.zama.ai
VITE_CHAIN_ID=8009
VITE_NETWORK_NAME=Zama Devnet

# Contract (for production)
VITE_CONTRACT_ADDRESS=0x...
VITE_USE_MOCKS=true

# UI Customization  
VITE_COMICY_FONT_URL=https://your-font-url.com/comicy.ttf
```

### Mock vs Production Mode

- **Development**: Set `VITE_USE_MOCKS=true` for offline learning
- **Production**: Set `VITE_USE_MOCKS=false` and provide real contract addresses

## 🧪 Testing

Run the test suite:

```bash
pnpm test        # Run all tests
pnpm test:watch  # Watch mode for development
pnpm test:ui     # Interactive test UI
```

## 🚀 Deployment

1. **Build production bundle**
   ```bash
   pnpm build
   ```

2. **Deploy to your favorite hosting**
   - Vercel: `vercel deploy`
   - Netlify: `netlify deploy --prod`
   - GitHub Pages: Push to `gh-pages` branch

## 🤝 Contributing

This tutorial is open source and educational. Contributions welcome:

1. Fork the repository
2. Create a feature branch
3. Make your improvements
4. Add tests if applicable
5. Submit a pull request

## 📚 Resources

- [Zama Protocol Documentation](https://docs.zama.ai)
- [FHEVM Developer Guide](https://docs.zama.ai/fhevm)
- [fhevmjs Library](https://docs.zama.ai/fhevm/fundamentals/fhevmjs)
- [Zama Community Discord](https://discord.gg/zama)

## 📄 License

MIT License - feel free to use this tutorial for learning and teaching confidential computing concepts.

---

**Built with ❤️ by the Zama team to democratize confidential computing education.**