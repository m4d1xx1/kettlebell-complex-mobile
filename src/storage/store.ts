import AsyncStorage from '@react-native-async-storage/async-storage';
// Serialize writes per key, so a slower old write cannot overwrite a newer one.
const queues = new Map<string, Promise<void>>();
const blocked = new Set<string>();
export async function readStored<T>(key: string, validate: (value: unknown) => value is T): Promise<T | null> {
  try {
    await queues.get(key);
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) { blocked.delete(key); return null; }
    const value: unknown = JSON.parse(raw);
    if (!validate(value)) throw new Error('Invalid saved data');
    blocked.delete(key);
    return value;
  } catch {
    blocked.add(key);
    throw new Error('Some saved data could not be loaded. The stored copy has been preserved. Restart the app to retry.');
  }
}
export function writeStored(key: string, value: unknown): Promise<void> {
  const serialized = value === null ? null : JSON.stringify(value);
  const next = (queues.get(key) ?? Promise.resolve()).catch(() => undefined).then(async () => {
    if (blocked.has(key)) throw new Error('This saved copy is protected after a read error. Restart to retry before replacing it.');
    if (serialized === null) await AsyncStorage.removeItem(key);
    else await AsyncStorage.setItem(key, serialized);
  });
  queues.set(key, next.catch(() => undefined));
  return next;
}

/** Read-modify-write is one queued operation, including validation and computation. */
export function updateStored<T>(key: string, fallback: T, validate: (x: unknown) => x is T, transform: (current: T) => T): Promise<T> {
  const next = (queues.get(key) ?? Promise.resolve()).then(async () => {
    if (blocked.has(key)) throw new Error('Saved data needs recovery before editing.');
    let current: T;
    try {
      const raw = await AsyncStorage.getItem(key);
      current = raw === null ? fallback : JSON.parse(raw);
      if (!validate(current)) throw new Error('Invalid saved data');
    } catch (error) { blocked.add(key); throw error; }
    const value = transform(current);
    if (!validate(value)) throw new Error('Invalid change; nothing was saved.');
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return value;
  });
  queues.set(key, next.then(() => undefined, () => undefined));
  return next;
}

/** Preserve the exact original in a discoverable archive before resetting a damaged key. */
export function archiveAndReset(key: string): Promise<string> {
  const next = (queues.get(key) ?? Promise.resolve()).then(async () => {
    const raw = await AsyncStorage.getItem(key);
    const backup = `${key}.backup.${Date.now()}`;
    if (raw !== null) await AsyncStorage.setItem(backup, raw);
    await AsyncStorage.removeItem(key);
    blocked.delete(key);
    return backup;
  });
  queues.set(key, next.then(() => undefined, () => undefined));
  return next;
}
export async function exportStoredCopies(): Promise<string> {
  const keys = (await AsyncStorage.getAllKeys()).filter(key => key.startsWith('kb.'));
  return JSON.stringify(Object.fromEntries(await AsyncStorage.multiGet(keys)), null, 2);
}
