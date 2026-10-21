import path from 'path';
import { createRequire } from 'module';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

// Helper to ensure request body is parsed in any Vercel environment
async function getRequestBody(req: any): Promise<any> {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk: any) => {
      data += chunk;
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(data));
      } catch {
        resolve({});
      }
    });
  });
}

export async function parseDocument(fileName: string, fileData: string) {
  if (!fileName || !fileData) {
    const err: any = new Error('Missing file name or file content in request.');
    err.statusCode = 400;
    throw err;
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
        const err: any = new Error('The uploaded Excel file does not contain readable data rows or is empty.');
        err.statusCode = 422;
        throw err;
      }
    } catch (err: any) {
      if (err.statusCode) throw err;
      const parseErr: any = new Error(`Failed to parse Excel workbook: ${err.message || 'Malformed spreadsheet structure'}`);
      parseErr.statusCode = 422;
      throw parseErr;
    }
  } else if (ext === '.docx' || ext === '.doc') {
    try {
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value ? result.value.trim() : '';

      if (!extractedText) {
        const err: any = new Error('The uploaded Word document contains no readable text paragraphs.');
        err.statusCode = 422;
        throw err;
      }

      if (result.messages && result.messages.length > 0) {
        warnings = result.messages.map((m) => m.message);
      }
    } catch (err: any) {
      if (err.statusCode) throw err;
      const parseErr: any = new Error(`Failed to parse Word document: ${err.message || 'Unsupported or corrupted DOCX file'}`);
      parseErr.statusCode = 422;
      throw parseErr;
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

      if (!extractedText || extractedText.length < 25) {
        const err: any = new Error(
          'No selectable text detected in this PDF (Scanned / Image-based PDF detected). Global Vantage Sourcing Assistant requires text-based PDFs. Please run an OCR tool on this scanned document or paste the text directly into the input workspace.'
        );
        err.statusCode = 422;
        throw err;
      }
    } catch (err: any) {
      if (err.statusCode) throw err;
      const parseErr: any = new Error(`Failed to parse PDF document: ${err.message || 'File may be encrypted or corrupted'}`);
      parseErr.statusCode = 422;
      throw parseErr;
    }
  } else if (ext === '.txt' || ext === '.md' || ext === '.rtf') {
    extractedText = buffer.toString('utf-8').trim();
    if (!extractedText) {
      const err: any = new Error('The uploaded text file is empty.');
      err.statusCode = 422;
      throw err;
    }
  } else {
    const err: any = new Error(
      `Unsupported file extension (${ext}). Please upload Excel (.xlsx, .xls), Word (.docx), text-based PDF (.pdf), or standard text files (.txt).`
    );
    err.statusCode = 400;
    throw err;
  }

  return {
    success: true,
    text: extractedText,
    fileName,
    fileType: ext.replace('.', ''),
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Method not allowed. Use POST.' }));
    return;
  }

  try {
    const body = await getRequestBody(req);
    const { fileName, fileData } = body;

    const result = await parseDocument(fileName, fileData);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(result));
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown error during document analysis',
      })
    );
  }
}
