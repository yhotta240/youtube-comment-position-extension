export const LARGE_LAYOUT_BREAKPOINT = 1017;

export function isLargeScreenLayout(width: number = window.innerWidth): boolean {
  return width >= LARGE_LAYOUT_BREAKPOINT;
}
