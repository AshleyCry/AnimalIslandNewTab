export const CUSTOM_BACKGROUND_IMAGE_ID = "custom";

const CUSTOM_BACKGROUND_DB_NAME = "animal-cross-newtab-background";
const CUSTOM_BACKGROUND_DB_VERSION = 1;
const CUSTOM_BACKGROUND_STORE_NAME = "images";
const CUSTOM_BACKGROUND_KEY = "current";

type CustomBackgroundImage = {
  id: string;
  blob: Blob;
  updatedAt: number;
};

let databasePromise: Promise<IDBDatabase> | null = null;

function openCustomBackgroundDatabase() {
  if (databasePromise) {
    return databasePromise;
  }

  databasePromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(
      CUSTOM_BACKGROUND_DB_NAME,
      CUSTOM_BACKGROUND_DB_VERSION,
    );

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(CUSTOM_BACKGROUND_STORE_NAME)) {
        database.createObjectStore(CUSTOM_BACKGROUND_STORE_NAME, {
          keyPath: "id",
        });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      databasePromise = null;
      reject(request.error);
    };
  });

  return databasePromise;
}

export async function getCustomBackgroundImage() {
  try {
    const database = await openCustomBackgroundDatabase();

    return await new Promise<Blob | null>((resolve, reject) => {
      const request = database
        .transaction(CUSTOM_BACKGROUND_STORE_NAME, "readonly")
        .objectStore(CUSTOM_BACKGROUND_STORE_NAME)
        .get(CUSTOM_BACKGROUND_KEY);

      request.onsuccess = () => {
        const image = request.result as CustomBackgroundImage | undefined;

        resolve(image?.blob ?? null);
      };
      request.onerror = () => reject(request.error);
    });
  } catch {
    return null;
  }
}

export async function saveCustomBackgroundImage(blob: Blob) {
  const database = await openCustomBackgroundDatabase();

  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(
      CUSTOM_BACKGROUND_STORE_NAME,
      "readwrite",
    );

    transaction.objectStore(CUSTOM_BACKGROUND_STORE_NAME).put({
      id: CUSTOM_BACKGROUND_KEY,
      blob,
      updatedAt: Date.now(),
    } satisfies CustomBackgroundImage);

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}
