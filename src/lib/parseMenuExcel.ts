import * as XLSX from "xlsx";

export type ParsedMenu = {
  [day: string]: {
    BRE: string[];
    LUN: string[];
    SNA: string[];
    DIN: string[];
  };
};

const REQUIRED_DAYS = ["MON","TUE","WED","THU","FRI","SAT","SUN"];

export function parseMenuExcel(file: File): Promise<ParsedMenu> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<any>(sheet);

        const result: ParsedMenu = {};

        rows.forEach((row) => {
          const day = row["Day"]?.toUpperCase();
          if (!day) return;

          result[day] = {
            BRE: row["Breakfast"]?.split(",").map((i: string) => i.trim()) ?? [],
            LUN: row["Lunch"]?.split(",").map((i: string) => i.trim()) ?? [],
            SNA: row["Snacks"]?.split(",").map((i: string) => i.trim()) ?? [],
            DIN: row["Dinner"]?.split(",").map((i: string) => i.trim()) ?? [],
          };
        });

        const missing = REQUIRED_DAYS.filter(d => !result[d]);
        if (missing.length > 0) {
          reject(new Error(`Missing days: ${missing.join(", ")}`));
          return;
        }

        resolve(result);
      } catch (err) {
        reject(new Error("Invalid Excel format."));
      }
    };

    reader.readAsArrayBuffer(file);
  });
}
