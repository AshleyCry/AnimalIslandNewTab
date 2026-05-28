import { useEffect, useState } from "react";
import { useNewtabStore } from "../store";

const OPEN_METEO_API_URL = "https://api.open-meteo.com/v1/forecast";

type OpenMeteoResponse = {
  current?: {
    temperature_2m?: number;
    relative_humidity_2m?: number;
    weather_code?: number;
  };
  daily?: {
    temperature_2m_min?: number[];
    temperature_2m_max?: number[];
  };
};

type OpenMeteoErrorResponse = {
  error?: boolean;
  reason?: string;
};

export type OpenWeatherData = {
  condition: string;
  weatherType: string;
  currentTemperature: number;
  lowTemperature: number;
  highTemperature: number;
  humidity: number;
  location: string;
};

type UseOpenWeatherState = {
  data: OpenWeatherData | null;
  isLoading: boolean;
  error: string | null;
};

type WeatherCoordinates = {
  latitude: number;
  longitude: number;
  locationName?: string;
};

const cachedWeatherByLocation = new Map<string, OpenWeatherData>();
const weatherPromiseByLocation = new Map<string, Promise<OpenWeatherData>>();

function getCurrentPosition() {
  return new Promise<GeolocationPosition>((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("当前浏览器不支持定位"));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      maximumAge: 10 * 60 * 1000,
      timeout: 10 * 1000,
    });
  });
}

function getWeatherInfo(weatherCode?: number) {
  if (weatherCode === 0) {
    return { condition: "晴", weatherType: "Clear" };
  }

  if (weatherCode === 1 || weatherCode === 2) {
    return { condition: "少云", weatherType: "Clouds" };
  }

  if (weatherCode === 3) {
    return { condition: "阴", weatherType: "Clouds" };
  }

  if ([45, 48].includes(weatherCode ?? -1)) {
    return { condition: "雾", weatherType: "Fog" };
  }

  if ([51, 53, 55, 56, 57].includes(weatherCode ?? -1)) {
    return { condition: "毛毛雨", weatherType: "Drizzle" };
  }

  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode ?? -1)) {
    return { condition: "雨", weatherType: "Rain" };
  }

  if ([71, 73, 75, 77, 85, 86].includes(weatherCode ?? -1)) {
    return { condition: "雪", weatherType: "Snow" };
  }

  if ([95, 96, 99].includes(weatherCode ?? -1)) {
    return { condition: "雷雨", weatherType: "Thunderstorm" };
  }

  return { condition: "未知天气", weatherType: "Clouds" };
}

function normalizeWeather(
  response: OpenMeteoResponse,
  locationName?: string,
): OpenWeatherData {
  const weatherInfo = getWeatherInfo(response.current?.weather_code);

  return {
    condition: weatherInfo.condition,
    weatherType: weatherInfo.weatherType,
    currentTemperature: Math.round(response.current?.temperature_2m ?? 0),
    lowTemperature: Math.round(response.daily?.temperature_2m_min?.[0] ?? 0),
    highTemperature: Math.round(response.daily?.temperature_2m_max?.[0] ?? 0),
    humidity: Math.round(response.current?.relative_humidity_2m ?? 0),
    location: locationName || "",
  };
}

async function fetchOpenWeather({
  latitude,
  longitude,
  locationName,
}: WeatherCoordinates) {
  const searchParams = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: "temperature_2m,relative_humidity_2m,weather_code",
    daily: "temperature_2m_max,temperature_2m_min",
    forecast_days: "1",
    timezone: "auto",
  });
  const response = await fetch(`${OPEN_METEO_API_URL}?${searchParams}`);

  if (!response.ok) {
    const errorBody = (await response
      .json()
      .catch(() => null)) as OpenMeteoErrorResponse | null;
    const message = errorBody?.reason ?? "天气数据获取失败";

    throw new Error(`天气数据获取失败：${response.status} ${message}`);
  }

  return normalizeWeather(
    (await response.json()) as OpenMeteoResponse,
    locationName,
  );
}

function getLocationCacheKey({
  latitude,
  longitude,
  locationName,
}: WeatherCoordinates) {
  return `${locationName ?? "auto"}:${latitude.toFixed(4)},${longitude.toFixed(4)}`;
}

function loadOpenWeather(coordinates: WeatherCoordinates) {
  const cacheKey = getLocationCacheKey(coordinates);
  const cachedWeather = cachedWeatherByLocation.get(cacheKey);

  if (cachedWeather) {
    return Promise.resolve(cachedWeather);
  }

  const cachedPromise = weatherPromiseByLocation.get(cacheKey);

  if (cachedPromise) {
    return cachedPromise;
  }

  const weatherPromise = fetchOpenWeather(coordinates)
    .then((weather) => {
      cachedWeatherByLocation.set(cacheKey, weather);
      return weather;
    })
    .catch((error: unknown) => {
      weatherPromiseByLocation.delete(cacheKey);
      throw error;
    });

  weatherPromiseByLocation.set(cacheKey, weatherPromise);

  return weatherPromise;
}

export function useOpenWeather(): UseOpenWeatherState {
  const weatherLocationMode = useNewtabStore(
    (state) => state.config.weatherLocationMode,
  );
  const manualWeatherLocation = useNewtabStore(
    (state) => state.config.manualWeatherLocation,
  );
  const [state, setState] = useState<UseOpenWeatherState>({
    data: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    setState((currentState) => ({
      ...currentState,
      isLoading: true,
      error: null,
    }));

    const coordinatesPromise =
      weatherLocationMode === "manual"
        ? Promise.resolve({
            latitude: manualWeatherLocation.latitude,
            longitude: manualWeatherLocation.longitude,
            locationName: manualWeatherLocation.name,
          })
        : getCurrentPosition().then((position) => ({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));

    coordinatesPromise
      .then((coordinates) => loadOpenWeather(coordinates))
      .then((data) => {
        if (!isMounted) {
          return;
        }

        setState({
          data,
          isLoading: false,
          error: null,
        });
      })
      .catch((error: unknown) => {
        if (!isMounted) {
          return;
        }

        setState({
          data: null,
          isLoading: false,
          error: error instanceof Error ? error.message : "天气数据获取失败",
        });
      });

    return () => {
      isMounted = false;
    };
  }, [
    manualWeatherLocation.latitude,
    manualWeatherLocation.longitude,
    manualWeatherLocation.name,
    weatherLocationMode,
  ]);

  return state;
}
