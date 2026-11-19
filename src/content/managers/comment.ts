import { getLayoutSettings, isEnabled } from "../state";
import { getElements } from "../elements";
import { isLargeScreenLayout } from "content/utils/responsive";

let stickyCommentsObserver: MutationObserver | undefined;

function clearStickyCommentsObserver(): void {
  stickyCommentsObserver?.disconnect();
  stickyCommentsObserver = undefined;
}

function moveHeader(parent: HTMLElement, header: HTMLElement, before: ChildNode | null): void {
  if ('moveBefore' in parent && typeof parent.moveBefore === 'function') parent.moveBefore(header, before);
  else parent.insertBefore(header, before);
}

function applyStickyComments(comments: HTMLElement, shouldSticky: boolean, stickyOnPage: boolean): boolean {
  const header = comments.querySelector<HTMLElement>("#header.style-scope");
  if (!header) return false;

  const ready = Boolean(header.querySelector("ytd-comments-header-renderer"));
  const sections = comments.querySelector<HTMLElement>(':scope > #sections');
  if (sections) {
    if (stickyOnPage && ready && header.parentElement === sections) {
      moveHeader(comments, header, sections);
    } else if (!stickyOnPage && header.parentElement === comments) {
      moveHeader(sections, header, sections.firstChild);
    }
  }

  header.classList.toggle('ycp-comment-header-sticky', shouldSticky && ready);
  return ready;
}

export function makeStickyComments(): void {
  const isLargeScreen = isLargeScreenLayout();
  clearStickyCommentsObserver();
  const { isLargeStickyComments, isMediumStickyComments } = getLayoutSettings();

  const shouldSticky = isEnabled && ((isLargeScreen && isLargeStickyComments) || (!isLargeScreen && isMediumStickyComments));
  const comments = getElements().comments;
  if (!comments) return;

  const stickyOnPage = shouldSticky && !isLargeScreen && comments.classList.contains('ycp-comments-custom');
  if (applyStickyComments(comments, shouldSticky, stickyOnPage) || !isEnabled) return;

  stickyCommentsObserver = new MutationObserver(() => {
    if (applyStickyComments(comments, shouldSticky, stickyOnPage)) {
      clearStickyCommentsObserver();
    }
  });
  stickyCommentsObserver.observe(comments, { childList: true, subtree: true });
}
