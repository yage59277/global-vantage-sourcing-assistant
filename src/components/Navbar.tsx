import React from 'react';
import {
  FileText,
  PlusCircle,
  FolderOpen,
  HelpCircle,
  Sparkles,
  Download,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { SourcingRequest } from '../types/rfq';

interface NavbarProps {
  currentRequest: SourcingRequest;
  onNewRequest: () => void;
  onOpenSavedModal: () => void;
  onOpenGuideModal: () => void;
  onOpenSampleModal: () => void;
  activeTab: 'ingest' | 'table' | 'clarifications' | 'export';
  setActiveTab: (tab: 'ingest' | 'table' | 'clarifications' | 'export') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRequest,
  onNewRequest,
  onOpenSavedModal,
  onOpenGuideModal,
  onOpenSampleModal,
  activeTab,
  setActiveTab,
}) => {
  const itemCount = currentRequest.items.length;
  const ambiguitiesCount = currentRequest.items.reduce(
    (acc, item) => acc + item.missingFields.length + item.ambiguityNotes.length,
    0
  );
  const reviewedCount = currentRequest.items.filter((i) => i.isReviewed).length;

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Product Identity */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-inner font-bold text-xl tracking-wider">
              GV
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-lg tracking-tight text-white">
                  Global Vantage
                </span>
                <span className="text-xs bg-blue-500/20 text-blue-300 font-medium px-2 py-0.5 rounded border border-blue-500/30">
                  Request Standardizer v1.0
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Buyer Sourcing Ingestion &amp; Supplier RFQ Engine
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenSampleModal}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 transition"
              title="Load realistic industrial sample RFQs"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
              <span className="hidden md:inline">Sample</span> Requests
            </button>

            <button
              onClick={onOpenSavedModal}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 transition"
              title="Locally saved requests (stored in this browser, no cloud account)"
            >
              <FolderOpen className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
              <span className="hidden md:inline">Saved</span> Library
            </button>

            <button
              onClick={onOpenGuideModal}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 transition"
              title="Windows Beginner Run & Maintenance Guide"
            >
              <HelpCircle className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
              <span className="hidden lg:inline">Windows</span> Guide
            </button>

            <button
              onClick={onNewRequest}
              className="inline-flex items-center px-3.5 py-1.5 text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-500 shadow-sm transition"
            >
              <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
              New Sourcing Request
            </button>
          </div>
        </div>

        {/* Workflow Navigation Bar */}
        <div className="flex items-center justify-between border-t border-slate-800/80 py-2.5 overflow-x-auto text-xs">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab('ingest')}
              className={`px-3 py-1.5 rounded-md font-medium transition flex items-center space-x-1.5 ${
                activeTab === 'ingest'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>1. Ingest &amp; Parse</span>
            </button>

            <button
              onClick={() => setActiveTab('table')}
              className={`px-3 py-1.5 rounded-md font-medium transition flex items-center space-x-1.5 ${
                activeTab === 'table'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span>2. Product Matrix</span>
              {itemCount > 0 && (
                <span className="bg-slate-700 px-1.5 py-0.5 rounded-full text-[10px] text-slate-200 font-bold">
                  {itemCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('clarifications')}
              className={`px-3 py-1.5 rounded-md font-medium transition flex items-center space-x-1.5 ${
                activeTab === 'clarifications'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span>3. Ambiguities &amp; Review</span>
              {ambiguitiesCount > 0 && (
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded-full text-[10px] font-bold flex items-center">
                  <AlertTriangle className="w-2.5 h-2.5 mr-0.5" />
                  {ambiguitiesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('export')}
              className={`px-3 py-1.5 rounded-md font-medium transition flex items-center space-x-1.5 ${
                activeTab === 'export'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>4. RFQ Export</span>
            </button>
          </div>

          {/* Status summary pill */}
          <div className="hidden md:flex items-center space-x-3 text-slate-400 text-[11px] pl-4">
            <span className="truncate max-w-[200px] text-slate-300 font-medium">
              Ref: {currentRequest.metadata.rfqNumber || 'Draft RFQ'}
            </span>
            <span className="h-3 w-px bg-slate-700" />
            <span className="flex items-center text-slate-300">
              <CheckCircle2 className="w-3 h-3 text-emerald-400 mr-1" />
              {reviewedCount} of {itemCount} Verified
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
