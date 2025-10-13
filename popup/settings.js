const DEFAULT_SETTINGS = {
  largeLayout: {
    positionId: "large-layout-position",
    position: "large-position-leftside",
    positionImgId: "large-image",
    positionImage: "./images/large-layout-comments-secondary-left.png",
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
    positionImage: "./images/medium-layout-comments-default.png",
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

function migrateSettings(settings) {
  const newSettings = {};

  for (const [key, value] of Object.entries(settings)) {
    // 旧構造の要素を新構造にマッピング
    newSettings[key] = {
      positionId: value.positionId,
      position: value.position,
      positionImgId: value.positionImgId,
      positionImage: value.positionImage,
      heightId: value.heightId,
      height: value.height || null,
      options: {
        stickyPlayer: {
          id: DEFAULT_SETTINGS[key].options.stickyPlayer.id,
          option: value.option || value.options?.stickyPlayer?.option || DEFAULT_SETTINGS[key].options.stickyPlayer.option,
        },
        stickyComments: {
          id: DEFAULT_SETTINGS[key].options.stickyComments.id,
          option: value.options?.stickyComments?.option || DEFAULT_SETTINGS[key].options.stickyComments.option,
        }
      },
      positionPrefix: value.positionPrefix,
    };
  }

  return newSettings;
}
export { DEFAULT_SETTINGS, migrateSettings };