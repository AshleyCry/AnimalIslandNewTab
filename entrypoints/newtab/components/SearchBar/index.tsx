import { useState } from "react";
import { Select } from "animal-island-ui";
import { Search } from "lucide-react";
import { useNewtabStore, type SearchEngine } from "../../store";
import {
  canUseBrowserDefaultSearch,
  getBrowserDefaultSearchApi,
} from "../../utils/browserSearch";
import "./style.css";

const BROWSER_DEFAULT_ENGINE = {
  id: "default",
  name: "浏览器默认",
} as const;

const URL_ENGINES = [
  {
    id: "google" as const,
    name: "Google",
    url: "https://www.google.com/search?q=",
  },
  {
    id: "bing" as const,
    name: "Bing",
    url: "https://www.bing.com/search?q=",
  },
  {
    id: "baidu" as const,
    name: "百度",
    url: "https://www.baidu.com/s?wd=",
  },
  {
    id: "duckduckgo" as const,
    name: "DuckDuckGo",
    url: "https://duckduckgo.com/?q=",
  },
];

function getEngines() {
  return canUseBrowserDefaultSearch()
    ? [BROWSER_DEFAULT_ENGINE, ...URL_ENGINES]
    : URL_ENGINES;
}

export function SearchBar() {
  const [query, setQuery] = useState("");
  const engineId = useNewtabStore((state) => state.config.searchEngine);
  const updateConfig = useNewtabStore((state) => state.updateConfig);

  const engines = getEngines();
  const engineOptions = engines.map((item) => ({
    key: item.id,
    label: item.name,
  }));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const searchText = query.trim();

    if (!searchText) {
      return;
    }

    if (engineId === "default") {
      void getBrowserDefaultSearchApi()?.query?.({
        text: searchText,
        disposition: "CURRENT_TAB",
      });
      return;
    }

    const engine =
      URL_ENGINES.find((item) => item.id === engineId) ?? URL_ENGINES[0];

    window.location.href = engine.url + encodeURIComponent(searchText);
  };

  const handleEngineChange = (value: string) => {
    if (!engines.some((engine) => engine.id === value)) {
      return;
    }

    updateConfig({ searchEngine: value as SearchEngine });
  };

  return (
    <div className="relative mt-2 w-full max-w-2xl sm:mt-4">
      <form
        onSubmit={handleSearch}
        className="flex items-center rounded-3xl border-4 border-[#c4b89e] bg-white p-2 shadow-[0_5px_0_#d4c9b4] transition-all hover:border-[#59C19D] hover:shadow-[0_5px_0_#8dccb6] focus-within:border-[#59C19D] focus-within:shadow-[0_5px_0_#8dccb6] max-[520px]:flex-wrap max-[520px]:gap-2"
      >
        <div className="search-engine-select">
          <Select
            options={engineOptions}
            value={engineId}
            onChange={handleEngineChange}
          />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="准备去哪座岛屿？..."
          className="min-w-0 flex-1 bg-transparent px-3 py-2 text-base font-bold text-[#6B5A49] outline-none placeholder:text-[#C5B7A3] sm:px-4 sm:text-lg max-[520px]:order-3 max-[520px]:basis-full"
        />

        <button
          type="submit"
          className="bg-[#59C19D] text-white p-3 rounded-full hover:bg-[#43A081] transition-colors shadow-sm"
        >
          <Search size={24} className="stroke-3" />
        </button>
      </form>
    </div>
  );
}
