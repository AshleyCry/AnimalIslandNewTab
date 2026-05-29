import { useState } from "react";
import { Button, Cursor, Typewriter } from "animal-island-ui";
import "./App.css";
import "animal-island-ui/dist/index.css";
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

const GITHUB_REPOSITORY_URL = "https://github.com/AshleyCry/AnimalCrossNewTab";

function App() {
  const config = useNewtabStore((state) => state.config);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <Cursor
        className="relative flex min-h-195 min-w-290 w-screen h-screen flex-col items-center justify-center overflow-auto px-8 py-10"
        style={{
          backgroundColor: config.backgroundColor,
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-55"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(114, 93, 66, 0.22) 2px, transparent 2.5px)",
            backgroundSize: "44px 44px",
          }}
        />
        <Typewriter>
          <div className="absolute top-8 left-8 z-10 text-[#59C19D] opacity-80 flex items-center gap-2 font-black text-xl">
            <LeafIcon width={32} height={32} className="fill-[#59C19D]" />
            <span>NookInc.</span>
          </div>
        </Typewriter>
        <main className="relative z-10 flex w-full max-w-5xl flex-col items-center gap-12">
          <section className="relative flex w-full justify-center">
            {config.enableDate ? (
              <div className="absolute -left-10 top-1/2 z-10 -translate-y-1/2 -rotate-6">
                <Calendar />
              </div>
            ) : null}
            <div className="relative z-20">
              <Clock />
            </div>
            {config.enableWeather ? (
              <div className="absolute -right-10 top-1/2 z-10 -translate-y-1/2 rotate-5">
                <Weather />
              </div>
            ) : null}
          </section>
          <SearchBar />
          <Bookmarks />
        </main>
        <div className="absolute w-screen bottom-8 px-8 z-40 flex justify-between">
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
        <SettingsSidebar
          open={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      </Cursor>
    </>
  );
}

export default App;
