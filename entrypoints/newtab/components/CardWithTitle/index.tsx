import type { HTMLAttributes, ReactNode } from "react";

type CardWithTitleProps = Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
  title?: ReactNode;
};

function CardWithTitle({
  title,
  children,
  className,
  ...cardProps
}: CardWithTitleProps) {
  const hasTitle = title !== undefined && title !== null;

  return (
    <div
      className={[
        "relative",
        "rounded-xl",
        "bg-[#f7f3df]",
        "font-medium",
        "text-[#725d42]",
        "transition-all",
        "duration-300",
        "ease-in-out",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...cardProps}
    >
      {hasTitle ? (
        <div className="absolute left-1/2 top-0 z-10 min-w-24 max-w-55 whitespace-nowrap -translate-x-1/2 -translate-y-1/2 -rotate-2 rounded-sm bg-[#59C19D] px-5 py-1.5 text-center text-base font-black text-white opacity-85">
          {title}
        </div>
      ) : null}
      {children}
    </div>
  );
}

export default CardWithTitle;
