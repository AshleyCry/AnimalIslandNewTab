import { useEffect, useState } from "react";
import { Button, Cursor, Typewriter } from "animal-island-ui";
import "animal-island-ui/dist/index.css";
import "./App.css";
import { useNewtabStore } from "./store";
import Calendar from "./components/Calendar";
import Clock from "./components/Clock";
import Weather from "./components/Weather";
import LeafIcon from "../../assets/Animal_Crossing_Leaf.svg?react";
import GithubIcon from "../../assets/github.svg?react";
import { SearchBar } from "./components/SearchBar";
import { Bookmarks } from "./components/BookMark";
import SettingsSidebar from "./components/SettingsSidebar";
import { Settings } from "lucide-react";
import { getBackgroundPresetSrc } from "./backgroundPresets";
import {
  CUSTOM_BACKGROUND_IMAGE_ID,
  getCustomBackgroundImage,
} from "./customBackgroundImage";

const GITHUB_REPOSITORY_URL = "https://github.com/AshleyCry/AnimalIslandNewTab";
const LIGHT_BACKGROUND_DOT_COLOR = "rgba(114, 93, 66, 0.22)";
const DARK_BACKGROUND_DOT_COLOR = "rgba(255, 249, 218, 0.28)";

function getHexChannel(hex: string, start: number, length: number) {
  const value = hex.slice(start, start + length);
  const normalizedValue = length === 1 ? value + value : value;

  return Number.parseInt(normalizedValue, 16);
}

function getBackgroundLuminance(color: string) {
  const hex = color.trim();
  const hexColor = hex.startsWith("#") ? hex.slice(1) : hex;

  if (!/^[0-9a-f]{3}$|^[0-9a-f]{6}$/i.test(hexColor)) {
    return 1;
  }

  const channelLength = hexColor.length === 3 ? 1 : 2;
  const red = getHexChannel(hexColor, 0, channelLength);
  const green = getHexChannel(hexColor, channelLength, channelLength);
  const blue = getHexChannel(hexColor, channelLength * 2, channelLength);

  return (red * 299 + green * 587 + blue * 114) / 255000;
}

function getBackgroundDotColor(backgroundColor: string) {
  return getBackgroundLuminance(backgroundColor) < 0.55
    ? DARK_BACKGROUND_DOT_COLOR
    : LIGHT_BACKGROUND_DOT_COLOR;
}

function App() {
  const config = useNewtabStore((state) => state.config);
  const backgroundCustomImageUpdatedAt = useNewtabStore(
    (state) => state.backgroundCustomImageUpdatedAt,
  );
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [customBackgroundImageSrc, setCustomBackgroundImageSrc] = useState("");
  const isCustomBackgroundImage =
    config.backgroundPresetImage === CUSTOM_BACKGROUND_IMAGE_ID;
  const backgroundImageSrc = isCustomBackgroundImage
    ? customBackgroundImageSrc
    : getBackgroundPresetSrc(config.backgroundPresetImage);
  const isImageBackground =
    config.backgroundType === "image" && Boolean(backgroundImageSrc);
  const backgroundDotColor = getBackgroundDotColor(config.backgroundColor);

  useEffect(() => {
    if (
      config.backgroundType !== "image" ||
      config.backgroundPresetImage !== CUSTOM_BACKGROUND_IMAGE_ID
    ) {
      setCustomBackgroundImageSrc("");
      return;
    }

    let objectUrl = "";
    let isCancelled = false;

    getCustomBackgroundImage().then((blob) => {
      if (isCancelled || !blob) {
        return;
      }

      objectUrl = URL.createObjectURL(blob);
      setCustomBackgroundImageSrc(objectUrl);
    });

    return () => {
      isCancelled = true;

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [
    backgroundCustomImageUpdatedAt,
    config.backgroundPresetImage,
    config.backgroundType,
  ]);

  return (
    <>
      <Cursor
        className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-x-hidden overflow-y-auto p-5"
        style={{
          backgroundColor: isImageBackground
            ? undefined
            : config.backgroundColor,
          backgroundImage: isImageBackground
            ? `url(${backgroundImageSrc})`
            : undefined,
          backgroundPosition: isImageBackground ? "center" : undefined,
          backgroundSize: isImageBackground ? "cover" : undefined,
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-55"
          style={{
            backgroundImage: `radial-gradient(circle, ${backgroundDotColor} 2px, transparent 2.5px)`,
            backgroundSize: "44px 44px",
            display: isImageBackground ? "none" : "block",
          }}
        />
        <Typewriter>
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 text-lg font-black text-[#59C19D] opacity-80 sm:top-8 sm:left-8 sm:text-xl [@media(max-height:840px)]:hidden">
            <LeafIcon width={32} height={32} className="fill-[#59C19D]" />
            <span>Nook Inc.</span>
          </div>
        </Typewriter>
        <main className="relative z-10 flex w-full max-w-5xl flex-col items-center gap-7 sm:gap-10 lg:gap-12">
          <section className="relative flex w-full justify-center">
            {config.enableDate ? (
              <div className="absolute -left-10 top-1/2 z-10 hidden -translate-y-1/2 -rotate-7 lg:block">
                <Calendar />
              </div>
            ) : null}
            <div className="relative z-20">
              <Clock />
            </div>
            {config.enableWeather ? (
              <div className="absolute -right-10 top-1/2 z-10 hidden -translate-y-1/2 rotate-3 lg:block">
                <Weather />
              </div>
            ) : null}
          </section>
          <SearchBar />
          <Bookmarks />
        </main>
        <SettingsSidebar
          open={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      </Cursor>
      <Cursor className="fixed bottom-4 z-40 w-screen sm:bottom-8">
        <div className="flex justify-between px-4 sm:px-8">
          <div className="flex gap-4">
            <Button
              type="primary"
              size="large"
              icon={<GithubIcon className="h-5 w-5" />}
              onClick={() => window.open(GITHUB_REPOSITORY_URL, "_blank")}
            />
          </div>
          <div className="flex gap-4">
            <Button
              type="primary"
              size="large"
              icon={<Settings className="h-5 w-5" />}
              onClick={() => setIsSettingsOpen(true)}
            />
          </div>
        </div>
      </Cursor>
    </>
  );
}

export default App;
