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
  },
  medium: {
    position: "medium-default",
    img: IMG_MAP["medium-default"],
    height: null,
    stickyPlayer: false,
    stickyComments: false,
  }
}

// レガシー型定義（マイグレーション用）
type LegacyPosition =
  | 'large-position-default'
  | 'large-position-leftside'
  | 'large-position-leftside-bottom'
  | 'large-position-switch'
  | 'medium-position-default'
  | 'medium-position-undermetadata'
  | 'medium-position-underplayer';

type LegacyOptions = {
  stickyPlayer: {
    id: string;
    option: boolean;
  };
  stickyComments: {
    id: string;
    option: boolean;
  };
}

type LegacyLayoutSetting = {
  positionId: string;
  position: LegacyPosition;
  positionImgId: string;
  positionImage: string;
  heightId: string;
  height: number | null;
  options: LegacyOptions;
  positionPrefix: string;
}

type LegacySettings = {
  largeLayout?: LegacyLayoutSetting;
  mediumLayout?: LegacyLayoutSetting;
}

// レガシーpositionを新しいpositionに変換
function migratePosition(oldPosition: string): Position {
  const map: Record<string, Position> = {
    'large-position-default': 'large-default',
    'large-position-leftside': 'large-secondary',
    'large-position-leftside-bottom': 'large-secondary-bottom',
    'large-position-switch': 'large-switch',
    'medium-position-default': 'medium-default',
    'medium-position-undermetadata': 'medium-undermetadata',
    'medium-position-underplayer': 'medium-underplayer',
    // 開発中の一時的な形式（念のため対応）
    'large-leftside': 'large-secondary',
    'large-leftside-bottom': 'large-secondary-bottom',
  };
  return map[oldPosition] || oldPosition as Position;
}

// レガシー設定を新しい形式に変換
function migrateSettings(data: any): Settings {
  const legacy = data as LegacySettings;

  // 旧形式（largeLayout/mediumLayoutを使用）を検出してマイグレーション
  if (legacy.largeLayout && legacy.mediumLayout) {
    return {
      large: {
        position: migratePosition(legacy.largeLayout.position),
        img: legacy.largeLayout.positionImage,
        height: legacy.largeLayout.height,
        stickyPlayer: legacy.largeLayout.options.stickyPlayer.option,
        stickyComments: legacy.largeLayout.options.stickyComments.option,
      },
      medium: {
        position: migratePosition(legacy.mediumLayout.position),
        img: legacy.mediumLayout.positionImage,
        height: legacy.mediumLayout.height,
        stickyPlayer: legacy.mediumLayout.options.stickyPlayer.option,
        stickyComments: legacy.mediumLayout.options.stickyComments.option,
      }
    };
  }

  // 新形式でも古いposition値を含む可能性があるため変換
  if (data.large && data.medium) {
    return {
      large: {
        ...data.large,
        position: migratePosition(data.large.position),
      },
      medium: {
        ...data.medium,
        position: migratePosition(data.medium.position),
      }
    };
  }

  return DEFAULT_SETTINGS;
}


export async function getSettings(): Promise<Settings> {
  const data = await getStorage<{ settings?: any }>('settings');
  if (!data.settings) {
    return DEFAULT_SETTINGS;
  }

  // マイグレーション実行
  const migratedSettings = migrateSettings(data.settings);

  // マイグレーションが必要だったかチェック
  const needsMigration =
    data.settings.largeLayout ||
    data.settings.mediumLayout ||
    (data.settings.large && (
      data.settings.large.position?.includes('position-') ||
      data.settings.large.position === 'large-leftside' ||
      data.settings.large.position === 'large-leftside-bottom'
    )) ||
    (data.settings.medium && (
      data.settings.medium.position?.includes('position-')
    ));

  // マイグレーションが必要だった場合は新しい形式で保存
  if (needsMigration) {
    await setStorage({ settings: migratedSettings });
  }

  return migratedSettings;
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