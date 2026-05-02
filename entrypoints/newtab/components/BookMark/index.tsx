import { useEffect, useMemo, useRef, useState, type WheelEvent } from "react";
import { ExternalLink } from "lucide-react";
import { useNewtabStore } from "../../store";

const PAGE_SIZE = 8;
const SWIPE_THRESHOLD = 50;
const WHEEL_THRESHOLD = 20;
const WHEEL_COOLDOWN = 450;
const DEFAULT_BOOKMARK_BACKGROUND = "#FDF4E6";
type PageDirection = "next" | "previous";

function clampPage(page: number, pageCount: number) {
  return Math.min(Math.max(page, 0), pageCount - 1);
}

function getFaviconUrl(url: string) {
  try {
    const domain = new URL(url).hostname;

    return `https://favicon.im/${domain}?larger=true`;
  } catch {
    return "";
  }
}

export function Bookmarks() {
  const bookmarkItems = useNewtabStore((state) => state.config.bookmarkItems);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageDirection, setPageDirection] = useState<PageDirection>("next");
  const touchStartX = useRef<number | null>(null);
  const lastWheelTime = useRef(0);

  const pageCount = Math.max(1, Math.ceil(bookmarkItems.length / PAGE_SIZE));
  const currentPageItems = useMemo(() => {
    const start = pageIndex * PAGE_SIZE;

    return bookmarkItems.slice(start, start + PAGE_SIZE);
  }, [bookmarkItems, pageIndex]);

  useEffect(() => {
    setPageIndex((currentPage) => clampPage(currentPage, pageCount));
  }, [pageCount]);

  const goToPage = (page: number) => {
    const nextPage = clampPage(page, pageCount);

    if (nextPage === pageIndex) {
      return;
    }

    setPageDirection(nextPage > pageIndex ? "next" : "previous");
    setPageIndex(nextPage);
  };

  const goToNextPage = () => {
    setPageDirection("next");
    setPageIndex((currentPage) => clampPage(currentPage + 1, pageCount));
  };

  const goToPreviousPage = () => {
    setPageDirection("previous");
    setPageIndex((currentPage) => clampPage(currentPage - 1, pageCount));
  };

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (pageCount <= 1) {
      return;
    }

    const delta =
      Math.abs(event.deltaX) > Math.abs(event.deltaY)
        ? event.deltaX
        : event.deltaY;

    if (Math.abs(delta) < WHEEL_THRESHOLD) {
      return;
    }

    const now = Date.now();

    if (now - lastWheelTime.current < WHEEL_COOLDOWN) {
      return;
    }

    lastWheelTime.current = now;

    if (delta > 0) {
      goToNextPage();
    } else {
      goToPreviousPage();
    }
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null || pageCount <= 1) {
      return;
    }

    const deltaX = event.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;

    if (Math.abs(deltaX) < SWIPE_THRESHOLD) {
      return;
    }

    if (deltaX < 0) {
      goToNextPage();
    } else {
      goToPreviousPage();
    }
  };

  return (
    <div
      className="mt-8 w-full max-w-3xl"
      onTouchEnd={handleTouchEnd}
      onTouchStart={handleTouchStart}
      onWheel={handleWheel}
    >
      <div
        key={pageIndex}
        className={[
          "grid grid-cols-4 gap-4 px-4 sm:grid-cols-8 sm:gap-6",
          pageDirection === "next"
            ? "animate-[bookmark-slide-next_260ms_ease-out]"
            : "animate-[bookmark-slide-previous_260ms_ease-out]",
        ].join(" ")}
      >
        {currentPageItems.map((bookmarkItem) => {
          const faviconUrl = getFaviconUrl(bookmarkItem.url);

          return (
            <a
              key={`${bookmarkItem.url}-${bookmarkItem.title}`}
              href={bookmarkItem.url}
              className="group flex flex-col items-center gap-2"
              rel="noreferrer"
              target="_blank"
            >
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 mb-1 rounded-[28px] flex items-center justify-center transition-all transform group-hover:-translate-y-2 group-hover:scale-105 border-4 border-white shadow-[0_6px_0_#D9CBB0]"
                style={{
                  backgroundColor:
                    bookmarkItem.backgroundColor ?? DEFAULT_BOOKMARK_BACKGROUND,
                }}
              >
                {faviconUrl ? (
                  <img
                    alt=""
                    className="h-9 w-9 rounded-lg object-contain"
                    src={faviconUrl}
                    loading="lazy"
                  />
                ) : (
                  <ExternalLink className="h-9 w-9 text-[#8A7966]" />
                )}
              </div>
              <span
                className="max-w-[100px] truncate rounded-full bg-white/60 px-3 py-1 text-sm font-bold text-[#8A7966] shadow-sm backdrop-blur-sm"
                title={bookmarkItem.title}
              >
                {bookmarkItem.title}
              </span>
            </a>
          );
        })}
        {bookmarkItems.length === 0 ? (
          <div className="col-span-4 flex flex-col items-center justify-center gap-2 rounded-[28px] border-4 border-dashed border-[#E5D9B4] bg-white/50 px-6 py-8 text-center text-[#8A7966] sm:col-span-8">
            <ExternalLink className="h-8 w-8" />
            <span className="font-bold">暂无书签</span>
          </div>
        ) : null}
      </div>
      {pageCount > 1 ? (
        <div className="mt-5 flex justify-center gap-2">
          {Array.from({ length: pageCount }, (_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`切换到第 ${index + 1} 页`}
              aria-current={index === pageIndex ? "page" : undefined}
              className={[
                "h-3 w-3 rounded-full transition-all",
                index === pageIndex
                  ? "scale-110 bg-[#59C19D]"
                  : "bg-[#D9CBB0] hover:bg-[#8A7966]",
              ].join(" ")}
              onClick={() => goToPage(index)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
