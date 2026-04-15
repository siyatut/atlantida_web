const HOME_PATHNAME = "/";
const SECTION_TOP_GAP = 16;
const CONTACTS_HASH = "#contacts";
const CONTACTS_SCROLL_ADJUSTMENT = 40;

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

  window.scrollTo({
    top: Math.max(top, 0),
    behavior: options.behavior ?? "smooth",
  });

  return true;
}
