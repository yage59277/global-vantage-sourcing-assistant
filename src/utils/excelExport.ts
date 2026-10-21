import * as XLSX from 'xlsx';
import { RfqItem, RfqMetadata } from '../types/rfq';

export function exportRfqToExcel(metadata: RfqMetadata, items: RfqItem[]) {
  const wb = XLSX.utils.book_new();

  // Create Header Rows
  const sheetData: any[][] = [
    ['GLOBAL VANTAGE SOURCING ASSISTANT - OFFICIAL REQUEST FOR QUOTATION (RFQ)'],
    [''],
    ['RFQ Reference Number:', metadata.rfqNumber || 'RFQ-2026-0001', '', 'Issue Date:', metadata.createdDate || new Date().toISOString().split('T')[0]],
    ['Project / Inquiry Title:', metadata.title || 'Standardized Sourcing Request', '', 'Closing / Bid Due Date:', metadata.closingDate || ''],
    ['Client Reference:', metadata.clientReference || 'N/A', '', 'Target Currency:', metadata.currency || 'USD'],
    ['Delivery Terms (Incoterms):', metadata.deliveryTerms || 'FOB / CIF as specified', '', 'Destination Port / Site:', metadata.destinationPort || 'As stated below'],
    ['Special Instructions:', metadata.specialInstructions || 'Please provide formal validity, data sheets, and inspection certificates with your offer.'],
    [''],
    [
      'SUPPLIER INSTRUCTIONS: Columns [A-H] specify the buyer requirements. Columns [I-O] (Supplier Bid Section) must be completed by the quoting supplier / factory.',
    ],
    [''],
    // Table Headers
    [
      'Item #',
      'Product Name',
      'Category',
      'Brand / Model Requirement',
      'Detailed Technical Specifications & Standards',
      'Quantity',
      'Unit',
      'Target Delivery Terms & Location',
      '-- SUPPLIER OFFERED BRAND / MODEL --',
      '-- SUPPLIER TECHNICAL COMPLIANCE (Full / Deviation) --',
      `-- SUPPLIER UNIT PRICE (${metadata.currency || 'USD'}) --`,
      `-- SUPPLIER TOTAL PRICE (${metadata.currency || 'USD'}) --`,
      '-- PRODUCTION LEAD TIME (Days) --',
      '-- COUNTRY OF ORIGIN --',
      '-- SUPPLIER REMARKS & PACKAGING NOTES --',
    ],
  ];

  // Data rows
  items.forEach((item, idx) => {
    sheetData.push([
      item.itemNumber || idx + 1,
      item.productName,
      item.category || '',
      item.brandModel || 'Unspecified / Open to equivalent',
      item.specifications,
      item.quantity !== null && item.quantity !== undefined ? item.quantity : '[To be confirmed]',
      item.unit || 'pcs',
      `${item.targetDeliveryLocation || metadata.deliveryTerms || ''} ${item.targetDeliveryDate ? `(By: ${item.targetDeliveryDate})` : ''}`.trim(),
      // Supplier fill-in blank placeholders
      '', // Offered Brand/Model
      '', // Compliance
      '', // Unit price
      '', // Total price formula or blank
      '', // Lead time
      '', // Country of origin
      item.commercialRequirements ? `Buyer Note: ${item.commercialRequirements}` : '',
    ]);
  });

  // Footer notes
  sheetData.push(['']);
  sheetData.push(['COMMERCIAL & SUBMISSION REQUIREMENTS:']);
  sheetData.push(['1. Quotation Validity:', 'All submitted prices must remain valid for a minimum of 45 calendar days from the bid closing date.']);
  sheetData.push(['2. Technical Submittals:', 'Please attach product technical data sheets, dimension drawings, and factory certifications (ISO/CE/API).']);
  sheetData.push(['3. Quality & Inspection:', 'Buyer or third-party inspection (SGS/TUV/Bureau Veritas) may be performed prior to shipment.']);
  sheetData.push(['4. Packaging:', 'All equipment must be packed in seaworthy/airworthy wooden crates compliant with ISPM-15.']);
  sheetData.push(['5. Payment Terms:', '[Editable Placeholder: e.g. 30% advance, 70% against copy of Bill of Lading]']);

  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  // Set column widths for clean readability
  ws['!cols'] = [
    { wch: 8 },  // Item #
    { wch: 28 }, // Product Name
    { wch: 18 }, // Category
    { wch: 24 }, // Brand / Model
    { wch: 45 }, // Technical Specifications
    { wch: 12 }, // Quantity
    { wch: 10 }, // Unit
    { wch: 26 }, // Target Delivery
    { wch: 26 }, // Supplier Offered Brand
    { wch: 28 }, // Supplier Compliance
    { wch: 20 }, // Unit Price
    { wch: 20 }, // Total Price
    { wch: 18 }, // Lead time
    { wch: 18 }, // Country of origin
    { wch: 35 }, // Remarks
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'RFQ Specifications');

  // Trigger download
  const safeFilename = `${(metadata.rfqNumber || 'RFQ').replace(/[^a-zA-Z0-9_-]/g, '_')}_GlobalVantage_RFQ.xlsx`;
  XLSX.writeFile(wb, safeFilename);
}
