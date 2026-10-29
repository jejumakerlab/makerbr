/** next.config.ts 의 images.remotePatterns 와 같은 호스트여야 합니다. */
const OPTIMIZED_HOSTS = [/(^|\.)supabase\.co$/i, /^images\.unsplash\.com$/i];

/** 허용 목록 밖의 외부 이미지 주소는 최적화 없이 그대로 불러와야 페이지가 깨지지 않습니다. */
export function needsUnoptimized(src: string) {
  try {
    const { protocol, hostname } = new URL(src);
    return !(protocol === "https:" && OPTIMIZED_HOSTS.some((pattern) => pattern.test(hostname)));
  } catch {
    return true;
  }
}
