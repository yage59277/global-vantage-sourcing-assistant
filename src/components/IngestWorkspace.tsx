import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  FileText,
  File,
  Sparkles,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  X,
  RefreshCw,
  Info,
} from 'lucide-react';
import { SAMPLE_REQUESTS, SampleRequestTemplate } from '../utils/sampleData';
import { SourcingRequest } from '../types/rfq';

interface IngestWorkspaceProps {
  currentRequest: SourcingRequest;
  onStandardize: (text: string, sourceFileName?: string, fileType?: any) => Promise<void>;
  onLoadSample: (sample: SampleRequestTemplate) => void;
  isLoading: boolean;
  statusMessage: string;
}

export const IngestWorkspace: React.FC<IngestWorkspaceProps> = ({
  currentRequest,
  onStandardize,
  onLoadSample,
  isLoading,
  statusMessage,
}) => {
  const [inputText, setInputText] = useState(currentRequest.metadata.rawInputText || '');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(
    currentRequest.metadata.sourceFileName || null
  );
  const [dragActive, setDragActive] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [fileParsing, setFileParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileProcess = async (file: File) => {
    setParseError(null);
    setFileParsing(true);

    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    const validExtensions = ['.xlsx', '.xls', '.docx', '.doc', '.pdf', '.txt', '.csv'];

    if (!validExtensions.includes(ext)) {
      setParseError(
        `Unsupported format (${ext}). Supported formats: Excel (.xlsx), Word (.docx), text-based PDF (.pdf), and Plain Text (.txt).`
      );
      setFileParsing(false);
      return;
    }

    // Vercel Serverless Function payload limit is 4.5 MB.
    // Base64 encoding expands binary data by ~33%, so raw files over 3.2 MB will exceed the edge payload limit.
    const MAX_FILE_SIZE_BYTES = 3.2 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setParseError(
        `File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds Vercel's 4.5 MB serverless limit. Please upload a document under 3.2 MB or paste the text directly.`
      );
      setFileParsing(false);
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;

        try {
          const res = await fetch('/api/parse-document', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileName: file.name,
              fileData: base64Data,
              mimeType: file.type,
            }),
          });

          if (res.status === 404) {
            setParseError('The serverless parsing endpoint (/api/parse-document) returned 404 Not Found. Please deploy the updated api/parse-document.ts route.');
            setFileParsing(false);
            return;
          }

          if (res.status === 413) {
            setParseError('The document payload exceeded Vercel serverless limits (4.5 MB). Please paste the text directly.');
            setFileParsing(false);
            return;
          }

          if (res.status === 504) {
            setParseError('Document parsing timed out on Vercel. Please paste the text directly.');
            setFileParsing(false);
            return;
          }

          const contentType = res.headers.get('content-type') || '';
          if (!contentType.includes('application/json')) {
            const errorText = await res.text();
            setParseError(
              `Server returned unexpected response (status ${res.status}): ${
                errorText.includes('The page could not be found')
                  ? 'Endpoint route not found on serverless host (404).'
                  : errorText.slice(0, 150)
              }`
            );
            setFileParsing(false);
            return;
          }

          const data = await res.json();

          if (!res.ok || !data.success) {
            setParseError(
              data.error ||
                'Unable to read document contents. If this is a PDF, please verify it is not a scanned image.'
            );
            setFileParsing(false);
            return;
          }

          setInputText(data.text);
          setUploadedFileName(file.name);
          setFileParsing(false);
        } catch (err: any) {
          setParseError(`Network/Server error while reading file: ${err.message || 'Unknown error'}`);
          setFileParsing(false);
        }
      };

      reader.onerror = () => {
        setParseError('Failed to read file from local disk.');
        setFileParsing(false);
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      setParseError(`Error processing file: ${err.message}`);
      setFileParsing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleClear = () => {
    setInputText('');
    setUploadedFileName(null);
    setParseError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = () => {
    if (!inputText.trim()) {
      setParseError('Please paste buyer request text or upload a document first.');
      return;
    }
    setParseError(null);
    onStandardize(inputText, uploadedFileName || undefined);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Overview & Value Proposition Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <span>Module 1</span>
            <span>•</span>
            <span>Request Standardizer</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2">
            Transform Messy Buyer Inquiries into Supplier-Ready RFQs
          </h1>
          <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
            Independent sourcing agents and tender consultants receive unstructured inquiries across
            emails, spreadsheets, and PDFs. Standardize them into clear line items, flag missing
            engineering parameters, and generate factory-grade Excel and Word RFQs.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
          <button
            onClick={() => onLoadSample(SAMPLE_REQUESTS[0])}
            className="px-3.5 py-2 text-xs font-medium bg-blue-600 hover:bg-blue-500 rounded-lg text-white transition flex items-center justify-center space-x-2 shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Load Valves &amp; Pumps Sample</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Upload & Paste Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: File Ingestion & Drag Drop (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900 mb-1 flex items-center">
              <UploadCloud className="w-5 h-5 mr-2 text-blue-600" />
              Upload Procurement Document
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Extract technical specifications directly from buyer spreadsheets or documents.
            </p>

            {/* Drag and Drop Box */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
                dragActive
                  ? 'border-blue-500 bg-blue-50/70'
                  : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".xlsx,.xls,.docx,.doc,.pdf,.txt,.csv"
                onChange={handleFileChange}
              />
              <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-3">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-slate-800">
                Click to browse or drag &amp; drop file
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Excel (.xlsx), Word (.docx), text-based PDF (.pdf)
              </p>
            </div>

            {/* Formats pill guide */}
            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs text-slate-600">
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex flex-col items-center">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600 mb-1" />
                <span className="font-semibold text-slate-800">Excel</span>
                <span className="text-[10px] text-slate-400">.xlsx / .xls</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex flex-col items-center">
                <FileText className="w-4 h-4 text-blue-600 mb-1" />
                <span className="font-semibold text-slate-800">Word</span>
                <span className="text-[10px] text-slate-400">.docx</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex flex-col items-center">
                <File className="w-4 h-4 text-red-600 mb-1" />
                <span className="font-semibold text-slate-800">PDF</span>
                <span className="text-[10px] text-slate-400">Text-based</span>
              </div>
            </div>

            {/* Scanned file notice */}
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 flex items-start space-x-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Important note:</strong> Scanned image PDFs without selectable text are
                transparently flagged. If you have an image scan, run OCR first or copy-paste the text
                into the right pane.
              </span>
            </div>
          </div>

          {/* Synthetic realistic sample picker */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 mb-2 flex items-center">
              <Sparkles className="w-4 h-4 mr-2 text-amber-500" />
              Quick-Test Synthetic Sample Requests
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              One-click realistic industrial procurement inquiries:
            </p>
            <div className="space-y-2">
              {SAMPLE_REQUESTS.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => onLoadSample(sample)}
                  className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-800 group-hover:text-blue-700">
                      {sample.title}
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                      {sample.sourceType}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2">{sample.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Text Workspace & AI Standardization (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col h-full">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h2 className="text-base font-semibold text-slate-900">
                  Buyer Inquiry Text / Document Content
                </h2>
              </div>
              {uploadedFileName && (
                <div className="flex items-center space-x-1.5 bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full border border-blue-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  <span className="font-medium truncate max-w-[150px]">{uploadedFileName}</span>
                  <button
                    onClick={() => {
                      setUploadedFileName(null);
                      setInputText('');
                    }}
                    className="hover:text-blue-900 ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Paste email threads, WhatsApp messages, raw RFP specs, or verify the extracted file text
              below.
            </p>

            {/* Error Message */}
            {parseError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3.5 text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-semibold block mb-0.5">Extraction Issue:</span>
                  <span>{parseError}</span>
                </div>
                <button onClick={() => setParseError(null)} className="text-red-500 hover:text-red-800">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Textarea */}
            <div className="relative flex-1">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste messy client RFQ / WhatsApp message / email here...&#10;&#10;Example:&#10;Hi Marcus, we need 24 pcs 6-inch bolted bonnet OS&Y gate valves A216 WCB trim 8 raised face. Please check if Class 300 or 600 is available. Also 4 centrifugal chemical pumps 250 GPM at 140ft head Duplex 2205 SS with Plan 53A seal. Delivery FOB Houston Port by August 2026."
                rows={15}
                className="w-full h-80 lg:h-96 p-4 text-xs font-mono bg-slate-50/70 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 resize-y leading-relaxed"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
                <span>
                  {inputText.length} characters • {inputText.split(/\s+/).filter(Boolean).length} words
                </span>
                {inputText.length > 0 && (
                  <button
                    onClick={handleClear}
                    className="text-slate-500 hover:text-red-600 font-medium transition"
                  >
                    Clear text
                  </button>
                )}
              </div>
            </div>

            {/* Processing State or Submit Button */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500">
                {fileParsing ? (
                  <span className="flex items-center text-blue-600 font-medium">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    Extracting document text...
                  </span>
                ) : isLoading ? (
                  <span className="flex items-center text-blue-600 font-medium">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    {statusMessage || 'Standardizing with Gemini AI...'}
                  </span>
                ) : (
                  <span>Strict extraction rules: no hallucinated specs or quantities.</span>
                )}
              </div>

              <button
                onClick={handleSubmit}
                disabled={isLoading || fileParsing || !inputText.trim()}
                className={`w-full sm:w-auto px-6 py-2.5 rounded-lg text-xs font-semibold text-white shadow-sm flex items-center justify-center space-x-2 transition ${
                  isLoading || fileParsing || !inputText.trim()
                    ? 'bg-slate-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-500 cursor-pointer'
                }`}
              >
                <span>Standardize &amp; Structure RFQ</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
