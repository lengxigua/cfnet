/**
 * Cloudflare Image Resizing URL generator
 * Generates optimized image URLs using Cloudflare's Image Resizing service
 *
 * Usage with Next.js Image component:
 *   <Image loader={cloudflareLoader} src="/image.jpg" width={800} height={600} />
 *
 * Or configure globally in next.config.ts:
 *   images: { loader: 'custom', loaderFile: './lib/image/cloudflare-loader.ts' }
 */

export interface CloudflareImageLoaderParams {
  src: string;
  width: number;
  quality?: number;
}

/**
 * Cloudflare Image Resizing loader
 * Transforms image URLs to use Cloudflare's image optimization CDN
 *
 * @see https://developers.cloudflare.com/images/transform-images/
 */
export default function cloudflareLoader({
  src,
  width,
  quality,
}: CloudflareImageLoaderParams): string {
  // Skip transformation for data URIs and external URLs
  if (src.startsWith('data:') || src.startsWith('blob:')) {
    return src;
  }

  const params = [
    `width=${width}`,
    `quality=${quality || 75}`,
    'format=auto', // Auto-select WebP/AVIF based on browser support
    'fit=cover',
  ];

  // For relative URLs, use Cloudflare Image Resizing path format
  if (src.startsWith('/')) {
    return `/cdn-cgi/image/${params.join(',')}${src}`;
  }

  // For absolute URLs, pass through (Cloudflare can resize external images too)
  return `/cdn-cgi/image/${params.join(',')}/` + encodeURIComponent(src);
}
