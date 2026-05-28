import { useState } from "react";
import { Button, Input, Select, Switch } from "animal-island-ui";
import {
  useNewtabStore,
  type ClockFormat,
  type WeatherLocationMode,
} from "../../../store";
import BookmarkSettingsPanel from "./BookmarkSettingsPanel";
import WeatherLocationModal from "./WeatherLocationModal";

const clockFormatOptions = [
  { key: "12h", label: "12 小时制" },
  { key: "24h", label: "24 小时制" },
];

const weatherLocationModeOptions = [
  { key: "manual", label: "手动位置" },
  { key: "auto", label: "自动定位" },
];

function isClockFormat(value: string): value is ClockFormat {
  return value === "12h" || value === "24h";
}

function isWeatherLocationMode(value: string): value is WeatherLocationMode {
  return value === "auto" || value === "manual";
}

function SettingsTabPanel() {
  const config = useNewtabStore((state) => state.config);
  const updateConfig = useNewtabStore((state) => state.updateConfig);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isBookmarkSettingsOpen, setIsBookmarkSettingsOpen] = useState(false);
  const isManualLocationDisabled = config.weatherLocationMode === "auto";

  const handleClockFormatChange = (value: string) => {
    if (!isClockFormat(value)) {
      return;
    }

    updateConfig({ clockFormat: value });
  };

  const handleWeatherLocationModeChange = (value: string) => {
    if (!isWeatherLocationMode(value)) {
      return;
    }

    updateConfig({ weatherLocationMode: value });
  };

  if (isBookmarkSettingsOpen) {
    return (
      <BookmarkSettingsPanel onBack={() => setIsBookmarkSettingsOpen(false)} />
    );
  }

  return (
    <div className="space-y-7">
      <label className="flex items-center justify-between gap-4">
        <span className="text-sm font-black text-[#725d42]">背景颜色</span>
        <div className="flex min-w-36 items-center gap-2">
          <input
            type="color"
            className="h-10 w-12 rounded-lg border-2 border-[#c4b89e]"
            value={config.backgroundColor}
            onChange={(event) =>
              updateConfig({ backgroundColor: event.target.value })
            }
          />
          <Input
            value={config.backgroundColor}
            onChange={(event) =>
              updateConfig({ backgroundColor: event.target.value })
            }
          />
        </div>
      </label>

      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-black text-[#725d42]">显示日期</span>
        <Switch
          checked={config.enableDate}
          onChange={(checked) => updateConfig({ enableDate: checked })}
        />
      </div>

      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-black text-[#725d42]">显示天气</span>
        <Switch
          checked={config.enableWeather}
          onChange={(checked) => updateConfig({ enableWeather: checked })}
        />
      </div>

      <label className="flex items-center justify-between gap-4">
        <span className="text-sm font-black text-[#725d42]">时间制</span>

        <Select
          options={clockFormatOptions}
          value={config.clockFormat}
          onChange={handleClockFormatChange}
        />
      </label>

      <label className="flex items-center justify-between gap-4">
        <span className="text-sm font-black text-[#725d42]">天气定位模式</span>

        <Select
          options={weatherLocationModeOptions}
          value={config.weatherLocationMode}
          onChange={handleWeatherLocationModeChange}
        />
      </label>

      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-sm font-black text-[#725d42]">
            天气定位设置
          </span>
          <span className="text-xs text-[#8a7966]">
            {config.manualWeatherLocation.name}
          </span>
        </div>
        <Button
          type="primary"
          disabled={isManualLocationDisabled}
          onClick={() => setIsLocationModalOpen(true)}
        >
          设置
        </Button>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-sm font-black text-[#725d42]">
            快捷方式设置
          </span>
          <span className="text-xs text-[#8a7966]">
            {config.bookmarkItems.length} 个快捷方式
          </span>
        </div>
        <Button type="primary" onClick={() => setIsBookmarkSettingsOpen(true)}>
          设置
        </Button>
      </div>

      <WeatherLocationModal
        open={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />
    </div>
  );
}

export default SettingsTabPanel;
