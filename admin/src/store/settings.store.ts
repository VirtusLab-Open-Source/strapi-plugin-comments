import { create } from 'zustand/react';
import { Config } from '../api/schemas';

type SettingsStore = {
  settings: Config;
  setSettings: (settings: any) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: {
    entryLabel: {},
    approvalFlow: [],
    blockedAuthorProps: [],
    reportReasons: {
      BAD_LANGUAGE: '',
      DISCRIMINATION: '',
      OTHER: '',
    },
    regex: {
      uid: '',
      relatedUid: '',
      email: '',
      sorting: '',
    },
    enabledCollections: [],
    moderatorRoles: [],
    isGQLPluginEnabled: false,
  },
  setSettings: (settings: any) => set({ settings }),
}));