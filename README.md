````markdown
# BasePaint Mint Hub

A Farcaster miniapp for minting collaborative on-chain art canvases on Base Network.

## About BasePaint

BasePaint is an interactive on-chain art platform built on Base where users can mint NFTs and contribute pixels to collaborative canvases. This miniapp provides seamless integration with Farcaster for easy discovery and sharing.

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/673326c5-f1a4-40ab-9397-b9a755cf1811) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## Testing API Routes Locally

### Option 1: Quick Testing with Vite (Image API Only)

For quick local testing, the image API route is proxied directly to `basepaint.xyz`:

```bash
npm run dev
```

Then test:
- `http://localhost:8080/api/art/image?day=829` ✅ Works (proxied to basepaint.xyz)
- `http://localhost:8080/api/farcaster.json?day=829` ❌ Won't work (needs vercel dev)
- `http://localhost:8080/.well-known/farcaster.json?day=829` ❌ Won't work (needs vercel dev)

### Option 2: Full API Testing with Vercel Dev (Recommended)

For full API route testing (including Farcaster JSON), use Vercel dev:

```bash
# Use npx (no installation needed)
npx vercel dev

# Or install globally first
npm i -g vercel
vercel dev
```

This will:
- Start the dev server (usually on port 3000)
- Serve ALL API routes from `/api` directory
- Handle `/.well-known` routes via `vercel.json` rewrites
- Provide the same environment as production

**Test the endpoints on the port shown by `vercel dev` (usually 3000):**
- `http://localhost:3000/api/art/image?day=829` ✅ Full API support
- `http://localhost:3000/api/farcaster.json?day=829` ✅ Full API support
- `http://localhost:3000/.well-known/farcaster.json?day=829` ✅ Full API support

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

### Quick Start
1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy the `dist/` folder to your hosting provider:
   - **Vercel** (Recommended): `vercel deploy`
   - **Netlify**: Drag & drop the `dist/` folder
   - **AWS Amplify**, **Cloudflare Pages**, or any static host

3. Make sure `/.well-known/farcaster.json` is accessible on your domain

## Dynamic Image Generation

This project includes dynamic image generation for OG images and Farcaster embeds, similar to `basepaint.xyz/api/art/image?day=829`.

### API Endpoints

- `/api/art/image?day=XXX` - Generates dynamic artwork images for a specific canvas day
- `/api/farcaster.json?day=XXX` - Returns dynamic Farcaster miniapp configuration
- `/.well-known/farcaster.json?day=XXX` - Serves Farcaster JSON from the well-known path

All endpoints automatically use the current canvas ID if no `day` parameter is provided.

### API Routes (Vercel Serverless Functions)

The API routes are implemented as Vercel serverless functions in the `/api` directory. When deployed via Lovable (which uses Vercel), these functions are automatically deployed and available at:

- `https://your-domain.com/api/art/image?day=XXX`
- `https://your-domain.com/api/farcaster.json?day=XXX`
- `https://your-domain.com/.well-known/farcaster.json?day=XXX`

**No additional configuration needed!** Lovable/Vercel automatically:
- Detects and deploys functions in the `/api` directory
- Handles routing for `/.well-known` paths (configured in `vercel.json`)
- Provides environment variables like `VERCEL_URL` automatically

The functions use Node.js runtime and can interact with blockchain via `viem` to fetch current canvas IDs.