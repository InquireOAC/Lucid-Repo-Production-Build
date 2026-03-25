const DB_NAME = 'dream-media-cache';
const DB_VERSION = 1;
const STORE_NAME = 'media';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function cacheMedia(key: string, blob: Blob): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(blob, key);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

export async function getCachedMedia(key: string): Promise<string | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(key);
      req.onsuccess = () => {
        db.close();
        if (req.result instanceof Blob) {
          resolve(URL.createObjectURL(req.result));
        } else {
          resolve(null);
        }
      };
      req.onerror = () => { db.close(); reject(req.error); };
    });
  } catch {
    return null;
  }
}

export async function hasCachedMedia(key: string): Promise<boolean> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).count(IDBKeyRange.only(key));
      req.onsuccess = () => { db.close(); resolve(req.result > 0); };
      req.onerror = () => { db.close(); reject(req.error); };
    });
  } catch {
    return false;
  }
}

export async function deleteCachedMedia(key: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(key);
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onerror = () => { db.close(); reject(tx.error); };
    });
  } catch {
    // Silently fail on delete
  }
}

export async function cacheMediaFromUrl(key: string, url: string): Promise<void> {
  if (!url || url.startsWith('blob:')) return;
  const already = await hasCachedMedia(key);
  if (already) return;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
    const blob = await response.blob();
    await cacheMedia(key, blob);
    console.log(`[MediaCache] Cached ${key} (${(blob.size / 1024).toFixed(0)} KB)`);
  } catch (err) {
    console.warn(`[MediaCache] Failed to cache ${key}:`, err);
  }
}

export function mediaCacheKey(dreamId: string, type: 'image' | 'video'): string {
  return `${dreamId}-${type}`;
}
