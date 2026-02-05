import Papa from 'papaparse';

export interface ParsedCSVData {
  headers: string[];
  rows: any[];
}

export async function parseCSV(fileContent: string): Promise<ParsedCSVData> {
  return new Promise((resolve, reject) => {
    Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        resolve({
          headers: results.meta.fields || [],
          rows: results.data,
        });
      },
      error: (error: any) => {
        reject(new Error(`CSV parsing error: ${error.message}`));
      },
    });
  });
}
