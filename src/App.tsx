import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { IngestWorkspace } from './components/IngestWorkspace';
import { ProductTable } from './components/ProductTable';
import { ClarificationsPanel } from './components/ClarificationsPanel';
import { ExportSection } from './components/ExportSection';
import { ItemEditModal } from './components/ItemEditModal';
import { SavedRequestsModal } from './components/SavedRequestsModal';
import { WindowsGuideModal } from './components/WindowsGuideModal';
import { SamplePickerModal } from './components/SamplePickerModal';
import { SAMPLE_REQUESTS, SampleRequestTemplate } from './utils/sampleData';
import { RfqItem, RfqMetadata, SourcingRequest } from './types/rfq';

const STORAGE_KEY_ACTIVE = 'GV_SOURCING_ACTIVE_REQUEST';
const STORAGE_KEY_SAVED = 'GV_SOURCING_SAVED_REQUESTS';

const initialEmptyRequest: SourcingRequest = {
  metadata: {
    id: `rfq-${Date.now()}`,
    rfqNumber: `RFQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    title: 'New Sourcing Inquiry',
    clientReference: '',
    industry: 'Industrial & Commercial',
    createdDate: new Date().toISOString().split('T')[0],
    closingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    deliveryTerms: 'FOB / CIF as specified',
    destinationPort: '',
    currency: 'USD',
    specialInstructions: 'Suppliers must provide valid manufacturer certifications and data sheets with their bid.',
    rawInputText: '',
  },
  items: [],
  status: 'draft',
  totalAmbiguitiesCount: 0,
};

export default function App() {
  // Load initial request from localStorage or use sample on first visit
  const [currentRequest, setCurrentRequest] = useState<SourcingRequest>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ACTIVE);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading active request from localStorage:', e);
    }
    // Default to first realistic sample on fresh start for quick exploration
    return SAMPLE_REQUESTS[0].preparsedData;
  });

  const [savedRequests, setSavedRequests] = useState<SourcingRequest[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SAVED);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading saved requests library:', e);
    }
    // Pre-populate with our synthetic samples as default library items
    return SAMPLE_REQUESTS.map((s) => s.preparsedData);
  });

  const [activeTab, setActiveTab] = useState<'ingest' | 'table' | 'clarifications' | 'export'>('table');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Modals state
  const [editingItem, setEditingItem] = useState<RfqItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isSampleModalOpen, setIsSampleModalOpen] = useState(false);

  const [notification, setNotification] = useState<{ type: 'error' | 'info' | 'success'; message: string } | null>(null);

  // Sync active request to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE, JSON.stringify(currentRequest));
    } catch (e) {
      console.error('Error saving active request to localStorage:', e);
    }
  }, [currentRequest]);

  // Sync saved requests library to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SAVED, JSON.stringify(savedRequests));
    } catch (e) {
      console.error('Error saving requests library to localStorage:', e);
    }
  }, [savedRequests]);

  // Handle standardizing raw text / document via Gemini AI endpoint
  const handleStandardize = async (text: string, sourceFileName?: string, fileType?: any) => {
    setIsLoading(true);
    setStatusMessage('Analyzing specifications & extracting line items with Gemini AI...');
    setNotification(null);

    try {
      const response = await fetch('/api/standardize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText: text,
          contextInfo: {
            sourceFileName,
            fileType,
          },
        }),
      });

      const contentType = response.headers.get('content-type') || '';
      let data: any = null;

      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const textResponse = await response.text();
        throw new Error(
          `Server returned status ${response.status}: ${
            textResponse.includes('The page could not be found')
              ? 'The endpoint (/api/standardize) was not found on the server (404).'
              : textResponse.slice(0, 150)
          }`
        );
      }

      if (!response.ok || !data.success) {
        throw new Error(data?.error || 'Failed to standardize sourcing request.');
      }

      const newMetadata: RfqMetadata = {
        ...currentRequest.metadata,
        ...data.rfqMetadata,
        rawInputText: text,
        sourceFileName,
        sourceFileType: fileType,
      };

      const newRequest: SourcingRequest = {
        metadata: newMetadata,
        items: data.items || [],
        status: 'review_required',
        totalAmbiguitiesCount: (data.items || []).reduce(
          (acc: number, item: RfqItem) => acc + item.missingFields.length + item.ambiguityNotes.length,
          0
        ),
      };

      setCurrentRequest(newRequest);

      // Auto-save to library if new
      setSavedRequests((prev) => {
        const existingIdx = prev.findIndex((r) => r.metadata.id === newRequest.metadata.id);
        if (existingIdx >= 0) {
          const updated = [...prev];
          updated[existingIdx] = newRequest;
          return updated;
        }
        return [newRequest, ...prev];
      });

      setNotification({ type: 'success', message: `Standardized ${newRequest.items.length} line items successfully!` });
      setTimeout(() => setNotification(null), 4000);

      // Switch to table tab
      setActiveTab('table');
    } catch (error: any) {
      console.error('Standardization failed:', error);
      setNotification({ type: 'error', message: `Standardization error: ${error.message || 'Please check server logs'}` });
    } finally {
      setIsLoading(false);
      setStatusMessage('');
    }
  };

  const handleLoadSample = (sample: SampleRequestTemplate) => {
    const loadedRequest: SourcingRequest = {
      ...sample.preparsedData,
      metadata: {
        ...sample.preparsedData.metadata,
        id: `rfq-${Date.now()}`,
        rawInputText: sample.rawText,
      },
    };
    setCurrentRequest(loadedRequest);
    setActiveTab('table');
  };

  const handleNewRequest = () => {
    const fresh: SourcingRequest = {
      ...initialEmptyRequest,
      metadata: {
        ...initialEmptyRequest.metadata,
        id: `rfq-${Date.now()}`,
        rfqNumber: `RFQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        createdDate: new Date().toISOString().split('T')[0],
      },
    };
    setCurrentRequest(fresh);
    setActiveTab('ingest');
  };

  const handleUpdateItem = (updatedItem: RfqItem) => {
    const newItems = currentRequest.items.map((item) =>
      item.id === updatedItem.id ? updatedItem : item
    );
    const updated = {
      ...currentRequest,
      items: newItems,
    };
    setCurrentRequest(updated);
    setSavedRequests((prev) =>
      prev.map((r) => (r.metadata.id === updated.metadata.id ? updated : r))
    );
  };

  const handleAddItem = () => {
    const nextItemNumber =
      currentRequest.items.length > 0
        ? Math.max(...currentRequest.items.map((i) => i.itemNumber)) + 1
        : 1;

    const newItem: RfqItem = {
      id: `item-${Date.now()}-${nextItemNumber}`,
      itemNumber: nextItemNumber,
      productName: 'New Equipment Item',
      category: 'General Equipment',
      specifications: 'Please enter detailed dimensions, technical standards, materials, and operating parameters.',
      brandModel: 'Open / Any qualified manufacturer',
      quantity: 1,
      unit: 'units',
      targetDeliveryLocation: currentRequest.metadata.deliveryTerms || 'FOB',
      targetDeliveryDate: currentRequest.metadata.closingDate || '',
      commercialRequirements: 'Standard export packaging & compliance certificate',
      sourceSnippet: 'Manually added line item',
      isReviewed: false,
      isInferred: false,
      inferredFields: [],
      missingFields: [],
      ambiguityNotes: [],
      buyerQuestions: [],
    };

    const updated = {
      ...currentRequest,
      items: [...currentRequest.items, newItem],
    };
    setCurrentRequest(updated);
    setSavedRequests((prev) =>
      prev.map((r) => (r.metadata.id === updated.metadata.id ? updated : r))
    );

    setEditingItem(newItem);
    setIsEditModalOpen(true);
  };

  const handleDeleteItem = (itemId: string) => {
    const newItems = currentRequest.items
      .filter((i) => i.id !== itemId)
      .map((item, idx) => ({ ...item, itemNumber: idx + 1 }));

    const updated = {
      ...currentRequest,
      items: newItems,
    };
    setCurrentRequest(updated);
    setSavedRequests((prev) =>
      prev.map((r) => (r.metadata.id === updated.metadata.id ? updated : r))
    );
    setNotification({ type: 'info', message: 'Item removed from table.' });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDuplicateItem = (itemId: string) => {
    const target = currentRequest.items.find((i) => i.id === itemId);
    if (!target) return;

    const duplicated: RfqItem = {
      ...target,
      id: `item-${Date.now()}-${currentRequest.items.length + 1}`,
      itemNumber: currentRequest.items.length + 1,
      productName: `${target.productName} (Copy)`,
      isReviewed: false,
    };

    const updated = {
      ...currentRequest,
      items: [...currentRequest.items, duplicated],
    };
    setCurrentRequest(updated);
    setSavedRequests((prev) =>
      prev.map((r) => (r.metadata.id === updated.metadata.id ? updated : r))
    );
    setNotification({ type: 'success', message: 'Item duplicated.' });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleOpenEditModal = (item: RfqItem) => {
    setEditingItem(item);
    setIsEditModalOpen(true);
  };

  const handleUpdateMetadata = (meta: RfqMetadata) => {
    const updated = {
      ...currentRequest,
      metadata: meta,
    };
    setCurrentRequest(updated);
    setSavedRequests((prev) =>
      prev.map((r) => (r.metadata.id === updated.metadata.id ? updated : r))
    );
  };

  const handleDeleteSavedRequest = (id: string) => {
    setSavedRequests((prev) => prev.filter((r) => r.metadata.id !== id));
    setNotification({ type: 'info', message: 'Request removed from saved library.' });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleExportAllBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(savedRequests, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `GlobalVantage_Sourcing_Backup_${new Date().toISOString().split('T')[0]}.json`);
    dlAnchor.click();
  };

  const handleImportAllBackup = (imported: SourcingRequest[]) => {
    setSavedRequests(imported);
    if (imported.length > 0) {
      setCurrentRequest(imported[0]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      {/* Top Navigation */}
      <Navbar
        currentRequest={currentRequest}
        onNewRequest={handleNewRequest}
        onOpenSavedModal={() => setIsSavedModalOpen(true)}
        onOpenGuideModal={() => setIsGuideModalOpen(true)}
        onOpenSampleModal={() => setIsSampleModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Global Notification Banner */}
      {notification && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div
            className={`p-3 rounded-lg text-xs font-semibold flex items-center justify-between shadow-xs ${
              notification.type === 'success'
                ? 'bg-emerald-600 text-white'
                : notification.type === 'error'
                ? 'bg-red-600 text-white'
                : 'bg-slate-800 text-white'
            }`}
          >
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="text-white/80 hover:text-white ml-3 text-xs"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace based on active workflow tab */}
      <main className="flex-1">
        {activeTab === 'ingest' && (
          <IngestWorkspace
            currentRequest={currentRequest}
            onStandardize={handleStandardize}
            onLoadSample={handleLoadSample}
            isLoading={isLoading}
            statusMessage={statusMessage}
          />
        )}

        {activeTab === 'table' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            {/* Header info bar */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                    {currentRequest.metadata.rfqNumber || 'RFQ-2026-0001'}
                  </span>
                  <h1 className="text-lg font-bold text-slate-900">
                    {currentRequest.metadata.title}
                  </h1>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Delivery: <strong className="text-slate-700">{currentRequest.metadata.deliveryTerms || 'FOB'}</strong> •
                  Currency: <strong className="text-slate-700">{currentRequest.metadata.currency || 'USD'}</strong> •
                  Closing: <strong className="text-slate-700">{currentRequest.metadata.closingDate || 'Open'}</strong>
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setActiveTab('clarifications')}
                  className="px-3.5 py-1.5 text-xs font-medium bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg transition flex items-center space-x-1"
                >
                  <span>Review Ambiguities</span>
                  {currentRequest.items.some((i) => i.missingFields.length > 0) && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 ml-1" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('export')}
                  className="px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-sm transition"
                >
                  Generate Supplier RFQ
                </button>
              </div>
            </div>

            {/* Editable Product Table */}
            <ProductTable
              items={currentRequest.items}
              onUpdateItem={handleUpdateItem}
              onAddItem={handleAddItem}
              onDeleteItem={handleDeleteItem}
              onDuplicateItem={handleDuplicateItem}
              onOpenEditModal={handleOpenEditModal}
            />
          </div>
        )}

        {activeTab === 'clarifications' && (
          <ClarificationsPanel
            metadata={currentRequest.metadata}
            items={currentRequest.items}
            onUpdateItem={handleUpdateItem}
            onProceedToExport={() => setActiveTab('export')}
          />
        )}

        {activeTab === 'export' && (
          <ExportSection
            metadata={currentRequest.metadata}
            items={currentRequest.items}
            onUpdateMetadata={handleUpdateMetadata}
          />
        )}
      </main>

      {/* Modals */}
      <ItemEditModal
        item={editingItem}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleUpdateItem}
      />

      <SavedRequestsModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        savedRequests={savedRequests}
        onSelectRequest={(req) => {
          setCurrentRequest(req);
          setActiveTab('table');
        }}
        onDeleteRequest={handleDeleteSavedRequest}
        onExportAll={handleExportAllBackup}
        onImportAll={handleImportAllBackup}
      />

      <WindowsGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />

      <SamplePickerModal
        isOpen={isSampleModalOpen}
        onClose={() => setIsSampleModalOpen(false)}
        onSelectSample={handleLoadSample}
      />
    </div>
  );
}
