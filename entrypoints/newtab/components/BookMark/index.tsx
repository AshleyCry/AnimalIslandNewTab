import { useEffect, useMemo, useRef, useState, type WheelEvent } from "react";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { useNewtabStore } from "../../store";

const PAGE_SIZE = 8;
const SWIPE_THRESHOLD = 50;
const TOUCHPAD_HORIZONTAL_THRESHOLD = 20;
const MOUSE_WHEEL_THRESHOLD = 80;
const WHEEL_AXIS_NOISE_THRESHOLD = 1;
const WHEEL_COOLDOWN = 450;
const FAVICON_ATTEMPT_TIMEOUT = 2000;
const DEFAULT_BOOKMARK_BACKGROUND = "#FDF4E6";
type PageDirection = "next" | "previous";
const faviconUrlCache = new Map<string, string | null>();

function clampPage(page: number, pageCount: number) {
  return Math.min(Math.max(page, 0), pageCount - 1);
}

function getFaviconCandidates(url: string) {
  try {
    const { hostname, origin } = new URL(url);

    return Array.from(
      new Set([
        `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(
          origin,
        )}&sz=128`,
        `${origin}/apple-touch-icon-precomposed.png`,
        `${origin}/apple-touch-icon.png`,
        `https://favicon.im/${hostname}?larger=true`,
        `https://icons.duckduckgo.com/ip3/${hostname}.ico`,
        `${origin}/favicon.ico`,
      ]),
    );
  } catch {
    return [];
  }
}

function loadImageWithTimeout(
  src: string,
  timeout: number,
  signal: AbortSignal,
) {
  return new Promise<string>((resolve, reject) => {
    const image = new Image();
    let settled = false;

    const finish = (result: string | null) => {
      if (settled) {
        return;
      }

      settled = true;
      window.clearTimeout(timer);
      signal.removeEventListener("abort", abort);

      if (result) {
        resolve(result);
      } else {
        reject(new Error("Favicon load failed"));
      }
    };

    const abort = () => {
      image.src = "";
      finish(null);
    };

    const timer = window.setTimeout(() => finish(null), timeout);

    image.onload = () => {
      if (image.naturalWidth > 1 && image.naturalHeight > 1) {
        finish(src);
        return;
      }

      finish(null);
    };
    image.onerror = () => finish(null);
    image.decoding = "async";
    image.referrerPolicy = "no-referrer";
    signal.addEventListener("abort", abort, { once: true });

    if (signal.aborted) {
      abort();
      return;
    }

    image.src = src;
  });
}

async function resolveFaviconUrl(url: string, signal: AbortSignal) {
  for (const candidate of getFaviconCandidates(url)) {
    if (signal.aborted) {
      return null;
    }

    try {
      return await loadImageWithTimeout(
        candidate,
        FAVICON_ATTEMPT_TIMEOUT,
        signal,
      );
    } catch {
      // Try the next source.
    }
  }

  return null;
}

function BookmarkFavicon({ url }: { url: string }) {
  const [faviconUrl, setFaviconUrl] = useState(() => {
    const cachedUrl = faviconUrlCache.get(url);

    return cachedUrl ?? "";
  });

  useEffect(() => {
    const cachedUrl = faviconUrlCache.get(url);

    if (cachedUrl !== undefined) {
      setFaviconUrl(cachedUrl ?? "");
      return;
    }

    const controller = new AbortController();

    setFaviconUrl("");

    resolveFaviconUrl(url, controller.signal).then((resolvedUrl) => {
      if (controller.signal.aborted) {
        return;
      }

      faviconUrlCache.set(url, resolvedUrl);
      setFaviconUrl(resolvedUrl ?? "");
    });

    return () => {
      controller.abort();
    };
  }, [url]);

  if (!faviconUrl) {
    return <ExternalLink className="h-9 w-9 text-[#8A7966]" />;
  }

  return (
    <img
      alt=""
      className="h-9 w-9 rounded-lg object-contain"
      src={faviconUrl}
    />
  );
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
  const canGoPrevious = pageIndex > 0;
  const canGoNext = pageIndex < pageCount - 1;

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

    const absDeltaX = Math.abs(event.deltaX);
    const absDeltaY = Math.abs(event.deltaY);
    const isHorizontalTouchpadScroll = absDeltaX > absDeltaY;
    const isMouseWheelScroll =
      absDeltaY >= MOUSE_WHEEL_THRESHOLD &&
      absDeltaX <= WHEEL_AXIS_NOISE_THRESHOLD;

    if (
      !isMouseWheelScroll &&
      (!isHorizontalTouchpadScroll || absDeltaX < TOUCHPAD_HORIZONTAL_THRESHOLD)
    ) {
      return;
    }

    event.preventDefault();

    const delta = isHorizontalTouchpadScroll ? event.deltaX : event.deltaY;

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
      className="relative mt-5 w-full max-w-3xl sm:mt-8 min-h-66 sm:min-h-0"
      onTouchEnd={handleTouchEnd}
      onTouchStart={handleTouchStart}
      onWheel={handleWheel}
    >
      {pageCount > 1 ? (
        <>
          <button
            type="button"
            aria-label="上一页书签"
            disabled={!canGoPrevious}
            className={[
              "absolute left-0 top-1/2 sm:top-11 z-10 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-3 border-white bg-[#FDF4E6] text-[#8A7966] shadow-[0_4px_0_#bdaea0] transition-all sm:-translate-x-full",
              canGoPrevious
                ? "hover:-translate-y-[calc(50%+2px)] hover:bg-[#59C19D] hover:text-white active:translate-y-[calc(-50%+2px)] active:shadow-[0_2px_0_#bdaea0]"
                : "cursor-not-allowed opacity-45 shadow-[0_2px_0_#d7cbbf]",
            ].join(" ")}
            onClick={goToPreviousPage}
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={3} />
          </button>
          <button
            type="button"
            aria-label="下一页书签"
            disabled={!canGoNext}
            className={[
              "absolute right-0 top-1/2 sm:top-11 z-10 flex h-8 w-8 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-3 border-white bg-[#FDF4E6] text-[#8A7966] shadow-[0_4px_0_#bdaea0] transition-all sm:translate-x-full",
              canGoNext
                ? "hover:-translate-y-[calc(50%+2px)] hover:bg-[#59C19D] hover:text-white active:translate-y-[calc(-50%+2px)] active:shadow-[0_2px_0_#bdaea0]"
                : "cursor-not-allowed opacity-45 shadow-[0_2px_0_#d7cbbf]",
            ].join(" ")}
            onClick={goToNextPage}
          >
            <ChevronRight className="h-5 w-5" strokeWidth={3} />
          </button>
        </>
      ) : null}
      <div
        key={pageIndex}
        className={[
          "grid grid-cols-2 gap-6 px-2 min-[420px]:grid-cols-4 sm:grid-cols-8 sm:px-6",
          pageDirection === "next"
            ? "animate-[bookmark-slide-next_260ms_ease-out]"
            : "animate-[bookmark-slide-previous_260ms_ease-out]",
        ].join(" ")}
      >
        {currentPageItems.map((bookmarkItem) => (
          <a
            key={`${bookmarkItem.url}-${bookmarkItem.title}`}
            href={bookmarkItem.url}
            className="group flex flex-col items-center gap-2"
            rel="noreferrer"
          >
            <div
              className="mb-1 flex h-16 w-16 items-center justify-center rounded-3xl border-4 border-white shadow-[0_6px_0_#bdaea0] transition-all group-hover:-translate-y-2 group-hover:scale-105 sm:h-20 sm:w-20 sm:rounded-[28px]"
              style={{
                backgroundColor:
                  bookmarkItem.backgroundColor ?? DEFAULT_BOOKMARK_BACKGROUND,
              }}
            >
              <BookmarkFavicon url={bookmarkItem.url} />
            </div>
            <div
              className="w-20 truncate text-center rounded-full bg-[#fff9da] px-3 py-1 text-sm font-bold text-[#8A7966] shadow-sm backdrop-blur-sm"
              title={bookmarkItem.title}
            >
              {bookmarkItem.title}
            </div>
          </a>
        ))}
        {bookmarkItems.length === 0 ? (
          <div className="col-span-2 flex flex-col items-center justify-center gap-2 rounded-[28px] border-4 border-dashed border-[#E5D9B4] bg-white/50 px-6 py-8 text-center text-[#8A7966] min-[420px]:col-span-4 sm:col-span-8">
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
