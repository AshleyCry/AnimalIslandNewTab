import { useState } from "react";
import { Button, Input, Modal } from "animal-island-ui";
import { useNewtabStore } from "../../../store";

type OpenMeteoLocation = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
};

type OpenMeteoGeocodingResponse = {
  results?: OpenMeteoLocation[];
};

type WeatherLocationModalProps = {
  open: boolean;
  onClose: () => void;
};

function WeatherLocationModal({ open, onClose }: WeatherLocationModalProps) {
  const updateConfig = useNewtabStore((state) => state.updateConfig);
  const [locationKeyword, setLocationKeyword] = useState("");
  const [locationResults, setLocationResults] = useState<OpenMeteoLocation[]>(
    [],
  );
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [locationSearchError, setLocationSearchError] = useState("");

  const handleSearchLocation = async () => {
    const keyword = locationKeyword.trim();

    if (!keyword) {
      setLocationSearchError("请输入地点关键词");
      setLocationResults([]);
      return;
    }

    setIsSearchingLocation(true);
    setLocationSearchError("");

    try {
      const searchParams = new URLSearchParams({
        name: keyword,
        count: "8",
        language: "zh",
        format: "json",
      });
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?${searchParams}`,
      );

      if (!response.ok) {
        throw new Error("地点搜索失败");
      }

      const data = (await response.json()) as OpenMeteoGeocodingResponse;
      const results = data.results ?? [];

      setLocationResults(results);
      setLocationSearchError(results.length === 0 ? "没有找到匹配地点" : "");
    } catch {
      setLocationResults([]);
      setLocationSearchError("地点搜索失败，请稍后再试");
    } finally {
      setIsSearchingLocation(false);
    }
  };

  const handleSelectLocation = (location: OpenMeteoLocation) => {
    updateConfig({
      weatherLocationMode: "manual",
      manualWeatherLocation: {
        name: location.name,
        latitude: location.latitude,
        longitude: location.longitude,
      },
    });
    setLocationSearchError("");
    onClose();
  };

  return (
    <Modal
      open={open}
      title="设置天气位置"
      width={420}
      footer={null}
      onClose={onClose}
      typewriter={false}
    >
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={locationKeyword}
            placeholder="输入城市或地区，例如上海"
            allowClear
            onChange={(event) => setLocationKeyword(event.target.value)}
            onClear={() => {
              setLocationKeyword("");
              setLocationResults([]);
              setLocationSearchError("");
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                void handleSearchLocation();
              }
            }}
          />
          <Button
            type="primary"
            loading={isSearchingLocation}
            onClick={handleSearchLocation}
          >
            搜索
          </Button>
        </div>

        {locationSearchError ? (
          <div className="rounded-xl bg-[#f4efe3] px-3 py-2 text-sm font-bold text-[#8a7966]">
            {locationSearchError}
          </div>
        ) : null}

        {locationResults.length > 0 ? (
          <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
            {locationResults.map((location) => (
              <button
                key={location.id}
                type="button"
                className="w-full rounded-xl bg-[#f4efe3] px-3 py-2 text-left font-bold text-[#725d42] transition-colors hover:bg-[#eadfcb]"
                onClick={() => handleSelectLocation(location)}
              >
                <div>{location.name}</div>
                <div className="text-xs text-[#8a7966]">
                  {[location.admin1, location.country]
                    .filter(Boolean)
                    .join(" · ")}
                  {" · "}
                  {location.latitude.toFixed(4)},{" "}
                  {location.longitude.toFixed(4)}
                </div>
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </Modal>
  );
}

export default WeatherLocationModal;
