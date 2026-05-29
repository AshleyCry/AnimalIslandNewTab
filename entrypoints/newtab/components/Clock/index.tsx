import { useEffect, useMemo, useState } from "react";
import { useNewtabStore } from "../../store";
import { Card } from "animal-island-ui";
import { Clock as ClockIcon } from "lucide-react";

function getTimeParts(date: Date, use12Hour: boolean) {
  const hours = date.getHours();
  const displayHours = use12Hour ? hours % 12 || 12 : hours;
  const period = hours < 12 ? "AM" : "PM";

  return {
    hours: String(displayHours).padStart(2, "0"),
    minutes: String(date.getMinutes()).padStart(2, "0"),
    seconds: String(date.getSeconds()).padStart(2, "0"),
    period,
  };
}

function Clock() {
  const clockFormat = useNewtabStore((state) => state.config.clockFormat);
  const [now, setNow] = useState(() => new Date());
  const use12Hour = clockFormat === "12h";

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const time = useMemo(() => getTimeParts(now, use12Hour), [now, use12Hour]);

  return (
    <Card className="flex items-center justify-center border-4 p-0! bg-[#dcaf82]! border-[#725d42] text-[#725d42] shadow-[0_6px_0_#725d42]">
      <div className="m-3 flex w-full items-center justify-center rounded-[20px] border-4 border-[#725d42] bg-[#f8f4df] px-4 py-5 sm:m-5 sm:px-6 sm:py-8">
        <ClockIcon
          className="mr-3 hidden h-12 w-12 text-[#ffc53d] sm:block lg:mr-4 lg:h-16 lg:w-16"
          strokeWidth={2.4}
        />
        <div className="flex items-center gap-3 sm:gap-5 lg:gap-6">
          <div className="text-5xl font-black leading-none tracking-tight sm:text-7xl lg:text-8xl">
            {time.hours}:{time.minutes}
          </div>
          <div className="flex flex-col items-center justify-end gap-1 sm:gap-2">
            {use12Hour ? (
              <span className="text-xl font-semibold leading-none sm:text-2xl lg:text-3xl">
                {time.period}
              </span>
            ) : null}
            <span className="text-3xl font-bold leading-none sm:text-4xl lg:text-5xl">
              {time.seconds}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default Clock;
