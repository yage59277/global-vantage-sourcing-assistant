import React from 'react';
import { X, Sparkles, ArrowRight, Layers, FileText } from 'lucide-react';
import { SAMPLE_REQUESTS, SampleRequestTemplate } from '../utils/sampleData';

interface SamplePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSample: (sample: SampleRequestTemplate) => void;
}

export const SamplePickerModal: React.FC<SamplePickerModalProps> = ({
  isOpen,
  onClose,
  onSelectSample,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Realistic Synthetic Sample Requests</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          <p className="text-slate-600 leading-relaxed">
            Test the complete sourcing workflow immediately with real-world scenarios featuring
            industrial equipment, multiple line items, technical standards, and real procurement edge
            cases:
          </p>

          <div className="space-y-3">
            {SAMPLE_REQUESTS.map((sample) => (
              <div
                key={sample.id}
                className="border border-slate-200 rounded-xl p-4 hover:border-blue-500 hover:shadow-xs transition bg-slate-50/50 hover:bg-white group"
              >
                <div className="flex items-start justify-between mb-1.5">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded mr-2">
                      {sample.category}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Format: {sample.sourceType}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 mt-1 group-hover:text-blue-700 transition">
                      {sample.title}
                    </h4>
                  </div>

                  <button
                    onClick={() => {
                      onSelectSample(sample);
                      onClose();
                    }}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-xs transition flex items-center space-x-1 shrink-0 ml-3 shadow-xs"
                  >
                    <span>Load Sample</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-slate-600 mb-3">{sample.description}</p>

                <div className="bg-slate-100 rounded p-2.5 font-mono text-[11px] text-slate-700 max-h-24 overflow-hidden relative">
                  <div className="line-clamp-3 whitespace-pre-wrap">{sample.rawText}</div>
                  <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-slate-100 to-transparent" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
