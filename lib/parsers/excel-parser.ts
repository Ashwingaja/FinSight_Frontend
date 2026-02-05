import * as XLSX from 'xlsx';

export interface ParsedExcelData {
  sheets: {
    [sheetName: string]: {
      headers: string[];
      rows: any[];
    };
  };
}

export async function parseExcel(buffer: Buffer): Promise<ParsedExcelData> {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheets: ParsedExcelData['sheets'] = {};

    workbook.SheetNames.forEach((sheetName) => {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (jsonData.length > 0) {
        const headers = jsonData[0] as string[];
        const rows = jsonData.slice(1).map((row: any) => {
          const obj: any = {};
          headers.forEach((header, index) => {
            obj[header] = row[index];
          });
          return obj;
        });

        sheets[sheetName] = { headers, rows };
      }
    });

    return { sheets };
  } catch (error: any) {
    throw new Error(`Excel parsing error: ${error.message}`);
  }
}
