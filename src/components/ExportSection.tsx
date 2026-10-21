import React, { useState } from 'react';
import {
  FileSpreadsheet,
  FileText,
  Copy,
  Check,
  Eye,
  Download,
  Building2,
  Calendar,
  Globe,
  DollarSign,
  Printer,
  Sparkles,
} from 'lucide-react';
import { RfqItem, RfqMetadata } from '../types/rfq';
import { exportRfqToExcel } from '../utils/excelExport';
import { exportRfqToWord } from '../utils/wordExport';

interface ExportSectionProps {
  metadata: RfqMetadata;
  items: RfqItem[];
  onUpdateMetadata: (meta: RfqMetadata) => void;
}

export const ExportSection: React.FC<ExportSectionProps> = ({
  metadata,
  items,
  onUpdateMetadata,
}) => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [isExportingWord, setIsExportingWord] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [activePreviewMode, setActivePreviewMode] = useState<'document' | 'email'>('document');

  const [exportFeedback, setExportFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleExcelExport = () => {
    setIsExportingExcel(true);
    setExportFeedback(null);
    try {
      exportRfqToExcel(metadata, items);
      setExportFeedback({ type: 'success', message: 'Excel workbook (.xlsx) downloaded successfully.' });
      setTimeout(() => setExportFeedback(null), 4000);
    } catch (err: any) {
      setExportFeedback({ type: 'error', message: `Export failed: ${err.message}` });
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handleWordExport = async () => {
    setIsExportingWord(true);
    setExportFeedback(null);
    try {
      await exportRfqToWord(metadata, items);
      setExportFeedback({ type: 'success', message: 'Word RFQ document (.docx) downloaded successfully.' });
      setTimeout(() => setExportFeedback(null), 4000);
    } catch (err: any) {
      setExportFeedback({ type: 'error', message: `Word export failed: ${err.message}` });
    } finally {
      setIsExportingWord(false);
    }
  };

  // Plain Text / Supplier Invitation Email draft
  const supplierEmailText = `REQUEST FOR QUOTATION (RFQ) - ${metadata.title || 'Procurement Package'}
RFQ Reference Number: ${metadata.rfqNumber || 'RFQ-2026-0001'}
Date of Issue: ${metadata.createdDate || new Date().toISOString().split('T')[0]}
Submission Deadline: ${metadata.closingDate || '[Date to be confirmed]'}
Target Delivery Terms: ${metadata.deliveryTerms || 'FOB / CIF as specified'}
Target Currency: ${metadata.currency || 'USD'}

Dear Valued Supplier / Sales Manager,

Global Vantage is currently accepting formal bids on behalf of our client for the following standardized equipment package. 

Please review the bill of quantities below and reply with your official quotation, indicating:
1. Unit Price & Extended Price (${metadata.currency || 'USD'})
2. Production Lead Time / Estimated Ship Date
3. Technical compliance or proposed brand/model equivalent
4. Quotation Validity (Minimum 45 days required)

--- BILL OF QUANTITIES & SPECIFICATIONS ---
${items
  .map(
    (item, idx) =>
      `Item #${item.itemNumber || idx + 1}: ${item.productName}
• Required Qty: ${item.quantity !== null && item.quantity !== undefined ? item.quantity : 'TBD'} ${item.unit || 'pcs'}
• Brand / Model: ${item.brandModel || 'Open to qualified equivalents'}
• Specifications: ${item.specifications}
• Delivery Requirement: ${item.targetDeliveryLocation || metadata.deliveryTerms || 'Per RFQ terms'} ${item.targetDeliveryDate ? `(By: ${item.targetDeliveryDate})` : ''}
${item.commercialRequirements ? `• Standards & Testing: ${item.commercialRequirements}` : ''}`
  )
  .join('\n\n')}

--- GENERAL COMMERCIAL INSTRUCTIONS ---
• Material Test Reports (MTR / EN 10204 3.1) and CE / ISO quality certificates are required where applicable.
• Packaging: Export-grade seaworthy packaging with complete packing list.
• Payment Terms: [Standard Commercial Terms Placeholder: e.g., 30% advance, 70% against Bill of Lading]

Please send your formal PDF quotation and technical submittals to our procurement desk by ${metadata.closingDate || 'the specified deadline'}.

Best regards,
Procurement & Tender Desk
Global Vantage Sourcing Assistant`;

  const handleCopySupplierEmail = () => {
    navigator.clipboard.writeText(supplierEmailText);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Export Header & Action Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Step 4 • Supplier-Ready RFQ Package</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2">
            Generate Official Supplier Tender Documents
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Download professional, factory-ready RFQ files. Includes clear item descriptions,
            specifications, quantities, and pre-formatted columns for suppliers to enter their prices
            and lead times.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={handleExcelExport}
            disabled={isExportingExcel}
            className="px-4 py-2.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white transition flex items-center space-x-2 shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Download Excel (.xlsx)</span>
          </button>

          <button
            onClick={handleWordExport}
            disabled={isExportingWord}
            className="px-4 py-2.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 rounded-lg text-white transition flex items-center space-x-2 shadow-sm"
          >
            <FileText className="w-4 h-4" />
            <span>Download Word (.docx)</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition border border-slate-700 flex items-center space-x-1.5"
            title="Print or Save as PDF"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Export notification banner */}
      {exportFeedback && (
        <div
          className={`p-3.5 rounded-lg text-xs font-medium flex items-center space-x-2 ${
            exportFeedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>{exportFeedback.message}</span>
        </div>
      )}

      {/* RFQ Metadata & Commercial Terms Customization */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-3 flex items-center">
          <Building2 className="w-4 h-4 mr-2 text-blue-600" />
          RFQ Header &amp; Commercial Terms (Editable Placeholders)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">RFQ Reference Code</label>
            <input
              type="text"
              value={metadata.rfqNumber}
              onChange={(e) => onUpdateMetadata({ ...metadata, rfqNumber: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Inquiry / Project Title</label>
            <input
              type="text"
              value={metadata.title}
              onChange={(e) => onUpdateMetadata({ ...metadata, title: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Delivery Terms (Incoterms)</label>
            <input
              type="text"
              value={metadata.deliveryTerms}
              onChange={(e) => onUpdateMetadata({ ...metadata, deliveryTerms: e.target.value })}
              placeholder="e.g. FOB Houston or CIF Rotterdam"
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Target Currency</label>
            <select
              value={metadata.currency}
              onChange={(e) => onUpdateMetadata({ ...metadata, currency: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 bg-white"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="CNY">CNY (¥)</option>
              <option value="JPY">JPY (¥)</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Issue Date</label>
            <input
              type="date"
              value={metadata.createdDate}
              onChange={(e) => onUpdateMetadata({ ...metadata, createdDate: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Bid Submission Due Date</label>
            <input
              type="date"
              value={metadata.closingDate}
              onChange={(e) => onUpdateMetadata({ ...metadata, closingDate: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Destination Port / Site</label>
            <input
              type="text"
              value={metadata.destinationPort}
              onChange={(e) => onUpdateMetadata({ ...metadata, destinationPort: e.target.value })}
              placeholder="e.g. Port of Houston, TX"
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Client Reference Code</label>
            <input
              type="text"
              value={metadata.clientReference}
              onChange={(e) => onUpdateMetadata({ ...metadata, clientReference: e.target.value })}
              placeholder="Optional internal ref"
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>
        </div>
      </div>

      {/* Document Preview Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActivePreviewMode('document')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition flex items-center space-x-1.5 ${
                activePreviewMode === 'document'
                  ? 'bg-white text-blue-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Official RFQ Document Layout</span>
            </button>
            <button
              onClick={() => setActivePreviewMode('email')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition flex items-center space-x-1.5 ${
                activePreviewMode === 'email'
                  ? 'bg-white text-blue-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Supplier Outreach Email Draft</span>
            </button>
          </div>

          {activePreviewMode === 'email' && (
            <button
              onClick={handleCopySupplierEmail}
              className="inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-md border border-blue-200 transition"
            >
              {copiedEmail ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  Copied Email to Clipboard!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1" />
                  Copy Email Text
                </>
              )}
            </button>
          )}
        </div>

        {/* Preview content */}
        <div className="p-8">
          {activePreviewMode === 'document' ? (
            <div className="max-w-4xl mx-auto bg-white border border-slate-300 rounded-lg p-8 sm:p-12 shadow-md font-sans text-slate-800 print:border-none print:shadow-none print:p-0">
              {/* Document Header */}
              <div className="text-center border-b-2 border-slate-800 pb-6 mb-6">
                <span className="text-xs font-bold tracking-widest text-blue-800 uppercase">
                  Global Vantage Sourcing Assistant
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                  REQUEST FOR QUOTATION (RFQ)
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Standardized Technical Specifications &amp; Bid Schedule
                </p>
              </div>

              {/* Meta Grid */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs mb-8">
                <div>
                  <span className="font-semibold text-slate-500 block">RFQ Reference:</span>
                  <span className="font-bold text-slate-900 font-mono text-sm">
                    {metadata.rfqNumber || 'RFQ-2026-0001'}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-slate-500 block">Issue Date:</span>
                  <span className="text-slate-900 font-medium">
                    {metadata.createdDate || new Date().toISOString().split('T')[0]}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-slate-500 block">Project Title:</span>
                  <span className="text-slate-900 font-semibold">{metadata.title}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-500 block">Closing / Due Date:</span>
                  <span className="text-slate-900 font-semibold text-red-700">
                    {metadata.closingDate || 'To be specified'}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-slate-500 block">Delivery Terms:</span>
                  <span className="text-slate-900">{metadata.deliveryTerms || 'FOB / CIF'}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-500 block">Currency:</span>
                  <span className="text-slate-900 font-bold">{metadata.currency || 'USD'}</span>
                </div>
              </div>

              {/* Section 1: Instructions */}
              <div className="mb-6">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-1 mb-2">
                  1. Sourcing Scope &amp; Instructions to Bidders
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Suppliers are invited to submit competitive quotations for the equipment specified
                  below. All quotations must clearly state: unit price, extended total price,
                  production lead time, country of origin, and compliance with the technical
                  standards. If proposing technical alternatives, all deviations must be declared in
                  writing.
                </p>
              </div>

              {/* Section 2: Product Table */}
              <div className="mb-8 overflow-x-auto">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-1 mb-3">
                  2. Bill of Quantities &amp; Technical Specifications
                </h2>
                <table className="w-full text-left text-xs border border-slate-300 divide-y divide-slate-300">
                  <thead className="bg-slate-100 font-semibold text-slate-800">
                    <tr>
                      <th className="p-2 border-r border-slate-300 text-center w-10">#</th>
                      <th className="p-2 border-r border-slate-300">Product &amp; Specifications</th>
                      <th className="p-2 border-r border-slate-300 w-28">Brand / Model</th>
                      <th className="p-2 border-r border-slate-300 text-right w-16">Qty</th>
                      <th className="p-2 border-r border-slate-300 text-center w-14">Unit</th>
                      <th className="p-2 border-r border-slate-300 bg-blue-50/50 text-blue-900 w-28">
                        Offered Brand
                      </th>
                      <th className="p-2 bg-blue-50/50 text-blue-900 text-right w-24">Unit Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {items.map((item, idx) => (
                      <tr key={item.id}>
                        <td className="p-2 border-r border-slate-200 text-center font-mono text-slate-500">
                          {item.itemNumber || idx + 1}
                        </td>
                        <td className="p-2 border-r border-slate-200">
                          <div className="font-bold text-slate-900">{item.productName}</div>
                          <div className="text-[11px] text-slate-600 mt-0.5 whitespace-pre-wrap">
                            {item.specifications}
                          </div>
                          {item.commercialRequirements && (
                            <div className="text-[10px] text-slate-500 italic mt-1">
                              Req: {item.commercialRequirements}
                            </div>
                          )}
                        </td>
                        <td className="p-2 border-r border-slate-200 text-slate-700">
                          {item.brandModel || 'Open / Equiv.'}
                        </td>
                        <td className="p-2 border-r border-slate-200 text-right font-mono font-bold text-slate-900">
                          {item.quantity !== null && item.quantity !== undefined
                            ? item.quantity.toLocaleString()
                            : 'TBD'}
                        </td>
                        <td className="p-2 border-r border-slate-200 text-center text-slate-700">
                          {item.unit || 'pcs'}
                        </td>
                        <td className="p-2 border-r border-slate-200 bg-slate-50 text-slate-400 text-center italic">
                          [Supplier fill]
                        </td>
                        <td className="p-2 bg-slate-50 text-slate-400 text-right italic">
                          [${metadata.currency}]
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Section 3: Commercial Placeholders */}
              <div className="mb-8">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-1 mb-2">
                  3. Standard Commercial Terms
                </h2>
                <div className="text-xs text-slate-700 space-y-1.5">
                  <p>
                    <span className="font-semibold">Quotation Validity:</span> Minimum 45 calendar
                    days from submission closing date.
                  </p>
                  <p>
                    <span className="font-semibold">Quality Certifications:</span> Factory inspection
                    certificates (e.g. EN 10204 3.1 / CE / ISO) must be provided prior to dispatch.
                  </p>
                  <p>
                    <span className="font-semibold">Packaging &amp; Marking:</span> ISPM-15 compliant
                    export wooden crates with legible item markings.
                  </p>
                  <p>
                    <span className="font-semibold">Payment Terms:</span> [Standard Commercial Terms
                    Placeholder: e.g. 30% advance, 70% against original shipping documents]
                  </p>
                </div>
              </div>

              {/* Section 4: Signature / Stamp Block */}
              <div className="border-t border-slate-300 pt-6 mt-8">
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-4">
                  4. Supplier Authorization &amp; Formal Stamp
                </h2>
                <div className="grid grid-cols-2 gap-8 text-xs text-slate-600">
                  <div>
                    <div className="border-b border-slate-300 pb-1 mb-2">Company Name:</div>
                    <div className="border-b border-slate-300 pb-1 mb-2">Signatory Name &amp; Title:</div>
                  </div>
                  <div>
                    <div className="border-b border-slate-300 pb-1 mb-2">Official Stamp / Seal:</div>
                    <div className="border-b border-slate-300 pb-1 mb-2">Date:</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              <div className="bg-slate-900 text-slate-100 rounded-lg p-6 font-mono text-xs leading-relaxed whitespace-pre-wrap select-all border border-slate-800 shadow-inner">
                {supplierEmailText}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
