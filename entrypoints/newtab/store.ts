import { create } from "zustand";

export type ClockFormat = "12h" | "24h";
type WeatherTemperatureDisplay = "current" | "range";
export type WeatherLocationMode = "auto" | "manual";

export type BookmarkItem = {
  title: string;
  url: string;
  backgroundColor?: string;
};

type ManualWeatherLocation = {
  name: string;
  latitude: number;
  longitude: number;
};

export type SearchEngine = "google" | "bing" | "duckduckgo" | "baidu";

export type NewtabConfig = {
  backgroundColor: string;
  enableClock: boolean;
  clockFormat: ClockFormat;
  enableDate: boolean;
  enableWeather: boolean;
  weatherLocationMode: WeatherLocationMode;
  manualWeatherLocation: ManualWeatherLocation;
  enableSearch: boolean;
  searchEngine: SearchEngine;
  enableSearchSuggestions: boolean;
  enableDailyQuote: boolean;
  customDailyQuote: boolean;
  customDailyQuoteText: string;
  enableFavoriteManager: boolean;
  enableHistory: boolean;
  showBookmarks: boolean;
  bookmarkItems: BookmarkItem[];
};

type NewtabStore = {
  config: NewtabConfig;
  updateConfig: (config: Partial<NewtabConfig>) => void;
};

const CONFIG_STORAGE_KEY = "animal-cross-newtab-config";

const DEFAULT_CONFIG: NewtabConfig = {
  backgroundColor: "#f8efbc",
  enableClock: true,
  clockFormat: "12h",
  enableDate: true,
  enableWeather: true,
  weatherLocationMode: "manual",
  manualWeatherLocation: {
    name: "上海",
    latitude: 31.2304,
    longitude: 121.4737,
  },
  enableSearch: true,
  searchEngine: "google",
  enableSearchSuggestions: true,
  enableDailyQuote: false,
  customDailyQuote: false,
  customDailyQuoteText: "",
  enableFavoriteManager: false,
  enableHistory: false,
  showBookmarks: true,
  bookmarkItems: [
    {
      title: "Google",
      url: "https://www.google.com",
      backgroundColor: "#fdf8e4",
    },
    {
      title: "Bing",
      url: "https://www.bing.com",
      backgroundColor: "#fdf8e4",
    },
    {
      title: "DuckDuckGo",
      url: "https://www.duckduckgo.com",
      backgroundColor: "#fdf8e4",
    },
    {
      title: "百度",
      url: "https://www.baidu.com",
      backgroundColor: "#fdf8e4",
    },
    {
      title: "GitHub",
      url: "https://www.github.com",
      backgroundColor: "#fdf8e4",
    },
    {
      title: "Twitter",
      url: "https://www.twitter.com",
      backgroundColor: "#fdf8e4",
    },
    {
      title: "Facebook",
      url: "https://www.facebook.com",
      backgroundColor: "#fdf8e4",
    },
    {
      title: "YouTube",
      url: "https://www.youtube.com",
      backgroundColor: "#fdf8e4",
    },
    {
      title: "Instagram",
      url: "https://www.instagram.com",
      backgroundColor: "#fdf8e4",
    },
    {
      title: "LinkedIn",
      url: "https://www.linkedin.com",
      backgroundColor: "#fdf8e4",
    },
    {
      title: "Pinterest",
      url: "https://www.pinterest.com",
      backgroundColor: "#fdf8e4",
    },
    {
      title: "Reddit",
      url: "https://www.reddit.com",
      backgroundColor: "#fdf8e4",
    },
    {
      title: "Stack Overflow",
      url: "https://www.stackoverflow.com",
      backgroundColor: "#fdf8e4",
    },
  ],
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mergeConfig(config: Partial<NewtabConfig>): NewtabConfig {
  return {
    ...DEFAULT_CONFIG,
    ...config,
    manualWeatherLocation: {
      ...DEFAULT_CONFIG.manualWeatherLocation,
      ...(isRecord(config.manualWeatherLocation)
        ? config.manualWeatherLocation
        : {}),
    },
  };
}

function loadConfigFromLocalStorage() {
  try {
    const storedConfig = localStorage.getItem(CONFIG_STORAGE_KEY);

    if (!storedConfig) {
      return DEFAULT_CONFIG;
    }

    const parsedConfig = JSON.parse(storedConfig);

    if (!isRecord(parsedConfig)) {
      return DEFAULT_CONFIG;
    }

    return mergeConfig(parsedConfig);
  } catch {
    return DEFAULT_CONFIG;
  }
}

function saveConfigToLocalStorage(config: NewtabConfig) {
  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch {
    // Ignore storage errors, such as disabled storage or quota limits.
  }
}

export const useNewtabStore = create<NewtabStore>((set) => ({
  config: loadConfigFromLocalStorage(),
  updateConfig: (config) =>
    set((state) => {
      const nextConfig = mergeConfig({
        ...state.config,
        ...config,
      });

      saveConfigToLocalStorage(nextConfig);

      return {
        config: nextConfig,
      };
    }),
}));
