# Local Testing Guide

## Testing API Routes Locally

### Prerequisites

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```
   Or use `npx vercel dev` (no global install needed)

### Running the Full Stack Locally

Run this command to start both the frontend and API routes:

```bash
vercel dev
```

Or using npx:
```bash
npx vercel dev
```

This will:
- Start the Vite dev server (usually on port 3000)
- Serve API routes from the `/api` directory
- Handle `/.well-known` routes via `vercel.json` rewrites
- Provide the same environment as production

### Testing Endpoints

Once `vercel dev` is running, you can test:

1. **Image Generation:**
   ```
   http://localhost:3000/api/art/image?day=829
   ```
   Should return a PNG image of canvas #829

2. **Farcaster JSON (API route):**
   ```
   http://localhost:3000/api/farcaster.json?day=829
   ```
   Should return JSON with canvas #829 info

3. **Farcaster JSON (Well-known path):**
   ```
   http://localhost:3000/.well-known/farcaster.json?day=829
   ```
   Should return the same JSON (routed via vercel.json)

4. **Current Canvas (no day parameter):**
   ```
   http://localhost:3000/api/art/image
   ```
   Should automatically fetch and return the current canvas image

### Frontend Only Testing

If you only want to test the frontend UI (without API routes):

```bash
npm run dev
```

This starts only the Vite dev server. Note that API routes won't work in this mode - they'll only work when deployed to Vercel or when using `vercel dev`.

### Troubleshooting

**Issue: `vercel dev` command not found**
- Install Vercel CLI: `npm i -g vercel`
- Or use: `npx vercel dev`

**Issue: API routes return 404**
- Make sure you're using `vercel dev`, not just `npm run dev`
- Check that files are in `/api` directory with `.ts` extension
- Verify `vercel.json` rewrites are correct

**Issue: Functions timeout or error**
- Check that `viem` and blockchain calls are working
- Verify network connectivity to Base network
- Check console logs in the terminal running `vercel dev`

