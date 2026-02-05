// Note: pdf-parse works in Node.js environment only
// For production, consider using a dedicated PDF parsing service

export interface ParsedPDFData {
  text: string;
  pages: number;
}

export async function parsePDF(buffer: Buffer): Promise<ParsedPDFData> {
  try {
    // Dynamic import for Node.js environment
    const pdfParseModule: any = await import('pdf-parse');
    const pdfParse = pdfParseModule.default || pdfParseModule;
    
    const data = await pdfParse(buffer);

    return {
      text: data.text,
      pages: data.numpages,
    };
  } catch (error: any) {
    throw new Error(`PDF parsing error: ${error.message}`);
  }
}

// Extract structured data from PDF text
export function extractDataFromPDFText(text: string): any[] {
  const lines = text.split('\n').filter(line => line.trim());
  const transactions: any[] = [];

  // Simple pattern matching for common financial data
  // This is a basic implementation - enhance based on actual PDF formats
  lines.forEach((line) => {
    // Look for date patterns (DD/MM/YYYY or DD-MM-YYYY)
    const dateMatch = line.match(/(\d{2}[/-]\d{2}[/-]\d{4})/);
    // Look for amount patterns (numbers with optional commas and decimals)
    const amountMatch = line.match(/(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g);

    if (dateMatch && amountMatch) {
      transactions.push({
        date: dateMatch[1],
        description: line.replace(dateMatch[1], '').trim(),
        amounts: amountMatch.map(a => parseFloat(a.replace(/,/g, ''))),
      });
    }
  });

  return transactions;
}
