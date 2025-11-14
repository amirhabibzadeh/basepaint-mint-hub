# Discovery Ready! ✅

Your BasePaint Mint Hub is now optimized for search and discovery on Farcaster.

## What Was Done

### 1. Enhanced Manifest for Discoverability

Updated `public/.well-known/farcaster.json` with:

**Required Fields (for search indexing):**
- ✅ `name`: "BasePaint Mint Hub"
- ✅ `iconUrl`: https://basepaint.art/logo.png
- ✅ `homeUrl`: https://basepaint.art/
- ✅ `description`: Complete, searchable description

**Discovery Optimization:**
- ✅ `noindex`: false (explicitly allows indexing)
- ✅ `ogTitle`: "BasePaint Mint Hub"
- ✅ `ogDescription`: Search-friendly social description
- ✅ `ogImageUrl`: For rich previews
- ✅ `tags`: Added 6 searchable tags (art, base, mint, nft, collaborative, onchain)
- ✅ `primaryCategory`: "art-creativity" (helps with categorization)

### 2. Manifest Structure

```json
{
  "miniapp": {
    "version": "1",
    "name": "BasePaint Mint Hub",
    "description": "Mint and contribute pixels to collaborative on-chain art canvases...",
    "noindex": false,
    "tags": ["art", "base", "mint", "nft", "collaborative", "onchain"],
    ...
  }
}
```

## How to Ensure Your App Shows Up in Search

### ✅ Already Complete
- Manifest has all required fields
- `noindex` is false (allows indexing)
- Tags are optimized for discovery
- HTML metadata is configured

### ⏭️ Before Deploying

1. **Replace Asset URLs** in the manifest:
   - Update `iconUrl` to your actual hosted logo
   - Update `homeUrl` to your production domain
   - Update `ogImageUrl` to your OG image

2. **Deploy to Production Domain**
   ```bash
   npm run build
   # Deploy dist/ to production domain (not development tunnel)
   ```

3. **Register Your App**
   - Go to: https://farcaster.xyz/~/developers/mini-apps/manifest
   - Enter your domain
   - Get green checkmark confirmation

### 📈 To Improve Search Ranking

1. **Get Initial Users**
   - Share on Farcaster with your community
   - Encourage users to add your app to their collection

2. **Maintain Engagement**
   - More opens = higher ranking
   - More adds = higher trending score
   - Recent activity keeps you in results

3. **Keep Manifest Fresh**
   - Update metadata periodically
   - Farcaster re-indexes daily

## Search Indexing Checklist

- [ ] Manifest deployed to `/.well-known/farcaster.json`
- [ ] All required fields present and populated
- [ ] `noindex` is false
- [ ] Icon image is accessible (1024x1024 PNG)
- [ ] Domain is production (not development tunnel)
- [ ] HTTPS enabled
- [ ] Registered at Farcaster Developer Tools (green checkmark)
- [ ] Share with community to drive engagement
- [ ] Monitor search results (updates daily)

## Key Differences for Discoverability

| Field | Why It Matters |
|-------|---|
| `noindex: false` | Tells Farcaster to index your app |
| `tags` | Users find you through search filters |
| `description` | Shows in search results and directory |
| `primaryCategory` | Helps categorize and organize apps |
| `ogTitle/ogDescription/ogImageUrl` | Rich previews when shared |

## See Also

- See `PUBLISHING.md` for complete deployment guide
- See `README.md` for development information
