// Web stub: the real SQLite database (expo-sqlite) only runs on native.
// On web we use an AsyncStorage-backed store (see repo.web.ts), so this
// getDb is a harmless no-op to satisfy imports.
export async function getDb(): Promise<any> {
  return null;
}
