type BrowserSearchQueryInfo = {
  text: string;
  disposition?: string;
};

type BrowserSearchApi = {
  chrome?: {
    search?: {
      query?: (queryInfo: BrowserSearchQueryInfo) => void;
    };
  };
};

export function getBrowserDefaultSearchApi() {
  const browserApi = globalThis as typeof globalThis & BrowserSearchApi;

  return browserApi.chrome?.search;
}

export function canUseBrowserDefaultSearch() {
  return typeof getBrowserDefaultSearchApi()?.query === "function";
}
