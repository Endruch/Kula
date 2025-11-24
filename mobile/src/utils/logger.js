// utils/logger.js
import * as FileSystem from "expo-file-system";

const LOG_FILE = FileSystem.documentDirectory + "app.log";

export async function log(message) {
  const time = new Date().toISOString();
  const entry = `[${time}] ${message}\n`;

  await FileSystem.writeAsStringAsync(
    LOG_FILE,
    entry,
    {
      encoding: FileSystem.EncodingType.UTF8,
      append: true
    }
  );
}

export function getLogFilePath() {
  return LOG_FILE;
}
