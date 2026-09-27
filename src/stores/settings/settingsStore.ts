import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { DEFAULT_LANGUAGE, type Language } from '@/lib/i18n';
import { zustandStorage } from '@/lib/storage';

export type ColorSchemeSetting = 'system' | 'light' | 'dark';

type SettingsState = {
  /** Skin name; validated against the theme registry by ThemeProvider (may be remote-config driven). */
  themeName: string;
  colorScheme: ColorSchemeSetting;
  language: Language;
};

type SettingsActions = {
  setThemeName: (themeName: string) => void;
  setColorScheme: (colorScheme: ColorSchemeSetting) => void;
  setLanguage: (language: Language) => void;
  reset: () => void;
};

const initialState: SettingsState = {
  themeName: 'default',
  colorScheme: 'system',
  language: DEFAULT_LANGUAGE,
};

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    (set) => ({
      ...initialState,
      setThemeName: (themeName) => set({ themeName }),
      setColorScheme: (colorScheme) => set({ colorScheme }),
      setLanguage: (language) => set({ language }),
      reset: () => set(initialState),
    }),
    {
      name: 'settings',
      version: 1,
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({
        themeName: state.themeName,
        colorScheme: state.colorScheme,
        language: state.language,
      }),
      migrate: (persisted) => persisted as SettingsState,
    },
  ),
);
