import { useEffect, useState } from "react";
import { useNewtabStore } from "../store";

const OPEN_METEO_API_URL = "https://api.open-meteo.com/v1/forecast";
const OPEN_METEO_AIR_QUALITY_API_URL =
  "https://air-quality-api.open-meteo.com/v1/air-quality";
const WEATHER_CACHE_TTL_MS = 5 * 60 * 1000;

type OpenMeteoResponse = {
  current?: {
    temperature_2m?: number;
    relative_humidity_2m?: number;
    apparent_temperature?: number;
    precipitation?: number;
    pressure_msl?: number;
    wind_speed_10m?: number;
    wind_direction_10m?: number;
    wind_gusts_10m?: number;
    weather_code?: number;
  };
  hourly?: {
    time?: string[];
    temperature_2m?: number[];
    apparent_temperature?: number[];
    precipitation?: number[];
    precipitation_probability?: number[];
    relative_humidity_2m?: number[];
    weather_code?: number[];
    wind_speed_10m?: number[];
  };
  daily?: {
    time?: string[];
    weather_code?: number[];
    temperature_2m_min?: number[];
    temperature_2m_max?: number[];
    precipitation_sum?: number[];
    precipitation_probability_max?: number[];
    sunrise?: string[];
    sunset?: string[];
    uv_index_max?: number[];
    wind_speed_10m_max?: number[];
  };
};

type OpenMeteoAirQualityResponse = {
  current?: {
    us_aqi?: number;
    pm2_5?: number;
    pm10?: number;
  };
};

type OpenMeteoErrorResponse = {
  error?: boolean;
  reason?: string;
};

export type DailyWeatherForecast = {
  date: string;
  condition: string;
  weatherType: string;
  lowTemperature: number;
  highTemperature: number;
  precipitationSum: number;
  precipitationProbability: number;
  uvIndex: number;
  windSpeed: number;
  sunrise: string;
  sunset: string;
};

export type HourlyWeatherForecast = {
  time: string;
  condition: string;
  weatherType: string;
  temperature: number;
  apparentTemperature: number;
  precipitation: number;
  precipitationProbability: number;
  humidity: number;
  windSpeed: number;
};

export type AirQualityData = {
  aqi: number | null;
  level: string;
  pm25: number | null;
  pm10: number | null;
};

export type OpenWeatherData = {
  condition: string;
  weatherType: string;
  currentTemperature: number;
  lowTemperature: number;
  highTemperature: number;
  humidity: number;
  apparentTemperature: number;
  precipitation: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  windGusts: number;
  sunrise: string;
  sunset: string;
  uvIndex: number;
  airQuality: AirQualityData;
  dailyForecast: DailyWeatherForecast[];
  hourlyForecast: HourlyWeatherForecast[];
  location: string;
  latitude: number;
  longitude: number;
  updatedAt: string;
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

type CachedWeather = {
  data: OpenWeatherData;
  cachedAt: number;
};

const cachedWeatherByLocation = new Map<string, CachedWeather>();
const weatherPromiseByLocation = new Map<string, Promise<OpenWeatherData>>();

function getCurrentPosition() {
  return new Promise<GeolocationPosition>((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("当前浏览器不支持定位"));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      maximumAge: 10 * 60 * 1000,
      timeout: 15 * 1000,
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

function roundNumber(value: number | undefined, fallback = 0) {
  return Math.round(value ?? fallback);
}

function roundOneDecimal(value: number | undefined, fallback = 0) {
  return Math.round((value ?? fallback) * 10) / 10;
}

function getAirQualityLevel(aqi?: number) {
  if (aqi === undefined) {
    return "未知";
  }

  if (aqi <= 50) {
    return "优";
  }

  if (aqi <= 100) {
    return "良";
  }

  if (aqi <= 150) {
    return "轻度污染";
  }

  if (aqi <= 200) {
    return "中度污染";
  }

  if (aqi <= 300) {
    return "重度污染";
  }

  return "严重污染";
}

function normalizeAirQuality(
  response: OpenMeteoAirQualityResponse | null,
): AirQualityData {
  const aqi = response?.current?.us_aqi;

  return {
    aqi: aqi === undefined ? null : roundNumber(aqi),
    level: getAirQualityLevel(aqi),
    pm25:
      response?.current?.pm2_5 === undefined
        ? null
        : roundOneDecimal(response.current.pm2_5),
    pm10:
      response?.current?.pm10 === undefined
        ? null
        : roundOneDecimal(response.current.pm10),
  };
}

function normalizeWeather(
  response: OpenMeteoResponse,
  airQualityResponse: OpenMeteoAirQualityResponse | null,
  coordinates: WeatherCoordinates,
): OpenWeatherData {
  const weatherInfo = getWeatherInfo(response.current?.weather_code);
  const dailyForecast = (response.daily?.time ?? []).map((date, index) => {
    const dailyWeatherInfo = getWeatherInfo(
      response.daily?.weather_code?.[index],
    );

    return {
      date,
      condition: dailyWeatherInfo.condition,
      weatherType: dailyWeatherInfo.weatherType,
      lowTemperature: roundNumber(response.daily?.temperature_2m_min?.[index]),
      highTemperature: roundNumber(response.daily?.temperature_2m_max?.[index]),
      precipitationSum: roundOneDecimal(
        response.daily?.precipitation_sum?.[index],
      ),
      precipitationProbability: roundNumber(
        response.daily?.precipitation_probability_max?.[index],
      ),
      uvIndex: roundOneDecimal(response.daily?.uv_index_max?.[index]),
      windSpeed: roundOneDecimal(response.daily?.wind_speed_10m_max?.[index]),
      sunrise: response.daily?.sunrise?.[index] ?? "",
      sunset: response.daily?.sunset?.[index] ?? "",
    };
  });
  const hourlyForecast = (response.hourly?.time ?? []).map((time, index) => {
    const hourlyWeatherInfo = getWeatherInfo(
      response.hourly?.weather_code?.[index],
    );

    return {
      time,
      condition: hourlyWeatherInfo.condition,
      weatherType: hourlyWeatherInfo.weatherType,
      temperature: roundNumber(response.hourly?.temperature_2m?.[index]),
      apparentTemperature: roundNumber(
        response.hourly?.apparent_temperature?.[index],
      ),
      precipitation: roundOneDecimal(response.hourly?.precipitation?.[index]),
      precipitationProbability: roundNumber(
        response.hourly?.precipitation_probability?.[index],
      ),
      humidity: roundNumber(response.hourly?.relative_humidity_2m?.[index]),
      windSpeed: roundOneDecimal(response.hourly?.wind_speed_10m?.[index]),
    };
  });

  return {
    condition: weatherInfo.condition,
    weatherType: weatherInfo.weatherType,
    currentTemperature: roundNumber(response.current?.temperature_2m),
    lowTemperature: roundNumber(response.daily?.temperature_2m_min?.[0]),
    highTemperature: roundNumber(response.daily?.temperature_2m_max?.[0]),
    humidity: roundNumber(response.current?.relative_humidity_2m),
    apparentTemperature: roundNumber(response.current?.apparent_temperature),
    precipitation: roundOneDecimal(response.current?.precipitation),
    pressure: roundNumber(response.current?.pressure_msl),
    windSpeed: roundOneDecimal(response.current?.wind_speed_10m),
    windDirection: roundNumber(response.current?.wind_direction_10m),
    windGusts: roundOneDecimal(response.current?.wind_gusts_10m),
    sunrise: response.daily?.sunrise?.[0] ?? "",
    sunset: response.daily?.sunset?.[0] ?? "",
    uvIndex: roundOneDecimal(response.daily?.uv_index_max?.[0]),
    airQuality: normalizeAirQuality(airQualityResponse),
    dailyForecast,
    hourlyForecast,
    location: coordinates.locationName || "当前位置",
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    updatedAt: new Date().toISOString(),
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
    current:
      "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m,weather_code",
    hourly:
      "temperature_2m,apparent_temperature,precipitation,precipitation_probability,relative_humidity_2m,weather_code,wind_speed_10m",
    daily:
      "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,sunrise,sunset,uv_index_max,wind_speed_10m_max",
    forecast_days: "15",
    forecast_hours: "24",
    timezone: "auto",
  });
  const airQualitySearchParams = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: "us_aqi,pm2_5,pm10",
    timezone: "auto",
  });
  const [response, airQualityResponse] = await Promise.all([
    fetch(`${OPEN_METEO_API_URL}?${searchParams}`),
    fetch(`${OPEN_METEO_AIR_QUALITY_API_URL}?${airQualitySearchParams}`).catch(
      () => null,
    ),
  ]);

  if (!response.ok) {
    const errorBody = (await response
      .json()
      .catch(() => null)) as OpenMeteoErrorResponse | null;
    const message = errorBody?.reason ?? "天气数据获取失败";

    throw new Error(`天气数据获取失败：${response.status} ${message}`);
  }

  const airQualityData =
    airQualityResponse && airQualityResponse.ok
      ? ((await airQualityResponse.json()) as OpenMeteoAirQualityResponse)
      : null;

  return normalizeWeather(
    (await response.json()) as OpenMeteoResponse,
    airQualityData,
    {
      latitude,
      longitude,
      locationName,
    },
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
    if (Date.now() - cachedWeather.cachedAt < WEATHER_CACHE_TTL_MS) {
      return Promise.resolve(cachedWeather.data);
    }

    cachedWeatherByLocation.delete(cacheKey);
  }

  const cachedPromise = weatherPromiseByLocation.get(cacheKey);

  if (cachedPromise) {
    return cachedPromise;
  }

  const weatherPromise = fetchOpenWeather(coordinates)
    .then((weather) => {
      cachedWeatherByLocation.set(cacheKey, {
        data: weather,
        cachedAt: Date.now(),
      });
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
