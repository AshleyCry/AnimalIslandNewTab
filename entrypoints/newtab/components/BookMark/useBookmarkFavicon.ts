import { useEffect, useState } from "react";
import { getCachedFavicon, refreshFavicon } from "./favicon";

function createObjectUrl(blob: Blob | null) {
  return blob ? URL.createObjectURL(blob) : "";
}

export function useBookmarkFavicon(url: string) {
  const [faviconUrl, setFaviconUrl] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    let objectUrl = "";

    const showBlob = (blob: Blob | null) => {
      if (controller.signal.aborted || !blob) {
        return;
      }

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }

      objectUrl = createObjectUrl(blob);
      setFaviconUrl(objectUrl);
    };

    setFaviconUrl("");

    // 先显示 IndexedDB 缓存，再后台刷新并覆盖缓存。
    getCachedFavicon(url).then(showBlob);
    refreshFavicon(url, controller.signal).then(showBlob);

    return () => {
      controller.abort();

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [url]);

  return faviconUrl;
}
