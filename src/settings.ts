export type Position =
  | 'large-position-default'
  | 'large-position-leftside'
  | 'large-position-leftside-bottom'
  | 'large-position-switch'
  | 'medium-position-default'
  | 'medium-position-undermetadata'
  | 'medium-position-underplayer';

type Options = {
  stickyPlayer: {
    id: string;
    option: boolean;
  };
  stickyComments: {
    id: string;
    option: boolean;
  };
}

export type LayoutSetting = {
  positionId: string;
  position: Position;
  positionImgId: string;
  positionImage: string;
  heightId: string;
  height: number | null;
  options: Options;
  positionPrefix: "large" | "medium";
}

export type Layout = "largeLayout" | "mediumLayout";

export type Settings = {
  [key in Layout]: LayoutSetting;
};

export const IMG_MAP: Record<Position, string> = {
  "large-position-default": "./images/large-layout-comments-default.png",
  "large-position-leftside": "./images/large-layout-comments-secondary.png",
  "large-position-leftside-bottom": "./images/large-layout-comments-secondary-bottom.png",
  "large-position-switch": "./images/large-layout-comments-related-switch.png",
  "medium-position-default": "./images/medium-layout-comments-default.png",
  "medium-position-undermetadata": "./images/medium-layout-comments-under-metadata.png",
  "medium-position-underplayer": "./images/medium-layout-comments-under-player.png",
};

export const DEFAULT_SETTINGS: Settings = {
  largeLayout: {
    positionId: "large-layout-position",
    position: "large-position-leftside",
    positionImgId: "large-image",
    positionImage: IMG_MAP["large-position-leftside"],
    heightId: "large-height-comments",
    height: null,
    options: {
      stickyPlayer: {
        id: "large-layout-sticky-player-option",
        option: false,
      },
      stickyComments: {
        id: "large-layout-sticky-comments-option",
        option: false,
      }
    },
    positionPrefix: "large",
  },
  mediumLayout: {
    positionId: "medium-layout-position",
    position: "medium-position-default",
    positionImgId: "medium-image",
    positionImage: IMG_MAP["medium-position-default"],
    heightId: "medium-height-comments",
    height: null,
    options: {
      stickyPlayer: {
        id: "medium-layout-sticky-player-option",
        option: false,
      },
      stickyComments: {
        id: "medium-layout-sticky-comments-option",
        option: false,
      }
    },
    positionPrefix: "medium",
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