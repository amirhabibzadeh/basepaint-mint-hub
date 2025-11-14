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

### Publishing as a Farcaster Miniapp

See [PUBLISHING.md](./PUBLISHING.md) for complete instructions on:
- Setting up your manifest
- Choosing a domain
- Verifying app ownership
- Becoming eligible for developer rewards

## Simply open [Lovable](https://lovable.dev/projects/673326c5-f1a4-40ab-9397-b9a755cf1811) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
