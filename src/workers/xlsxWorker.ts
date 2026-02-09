// Web Worker for parsing XLSX/XLS files off the main thread
// This prevents UI freezing for large files

self.onmessage = async (e: MessageEvent<{ buffer: ArrayBuffer; fileName: string }>) => {
  try {
    const { buffer, fileName } = e.data;
    const XLSX = await import("xlsx");
    const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: null });

    const headers = json.length > 0 ? Object.keys(json[0]) : [];

    self.postMessage({ success: true, rows: json, headers });
  } catch (err) {
    self.postMessage({ success: false, error: (err as Error).message });
  }
};
