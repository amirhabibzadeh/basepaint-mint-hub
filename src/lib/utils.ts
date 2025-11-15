import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate a rich embed metadata object for sharing on Farcaster
 * See: https://miniapps.farcaster.xyz/docs/guides/sharing
 * 
 * @param url - The URL to embed (e.g., referral link)
 * @param options - Embed options (imageUrl, buttonTitle, buttonUrl)
 * @returns JSON string of embed metadata
 */
export interface EmbedOptions {
  imageUrl: string;
  buttonTitle?: string;
  buttonUrl?: string;
  appName?: string;
  splashImageUrl?: string;
  splashBackgroundColor?: string;
}

export function generateMiniappEmbed(url: string, options: EmbedOptions): string {
  const {
    imageUrl,
    buttonTitle = "🎨 Mint Canvas",
    buttonUrl = url,
    appName = "BasePaint Mint Hub",
    splashImageUrl = imageUrl || "https://basepaint-mint-hub.lovable.app/og-image.png",
    splashBackgroundColor = "#000000"
  } = options;

  const miniappEmbed = {
    version: "1",
    imageUrl,
    button: {
      title: buttonTitle,
      action: {
        type: "launch_miniapp",
        url: buttonUrl,
        name: appName,
        splashImageUrl,
        splashBackgroundColor
      }
    }
  };

  return JSON.stringify(miniappEmbed);
}

/**
 * Inject embed meta tags into page head for rich sharing
 * Call this when you want to make a page shareable on Farcaster
 * 
 * @param embedJson - JSON string from generateMiniappEmbed()
 */
export function injectEmbedMeta(embedJson: string): void {
  // Remove existing meta tags if any
  const existing = document.querySelectorAll('meta[name="fc:miniapp"], meta[name="fc:frame"]');
  existing.forEach(el => el.remove());

  // Add fc:miniapp meta tag (primary)
  const miniappMeta = document.createElement('meta');
  miniappMeta.setAttribute('name', 'fc:miniapp');
  miniappMeta.setAttribute('content', embedJson);
  document.head.appendChild(miniappMeta);

  // Add fc:frame meta tag (backward compatibility)
  const frameMeta = document.createElement('meta');
  frameMeta.setAttribute('name', 'fc:frame');
  frameMeta.setAttribute('content', embedJson);
  document.head.appendChild(frameMeta);
}

/**
 * Update Open Graph and Twitter meta tags for dynamic og-image
 * 
 * @param imageUrl - The URL of the og-image to set
 */
export function updateOgImage(imageUrl: string): void {
  // Update or create og:image meta tag
  let ogImage = document.querySelector('meta[property="og:image"]');
  if (!ogImage) {
    ogImage = document.createElement('meta');
    ogImage.setAttribute('property', 'og:image');
    document.head.appendChild(ogImage);
  }
  ogImage.setAttribute('content', imageUrl);

  // Update or create twitter:image meta tag
  let twitterImage = document.querySelector('meta[name="twitter:image"]');
  if (!twitterImage) {
    twitterImage = document.createElement('meta');
    twitterImage.setAttribute('name', 'twitter:image');
    document.head.appendChild(twitterImage);
  }
  twitterImage.setAttribute('content', imageUrl);
}

/**
 * Sharing best practices for Farcaster miniapps:
 * 
 * 1. Image Requirements:
 *    - Aspect ratio: 3:2 (landscape)
 *    - Minimum: 600x400px
 *    - Maximum: 3000x2000px
 *    - Format: PNG (production), JPG, GIF, WebP
 *    - File size: < 10MB
 * 
 * 2. Cache Headers (for dynamic images):
 *    - Static data: max-age=3600+
 *    - Dynamic data: max-age=300-600
 *    - Real-time: max-age=60
 *    - Errors: max-age=0
 * 
 * 3. Meta Tag Placement:
 *    - Add to <head> of shareable pages
 *    - Update when page content changes
 *    - Farcaster caches embeds per URL
 * 
 * 4. Testing:
 *    - Use: https://farcaster.xyz/~/developers/mini-apps/embed
 *    - Preview embeds before launching
 */
export const SHARING_BEST_PRACTICES = {
  imageAspectRatio: "3:2",
  imageMinSize: { width: 600, height: 400 },
  imageMaxSize: { width: 3000, height: 2000 },
  recommendedSize: { width: 1200, height: 630 },
  maxFileSize: "10MB",
  supportedFormats: ["PNG", "JPG", "GIF", "WebP"]
};

