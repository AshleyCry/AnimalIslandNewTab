import { useState } from "react";
import { Select } from "animal-island-ui";
import { Search } from "lucide-react";
import { useNewtabStore, type SearchEngine } from "../../store";
import "./style.css";

const ENGINES = [
  {
    id: "google",
    name: "Google",
    url: "https://www.google.com/search?q=",
  },
  {
    id: "bing",
    name: "Bing",
    url: "https://www.bing.com/search?q=",
  },
  {
    id: "baidu",
    name: "百度",
    url: "https://www.baidu.com/s?wd=",
  },
  {
    id: "duckduckgo",
    name: "DuckDuckGo",
    url: "https://duckduckgo.com/?q=",
  },
];

function isSearchEngine(value: string): value is SearchEngine {
  return ENGINES.some((engine) => engine.id === value);
}

export function SearchBar() {
  const [query, setQuery] = useState("");
  const engineId = useNewtabStore((state) => state.config.searchEngine);
  const updateConfig = useNewtabStore((state) => state.updateConfig);

  const engine = ENGINES.find((item) => item.id === engineId) ?? ENGINES[0];
  const engineOptions = ENGINES.map((item) => ({
    key: item.id,
    label: item.name,
  }));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      window.location.href = engine.url + encodeURIComponent(query);
    }
  };

  const handleEngineChange = (value: string) => {
    if (!isSearchEngine(value)) {
      return;
    }

    updateConfig({ searchEngine: value });
  };

  return (
    <div className="w-full max-w-2xl relative mt-4">
      <form
        onSubmit={handleSearch}
        className="flex items-center bg-white border-4 border-[#c4b89e] rounded-3xl p-2 shadow-[0_6px_0_#d4c9b4] focus-within:border-[#59C19D] focus-within:shadow-[0_6px_0_#8dccb6] hover:border-[#59C19D] hover:shadow-[0_6px_0_#8dccb6] transition-all"
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
          className="flex-1 bg-transparent px-4 py-2 text-[#6B5A49] font-bold text-lg outline-none placeholder:text-[#C5B7A3]"
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
