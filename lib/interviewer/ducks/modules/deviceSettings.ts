const SET_DESCRIPTION = 'SETTINGS/SET_DESCRIPTION' as const;
const SET_INTERFACE_SCALE = 'SETTINGS/SET_INTERFACE_SCALE' as const;
const TOGGLE_SETTING = 'SETTINGS/TOGGLE_SETTING' as const;
const SET_SETTING = 'SETTINGS/SET_SETTING' as const;

// Static defaults should be distinguishable from user choices (e.g., undefined instead of false).
export type DeviceSettings = {
  useDynamicScaling: boolean;
  useFullScreenForms?: boolean; // leave using full screen forms up to the user
  interfaceScale: number;
  startFullScreen: boolean;
  enableExperimentalTTS: boolean;
  enableExperimentalSounds: boolean;
  description?: string;
};

const initialState: DeviceSettings = {
  useDynamicScaling: true,
  useFullScreenForms: false,
  interfaceScale: 100,
  startFullScreen: false,
  enableExperimentalTTS: false,
  enableExperimentalSounds: false,
};

type ActionType =
  | typeof SET_DESCRIPTION
  | typeof SET_INTERFACE_SCALE
  | typeof TOGGLE_SETTING
  | typeof SET_SETTING;

type Action = {
  type: ActionType;
  description?: string;
  scale?: number;
  item?: keyof DeviceSettings;
  setting?: keyof DeviceSettings;
  value?: DeviceSettings[keyof DeviceSettings];
};

export default function reducer(
  state: DeviceSettings = initialState,
  action: Action,
): DeviceSettings {
  switch (action.type) {
    case SET_DESCRIPTION:
      return {
        ...state,
        description: action.description,
      };
    case SET_INTERFACE_SCALE:
      return {
        ...state,
        interfaceScale: action.scale!,
      };
    case TOGGLE_SETTING:
      return {
        ...state,
        [action.item!]: !state[action.item!],
      };
    case SET_SETTING:
      return {
        ...state,
        [action.setting!]: action.value,
      };
    default:
      return state;
  }
}

const setDescription = (description: string) => ({
  type: SET_DESCRIPTION,
  description,
});

const setInterfaceScale = (scale: number) => ({
  type: SET_INTERFACE_SCALE,
  scale,
});

const toggleSetting = (item: keyof DeviceSettings) => ({
  type: TOGGLE_SETTING,
  item,
});

const setSetting = (
  setting: keyof DeviceSettings,
  value: DeviceSettings[keyof DeviceSettings],
) => ({
  type: SET_SETTING,
  setting,
  value,
});

const actionCreators = {
  setDescription,
  setInterfaceScale,
  toggleSetting,
  setSetting,
};

const actionTypes = {
  SET_DESCRIPTION,
  SET_INTERFACE_SCALE,
  TOGGLE_SETTING,
  SET_SETTING,
};

export { actionCreators, actionTypes };
