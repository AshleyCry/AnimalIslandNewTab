import { Cursor } from "animal-island-ui";
import "./App.css";
import "animal-island-ui/dist/index.css";
import { useNewtabStore } from "./store";
import Calendar from "./components/Calendar";
import Clock from "./components/Clock";
import Weather from "./components/Weather";
import { Leaf } from "lucide-react";
import { SearchBar } from "./components/SearchBar";
import { Bookmarks } from "./components/BookMark";
import SettingsSidebar from "./components/SettingsSidebar";

function App() {
  const config = useNewtabStore((state) => state.config);

  return (
    <Cursor
      className="flex min-h-screen w-screen flex-col items-center justify-center overflow-hidden px-8 py-10"
      style={{ backgroundColor: config.backgroundColor }}
    >
      <div className="absolute top-8 left-8 text-[#59C19D] opacity-80 flex items-center gap-2 font-black text-xl">
        <Leaf size={32} className="fill-[#59C19D]" />
        <span>NookInc.</span>
      </div>
      <main className="flex w-full max-w-5xl flex-col items-center gap-5">
        <section className="relative flex w-full justify-center">
          {config.enableDate ? (
            <div className="absolute left-[-20px] top-1/2 z-10 -translate-y-1/2 -rotate-6">
              <Calendar />
            </div>
          ) : null}
          <div className="relative z-20">
            <Clock />
          </div>
          {config.enableWeather ? (
            <div className="absolute right-[-20px] top-1/2 z-10 -translate-y-1/2 rotate-5">
              <Weather />
            </div>
          ) : null}
        </section>
        <SearchBar />
        <Bookmarks />
      </main>
      <SettingsSidebar />
    </Cursor>
  );
}

export default App;
