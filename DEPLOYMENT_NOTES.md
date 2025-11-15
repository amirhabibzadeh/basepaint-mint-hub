# Deployment Notes for API Routes

## Issue: API Routes Returning 404

If API routes are returning 404 after deployment, check:

1. **API Directory Location**: The `/api` directory must be at the root of the project (not in `dist/`)

2. **Vercel Configuration**: The `vercel.json` should have:
   - `functions` configuration for TypeScript files
   - Proper `rewrites` for routing

3. **File Structure**: 
   ```
   /api
     /art
       image.ts
     farcaster.json.ts
     /.well-known
       farcaster.json.ts
   ```

4. **Deployment**: When using `outputDirectory: "dist"`, Vercel should still include the `/api` directory automatically, but verify in deployment logs.

5. **Check Deployment Logs**: In Vercel dashboard, check:
   - Build logs for API function compilation
   - Runtime logs for any errors
   - Function list to see if API routes are detected

## Troubleshooting Steps

1. Verify API files are committed to git
2. Check that `/api` directory is not in `.gitignore` or `.vercelignore`
3. Review Vercel deployment logs for function detection
4. Test locally with `npx vercel dev` to ensure routes work
5. If still failing, try removing `outputDirectory` temporarily to test

