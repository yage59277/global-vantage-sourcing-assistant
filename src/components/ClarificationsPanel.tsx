import React, { useState } from 'react';
import {
  AlertTriangle,
  HelpCircle,
  CheckCircle2,
  Copy,
  Check,
  Send,
  MessageSquare,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { RfqItem, RfqMetadata } from '../types/rfq';

interface ClarificationsPanelProps {
  metadata: RfqMetadata;
  items: RfqItem[];
  onUpdateItem: (updatedItem: RfqItem) => void;
  onProceedToExport: () => void;
}

export const ClarificationsPanel: React.FC<ClarificationsPanelProps> = ({
  metadata,
  items,
  onUpdateItem,
  onProceedToExport,
}) => {
  const [copiedDraft, setCopiedDraft] = useState(false);

  // Collect all items with ambiguities or missing fields
  const itemsWithIssues = items.filter(
    (item) => item.missingFields.length > 0 || item.ambiguityNotes.length > 0 || item.isInferred
  );

  // Generate an automated professional clarification email to the buyer
  const generatedEmailDraft = `Subject: Sourcing Clarification & Technical Verification - ${metadata.title || 'RFQ Inquiry'} [Ref: ${metadata.rfqNumber}]

Dear Client / Procurement Team,

Thank you for providing the sourcing requirements. Our engineering team has prepared the initial bill of quantities for supplier tender. 

To ensure exact supplier pricing and avoid costly deviations, please clarify the following technical parameters:

${itemsWithIssues
  .map((item) => {
    const questions = item.buyerQuestions.length > 0
      ? item.buyerQuestions.map((q) => `  • ${q}`).join('\n')
      : item.missingFields.map((mf) => `  • Please confirm: ${mf}`).join('\n');
    return `Item #${item.itemNumber} - ${item.productName}:\n${questions || '  • Please confirm if technical alternatives to the requested brand are acceptable.'}`;
  })
  .join('\n\n')}

Delivery Terms & Commercial Schedule:
• Confirmed Destination: ${metadata.destinationPort || metadata.deliveryTerms || '[Please specify target port or delivery address]'}
• Target Delivery Date: ${metadata.closingDate || '[Please specify required on-site date]'}

Once you confirm these points, we will immediately issue the standardized RFQ package to qualified manufacturers.

Best regards,
Global Vantage Sourcing Team`;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(generatedEmailDraft);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2500);
  };

  const handleResolveIssue = (item: RfqItem, issueType: 'missing' | 'ambiguity', text: string) => {
    const updated = { ...item };
    if (issueType === 'missing') {
      updated.missingFields = updated.missingFields.filter((f) => f !== text);
    } else {
      updated.ambiguityNotes = updated.ambiguityNotes.filter((a) => a !== text);
    }
    // If no more issues, mark reviewed
    if (updated.missingFields.length === 0 && updated.ambiguityNotes.length === 0) {
      updated.isReviewed = true;
    }
    onUpdateItem(updated);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Overview Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-700 text-xs font-semibold uppercase tracking-wider mb-1">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Buyer Ambiguity &amp; Technical Gap Resolution</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Review Flagged Items Before Sending to Suppliers
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl mt-1 leading-relaxed">
            Sending incomplete RFQs to factories results in inaccurate quotes, prolonged email loops,
            or unexpected change orders. Review the missing engineering parameters identified below,
            or send the generated clarification email to your buyer.
          </p>
        </div>

        <button
          onClick={onProceedToExport}
          className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm flex items-center space-x-2 transition shrink-0"
        >
          <span>Proceed to RFQ Export</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Flagged Items & Resolution checklist (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-sm font-semibold text-slate-800 flex items-center justify-between">
            <span>Itemized Technical Ambiguities ({itemsWithIssues.length})</span>
            <span className="text-xs font-normal text-slate-500">
              Click 'Resolve' once confirmed with buyer
            </span>
          </h3>

          {itemsWithIssues.length === 0 ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-8 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
              <h4 className="text-base font-semibold text-emerald-900">
                All Specifications Verified!
              </h4>
              <p className="text-xs text-emerald-700 max-w-md mx-auto mt-1 mb-4">
                No unresolved technical ambiguities or missing critical parameters remain. Your RFQ
                package is ready for export to suppliers.
              </p>
              <button
                onClick={onProceedToExport}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold shadow-sm transition"
              >
                Go to Export Generation
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {itemsWithIssues.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">
                          Item #{item.itemNumber}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">{item.productName}</h4>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {item.specifications}
                      </p>
                    </div>

                    {item.isInferred && (
                      <span className="text-[10px] bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full font-medium shrink-0 flex items-center">
                        <Sparkles className="w-2.5 h-2.5 mr-1" />
                        Inferred Specs
                      </span>
                    )}
                  </div>

                  {/* Missing Fields list */}
                  {item.missingFields.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      <span className="text-[11px] font-semibold text-red-700 uppercase tracking-wide flex items-center">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Missing Critical Parameters:
                      </span>
                      {item.missingFields.map((mf, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between bg-red-50/70 border border-red-200/60 rounded-lg p-2 text-xs text-red-900"
                        >
                          <span>{mf}</span>
                          <button
                            onClick={() => handleResolveIssue(item, 'missing', mf)}
                            className="text-[11px] bg-white text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 px-2 py-0.5 rounded border border-slate-200 transition font-medium ml-2 shrink-0"
                          >
                            Mark Resolved
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Ambiguity Notes list */}
                  {item.ambiguityNotes.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wide flex items-center">
                        <HelpCircle className="w-3 h-3 mr-1" />
                        Ambiguity / Conflicting Detail:
                      </span>
                      {item.ambiguityNotes.map((note, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between bg-amber-50/70 border border-amber-200/60 rounded-lg p-2 text-xs text-amber-900"
                        >
                          <span>{note}</span>
                          <button
                            onClick={() => handleResolveIssue(item, 'ambiguity', note)}
                            className="text-[11px] bg-white text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 px-2 py-0.5 rounded border border-slate-200 transition font-medium ml-2 shrink-0"
                          >
                            Mark Resolved
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Buyer clarification prompt question */}
                  {item.buyerQuestions.length > 0 && (
                    <div className="bg-slate-50 rounded-lg p-2.5 text-xs text-slate-700 border border-slate-200/80">
                      <span className="font-semibold text-blue-700 block mb-1 flex items-center">
                        <MessageSquare className="w-3 h-3 mr-1" />
                        Suggested Question for Buyer:
                      </span>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                        {item.buyerQuestions.map((q, i) => (
                          <li key={i} className="text-[11px]">
                            {q}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Pre-drafted Buyer Clarification Email (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm sticky top-28">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center">
                <Send className="w-4 h-4 mr-2 text-blue-600" />
                Client Clarification Email Draft
              </h3>
              <button
                onClick={handleCopyEmail}
                className="inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 transition"
              >
                {copiedDraft ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                    Copied to Clipboard!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 mr-1" />
                    Copy Email
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Copy and send this directly to your client via email or messaging app to collect the
              missing answers in one go.
            </p>

            <div className="bg-slate-900 text-slate-100 rounded-lg p-4 font-mono text-[11px] leading-relaxed max-h-[480px] overflow-y-auto whitespace-pre-wrap select-all border border-slate-800 shadow-inner">
              {generatedEmailDraft}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
              Tip: As your client replies, open the Product Matrix tab to update the row
              specifications before final export.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
