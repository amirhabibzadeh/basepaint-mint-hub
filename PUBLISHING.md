# BasePaint - Farcaster Miniapp Publishing & Discovery Guide

## Overview

This guide covers publishing BasePaint as a Farcaster miniapp and ensuring it's discoverable in the app search and directory.

Resources:
- [Publishing Guide](https://miniapps.farcaster.xyz/docs/guides/publishing)
- [Discovery & Search Guide](https://miniapps.farcaster.xyz/docs/guides/discovery)

## Pre-Publishing Checklist

### ✅ Required Fields for Search Indexing

Your `farcaster.json` manifest includes all required fields for search:

| Field | Status | Value |
|-------|--------|-------|
| `name` | ✅ | "BasePaint Mint Hub" |
| `iconUrl` | ✅ | https://basepaint.art/logo.png |
| `homeUrl` | ✅ | https://basepaint.art/ |
| `description` | ✅ | "Mint and contribute pixels to collaborative on-chain art canvases..." |

### ✅ Discovery Optimization

Enhanced fields added for better search visibility:

| Field | Status | Value |
|-------|--------|-------|
| `noindex` | ✅ | false (allows indexing) |
| `ogTitle` | ✅ | "BasePaint Mint Hub" |
| `ogDescription` | ✅ | Search-friendly description |
| `ogImageUrl` | ✅ | https://basepaint.art/og-image.png |
| `tags` | ✅ | art, base, mint, nft, collaborative, onchain |
| `primaryCategory` | ✅ | art-creativity |

### ✅ HTML Metadata

- `<title>`: BasePaint - Collaborative On-Chain Art
- `<meta description>`: Updated
- `og:title`, `og:description`, `og:image`: Configured

### ✅ Miniapp SDK Detection

App detects miniapp context and initializes Frame SDK automatically.

## Publishing Steps

### Step 1: Prepare Your Domain

Choose a **production domain** (required for search indexing):

**Valid Options:**
- Main domain: `basepaint.art`
- Subdomain: `mint.basepaint.art`
- Dedicated: `basepaint-mint.com`

**Invalid (won't be indexed):**
- ❌ ngrok.io tunnels
- ❌ replit.dev
- ❌ localtunnel.me
- ❌ localhost or development servers

### Step 2: Build Your App

```bash
npm run build
# or
bun run build
```

This creates a `dist/` folder with your static files.

### Step 3: Deploy to Production

Deploy the `dist/` folder to your production domain:

**Recommended Hosting:**
- **Vercel**: `vercel deploy` (easiest for SPA)
- **Netlify**: Drag & drop `dist/` folder
- **AWS Amplify**: Connect GitHub repo
- **Cloudflare Pages**: Push to production branch
- **AWS S3 + CloudFront**: For enterprise

**Deployment Checklist:**
- ✅ `dist/` folder deployed to domain root
- ✅ `.well-known/farcaster.json` accessible at `/.well-known/farcaster.json`
- ✅ All asset URLs (icons, images) are accessible
- ✅ HTTPS enabled (required)
- ✅ CORS headers configured if needed

### Step 4: Verify Manifest Accessibility

Test that your manifest is accessible:

```bash
# Should return valid JSON
curl https://your-domain.com/.well-known/farcaster.json

# Verify icon image loads
curl -I https://basepaint.art/logo.png
```

Expected response:
```json
{
  "miniapp": {
    "version": "1",
    "name": "BasePaint Mint Hub",
    ...
  }
}
```

### Step 5: Register Your Manifest

Register your app with Farcaster for indexing:

1. Visit: https://farcaster.xyz/~/developers/mini-apps/manifest
2. Enter your domain (e.g., `basepaint.art`)
3. Farcaster validates and registers your manifest
4. You'll see a green checkmark when successful

**Important:** The domain must **exactly match** where you host the manifest.

### Step 6: Verify Ownership (Optional - Enables Developer Rewards)

To get verified and earn developer rewards:

1. Go to: https://farcaster.xyz/~/developers/new in Warpcast
2. Select "Create Mini App Manifest"
3. Generate account association for your domain
4. Add `accountAssociation` to your `farcaster.json`:

```json
{
  "accountAssociation": {
    "header": "eyJmaWQiOjk...",
    "payload": "eyJkb21haW4iOi...",
    "signature": "MHgx..."
  },
  "miniapp": { ... }
}
```

Re-deploy after adding this field.

## Ensuring Discoverability

### Required for Search Indexing

✅ **All items below must be met for your app to appear in search:**

1. **App Registration**
   - ✅ Manifest registered at https://farcaster.xyz/~/developers/mini-apps/manifest
   - ✅ Green checkmark visible after registration

2. **Complete Manifest**
   - ✅ `name`: "BasePaint Mint Hub"
   - ✅ `iconUrl`: Accessible image URL
   - ✅ `homeUrl`: Your production domain
   - ✅ `description`: 170 characters describing your app
   - ✅ `noindex`: false (explicitly allow indexing)

3. **Valid Images**
   - ✅ `iconUrl` must return valid image with proper Content-Type header
   - ✅ Images must be accessible (HTTP 200)
   - ✅ Icon should be 1024x1024 PNG (no alpha)

4. **Production Domain**
   - ✅ Must be a real domain (not development tunnel)
   - ✅ Must have HTTPS
   - ✅ Must be publicly accessible

5. **Usage & Activity**
   - 📈 Apps need minimum user engagement to appear in search
   - 📈 Recent opens and adds improve ranking
   - 📈 Trending score based on recent activity

### Search Ranking Factors

Your app ranks higher by:

1. **Number of Opens**: Users opening your app
2. **Number of Adds**: Users adding app to their collection
3. **Trending Score**: Recent engagement growth
4. **Time to Reindex**: Daily refresh cycle (changes reflected within 24hrs)

**Tips to Improve Ranking:**
- Share on Farcaster with your audience
- Encourage users to add to their collection
- Maintain regular user engagement
- Keep manifest metadata fresh and accurate

## Optimization Checklist

Before going live, complete this checklist:

- [ ] Domain chosen and production-ready
- [ ] App built: `npm run build`
- [ ] Deployed to production domain
- [ ] `.well-known/farcaster.json` accessible and valid
- [ ] Icon and images are accessible and valid
- [ ] Manifest registered at Farcaster Developer Tools
- [ ] Green checkmark shows in registration tool
- [ ] `noindex` is false (or omitted, defaults to false)
- [ ] All URLs in manifest use your production domain
- [ ] Tested on Farcaster clients
- [ ] Ready to share with community for engagement

## Troubleshooting Search Issues

### App not appearing in search?

1. **Check Registration**
   - Go to https://farcaster.xyz/~/developers/mini-apps/manifest
   - Verify domain is registered with green checkmark

2. **Verify Manifest**
   ```bash
   curl https://your-domain.com/.well-known/farcaster.json
   ```
   - Should return valid JSON
   - Must have all required fields

3. **Check Images**
   ```bash
   curl -I https://your-domain.com/logo.png
   ```
   - Must return HTTP 200
   - Must have `Content-Type: image/*` header

4. **Domain Validation**
   - Production domain? (not ngrok, replit.dev, etc.)
   - HTTPS enabled?
   - Publicly accessible?

5. **Wait for Reindex**
   - Farcaster refreshes search daily
   - Changes may take up to 24 hours to appear

6. **Minimum Activity Required**
   - Share with your audience
   - Get initial users to open and add your app
   - Apps need some engagement to appear in search

## Build & Deploy Commands

```bash
# Install dependencies
npm install
# or
bun install

# Development
npm run dev
# or
bun run dev

# Production build
npm run build
# or
bun run build

# Preview build locally
npm run preview
# or
bun run preview
```

## Important: Update Asset URLs

Before deploying, replace placeholder URLs in `public/.well-known/farcaster.json`:

| Item | Replace | With |
|------|---------|------|
| iconUrl | `https://basepaint.art/logo.png` | Your actual icon URL |
| splashImageUrl | `https://basepaint.art/logo.png` | Your splash screen URL |
| homeUrl | `https://basepaint.art/` | Your production URL |
| ogImageUrl | `https://basepaint.art/og-image.png` | Your OG image URL |

## Resources

- [Farcaster Miniapps Docs](https://miniapps.farcaster.xyz/docs)
- [Publishing Guide](https://miniapps.farcaster.xyz/docs/guides/publishing)
- [Discovery & Search](https://miniapps.farcaster.xyz/docs/guides/discovery)
- [Frame SDK Reference](https://miniapps.farcaster.xyz/docs/reference/frame-sdk)
- [Developer Manifest Tool](https://farcaster.xyz/~/developers/mini-apps/manifest)
- [Developer Rewards](https://farcaster.xyz/~/developers/rewards)

## Questions?

- Farcaster Discord: https://discord.gg/farcaster
- GitHub Issues: https://github.com/farcasterxyz/miniapps
- Twitter: @farcaster_xyz
