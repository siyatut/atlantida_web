const HOME_PATHNAME = "/";
const SECTION_TOP_GAP = 16;
const CONTACTS_HASH = "#contacts";
const CONTACTS_SCROLL_ADJUSTMENT = 40;
const SCROLL_DURATION_MS = 750;

function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

export function animatedScrollTo(top: number, duration = SCROLL_DURATION_MS): void {
  const start = window.scrollY;
  const distance = top - start;
  if (Math.abs(distance) < 1) return;

  const startTime = performance.now();

  function step(now: number) {
    const progress = Math.min((now - startTime) / duration, 1);
    window.scrollTo(0, start + distance * easeInOutQuad(progress));
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

function normalizeHash(hash: string): string {
  if (!hash) {
    return "";
  }

  return hash.startsWith("#") ? hash : `#${hash}`;
}

export function isHomeHashLink(pathname: string, hash: string): boolean {
  return pathname === HOME_PATHNAME && normalizeHash(hash).length > 1;
}

export function getStickyHeaderHeight(): number {
  const header = document.querySelector<HTMLElement>("[data-site-header]");

  if (!header) {
    return 0;
  }

  return header.getBoundingClientRect().height;
}

export function scrollToHashTarget(
  hash: string,
  options: { behavior?: ScrollBehavior } = {},
): boolean {
  const normalizedHash = normalizeHash(hash);

  if (!normalizedHash) {
    return false;
  }

  const targetId = decodeURIComponent(normalizedHash.slice(1));
  const target = document.getElementById(targetId);

  if (!target) {
    return false;
  }

  const extraScrollAdjustment =
    normalizedHash === CONTACTS_HASH ? CONTACTS_SCROLL_ADJUSTMENT : 0;
  const top =
    target.getBoundingClientRect().top +
    window.scrollY -
    getStickyHeaderHeight() -
    SECTION_TOP_GAP +
    extraScrollAdjustment;

  const clampedTop = Math.max(top, 0);

  if (options.behavior === "auto") {
    window.scrollTo({ top: clampedTop, behavior: "auto" });
  } else {
    animatedScrollTo(clampedTop);
  }

  return true;
}
