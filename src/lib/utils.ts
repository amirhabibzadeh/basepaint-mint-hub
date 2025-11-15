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

/**
 * Ensures a URL is an absolute HTTPS URL (not relative, localhost, or IP address)
 * @param url - The URL to validate/convert
 * @param fallbackOrigin - Fallback origin if url is relative (defaults to window.location.origin)
 * @returns Absolute HTTPS URL
 */
function ensureAbsoluteHttpsUrl(url: string, fallbackOrigin?: string): string {
  // If already absolute HTTPS URL, validate it's not localhost or IP
  if (url.startsWith('https://')) {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;
      
      // Reject localhost and IP addresses
      if (hostname === 'localhost' || hostname === '127.0.0.1' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
        throw new Error(`Invalid URL: ${url} - Cannot use localhost or IP addresses`);
      }
      
      return url;
    } catch (e) {
      throw new Error(`Invalid URL: ${url} - ${e instanceof Error ? e.message : 'Invalid URL format'}`);
    }
  }
  
  // If relative URL, convert to absolute using fallback origin
  const origin = fallbackOrigin || (typeof window !== 'undefined' ? window.location.origin : '');
  if (!origin) {
    throw new Error(`Cannot convert relative URL ${url} to absolute - no origin available`);
  }
  
  // Ensure origin is HTTPS
  if (!origin.startsWith('https://')) {
    throw new Error(`Origin must be HTTPS: ${origin}`);
  }
  
  // Convert relative to absolute
  const absoluteUrl = url.startsWith('/') 
    ? `${origin}${url}` 
    : `${origin}/${url}`;
  
  // Validate the resulting URL
  try {
    const urlObj = new URL(absoluteUrl);
    const hostname = urlObj.hostname;
    
    // Reject localhost and IP addresses
    if (hostname === 'localhost' || hostname === '127.0.0.1' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
      throw new Error(`Invalid URL: ${absoluteUrl} - Cannot use localhost or IP addresses`);
    }
    
    return absoluteUrl;
  } catch (e) {
    throw new Error(`Invalid URL: ${absoluteUrl} - ${e instanceof Error ? e.message : 'Invalid URL format'}`);
  }
}

export function generateMiniappEmbed(url: string, options: EmbedOptions): string {
  const {
    imageUrl,
    buttonTitle = "🎨 Mint Canvas",
    buttonUrl = url,
    appName = "BasePaint Mint Hub",
    splashImageUrl = imageUrl,
    splashBackgroundColor = "#000000"
  } = options;

  // Get fallback origin for relative URLs
  const fallbackOrigin = typeof window !== 'undefined' ? window.location.origin : undefined;
  
  // Ensure all URLs are absolute HTTPS URLs
  const absoluteImageUrl = ensureAbsoluteHttpsUrl(imageUrl, fallbackOrigin);
  const absoluteButtonUrl = ensureAbsoluteHttpsUrl(buttonUrl, fallbackOrigin);
  const absoluteSplashImageUrl = splashImageUrl 
    ? ensureAbsoluteHttpsUrl(splashImageUrl, fallbackOrigin)
    : absoluteImageUrl;

  const miniappEmbed = {
    version: "1",
    imageUrl: absoluteImageUrl,
    button: {
      title: buttonTitle,
      action: {
        type: "launch_miniapp",
        url: absoluteButtonUrl,
        name: appName,
        splashImageUrl: absoluteSplashImageUrl,
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
 * This function OVERWRITES any existing fc:miniapp and fc:frame meta tags
 * (including static fallback tags from index.html) with new dynamic content.
 * 
 * @param embedJson - JSON string from generateMiniappEmbed() containing dynamic imageUrl
 */
export function injectEmbedMeta(embedJson: string): void {
  // Remove existing meta tags (including static fallback from index.html)
  // This ensures we always overwrite with the latest dynamic imageUrl
  const existing = document.querySelectorAll('meta[name="fc:miniapp"], meta[name="fc:frame"]');
  existing.forEach(el => el.remove());

  // Parse the JSON to create backward-compatible version for fc:frame
  const embed = JSON.parse(embedJson);
  const frameEmbed = {
    ...embed,
    button: {
      ...embed.button,
      action: {
        ...embed.button.action,
        type: "launch_frame" // Backward compatibility
      }
    }
  };

  // Add fc:miniapp meta tag (primary)
  const miniappMeta = document.createElement('meta');
  miniappMeta.setAttribute('name', 'fc:miniapp');
  miniappMeta.setAttribute('content', embedJson);
  document.head.appendChild(miniappMeta);

  // Add fc:frame meta tag (backward compatibility with launch_frame type)
  const frameMeta = document.createElement('meta');
  frameMeta.setAttribute('name', 'fc:frame');
  frameMeta.setAttribute('content', JSON.stringify(frameEmbed));
  document.head.appendChild(frameMeta);
}

/**
 * Update Open Graph and Twitter meta tags for dynamic og-image and canvas info
 * 
 * @param imageUrl - The URL of the og-image to set
 * @param canvasId - Optional canvas ID to include in title and description
 */
export function updateOgImage(imageUrl: string, canvasId?: number): void {
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

  // Update title and description if canvasId is provided
  if (canvasId !== undefined) {
    const title = `BasePaint Mint Hub - Canvas #${canvasId}`;
    const description = `Mint Canvas #${canvasId} - Collaborative on-chain art canvas on Base Network. Earn protocol fees from referrals.`;

    // Update og:title
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute('content', title);

    // Update twitter:title
    let twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (!twitterTitle) {
      twitterTitle = document.createElement('meta');
      twitterTitle.setAttribute('name', 'twitter:title');
      document.head.appendChild(twitterTitle);
    }
    twitterTitle.setAttribute('content', title);

    // Update og:description
    let ogDescription = document.querySelector('meta[property="og:description"]');
    if (!ogDescription) {
      ogDescription = document.createElement('meta');
      ogDescription.setAttribute('property', 'og:description');
      document.head.appendChild(ogDescription);
    }
    ogDescription.setAttribute('content', description);

    // Update twitter:description
    let twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (!twitterDescription) {
      twitterDescription = document.createElement('meta');
      twitterDescription.setAttribute('name', 'twitter:description');
      document.head.appendChild(twitterDescription);
    }
    twitterDescription.setAttribute('content', description);
  }
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

