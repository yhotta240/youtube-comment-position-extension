import { getLayoutSettings } from "content/state";
import { getElements } from "../elements";
import { isLargeScreenLayout } from "content/utils/responsive";

const MIN_SECONDARY_WIDTH = 300;
const MIN_PRIMARY_WIDTH = 300;

let resizeTimeout: number | undefined;
let fullscreenResizeInitialized = false;

export function handleFullscreenResize(): void {
  if (fullscreenResizeInitialized) return;
  fullscreenResizeInitialized = true;
  window.addEventListener('resize', (ev: Event) => {
    if (!ev.isTrusted) return;
    if (resizeTimeout) clearTimeout(resizeTimeout);
    resizeTimeout = window.setTimeout(() => {
      if (isLargeScreenLayout()) setupSecondaryWidths();
    }, 200);
  });
}

export async function insertDragHandle(): Promise<void> {
  const { secondaryInner, dragHandle: exist } = getElements();
  if (exist) return;
  const dragHandle = document.createElement('div');
  dragHandle.classList.add('style-scope', 'ytd-watch-flexy', 'ycp-drag-handle');
  secondaryInner?.insertAdjacentElement('beforebegin', dragHandle);
  handleDrag();
}

function updateDragHandleVisibility(enabled: boolean): void {
  const { ytdWatchFlexy } = getElements();
  if (!ytdWatchFlexy) return;
  ytdWatchFlexy.classList.toggle('ycp-secondary-resize-enabled', enabled);
}

export async function applySecondaryResizeSettings(): Promise<void> {
  const enabled = getLayoutSettings().largeSidebarEnabled;
  updateDragHandleVisibility(enabled);

  if (!enabled) {
    clearSecondaryWidths();
    return;
  }

  await insertDragHandle();
  await setupSecondaryWidths();
  handleFullscreenResize();
}

type SidebarElements = {
  primary: HTMLElement;
  secondary: HTMLElement;
  ytdWatchFlexy: HTMLElement;
  video: HTMLElement;
};

function applySecondaryWidths(columnsWidth: number, primaryWidth: number, els: SidebarElements): void {
  const secondaryWidth = Math.max(columnsWidth - primaryWidth, 0);
  els.primary.style.setProperty('--ycp-primary-width', `${Math.floor(primaryWidth)}px`, 'important');
  els.primary.classList.add('ycp-custom-sidebar-width');
  els.secondary.style.setProperty('--ycp-secondary-width', `${Math.floor(secondaryWidth)}px`, 'important');
  els.secondary.classList.add('ycp-custom-sidebar-width');
  els.ytdWatchFlexy.classList.add('ycp-custom-sidebar-width');
  els.video.classList.add('ycp-custom-sidebar-width');
}

export function clearSecondaryWidths(): void {
  const { columns, primary, secondary, ytdWatchFlexy, video } = getElements();

  if (!columns || !primary || !secondary || !ytdWatchFlexy || !video) return;
  primary.style.removeProperty('--ycp-primary-width');
  primary.classList.remove('ycp-custom-sidebar-width');
  secondary.style.removeProperty('--ycp-secondary-width');
  secondary.classList.remove('ycp-custom-sidebar-width');
  ytdWatchFlexy.classList.remove('ycp-custom-sidebar-width');
  video.classList.remove('ycp-custom-sidebar-width');
  window.dispatchEvent(new Event('resize'));
}

export async function setupSecondaryWidths(retryCount = 0): Promise<void> {
  const { columns, primary, secondary, ytdWatchFlexy, video } = getElements();
  if (!columns || !primary || !secondary || !ytdWatchFlexy || !video) return;
  if (!getLayoutSettings().largeSidebarEnabled) {
    clearSecondaryWidths();
    return;
  }

  // columns.clientWidth が0の場合は DOM が完全にレンダリングされていないのでリトライ
  if (columns.clientWidth === 0 && retryCount < 10) {
    setTimeout(() => setupSecondaryWidths(retryCount + 1), 100);
    return;
  }

  try {
    const data = await chrome.storage.local.get(['ycpSecondaryWidth']);
    const savedWidth = data.ycpSecondaryWidth as number | null;

    if (savedWidth !== null && savedWidth !== undefined) {
      const columnsWidth = columns.clientWidth;
      const maxSecondaryWidth = Math.max(columnsWidth - MIN_PRIMARY_WIDTH, MIN_SECONDARY_WIDTH);
      let secondaryWidth = Math.floor(savedWidth);
      secondaryWidth = Math.min(Math.max(secondaryWidth, MIN_SECONDARY_WIDTH), maxSecondaryWidth);
      const primaryWidth = Math.max(columnsWidth - secondaryWidth, 0);
      applySecondaryWidths(columnsWidth, primaryWidth, { primary, secondary, ytdWatchFlexy, video });
      window.dispatchEvent(new Event('resize'));
    } else {
      clearSecondaryWidths();
    }
  } catch (err) {
    console.error('[youtube-comment-position] setupSecondaryWidths error', err);
  }
}

let isDragging = false;
let dragListenersInitialized = false;
function handleDrag(): void {
  const { columns, primary, secondary, ytdWatchFlexy, dragHandle, video } = getElements();
  if (!columns || !primary || !secondary || !dragHandle || !ytdWatchFlexy || !video) return;
  if (dragListenersInitialized) return;
  dragListenersInitialized = true;

  const start = (e: PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    isDragging = true;
    dragHandle.classList.add('dragging');
    document.documentElement.style.userSelect = 'none';
  };

  const stop = (e?: PointerEvent) => {
    if (!isDragging) return;
    isDragging = false;
    try { dragHandle.releasePointerCapture?.((e as PointerEvent)?.pointerId); } catch { }
    dragHandle.classList.remove('dragging');
    document.documentElement.style.userSelect = '';
    (async () => {
      const columnsWidth = columns.clientWidth;
      const secondaryWidth = Math.round(secondary.getBoundingClientRect().width);
      const maxSecondaryWidth = Math.max(columnsWidth - MIN_PRIMARY_WIDTH, MIN_SECONDARY_WIDTH);
      const clamped = Math.min(Math.max(Math.round(secondaryWidth), MIN_SECONDARY_WIDTH), maxSecondaryWidth);
      await chrome.storage.local.set({ ycpSecondaryWidth: clamped });
      window.dispatchEvent(new Event('resize'));
    })();
  };

  const move = (clientX: number) => {
    if (!isDragging) return;
    const rect = columns.getBoundingClientRect();
    const columnsWidth = columns.clientWidth;
    const maxSecondaryWidth = Math.max(columnsWidth - MIN_PRIMARY_WIDTH, MIN_SECONDARY_WIDTH);
    let secondaryWidth = rect.right - clientX;
    secondaryWidth = Math.min(Math.max(secondaryWidth, MIN_SECONDARY_WIDTH), maxSecondaryWidth);
    const primaryWidth = columnsWidth - secondaryWidth;
    applySecondaryWidths(columnsWidth, primaryWidth, { primary, secondary, ytdWatchFlexy, video });
  };

  dragHandle.addEventListener('pointerdown', (ev: PointerEvent) => {
    ev.preventDefault();
    start(ev);
  });

  document.addEventListener('pointermove', (ev: PointerEvent) => {
    if (!isDragging) return;
    move(ev.clientX);
  });

  document.addEventListener('pointerup', (ev: PointerEvent) => {
    stop(ev);
  });
}
