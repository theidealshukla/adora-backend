const INSTAGRAM_REEL_RE =
  /^https?:\/\/(www\.)?instagram\.com\/(reel|reels)\/[\w-]+\/?(\?.*)?$/;

export function validateInstagramUrl(url: string): boolean {
  return INSTAGRAM_REEL_RE.test(url.trim());
}
