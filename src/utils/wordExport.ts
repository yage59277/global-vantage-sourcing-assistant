import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  WidthType,
  AlignmentType,
  BorderStyle,
  HeadingLevel,
  ShadingType,
} from 'docx';
import { RfqItem, RfqMetadata } from '../types/rfq';

export async function exportRfqToWord(metadata: RfqMetadata, items: RfqItem[]) {
  // Define border styles
  const thinBorder = {
    style: BorderStyle.SINGLE,
    size: 1,
    color: 'CCCCCC',
  };

  const borders = {
    top: thinBorder,
    bottom: thinBorder,
    left: thinBorder,
    right: thinBorder,
  };

  // Header Table
  const metaRows = [
    new TableRow({
      children: [
        new TableCell({
          width: { size: 30, type: WidthType.PERCENTAGE },
          shading: { type: ShadingType.CLEAR, fill: 'F1F5F9' },
          children: [new Paragraph({ children: [new TextRun({ text: 'RFQ Reference No:', bold: true, size: 20 })] })],
        }),
        new TableCell({
          width: { size: 70, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ children: [new TextRun({ text: metadata.rfqNumber || 'RFQ-2026-0001', size: 20 })] })],
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          width: { size: 30, type: WidthType.PERCENTAGE },
          shading: { type: ShadingType.CLEAR, fill: 'F1F5F9' },
          children: [new Paragraph({ children: [new TextRun({ text: 'Project / Title:', bold: true, size: 20 })] })],
        }),
        new TableCell({
          width: { size: 70, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ children: [new TextRun({ text: metadata.title || 'Procurement Package', size: 20 })] })],
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          width: { size: 30, type: WidthType.PERCENTAGE },
          shading: { type: ShadingType.CLEAR, fill: 'F1F5F9' },
          children: [new Paragraph({ children: [new TextRun({ text: 'Issue Date:', bold: true, size: 20 })] })],
        }),
        new TableCell({
          width: { size: 70, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ children: [new TextRun({ text: metadata.createdDate || new Date().toISOString().split('T')[0], size: 20 })] })],
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          width: { size: 30, type: WidthType.PERCENTAGE },
          shading: { type: ShadingType.CLEAR, fill: 'F1F5F9' },
          children: [new Paragraph({ children: [new TextRun({ text: 'Bid Submission Deadline:', bold: true, size: 20 })] })],
        }),
        new TableCell({
          width: { size: 70, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ children: [new TextRun({ text: metadata.closingDate || 'As agreed with sourcing agent', size: 20 })] })],
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          width: { size: 30, type: WidthType.PERCENTAGE },
          shading: { type: ShadingType.CLEAR, fill: 'F1F5F9' },
          children: [new Paragraph({ children: [new TextRun({ text: 'Delivery Terms & Currency:', bold: true, size: 20 })] })],
        }),
        new TableCell({
          width: { size: 70, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ children: [new TextRun({ text: `${metadata.deliveryTerms || 'FOB / CIF'} | Currency: ${metadata.currency || 'USD'}`, size: 20 })] })],
        }),
      ],
    }),
  ];

  const metaTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: metaRows,
  });

  // Product Specification Table
  const productHeaders = [
    { text: 'Item', width: 6 },
    { text: 'Product Description & Specs', width: 34 },
    { text: 'Brand / Model', width: 14 },
    { text: 'Qty', width: 8 },
    { text: 'Unit', width: 8 },
    { text: 'Offered Brand / Specs', width: 15 },
    { text: 'Unit Price', width: 15 },
  ];

  const tableHeaderRow = new TableRow({
    children: productHeaders.map(
      (h) =>
        new TableCell({
          width: { size: h.width, type: WidthType.PERCENTAGE },
          shading: { type: ShadingType.CLEAR, fill: '1E3A8A' },
          borders,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: h.text, bold: true, color: 'FFFFFF', size: 18 })],
            }),
          ],
        })
    ),
  });

  const productRows = items.map((item, idx) => {
    return new TableRow({
      children: [
        new TableCell({
          width: { size: 6, type: WidthType.PERCENTAGE },
          borders,
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${item.itemNumber || idx + 1}`, size: 18 })] })],
        }),
        new TableCell({
          width: { size: 34, type: WidthType.PERCENTAGE },
          borders,
          children: [
            new Paragraph({ children: [new TextRun({ text: item.productName, bold: true, size: 19 })] }),
            new Paragraph({ children: [new TextRun({ text: item.specifications, size: 17, color: '333333' })] }),
            ...(item.commercialRequirements
              ? [new Paragraph({ children: [new TextRun({ text: `Req: ${item.commercialRequirements}`, italics: true, size: 15, color: '555555' })] })]
              : []),
          ],
        }),
        new TableCell({
          width: { size: 14, type: WidthType.PERCENTAGE },
          borders,
          children: [new Paragraph({ children: [new TextRun({ text: item.brandModel || 'Open / Equiv.', size: 17 })] })],
        }),
        new TableCell({
          width: { size: 8, type: WidthType.PERCENTAGE },
          borders,
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [new TextRun({ text: item.quantity !== null && item.quantity !== undefined ? `${item.quantity}` : 'TBD', size: 18, bold: true })],
            }),
          ],
        }),
        new TableCell({
          width: { size: 8, type: WidthType.PERCENTAGE },
          borders,
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: item.unit || 'pcs', size: 17 })] })],
        }),
        new TableCell({
          width: { size: 15, type: WidthType.PERCENTAGE },
          shading: { type: ShadingType.CLEAR, fill: 'FAFAFA' },
          borders,
          children: [new Paragraph({ children: [new TextRun({ text: '[Supplier to fill]', size: 16, italics: true, color: '888888' })] })],
        }),
        new TableCell({
          width: { size: 15, type: WidthType.PERCENTAGE },
          shading: { type: ShadingType.CLEAR, fill: 'FAFAFA' },
          borders,
          children: [new Paragraph({ children: [new TextRun({ text: `[${metadata.currency || 'USD'} / unit]`, size: 16, italics: true, color: '888888' })] })],
        }),
      ],
    });
  });

  const productsTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [tableHeaderRow, ...productRows],
  });

  // Create Document structure
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: 'GLOBAL VANTAGE SOURCING ASSISTANT',
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: 'FORMAL REQUEST FOR QUOTATION (RFQ)',
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({ text: '' }),
          metaTable,
          new Paragraph({ text: '' }),
          new Paragraph({
            text: '1. SOURCING SCOPE & INSTRUCTIONS TO BIDDERS',
            heading: HeadingLevel.HEADING_3,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'We are requesting formal quotations for the items detailed below. All offers must state: unit pricing, production lead time, country of origin, packaging specifications, and manufacturer warranty. If proposing technical alternatives, suppliers must clearly note all deviations.',
                size: 20,
              }),
            ],
          }),
          new Paragraph({ text: '' }),
          new Paragraph({
            text: '2. BILL OF QUANTITIES & SPECIFICATIONS',
            heading: HeadingLevel.HEADING_3,
          }),
          productsTable,
          new Paragraph({ text: '' }),
          new Paragraph({
            text: '3. COMMERCIAL TERMS & CONDITIONS',
            heading: HeadingLevel.HEADING_3,
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Quotation Validity: ', bold: true }),
              new TextRun({ text: 'Minimum 45 calendar days from the submission deadline.\n' }),
              new TextRun({ text: 'Delivery Location: ', bold: true }),
              new TextRun({ text: `${metadata.destinationPort || metadata.deliveryTerms || '[Destination Port to be confirmed]'}\n` }),
              new TextRun({ text: 'Quality & Inspection: ', bold: true }),
              new TextRun({ text: 'Factory test certificates (MTR / CE / ISO) must accompany the delivery. Pre-shipment inspection reserved.\n' }),
              new TextRun({ text: 'Payment Terms: ', bold: true }),
              new TextRun({ text: '[Standard Commercial Terms Placeholder: e.g. 30% advance, 70% against original shipping documents]' }),
            ],
          }),
          new Paragraph({ text: '' }),
          new Paragraph({
            text: '4. SUPPLIER AUTHORIZED SIGN-OFF (TO BE COMPLETED BY BIDDER)',
            heading: HeadingLevel.HEADING_3,
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Supplier Company Name: _____________________________________________________\n' }),
              new TextRun({ text: 'Authorized Representative: _______________________  Title: ____________________\n' }),
              new TextRun({ text: 'Date: ________________________   Signature / Stamp: ________________________' }),
            ],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const safeFilename = `${(metadata.rfqNumber || 'RFQ').replace(/[^a-zA-Z0-9_-]/g, '_')}_GlobalVantage_RFQ.docx`;

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = safeFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
