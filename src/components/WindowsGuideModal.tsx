import React from 'react';
import { X, Terminal, CheckCircle2, AlertTriangle, HelpCircle, Code, Cpu, Monitor } from 'lucide-react';

interface WindowsGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WindowsGuideModal: React.FC<WindowsGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Monitor className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-base font-bold text-white">
                Windows Beginner Guide: Run, Test &amp; Maintain
              </h3>
              <p className="text-[11px] text-slate-400">
                Step-by-step instructions for running this application on Windows 10/11
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 leading-relaxed">
          {/* Step 1: Prerequisites */}
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 space-y-2">
            <h4 className="font-bold text-slate-900 text-sm flex items-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-1.5" />
              1. Prerequisites on Windows
            </h4>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li>
                <strong>Node.js (LTS version 20 or 22):</strong> Download and install from{' '}
                <span className="font-mono text-blue-600">https://nodejs.org</span>. Check "Automatically install the necessary tools".
              </li>
              <li>
                <strong>Terminal:</strong> Use <em>Windows Terminal</em>, <em>PowerShell</em>, or <em>VS Code built-in terminal</em>.
              </li>
              <li>
                <strong>Verification in PowerShell:</strong> Type <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">node -v</code> and <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">npm -v</code> to verify installation.
              </li>
            </ul>
          </div>

          {/* Step 2: Setup & Environment Variables */}
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 space-y-2">
            <h4 className="font-bold text-slate-900 text-sm flex items-center">
              <Terminal className="w-4 h-4 text-blue-600 mr-1.5" />
              2. Installing Dependencies &amp; Environment Setup
            </h4>
            <p>In your project folder in PowerShell or Command Prompt:</p>
            <div className="bg-slate-900 text-slate-100 p-3 rounded font-mono text-[11px] space-y-1">
              <p className="text-emerald-400"># 1. Install all dependencies</p>
              <p>npm install</p>
              <p className="text-emerald-400 mt-2"># 2. Configure Gemini API Key (Required for AI extraction)</p>
              <p>copy .env.example .env</p>
            </div>
            <p className="text-[11px] text-slate-500">
              Open the created <code className="font-mono">.env</code> file in Notepad or VS Code and set your key:
              <br />
              <code className="font-mono text-slate-800">GEMINI_API_KEY=your_gemini_api_key_here</code>
            </p>
          </div>

          {/* Step 3: Running Dev Server */}
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 space-y-2">
            <h4 className="font-bold text-slate-900 text-sm flex items-center">
              <Cpu className="w-4 h-4 text-amber-600 mr-1.5" />
              3. Starting the Full-Stack Server
            </h4>
            <div className="bg-slate-900 text-slate-100 p-3 rounded font-mono text-[11px] space-y-1">
              <p className="text-emerald-400"># Start both Express backend and Vite frontend together</p>
              <p>npm run dev</p>
            </div>
            <p>
              Open your browser at <span className="font-mono text-blue-600 font-semibold">http://localhost:3000</span>.
              The backend handles document parsing (.xlsx, .docx, .pdf) and secure Gemini AI calls, while Vite serves the React UI.
            </p>
          </div>

          {/* Step 4: Testing & Verification Workflow */}
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 space-y-2">
            <h4 className="font-bold text-slate-900 text-sm flex items-center">
              <Code className="w-4 h-4 text-purple-600 mr-1.5" />
              4. Verification Checklist Before Going to Production
            </h4>
            <div className="space-y-1.5">
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                <span>
                  <strong>Upload &amp; Extract:</strong> Upload an Excel, Word, or PDF file, or click one of the 3 realistic industrial sample buttons.
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                <span>
                  <strong>Edits Survive:</strong> Edit product names, quantities, or specs in the table. Verify the edits remain unchanged when navigating to Step 3 and Step 4.
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                <span>
                  <strong>Download Excel &amp; Word:</strong> Click "Download Excel (.xlsx)" and "Download Word (.docx)". Open both files in Microsoft Excel/Word or LibreOffice to confirm formatting.
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                <span>
                  <strong>Ambiguities Flagged:</strong> Notice how missing flange ratings or voltage specs are highlighted in red/amber with questions for the buyer.
                </span>
              </div>
            </div>
          </div>

          {/* Step 5: Honest Technical Boundaries & Version 1 Scope */}
          <div className="border border-amber-200 rounded-lg p-4 bg-amber-50/70 space-y-2">
            <h4 className="font-bold text-amber-900 text-sm flex items-center">
              <AlertTriangle className="w-4 h-4 text-amber-700 mr-1.5" />
              5. Transparent Technical Limitations (Version 1 Scope)
            </h4>
            <ul className="list-disc list-inside space-y-1 text-amber-800 text-[11px]">
              <li>
                <strong>Scanned Image PDFs:</strong> Global Vantage handles digital/text-based PDFs natively. Scanned paper image PDFs without OCR are transparently detected and warned.
              </li>
              <li>
                <strong>Data Persistence:</strong> Version 1 uses client-side LocalStorage and portable JSON Export/Import to avoid paid external database costs for single users.
              </li>
              <li>
                <strong>Future Modules (V2 Roadmap):</strong> Supplier quote comparison matrix, landed cost calculation, margin setting, and offer generation are designed to plug directly into this data model in subsequent releases.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md"
          >
            Got it, Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
