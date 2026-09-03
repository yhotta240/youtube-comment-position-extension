export type Position =
  | 'large-default'
  | 'large-secondary'
  | 'large-secondary-bottom'
  | 'large-switch'
  | 'medium-default'
  | 'medium-undermetadata'
  | 'medium-underplayer';

export type LayoutSetting = {
  position: Position;
  img: string;
  height: number | null;
  stickyPlayer: boolean;
  stickyComments: boolean;
  largeSidebarEnabled?: boolean;
}

export type Layout = "large" | "medium";

export type Settings = {
  [key in Layout]: LayoutSetting;
};

export const IMG_MAP: Record<Position, string> = {
  "large-default": "./images/large-layout-comments-default.png",
  "large-secondary": "./images/large-layout-comments-secondary.png",
  "large-secondary-bottom": "./images/large-layout-comments-secondary-bottom.png",
  "large-switch": "./images/large-layout-comments-related-switch.png",
  "medium-default": "./images/medium-layout-comments-default.png",
  "medium-undermetadata": "./images/medium-layout-comments-under-metadata.png",
  "medium-underplayer": "./images/medium-layout-comments-under-player.png",
};

export const DEFAULT_SETTINGS: Settings = {
  large: {
    position: "large-secondary",
    img: IMG_MAP["large-secondary"],
    height: null,
    stickyPlayer: false,
    stickyComments: false,
    largeSidebarEnabled: false,
  },
  medium: {
    position: "medium-default",
    img: IMG_MAP["medium-default"],
    height: null,
    stickyPlayer: false,
    stickyComments: false,
  }
}

export async function getSettings(): Promise<Settings> {
  const data = await getStorage<{ settings?: Settings }>('settings');
  return data.settings ?? DEFAULT_SETTINGS;
}

export async function isEnabled(): Promise<boolean> {
  const data = await getStorage<{ isEnabled?: boolean }>('isEnabled');
  return data.isEnabled === true;
}

export async function setSettings(settings: Settings): Promise<void> {
  await setStorage({ settings });
}

export async function setEnabled(isEnabled: boolean): Promise<void> {
  await setStorage({ isEnabled });
}

export function getStorage<T extends Record<string, unknown>>(keys: string | string[]): Promise<Partial<T>> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(keys, (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }
      resolve((result ?? {}) as Partial<T>);
    });
  });
}

export function setStorage<T extends Record<string, unknown>>(items: T): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(items, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }
      resolve();
    });
  });
}
