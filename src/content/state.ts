import { getSettings, isEnabled as getIsEnabled, Settings } from "../settings";

export let isEnabled: boolean = false;
export let settings: Settings;

export let preRespWidth: 'large' | 'medium' | null = null;
export let isReloaded = false;
export let preUrl: string | null = null;

export function setPreRespWidth(value: 'large' | 'medium' | null) {
  preRespWidth = value;
}

export function setIsReloaded(value: boolean) {
  isReloaded = value;
}

export function setPreUrl(value: string | null) {
  preUrl = value;
}

export async function loadSettings(): Promise<void> {
  settings = await getSettings();
  isEnabled = await getIsEnabled();
}

// popup側で設定が変更されたときに自動同期
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== 'local') return;

  if (changes.settings?.newValue) {
    settings = changes.settings.newValue as Settings;
  }

  if (changes.isEnabled?.newValue !== undefined) {
    isEnabled = changes.isEnabled.newValue as boolean;
  }
});

export function getLayoutSettings() {
  const large = settings.large;
  const medium = settings.medium;

  return {
    isLargeDefaultPosition: large.position === "large-default",
    isLargeStickyPlayer: large.stickyPlayer,
    isLargeStickyComments: large.stickyComments,
    isMediumDefaultPosition: medium.position === "medium-default",
    isMediumStickyPlayer: medium.stickyPlayer,
    isMediumStickyComments: medium.stickyComments,
    largeLayoutPosition: large.position,
    mediumLayoutPosition: medium.position,
    largeHeight: large.height,
    mediumHeight: medium.height,
    largeSidebarEnabled: large.largeSidebarEnabled || false,
  };
}
