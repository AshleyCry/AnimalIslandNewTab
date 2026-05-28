import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Droplet,
  Sun,
} from "lucide-react";
import { useOpenWeather } from "../../hooks/useOpenWeather";
import CardWithTitle from "../CardWithTitle";

function getWeatherIcon(weatherType?: string) {
  switch (weatherType) {
    case "Clear":
      return Sun;
    case "Clouds":
      return CloudSun;
    case "Drizzle":
      return CloudDrizzle;
    case "Rain":
      return CloudRain;
    case "Thunderstorm":
      return CloudLightning;
    case "Snow":
      return CloudSnow;
    case "Mist":
    case "Smoke":
    case "Haze":
    case "Dust":
    case "Fog":
    case "Sand":
    case "Ash":
    case "Squall":
    case "Tornado":
      return CloudFog;
    default:
      return Cloud;
  }
}

function getWeatherIconColor(weatherType?: string) {
  switch (weatherType) {
    case "Clear":
      return "text-[#ffc53d]";
    case "Clouds":
      return "text-[#8d99a6]";
    case "Drizzle":
      return "text-[#5ab5d8]";
    case "Rain":
      return "text-[#3f8edc]";
    case "Thunderstorm":
      return "text-[#7467d8]";
    case "Snow":
      return "text-[#78c8e8]";
    case "Mist":
    case "Smoke":
    case "Haze":
    case "Dust":
    case "Fog":
    case "Sand":
    case "Ash":
    case "Squall":
    case "Tornado":
      return "text-[#9aa0a6]";
    default:
      return "text-[#8d99a6]";
  }
}

function getHumidityDescription(value: number) {
  if (value < 40) {
    return "偏干";
  }

  if (value > 70) {
    return "偏湿";
  }

  return "舒适";
}

function Weather() {
  const { data, error, isLoading } = useOpenWeather();
  const condition = isLoading ? "定位中..." : (data?.condition ?? "天气未知");
  const currentTemperature = data?.currentTemperature;
  const lowTemperature = data?.lowTemperature;
  const highTemperature = data?.highTemperature;
  const humidity = data?.humidity;
  const humidityText =
    humidity === undefined
      ? isLoading
        ? "定位中"
        : "未知"
      : getHumidityDescription(humidity);
  const location = error ?? data?.location ?? "";
  const title = `${location}天气`;
  const WeatherIcon = getWeatherIcon(data?.weatherType);
  const weatherIconColor = getWeatherIconColor(data?.weatherType);

  return (
    <CardWithTitle
      className="flex h-56 w-60 flex-col items-center justify-center gap-3 p-5 text-[#5f432d] shadow-[0_8px_18px_rgba(114,93,66,0.22)]"
      title={title}
    >
      <div className="grid grid-cols-[64px_1fr] items-center gap-3">
        <div className="flex justify-center">
          <WeatherIcon
            className={`h-16 w-16 ${weatherIconColor}`}
            strokeWidth={2.4}
          />
        </div>

        <div className="flex flex-col items-center gap-1 text-center">
          <div className="text-lg font-semibold">{condition}</div>
          <div className="text-5xl font-black leading-none">
            {currentTemperature ?? "--"}
            <span className="align-top text-3xl font-bold">℃</span>
          </div>
          <div className="text-base font-semibold">
            {lowTemperature ?? "--"}℃ ~ {highTemperature ?? "--"}℃
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-fit items-center gap-2 rounded-full bg-[#eadfcb] px-3 py-1.5 text-base font-bold">
        <span className="flex items-center gap-1.5">
          <Droplet className="h-4 w-4 text-[#42a5f5]" fill="currentColor" />
          湿度 {humidity ?? "--"}%
        </span>
        <span className="text-[#8a8578]">{humidityText}</span>
      </div>
    </CardWithTitle>
  );
}

export default Weather;
