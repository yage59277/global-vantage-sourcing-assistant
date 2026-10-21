import React, { useRef } from 'react';
import {
  X,
  FolderOpen,
  Calendar,
  Layers,
  Trash2,
  Download,
  Upload,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { SourcingRequest } from '../types/rfq';

interface SavedRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedRequests: SourcingRequest[];
  onSelectRequest: (request: SourcingRequest) => void;
  onDeleteRequest: (id: string) => void;
  onExportAll: () => void;
  onImportAll: (data: SourcingRequest[]) => void;
}

export const SavedRequestsModal: React.FC<SavedRequestsModalProps> = ({
  isOpen,
  onClose,
  savedRequests,
  onSelectRequest,
  onDeleteRequest,
  onExportAll,
  onImportAll,
}) => {
  if (!isOpen) return null;

  const importInputRef = useRef<HTMLInputElement>(null);
  const [feedbackMessage, setFeedbackMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (Array.isArray(parsed)) {
          onImportAll(parsed);
          setFeedbackMessage({ type: 'success', text: `Successfully imported ${parsed.length} sourcing requests!` });
          setTimeout(() => setFeedbackMessage(null), 4000);
        } else {
          setFeedbackMessage({ type: 'error', text: 'Invalid file format: Expected an array of sourcing requests.' });
        }
      } catch (err: any) {
        setFeedbackMessage({ type: 'error', text: `Failed to import file: ${err.message}` });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FolderOpen className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold text-white">Sourcing Request Library</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Storage Transparency Notice */}
        <div className="bg-amber-50/80 border-b border-amber-200/80 px-6 py-2.5 text-[11px] text-amber-900 flex items-start space-x-2">
          <span className="font-semibold shrink-0">Data Notice:</span>
          <span>
            Requests are stored in this browser&apos;s <strong>LocalStorage (this device only)</strong>. There is no cloud user account, remote database, or cross-device sync. Clearing browser cookies or site data will remove these items. Use <strong>Export Backup</strong> to download a portable JSON file.
          </span>
        </div>

        {/* Toolbar */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-600 font-medium">
            Browser Storage: {savedRequests.length} {savedRequests.length === 1 ? 'request' : 'requests'}
          </span>
          <div className="flex items-center space-x-2">
            <input
              ref={importInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImportFile}
            />
            <button
              onClick={() => importInputRef.current?.click()}
              className="px-2.5 py-1 text-slate-700 bg-white hover:bg-slate-100 rounded border border-slate-300 font-medium flex items-center space-x-1"
            >
              <Upload className="w-3.5 h-3.5 mr-1" />
              Import Backup
            </button>
            <button
              onClick={onExportAll}
              className="px-2.5 py-1 text-slate-700 bg-white hover:bg-slate-100 rounded border border-slate-300 font-medium flex items-center space-x-1"
            >
              <Download className="w-3.5 h-3.5 mr-1" />
              Export Backup
            </button>
          </div>
        </div>

        {feedbackMessage && (
          <div
            className={`px-6 py-2 text-xs font-medium border-b ${
              feedbackMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-red-50 text-red-800 border-red-200'
            }`}
          >
            {feedbackMessage.text}
          </div>
        )}

        {/* List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1 text-xs">
          {savedRequests.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-700">No saved requests found</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Requests you standardize are saved locally so you can resume anytime.
              </p>
            </div>
          ) : (
            savedRequests.map((req) => (
              <div
                key={req.metadata.id}
                className="bg-white border border-slate-200 rounded-lg p-4 hover:border-blue-400 hover:shadow-xs transition flex items-center justify-between group"
              >
                <div className="flex-1 pr-4">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-bold">
                      {req.metadata.rfqNumber || 'RFQ'}
                    </span>
                    <h4 className="font-bold text-slate-900 group-hover:text-blue-700 transition">
                      {req.metadata.title || 'Untitled Request'}
                    </h4>
                  </div>
                  <div className="flex items-center space-x-4 text-slate-500 text-[11px] mt-1.5">
                    <span className="flex items-center">
                      <Layers className="w-3 h-3 mr-1 text-slate-400" />
                      {req.items.length} items
                    </span>
                    <span className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1 text-slate-400" />
                      {req.metadata.createdDate}
                    </span>
                    <span className="text-slate-400">
                      Incoterms: {req.metadata.deliveryTerms || 'FOB'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      onSelectRequest(req);
                      onClose();
                    }}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md font-semibold text-xs transition flex items-center space-x-1"
                  >
                    <span>Open</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </button>
                  <button
                    onClick={() => onDeleteRequest(req.metadata.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                    title="Delete saved request"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
