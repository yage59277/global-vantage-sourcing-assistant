import path from 'path';
import { createRequire } from 'module';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

export interface ParsedDocumentResult {
  success: boolean;
  text: string;
  fileName: string;
  fileType: string;
  warnings?: string[];
}

export class DocumentParseError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 422) {
    super(message);
    this.name = 'DocumentParseError';
    this.statusCode = statusCode;
  }
}

export async function parseDocument(fileName: string, fileData: string): Promise<ParsedDocumentResult> {
  if (!fileName || !fileData) {
    throw new DocumentParseError('Missing file name or file content in request.', 400);
  }

  // Decode base64
  const base64Content = fileData.includes(',') ? fileData.split(',')[1] : fileData;
  const buffer = Buffer.from(base64Content, 'base64');
  const ext = path.extname(fileName).toLowerCase();

  let extractedText = '';
  let warnings: string[] = [];

  if (ext === '.xlsx' || ext === '.xls' || ext === '.csv') {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetSummaries: string[] = [];

      workbook.SheetNames.forEach((sheetName) => {
        const sheet = workbook.Sheets[sheetName];
        const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        if (rows.length > 0) {
          sheetSummaries.push(`--- Sheet: ${sheetName} ---`);
          rows.forEach((row, rowIndex) => {
            const nonNullRow = row.filter((c) => c !== undefined && c !== null && c !== '');
            if (nonNullRow.length > 0) {
              sheetSummaries.push(`Row ${rowIndex + 1}: ${nonNullRow.join(' | ')}`);
            }
          });
        }
      });

      extractedText = sheetSummaries.join('\n');
      if (!extractedText.trim()) {
        throw new DocumentParseError('The uploaded Excel file does not contain readable data rows or is empty.', 422);
      }
    } catch (err: any) {
      if (err instanceof DocumentParseError) throw err;
      throw new DocumentParseError(`Failed to parse Excel workbook: ${err.message || 'Malformed spreadsheet structure'}`, 422);
    }
  } else if (ext === '.docx' || ext === '.doc') {
    try {
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value ? result.value.trim() : '';

      if (!extractedText) {
        throw new DocumentParseError('The uploaded Word document contains no readable text paragraphs.', 422);
      }

      if (result.messages && result.messages.length > 0) {
        warnings = result.messages.map((m) => m.message);
      }
    } catch (err: any) {
      if (err instanceof DocumentParseError) throw err;
      throw new DocumentParseError(`Failed to parse Word document: ${err.message || 'Unsupported or corrupted DOCX file'}`, 422);
    }
  } else if (ext === '.pdf') {
    try {
      let pdfData: any;
      if (typeof pdfParse === 'function') {
        pdfData = await pdfParse(buffer);
      } else if (pdfParse?.PDFParse) {
        const parser = new pdfParse.PDFParse({ data: buffer });
        pdfData = await parser.getText();
        if (typeof parser.destroy === 'function') {
          await parser.destroy();
        }
      } else if (pdfParse?.default && typeof pdfParse.default === 'function') {
        pdfData = await pdfParse.default(buffer);
      } else {
        throw new Error('Unsupported pdf-parse interface');
      }

      extractedText = pdfData.text ? pdfData.text.trim() : '';

      // Scanned PDF detection: text is empty or negligible compared to pages
      if (!extractedText || extractedText.length < 25) {
        throw new DocumentParseError(
          'No selectable text detected in this PDF (Scanned / Image-based PDF detected). Global Vantage Sourcing Assistant requires text-based PDFs. Please run an OCR tool on this scanned document or paste the text directly into the input workspace.',
          422
        );
      }
    } catch (err: any) {
      if (err instanceof DocumentParseError) throw err;
      throw new DocumentParseError(`Failed to parse PDF document: ${err.message || 'File may be encrypted or corrupted'}`, 422);
    }
  } else if (ext === '.txt' || ext === '.md' || ext === '.rtf') {
    extractedText = buffer.toString('utf-8').trim();
    if (!extractedText) {
      throw new DocumentParseError('The uploaded text file is empty.', 422);
    }
  } else {
    throw new DocumentParseError(
      `Unsupported file extension (${ext}). Please upload Excel (.xlsx, .xls), Word (.docx), text-based PDF (.pdf), or standard text files (.txt).`,
      400
    );
  }

  return {
    success: true,
    text: extractedText,
    fileName,
    fileType: ext.replace('.', ''),
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}
