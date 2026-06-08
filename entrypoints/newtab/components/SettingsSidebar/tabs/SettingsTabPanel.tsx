import { useEffect, useState } from "react";
import { Button, Input, Select, Switch, Tooltip } from "animal-island-ui";
import { ImagePlus } from "lucide-react";
import {
  useNewtabStore,
  type BackgroundType,
  type ClockFormat,
  type WeatherLocationMode,
} from "../../../store";
import BookmarkSettingsPanel from "./BookmarkSettingsPanel";
import WeatherLocationModal from "./WeatherLocationModal";
import { backgroundPresets } from "../../../backgroundPresets";
import {
  CUSTOM_BACKGROUND_IMAGE_ID,
  getCustomBackgroundImage,
  saveCustomBackgroundImage,
} from "../../../customBackgroundImage";

const clockFormatOptions = [
  { key: "12h", label: "12 小时制" },
  { key: "24h", label: "24 小时制" },
];

const weatherLocationModeOptions = [
  { key: "manual", label: "手动位置" },
  { key: "auto", label: "自动定位" },
];

const backgroundTypeOptions: { key: BackgroundType; label: string }[] = [
  { key: "color", label: "纯色" },
  { key: "image", label: "图片" },
];

const COLLAPSED_BACKGROUND_PRESET_COUNT = 6;

const backgroundColorPresets = [
  { label: "阳光浅麦", value: "#f8efbc" },
  { label: "奶油米杏", value: "#f7f3df" },
  { label: "嫩叶浅绿", value: "#dceecf" },
  { label: "薄荷晨雾", value: "#d8f0e5" },
  { label: "湖水浅蓝", value: "#dceff3" },
  { label: "樱花淡粉", value: "#f6dfe2" },
  { label: "蘑菇浅褐", value: "#eadfcb" },
  { label: "薰衣草雾", value: "#e8e0f0" },
  { label: "蜜桃奶霜", value: "#f5e2d3" },
];

function isClockFormat(value: string): value is ClockFormat {
  return value === "12h" || value === "24h";
}

function isWeatherLocationMode(value: string): value is WeatherLocationMode {
  return value === "auto" || value === "manual";
}

function isBackgroundType(value: string): value is BackgroundType {
  return value === "color" || value === "image";
}

function isHexColor(value: string) {
  return /^#[0-9a-f]{6}$/i.test(value);
}

function SettingsTabPanel() {
  const config = useNewtabStore((state) => state.config);
  const updateConfig = useNewtabStore((state) => state.updateConfig);
  const backgroundCustomImageUpdatedAt = useNewtabStore(
    (state) => state.backgroundCustomImageUpdatedAt,
  );
  const touchCustomBackgroundImage = useNewtabStore(
    (state) => state.touchCustomBackgroundImage,
  );
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isBookmarkSettingsOpen, setIsBookmarkSettingsOpen] = useState(false);
  const [isBackgroundPresetExpanded, setIsBackgroundPresetExpanded] =
    useState(false);
  const [customBackgroundPreviewSrc, setCustomBackgroundPreviewSrc] =
    useState("");
  const isManualLocationDisabled = config.weatherLocationMode === "auto";
  const currentBackgroundColor = isHexColor(config.backgroundColor)
    ? config.backgroundColor
    : backgroundColorPresets[0].value;
  const hasHiddenBackgroundPresets =
    backgroundPresets.length + 1 > COLLAPSED_BACKGROUND_PRESET_COUNT;
  const isUsingPresetBackground = backgroundColorPresets.some(
    (preset) =>
      preset.value.toLowerCase() === currentBackgroundColor.toLowerCase(),
  );

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

  const handleBackgroundTypeChange = (value: string) => {
    if (!isBackgroundType(value)) {
      return;
    }

    updateConfig({ backgroundType: value });
  };

  const handleCustomBackgroundUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file || !file.type.startsWith("image/")) {
      return;
    }

    await saveCustomBackgroundImage(file);
    updateConfig({
      backgroundType: "image",
      backgroundPresetImage: CUSTOM_BACKGROUND_IMAGE_ID,
    });
    touchCustomBackgroundImage();
    event.target.value = "";
  };

  useEffect(() => {
    let objectUrl = "";
    let isCancelled = false;

    getCustomBackgroundImage().then((blob) => {
      if (isCancelled || !blob) {
        return;
      }

      objectUrl = URL.createObjectURL(blob);
      setCustomBackgroundPreviewSrc(objectUrl);
    });

    return () => {
      isCancelled = true;

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [backgroundCustomImageUpdatedAt]);

  if (isBookmarkSettingsOpen) {
    return (
      <BookmarkSettingsPanel onBack={() => setIsBookmarkSettingsOpen(false)} />
    );
  }

  return (
    <div className="space-y-7">
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
        <span className="text-sm font-black text-[#725d42]">背景类型</span>

        <Select
          options={backgroundTypeOptions}
          value={config.backgroundType}
          onChange={handleBackgroundTypeChange}
        />
      </label>

      {config.backgroundType === "color" ? (
        <div className="flex items-start justify-between gap-4">
          <span className="text-sm font-black text-[#725d42] mt-3">
            背景颜色
          </span>
          <div className="flex max-w-50 flex-col items-end gap-3 bg-[#fff9] p-3 rounded-2xl">
            <div className="flex flex-wrap justify-between gap-2">
              {backgroundColorPresets.map((preset) => {
                const isSelected =
                  preset.value.toLowerCase() ===
                  currentBackgroundColor.toLowerCase();

                return (
                  <Tooltip key={preset.value} title={preset.label}>
                    <button
                      type="button"
                      aria-label={`使用${preset.label}背景`}
                      aria-pressed={isSelected}
                      className={[
                        "h-7 w-7 rounded-full border-3 transition-all",
                        isSelected
                          ? "scale-110 border-[#59C19D] shadow-[0_0_0_3px_rgba(89,193,157,0.22)]"
                          : "border-white shadow-[0_3px_0_#c4b89e] hover:-translate-y-0.5",
                      ].join(" ")}
                      style={{ backgroundColor: preset.value }}
                      onClick={() =>
                        updateConfig({
                          backgroundType: "color",
                          backgroundColor: preset.value,
                        })
                      }
                    />
                  </Tooltip>
                );
              })}
              <Tooltip title="自定义">
                <label
                  className={[
                    "relative flex h-7 w-7 cursor-pointer items-center justify-center overflow-hidden rounded-full border-3 transition-all",
                    isUsingPresetBackground
                      ? "border-white shadow-[0_3px_0_#c4b89e] hover:-translate-y-0.5"
                      : "scale-110 border-[#59C19D] shadow-[0_0_0_3px_rgba(89,193,157,0.22)]",
                  ].join(" ")}
                >
                  <span
                    className="h-full w-full"
                    style={{ backgroundColor: currentBackgroundColor }}
                  />
                  <span className="absolute inset-0 bg-[linear-gradient(135deg,transparent_0_42%,rgba(255,255,255,0.9)_42%_58%,transparent_58%)]" />
                  <input
                    type="color"
                    aria-label="自定义背景颜色"
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    value={currentBackgroundColor}
                    onChange={(event) =>
                      updateConfig({
                        backgroundType: "color",
                        backgroundColor: event.target.value,
                      })
                    }
                  />
                </label>
              </Tooltip>
            </div>
            <Input
              value={config.backgroundColor}
              onChange={(event) =>
                updateConfig({
                  backgroundType: "color",
                  backgroundColor: event.target.value,
                })
              }
            />
          </div>
        </div>
      ) : null}

      {config.backgroundType === "image" ? (
        <div className="flex items-start justify-between gap-4">
          <span className="mt-3 text-sm font-black text-[#725d42]">
            背景图片
          </span>
          <div className="flex max-w-62 flex-col gap-3 rounded-2xl bg-[#fff9] p-2">
            <div
              className={[
                "grid grid-cols-3 gap-2 overflow-hidden transition-all duration-300 ease-in-out p-1",
                isBackgroundPresetExpanded ? "" : "max-h-24",
              ].join(" ")}
            >
              {backgroundPresets.map((preset, index) => {
                const isSelected = config.backgroundPresetImage === preset.id;

                return (
                  <button
                    key={preset.id}
                    type="button"
                    aria-label={`使用预设背景图片 ${index + 1}`}
                    aria-pressed={isSelected}
                    className={[
                      "h-10 w-15 overflow-hidden rounded-lg border-3 bg-[#f7f3df] transition-all",
                      isSelected
                        ? "scale-105 border-[#59C19D] shadow-[0_0_0_3px_rgba(89,193,157,0.22)]"
                        : "border-white shadow-[0_3px_0_#c4b89e] hover:-translate-y-0.5",
                    ].join(" ")}
                    onClick={() =>
                      updateConfig({
                        backgroundType: "image",
                        backgroundPresetImage: preset.id,
                      })
                    }
                  >
                    <img
                      alt=""
                      className="h-full w-full object-cover"
                      src={preset.src}
                    />
                  </button>
                );
              })}
              <label
                className={[
                  "relative flex h-10 w-15 cursor-pointer overflow-hidden rounded-lg border-3 bg-[#f7f3df] transition-all",
                  config.backgroundPresetImage === CUSTOM_BACKGROUND_IMAGE_ID
                    ? "scale-105 border-[#59C19D] shadow-[0_0_0_3px_rgba(89,193,157,0.22)]"
                    : "border-white shadow-[0_3px_0_#c4b89e] hover:-translate-y-0.5",
                ].join(" ")}
              >
                {customBackgroundPreviewSrc ? (
                  <>
                    <img
                      alt=""
                      className="h-full w-full object-cover"
                      src={customBackgroundPreviewSrc}
                    />
                    <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-0.5 bg-[#725d42]/75 py-0.5 text-[9px] font-black text-white">
                      <ImagePlus className="h-2.5 w-2.5" />
                      自定义
                    </span>
                  </>
                ) : (
                  <span className="flex h-full w-full flex-col items-center justify-center gap-0.5 text-[10px] font-black text-[#8A7966]">
                    <ImagePlus className="h-4 w-4" />
                    自定义
                  </span>
                )}
                <input
                  type="file"
                  accept="image/*"
                  aria-label="上传自定义背景图片"
                  className="hidden"
                  onChange={handleCustomBackgroundUpload}
                />
              </label>
            </div>
            {hasHiddenBackgroundPresets ? (
              <Button
                type="primary"
                size="small"
                onClick={() =>
                  setIsBackgroundPresetExpanded(
                    (currentExpanded) => !currentExpanded,
                  )
                }
              >
                {isBackgroundPresetExpanded ? "收起" : "展开"}
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}

      <label className="flex items-center justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-sm font-black text-[#725d42]">
            天气定位模式
          </span>
        </div>

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
