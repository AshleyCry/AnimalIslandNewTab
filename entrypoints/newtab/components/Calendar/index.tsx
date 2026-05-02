import { useEffect, useMemo, useState } from "react";
import CardWithTitle from "../CardWithTitle";

const weekdayFormatter = new Intl.DateTimeFormat("zh-CN", {
  weekday: "long",
});

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

const lunarFormatter = new Intl.DateTimeFormat("zh-CN-u-ca-chinese", {
  month: "long",
  day: "numeric",
});

const lunarDays = [
  "",
  "初一",
  "初二",
  "初三",
  "初四",
  "初五",
  "初六",
  "初七",
  "初八",
  "初九",
  "初十",
  "十一",
  "十二",
  "十三",
  "十四",
  "十五",
  "十六",
  "十七",
  "十八",
  "十九",
  "二十",
  "廿一",
  "廿二",
  "廿三",
  "廿四",
  "廿五",
  "廿六",
  "廿七",
  "廿八",
  "廿九",
  "三十",
] as const;

function formatLunarDate(date: Date) {
  const parts = lunarFormatter.formatToParts(date);
  const month = parts.find((part) => part.type === "month")?.value ?? "";
  const day = Number(parts.find((part) => part.type === "day")?.value);

  return `农历 ${month}${lunarDays[day] ?? ""}`;
}

function Calendar() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 60 * 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const calendar = useMemo(
    () => ({
      date: dateFormatter.format(now),
      weekday: weekdayFormatter.format(now),
      lunarDate: formatLunarDate(now),
    }),
    [now],
  );

  return (
    <CardWithTitle
      className="flex h-56 w-60 flex-col items-center justify-center gap-3 p-5 text-[#725d42] shadow-[0_8px_18px_rgba(114,93,66,0.22)]"
      title="今天是"
    >
      <div className="text-xl font-bold">{calendar.date}</div>
      <div className="text-5xl font-black tracking-widest text-[#3f8f46]">
        {calendar.weekday}
      </div>
      <div className="flex w-fit items-center gap-3 rounded-full bg-[#eadfcb] px-4 py-2 text-base font-semibold">
        {calendar.lunarDate}
      </div>
    </CardWithTitle>
  );
}

export default Calendar;
