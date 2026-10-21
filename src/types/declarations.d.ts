declare module 'mammoth' {
  interface MammothResult {
    value: string;
    messages: Array<{
      type: string;
      message: string;
    }>;
  }

  export function extractRawText(input: { buffer: Buffer }): Promise<MammothResult>;
  export function convertToHtml(input: { buffer: Buffer }): Promise<MammothResult>;
}

declare module 'pdf-parse' {
  interface PdfData {
    numpages: number;
    numrender: number;
    info: any;
    metadata: any;
    text: string;
    version: string;
  }

  function pdfParse(dataBuffer: Buffer, options?: any): Promise<PdfData>;
  export default pdfParse;
}
