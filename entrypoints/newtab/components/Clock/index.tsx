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
      <div className="px-6 py-8 m-5 bg-[#f8f4df] rounded-[20px] border-[#725d42] border-4 w-full flex justify-center items-center">
        <ClockIcon
          className="h-16 w-16 mr-4 text-[#ffc53d]"
          strokeWidth={2.4}
        />
        <div className="flex items-center gap-6">
          <div className="text-8xl font-black leading-none tracking-tight">
            {time.hours}:{time.minutes}
          </div>
          <div className="flex flex-col items-center justify-end gap-2">
            {use12Hour ? (
              <span className="text-3xl font-semibold leading-none">
                {time.period}
              </span>
            ) : null}
            <span className="text-5xl font-bold leading-none">
              {time.seconds}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default Clock;
