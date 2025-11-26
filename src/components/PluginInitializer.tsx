'use client';

import { useEffect } from 'react';
import { initializePlugins } from '@/config/plugins';
import { useSettingsStore } from '@/store/settings-store';

export function PluginInitializer() {
  const { setPluginsInitialized, pluginsInitialized } = useSettingsStore();

  useEffect(() => {
    if (!pluginsInitialized) {
      console.log("Initializing plugins...");
      initializePlugins({ gameId: 'mtg' });
      setPluginsInitialized(true);
      console.log("Plugins initialized.");
    }
  }, [pluginsInitialized, setPluginsInitialized]);

  return null;
}
