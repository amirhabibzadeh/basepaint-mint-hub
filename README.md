# BasePaint Mint Hub

A Farcaster miniapp for minting collaborative on-chain art canvases on Base Network. Discover, mint, and share daily collaborative artworks created by the Farcaster community.

## About

BasePaint is an interactive on-chain art platform built on Base where users can mint NFTs and contribute pixels to collaborative canvases. This miniapp provides seamless integration with Farcaster for easy discovery, sharing, and social features.

## Features

- 🎨 **Daily Canvas Display** - View the current day's collaborative artwork
- 💰 **One-Click Minting** - Mint BasePaint NFTs directly from the miniapp
- 🔗 **Referral System** - Earn 10% of protocol fees when others mint using your referral link
- 📊 **Real-time Stats** - View total mints, earnings, pixels, and contributors
- ⏱️ **Countdown Timer** - See when the next canvas will be available
- 🔐 **Farcaster Integration** - Seamless authentication and wallet connection via Farcaster
- 📱 **Mini App Support** - Optimized for Farcaster clients like Warpcast
- 🖼️ **Dynamic OG Images** - Shareable links with dynamic canvas artwork previews
- 👥 **Friends Minted** - See which of your Farcaster friends have minted the current canvas

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **UI**: shadcn-ui + Tailwind CSS
- **Blockchain**: Wagmi + Viem (Base Network)
- **Social**: Farcaster Mini App SDK
- **Data Fetching**: TanStack Query (React Query)
- **Deployment**: Vercel (Serverless Functions)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Base Network wallet (or Farcaster account with custody address)

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd basepaint-mint-hub

# Install dependencies
npm install

# Start development server
npm run dev
```

### Local Development

For full API route testing (including Farcaster JSON endpoints), use Vercel dev:

```bash
npx vercel dev
```

This starts the server on port 3000 with full API support:
- `http://localhost:3000/api/art/image?day=829` - Dynamic artwork images
- `http://localhost:3000/.well-known/farcaster.json?day=829` - Farcaster miniapp config

## Project Structure

```
src/
├── components/          # React components
│   ├── MintWithWallet.tsx
│   ├── WalletConnect.tsx
│   └── ui/             # shadcn-ui components
├── lib/                # Utilities and integrations
│   ├── basepaint.ts   # BasePaint contract interactions
│   ├── farcaster.ts   # Farcaster SDK integration
│   └── farcasterFriends.ts  # Friends query utilities
├── hooks/              # Custom React hooks
├── pages/              # Page components
└── providers/          # Context providers

api/
└── art/
    └── image.ts       # Dynamic image generation API
```

## API Endpoints

- `/api/art/image?day=XXX` - Generates dynamic artwork images for OG tags and embeds
- `/.well-known/farcaster.json?day=XXX` - Dynamic Farcaster miniapp configuration

All endpoints automatically use the current canvas ID if no `day` parameter is provided.

## Deployment

The project is configured for Vercel deployment:

```bash
npm run build
vercel deploy
```

Vercel automatically:
- Detects and deploys serverless functions in `/api`
- Handles `/.well-known` routes via `vercel.json`
- Provides environment variables

## Future Ideas & Contributions

We welcome contributions! Here are some ideas for features that could be implemented:

### 1. Gallery
Create a gallery view to browse historical canvases. Users could:
- View past days' artwork in a grid or carousel
- Filter by date range, mint count, or earnings
- Save favorites or create collections
- Share specific canvas pages

### 2. Animation and Burn
Add visual enhancements and utility features:
- **Animation**: Show canvas evolution over time (pixel-by-pixel progression)
- **Burn Mechanism**: Allow users to burn their minted NFTs for rewards or special benefits
- **Time-lapse View**: Replay the collaborative painting process

### 3. Farcaster Users Who Minted
Display a comprehensive list of all Farcaster users who minted a canvas:
- Show profile cards with avatars and usernames
- Link to their Farcaster profiles
- Filter and search functionality
- Leaderboard of top minters

### 4. Notification for New Canvas
Real-time notifications when a new canvas becomes available:
- Browser push notifications
- Farcaster notifications (via SDK)
- Email/SMS alerts (optional)
- In-app notification center

### 5. Friends Who Minted & Notifications
Enhanced social features:
- Show which friends minted the current canvas (already partially implemented)
- Push notifications when friends mint
- Friend activity feed
- Share achievements when you or friends mint

### 6. Subscription
Automatic minting subscription system:
- Users subscribe for X days (e.g., 7, 30, 90 days)
- System automatically mints new canvases based on user configuration
- Configurable settings: mint quantity per canvas, max price, referral address
- Wallet balance monitoring and alerts
- Subscription management dashboard
- Pause/resume subscriptions
- Auto-renewal options

### 7. Share by Day Query String
Deep linking and sharing improvements:
- Support `?day=XXX` query parameter to load specific canvas
- Farcaster can load specific day when sharing
- Shareable URLs that preserve canvas context
- QR codes for easy sharing

## Contributing

We'd love your help making BasePaint Mint Hub better! Here's how you can contribute:

### How to Contribute

1. **Fork the repository** and clone it locally
2. **Create a branch** for your feature: `git checkout -b feature/your-feature-name`
3. **Make your changes** and test thoroughly
4. **Commit your changes**: `git commit -m 'Add some feature'`
5. **Push to your fork**: `git push origin feature/your-feature-name`
6. **Open a Pull Request** with a clear description of your changes

### Contribution Guidelines

- Follow the existing code style and conventions
- Add TypeScript types for all new code
- Write clear commit messages
- Test your changes locally before submitting
- Update documentation if needed
- Be respectful and constructive in discussions

### Areas Where Help is Needed

- 🐛 Bug fixes and improvements
- ✨ New features from the ideas list above
- 📝 Documentation improvements
- 🎨 UI/UX enhancements
- ⚡ Performance optimizations
- 🧪 Testing and test coverage

### Questions?

Feel free to open an issue for:
- Bug reports
- Feature requests
- Questions about the codebase
- Suggestions for improvements

Thank you for contributing to BasePaint Mint Hub! 🎨
