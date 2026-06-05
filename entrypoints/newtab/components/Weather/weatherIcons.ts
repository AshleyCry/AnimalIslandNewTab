import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Sun,
} from "lucide-react";

export function getWeatherIcon(weatherType?: string) {
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

export function getWeatherIconColor(weatherType?: string) {
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
