# Thaler Mobile

A mobile savings app built on the Thaler protocol, helping you save ETH and ERC20 tokens with regular deposits and secure withdrawals.

## What's Thaler?

Thaler is a decentralized savings protocol that makes it easy to create personal savings pools with regular deposit schedules. Think of it as a digital piggy bank for your crypto.

## Features

- **Connect your wallet** using Privy for a seamless experience
- **Create savings pools** for ETH or ERC20 tokens
- **Set up regular deposits** on a monthly schedule
- **Track your progress** with clean, visual interfaces
- **Withdraw funds** when your savings goal is complete
- **Early withdrawals** with ZK proof verification for donations

## Tech Stack

- React Native + Expo
- ethers.js for blockchain interactions
- React Navigation for smooth app navigation
- Lottie for slick animations
- Apollo Client for GraphQL data fetching

## Getting Started

1. Clone the repo

```
git clone https://github.com/Jaseempk/Thaler-Mobile.git
cd Thaler-Mobile
```

2. Install dependencies

```
npm install
```

3. Start the development server

```
npm start
```

4. Run on your device or simulator
   - Press 'i' for iOS simulator
   - Press 'a' for Android emulator
   - Scan the QR code with Expo Go on your physical device

## Development Notes

- We're using Expo Router for navigation
- The app supports both light and dark themes
- Wallet connection is handled through Privy
- Smart contract interactions are in the context files

## Roadmap

- [ ] Add support for more ERC20 tokens
- [ ] Implement notifications for deposit reminders
- [ ] Add biometric authentication
- [ ] Improve analytics with more detailed charts
- [ ] Add more utility features like yield generation while your funds are parked in the savings pool
