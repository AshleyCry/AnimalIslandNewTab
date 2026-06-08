import dayjs from "dayjs";
import { useState } from "react";
import type { ReactNode } from "react";
import { Button } from "animal-island-ui";
import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Clock3,
  Gauge,
  MapPin,
  Sun,
  Sunrise,
  Sunset,
  Thermometer,
  Umbrella,
  Waves,
  Wind,
  Droplet,
} from "lucide-react";
import type { OpenWeatherData } from "../../hooks/useOpenWeather";
import { useNewtabStore, type WeatherLocationMode } from "../../store";
import Sidebar from "../Sidebar";
import { getWeatherIcon, getWeatherIconColor } from "./weatherIcons";

const COLLAPSED_DAILY_FORECAST_COUNT = 3;

type WeatherDetailSidebarProps = {
  open: boolean;
  onClose: () => void;
  data: OpenWeatherData | null;
  isLoading: boolean;
  error: string | null;
};

type DetailMetricProps = {
  label: string;
  value: string;
  icon: ReactNode;
  hint?: string;
  accentClassName?: string;
  accentTextClassName?: string;
};

function formatClockTime(value?: string) {
  if (!value) {
    return "--:--";
  }

  const date = dayjs(value);

  return date.isValid() ? date.format("HH:mm") : "--:--";
}

function formatDate(value: string) {
  const date = dayjs(value);

  return date.isValid() ? date.format("M/D") : value;
}

function formatHour(value: string) {
  const date = dayjs(value);

  return date.isValid() ? date.format("HH:mm") : value;
}

function formatUpdatedAt(value: string) {
  const date = dayjs(value);

  return date.isValid() ? date.format("YYYY-MM-DD HH:mm") : "--";
}

function getWindDirectionText(degree: number) {
  const directions = [
    "北风",
    "东北风",
    "东风",
    "东南风",
    "南风",
    "西南风",
    "西风",
    "西北风",
  ];
  const index = Math.round(degree / 45) % directions.length;

  return directions[index];
}

function DetailMetric({
  label,
  value,
  icon,
  hint,
  accentClassName = "bg-[#59C19D]",
  accentTextClassName = "text-[#59C19D]",
}: DetailMetricProps) {
  return (
    <div className="relative min-w-0 overflow-hidden rounded-lg border-2 border-[#eadfcb] border-b-0 bg-[#fffaf0] p-3 shadow-[0_4px_0_rgba(216,192,149,0.8)]">
      <span
        className={`absolute left-0 top-0 h-1.5 w-full ${accentClassName}`}
      />
      <div className="grid grid-cols-[1fr_3rem] items-center gap-3 pt-1">
        <div className="min-w-0 flex flex-col gap-1">
          <div className={`truncate text-sm font-black ${accentTextClassName}`}>
            {label}
          </div>
          <div className="wrap-break-word text-2xl font-black text-[#5f432d]">
            {value}
          </div>
          {hint ? (
            <div className="text-xs font-bold text-[#9a8a76]">{hint}</div>
          ) : null}
        </div>
        <span
          className={`flex h-12 w-12 items-center justify-center rounded-full ${accentClassName} text-white shadow-[0_3px_0_rgba(114,93,66,0.16)] [&>svg]:h-6 [&>svg]:w-6`}
        >
          {icon}
        </span>
      </div>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  note,
}: {
  icon: ReactNode;
  title: string;
  note?: string;
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#59C19D] text-white shadow-[0_2px_0_rgba(114,93,66,0.18)]">
          {icon}
        </span>
        <h3 className="truncate text-base font-black text-[#5f432d]">
          {title}
        </h3>
      </div>
      {note ? (
        <span className="shrink-0 rounded-full bg-[#eadfcb] px-2.5 py-1 text-xs font-black text-[#8a7966]">
          {note}
        </span>
      ) : null}
    </div>
  );
}

function WeatherIconBadge({
  weatherType,
  className = "h-8 w-8",
}: {
  weatherType: string;
  className?: string;
}) {
  const WeatherIcon = getWeatherIcon(weatherType);
  const iconColor = getWeatherIconColor(weatherType);

  return (
    <WeatherIcon
      className={`${className} ${iconColor} shrink-0`}
      strokeWidth={2.4}
    />
  );
}

function WeatherDetailContent({
  data,
  isLoading,
  error,
}: Pick<WeatherDetailSidebarProps, "data" | "isLoading" | "error">) {
  const [isDailyForecastExpanded, setIsDailyForecastExpanded] = useState(false);
  const weatherLocationMode = useNewtabStore(
    (state) => state.config.weatherLocationMode,
  );

  if (isLoading) {
    return (
      <div className="rounded-lg bg-[#fffaf0] p-4 text-sm font-black text-[#8a7966]">
        正在获取天气详情...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-lg bg-[#fffaf0] p-4 text-sm font-black text-[#8a7966]">
        {error ?? "天气详情暂不可用"}
      </div>
    );
  }

  const hasMoreDailyForecast =
    data.dailyForecast.length > COLLAPSED_DAILY_FORECAST_COUNT;
  const visibleDailyForecast = isDailyForecastExpanded
    ? data.dailyForecast
    : data.dailyForecast.slice(0, COLLAPSED_DAILY_FORECAST_COUNT);
  const DailyForecastToggleIcon = isDailyForecastExpanded
    ? ChevronUp
    : ChevronDown;

  return (
    <div className="weather-detail-scrollbar min-h-0 overflow-y-auto pr-1 text-[#725d42]">
      <section className="relative mb-4 overflow-hidden rounded-lg border-2 border-[#ead7aa] bg-[#fffaf0] border-b-0 p-4 shadow-[0_4px_0_rgba(216,192,149,0.9)]">
        <div
          className="pointer-events-none absolute inset-0 opacity-45"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(114,93,66,0.16) 1.5px, transparent 2px)",
            backgroundSize: "18px 18px",
          }}
        />
        {/* <div className="absolute inset-x-0 top-0 h-1 bg-[#bfe7dd]" /> */}
        <div className="relative flex items-end justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-2 border-white bg-[#fdf8e4] shadow-[0_4px_0_rgba(114,93,66,0.14)]">
              <WeatherIconBadge
                weatherType={data.weatherType}
                className="h-14 w-14"
              />
            </div>
            <div className="min-w-0">
              <div className="mb-1 flex w-fit max-w-full items-center gap-1 rounded-full bg-[#59C19D] px-2.5 py-1 text-xs font-black text-white">
                <MapPin className="h-3.5 w-3.5" />
                <span className="truncate">{data.location || "当前位置"}</span>
              </div>
              <div className="text-5xl font-black leading-none text-[#5f432d]">
                {data.currentTemperature}℃
              </div>
            </div>
          </div>
          <div className="shrink-0 rounded-lg border-2 border-[#eadfcb] bg-[#fdf8e4] border-b-0 px-3 py-2 text-right shadow-[0_3px_0_rgba(216,192,149,0.8)]">
            <div className="text-lg font-black">{data.condition}</div>
            <div className="mt-1 text-sm font-bold text-[#8a7966]">
              最高 {data.highTemperature}℃ / 最低 {data.lowTemperature}℃
            </div>
          </div>
        </div>
        <div className="relative mt-4 grid gap-2 rounded-lg border-2 border-[#eadfcb] bg-[#fdf8e4]/90 px-3 py-2 text-xs font-black text-[#8a7966] shadow-[0_2px_0_rgba(216,192,149,0.75)] sm:grid-cols-2">
          <div className="flex min-w-0 items-center gap-1.5">
            <Clock3 className="h-3.5 w-3.5 shrink-0 text-[#59C19D]" />
            <span className="min-w-0 truncate">
              {formatUpdatedAt(data.updatedAt)}
            </span>
          </div>
          <div className="flex min-w-0 items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-[#59C19D]" />
            <span className="min-w-0 truncate">
              {data.latitude.toFixed(4)}, {data.longitude.toFixed(4)}
            </span>
          </div>
        </div>
      </section>

      <section className="mb-4 rounded-lg border-2 border-[#eadfcb] bg-[#fdf8e4] border-b-0 p-4 shadow-[0_4px_0_rgba(216,192,149,0.8)]">
        <SectionHeader
          icon={<Clock3 className="h-4 w-4" />}
          title="未来24小时天气"
          note="温度 / 降水"
        />
        <div className="weather-detail-scrollbar flex gap-3 overflow-x-auto pb-1">
          {data.hourlyForecast.map((item) => (
            <div
              key={item.time}
              className="w-20 shrink-0 rounded-lg border-2 border-[#eadfcb] bg-[#fffaf0] p-2 text-center"
            >
              <div className="rounded-full bg-[#bfe7dd] px-2 py-0.5 text-xs font-black text-[#5f432d]">
                {formatHour(item.time)}
              </div>
              <WeatherIconBadge
                weatherType={item.weatherType}
                className="mx-auto mt-1 h-7 w-7"
              />
              <div className="mt-1 text-lg font-black text-[#5f432d]">
                {item.temperature}℃
              </div>
              <div className="mt-1 truncate text-xs font-bold">
                {item.condition}
              </div>
              <div className="mt-1 rounded-full bg-[#d8ecf2] px-1.5 py-0.5 text-xs font-black text-[#3f8edc] flex items-center justify-center gap-1">
                <Droplet
                  className="h-2.5 w-2.5 text-[#3f8edc]"
                  fill="currentColor"
                />
                <span>{item.precipitationProbability}%</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-4 rounded-lg border-2 border-[#eadfcb] bg-[#fdf8e4] border-b-0 p-4 shadow-[0_4px_0_rgba(216,192,149,0.8)]">
        <SectionHeader
          icon={<CalendarDays className="h-4 w-4" />}
          title="近15日天气"
        />
        <div className="space-y-2">
          {visibleDailyForecast.map((item) => (
            <div
              key={item.date}
              className="grid grid-cols-[3.5rem_1.75rem_1fr_5.5rem] items-center gap-3 rounded-lg border-l-4 border-[#59C19D] bg-[#fffaf0] px-3 py-2 text-sm font-bold shadow-[0_2px_0_rgba(216,192,149,0.75)]"
            >
              <span className="rounded-full bg-[#eadfcb] px-2 py-1 text-center font-black text-[#5f432d]">
                {formatDate(item.date)}
              </span>
              <WeatherIconBadge
                weatherType={item.weatherType}
                className="h-6 w-6"
              />
              <span className="min-w-0 truncate">{item.condition}</span>
              <span className="text-right font-black">
                {item.lowTemperature}℃~{item.highTemperature}℃
              </span>
            </div>
          ))}
        </div>
        {hasMoreDailyForecast ? (
          <div className="mt-3">
            <Button
              block
              type="primary"
              icon={<DailyForecastToggleIcon className="h-4 w-4" />}
              onClick={() =>
                setIsDailyForecastExpanded((currentValue) => !currentValue)
              }
            >
              {isDailyForecastExpanded
                ? "收起"
                : `展开其余 ${data.dailyForecast.length - COLLAPSED_DAILY_FORECAST_COUNT} 天`}
            </Button>
          </div>
        ) : null}
      </section>

      <section className="mb-4 grid grid-cols-2 gap-3">
        <DetailMetric
          label="空气质量"
          value={
            data.airQuality.aqi === null
              ? "--"
              : `${data.airQuality.aqi} ${data.airQuality.level}`
          }
          icon={<Waves className="h-4 w-4" />}
          hint={`PM2.5 ${
            data.airQuality.pm25 ?? "--"
          } / PM10 ${data.airQuality.pm10 ?? "--"}`}
          accentClassName="bg-[#59C19D]"
          accentTextClassName="text-[#3b9f7f]"
        />
        <DetailMetric
          label="紫外线"
          value={String(data.uvIndex)}
          icon={<Sun className="h-4 w-4" />}
          hint={data.uvIndex >= 6 ? "注意防晒" : "强度较低"}
          accentClassName="bg-[#ffc53d]"
          accentTextClassName="text-[#c48700]"
        />
        <DetailMetric
          label="湿度"
          value={`${data.humidity}%`}
          icon={<Umbrella className="h-4 w-4" />}
          hint="当前相对湿度"
          accentClassName="bg-[#42a5f5]"
          accentTextClassName="text-[#2f8bc6]"
        />
        <DetailMetric
          label="体感温度"
          value={`${data.apparentTemperature}℃`}
          icon={<Thermometer className="h-4 w-4" />}
          hint="结合湿度与风感"
          accentClassName="bg-[#f28b66]"
          accentTextClassName="text-[#cf6744]"
        />
        <DetailMetric
          label="风力信息"
          value={`${data.windSpeed} km/h`}
          icon={<Wind className="h-4 w-4" />}
          hint={`${getWindDirectionText(data.windDirection)} 阵风 ${data.windGusts}km/h`}
          accentClassName="bg-[#7bcf92]"
          accentTextClassName="text-[#4b9f63]"
        />
        <DetailMetric
          label="气压"
          value={`${data.pressure} hPa`}
          icon={<Gauge className="h-4 w-4" />}
          hint="海平面气压"
          accentClassName="bg-[#9c8ee8]"
          accentTextClassName="text-[#7467d8]"
        />
      </section>

      <section className="mb-4 grid grid-cols-2 gap-3">
        <DetailMetric
          label="日出"
          value={formatClockTime(data.sunrise)}
          icon={<Sunrise className="h-4 w-4" />}
          accentClassName="bg-[#f28b66]"
          accentTextClassName="text-[#cf6744]"
        />
        <DetailMetric
          label="日落"
          value={formatClockTime(data.sunset)}
          icon={<Sunset className="h-4 w-4" />}
          accentClassName="bg-[#7467d8]"
          accentTextClassName="text-[#7467d8]"
        />
      </section>
    </div>
  );
}

function WeatherDetailSidebar({
  open,
  onClose,
  data,
  isLoading,
  error,
}: WeatherDetailSidebarProps) {
  return (
    <Sidebar
      open={open}
      title="天气详情"
      onClose={onClose}
      ariaLabel="关闭天气详情侧边栏"
      widthClassName="w-125"
    >
      <WeatherDetailContent data={data} isLoading={isLoading} error={error} />
    </Sidebar>
  );
}

export default WeatherDetailSidebar;
