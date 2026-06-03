const FAVICON_ATTEMPT_TIMEOUT = 2000;
const FAVICON_DB_NAME = "animal-cross-newtab-favicons";
const FAVICON_DB_VERSION = 1;
const FAVICON_STORE_NAME = "favicons";

type CachedFavicon = {
  url: string;
  blob: Blob;
  sourceUrl: string;
  updatedAt: number;
};

let faviconDatabasePromise: Promise<IDBDatabase> | null = null;

function getFaviconCandidates(url: string) {
  try {
    const { hostname, origin } = new URL(url);

    // 先试稳定的第三方服务，再回退到网站自己的图标文件。
    return [
      `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(
        origin,
      )}&sz=128`,
      `https://icons.duckduckgo.com/ip3/${hostname}.ico`,
      `https://favicon.im/${hostname}?larger=true`,
      `${origin}/apple-touch-icon-precomposed.png`,
      `${origin}/apple-touch-icon.png`,
      `${origin}/favicon.ico`,
    ];
  } catch {
    return [];
  }
}

function openFaviconDatabase() {
  if (faviconDatabasePromise) {
    return faviconDatabasePromise;
  }

  faviconDatabasePromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(FAVICON_DB_NAME, FAVICON_DB_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(FAVICON_STORE_NAME)) {
        database.createObjectStore(FAVICON_STORE_NAME, { keyPath: "url" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      faviconDatabasePromise = null;
      reject(request.error);
    };
  });

  return faviconDatabasePromise;
}

export async function getCachedFavicon(url: string) {
  try {
    const database = await openFaviconDatabase();

    return await new Promise<Blob | null>((resolve, reject) => {
      const request = database
        .transaction(FAVICON_STORE_NAME, "readonly")
        .objectStore(FAVICON_STORE_NAME)
        .get(url);

      request.onsuccess = () => {
        const cachedFavicon = request.result as CachedFavicon | undefined;

        resolve(cachedFavicon?.blob ?? null);
      };
      request.onerror = () => reject(request.error);
    });
  } catch {
    return null;
  }
}

async function cacheFavicon(url: string, blob: Blob, sourceUrl: string) {
  try {
    const database = await openFaviconDatabase();

    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(FAVICON_STORE_NAME, "readwrite");

      transaction.objectStore(FAVICON_STORE_NAME).put({
        url,
        blob,
        sourceUrl,
        updatedAt: Date.now(),
      } satisfies CachedFavicon);

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  } catch {
    // 缓存失败不影响本次显示。
  }
}

function createTimeoutSignal(timeout: number, signal: AbortSignal) {
  const controller = new AbortController();
  const abort = () => controller.abort();
  const timer = window.setTimeout(abort, timeout);

  signal.addEventListener("abort", abort, { once: true });

  return {
    signal: controller.signal,
    cleanup: () => {
      window.clearTimeout(timer);
      signal.removeEventListener("abort", abort);
    },
  };
}

async function fetchImageBlob(src: string, signal: AbortSignal) {
  const timeout = createTimeoutSignal(FAVICON_ATTEMPT_TIMEOUT, signal);

  try {
    const response = await fetch(src, {
      credentials: "omit",
      referrerPolicy: "no-referrer",
      signal: timeout.signal,
    });

    if (!response.ok) {
      return null;
    }

    const blob = await response.blob();

    return blob.size && blob.type.startsWith("image/") ? blob : null;
  } finally {
    timeout.cleanup();
  }
}

export async function refreshFavicon(url: string, signal: AbortSignal) {
  for (const candidate of getFaviconCandidates(url)) {
    if (signal.aborted) {
      return null;
    }

    try {
      const blob = await fetchImageBlob(candidate, signal);

      if (!blob) {
        continue;
      }

      await cacheFavicon(url, blob, candidate);

      return blob;
    } catch {
      // 当前候选源不可用，继续尝试下一个。
    }
  }

  return null;
}
