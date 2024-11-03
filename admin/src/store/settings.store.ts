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
      BAD_LANGUAGE: 'BAD_LANGUAGE',
      DISCRIMINATION: 'DISCRIMINATION',
      OTHER: 'OTHER',
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
    client: {
      url: '',
      contactEmail: '',
    },
  },
  setSettings: (settings: Config) => set({ settings }),
}));