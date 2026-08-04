"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { settingsAPI } from "./api";

interface SettingValue { value: string; publicId?: string }

interface SettingsContextType {
  settings: Record<string, SettingValue>;
  get: (key: string) => string;
  loading: boolean;
  refresh: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType>({} as SettingsContextType);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Record<string, SettingValue>>({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const r = await settingsAPI.getAll();
      setSettings(r.data || {});
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const get = (key: string) => settings[key]?.value || "";

  return (
    <SettingsContext.Provider value={{ settings, get, loading, refresh: load }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);