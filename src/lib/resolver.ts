export function resolveAssetUrl(url: string | undefined | null): string {
  if (!url) return "";

  // If the url is already an absolute external url, or a standard relative public url
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/assets/")) {
    return url;
  }

  // Handle lovable proxy assets
  if (url.startsWith("/__l5e/assets-v1/")) {
    // We could map these to absolute production paths if known,
    // but typically they might break locally. We'll pass them through or
    // fallback if we have a known environment variable.
    // For now, return the url untouched unless it matches a known mock replacement
    return url;
  }

  return url;
}
