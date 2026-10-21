import React, { useState } from 'react';
import { X, Check, AlertTriangle, Sparkles, Tag, FileSearch } from 'lucide-react';
import { RfqItem } from '../types/rfq';

interface ItemEditModalProps {
  item: RfqItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedItem: RfqItem) => void;
}

export const ItemEditModal: React.FC<ItemEditModalProps> = ({
  item,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen || !item) return null;

  const [form, setForm] = useState<RfqItem>({ ...item });
  const [newMissingField, setNewMissingField] = useState('');
  const [newAmbiguityNote, setNewAmbiguityNote] = useState('');
  const [newBuyerQuestion, setNewBuyerQuestion] = useState('');

  const handleSave = () => {
    onSave(form);
    onClose();
  };

  const addMissingField = () => {
    if (newMissingField.trim()) {
      setForm({
        ...form,
        missingFields: [...form.missingFields, newMissingField.trim()],
      });
      setNewMissingField('');
    }
  };

  const removeMissingField = (index: number) => {
    setForm({
      ...form,
      missingFields: form.missingFields.filter((_, i) => i !== index),
    });
  };

  const addAmbiguityNote = () => {
    if (newAmbiguityNote.trim()) {
      setForm({
        ...form,
        ambiguityNotes: [...form.ambiguityNotes, newAmbiguityNote.trim()],
      });
      setNewAmbiguityNote('');
    }
  };

  const removeAmbiguityNote = (index: number) => {
    setForm({
      ...form,
      ambiguityNotes: form.ambiguityNotes.filter((_, i) => i !== index),
    });
  };

  const addBuyerQuestion = () => {
    if (newBuyerQuestion.trim()) {
      setForm({
        ...form,
        buyerQuestions: [...form.buyerQuestions, newBuyerQuestion.trim()],
      });
      setNewBuyerQuestion('');
    }
  };

  const removeBuyerQuestion = (index: number) => {
    setForm({
      ...form,
      buyerQuestions: form.buyerQuestions.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-3xl w-full overflow-hidden my-8">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-blue-400 font-semibold uppercase tracking-wider">
              Item #{form.itemNumber} Specification Editor
            </span>
            <h3 className="text-base font-bold text-white truncate max-w-lg">
              {form.productName}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
          {/* Row 1: Product Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Product Name</label>
              <input
                type="text"
                value={form.productName}
                onChange={(e) => setForm({ ...form, productName: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category</label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="e.g. Pumps, Valves, Electrical"
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>
          </div>

          {/* Row 2: Technical Specifications */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Detailed Technical Specifications &amp; Standards
            </label>
            <textarea
              rows={4}
              value={form.specifications}
              onChange={(e) => setForm({ ...form, specifications: e.target.value })}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 leading-relaxed font-mono"
            />
          </div>

          {/* Row 3: Brand/Model, Qty, Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Requested Brand / Model</label>
              <input
                type="text"
                value={form.brandModel}
                onChange={(e) => setForm({ ...form, brandModel: e.target.value })}
                placeholder="e.g. Goulds 3196 or Equivalent"
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Quantity</label>
              <input
                type="number"
                value={form.quantity !== null && form.quantity !== undefined ? form.quantity : ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    quantity: e.target.value === '' ? null : parseFloat(e.target.value),
                  })
                }
                placeholder="Numeric qty (or leave empty if unstated)"
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Unit of Measurement (UoM)</label>
              <input
                type="text"
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                placeholder="pcs, units, sets, meters, kg"
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 font-mono"
              />
            </div>
          </div>

          {/* Row 4: Delivery Location & Target Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Delivery Location / Port</label>
              <input
                type="text"
                value={form.targetDeliveryLocation}
                onChange={(e) => setForm({ ...form, targetDeliveryLocation: e.target.value })}
                placeholder="e.g. FOB Houston Port"
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Delivery Date</label>
              <input
                type="text"
                value={form.targetDeliveryDate}
                onChange={(e) => setForm({ ...form, targetDeliveryDate: e.target.value })}
                placeholder="YYYY-MM-DD or lead time"
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>
          </div>

          {/* Row 5: Commercial Requirements */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Certifications, Testing &amp; Packaging Requirements
            </label>
            <input
              type="text"
              value={form.commercialRequirements}
              onChange={(e) => setForm({ ...form, commercialRequirements: e.target.value })}
              placeholder="e.g. EN 10204 3.1 MTR, API 607 Fire Safe, ISPM-15 Crates"
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

          {/* Row 6: Original Buyer Source Snippet (Read-only / editable) */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="font-semibold text-slate-700 block mb-1 flex items-center">
              <FileSearch className="w-3.5 h-3.5 mr-1 text-blue-600" />
              Source Snippet from Buyer's Original Inquiry:
            </span>
            <p className="font-mono text-[11px] text-slate-600 italic bg-white p-2 rounded border border-slate-200">
              "{form.sourceSnippet || 'Manual item creation'}"
            </p>
          </div>

          {/* Row 7: Flags & Ambiguities Manager */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">Human Verification &amp; Gap Tracker</span>
              <label className="inline-flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isReviewed}
                  onChange={(e) => setForm({ ...form, isReviewed: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="font-semibold text-emerald-700">Mark as Verified by Sourcing Agent</span>
              </label>
            </div>

            {/* Missing fields tag builder */}
            <div>
              <span className="font-semibold text-slate-700 block mb-1">Missing Specifications / Gaps:</span>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {form.missingFields.map((mf, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center bg-red-100 text-red-800 px-2 py-0.5 rounded text-[11px] font-medium"
                  >
                    <span>{mf}</span>
                    <button
                      type="button"
                      onClick={() => removeMissingField(i)}
                      className="ml-1 text-red-500 hover:text-red-900 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMissingField}
                  onChange={(e) => setNewMissingField(e.target.value)}
                  placeholder="e.g. Flange Rating ANSI Class"
                  className="flex-1 p-1.5 border border-slate-300 rounded text-xs"
                />
                <button
                  type="button"
                  onClick={addMissingField}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded border border-slate-300"
                >
                  Add Gap
                </button>
              </div>
            </div>

            {/* Buyer questions builder */}
            <div>
              <span className="font-semibold text-slate-700 block mb-1">
                Direct Questions for Buyer:
              </span>
              <div className="space-y-1 mb-2">
                {form.buyerQuestions.map((q, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-blue-50 p-1.5 rounded border border-blue-200 text-[11px] text-blue-900"
                  >
                    <span>• {q}</span>
                    <button
                      type="button"
                      onClick={() => removeBuyerQuestion(i)}
                      className="text-blue-500 hover:text-red-600 font-bold ml-2"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newBuyerQuestion}
                  onChange={(e) => setNewBuyerQuestion(e.target.value)}
                  placeholder="e.g. Please confirm if 300# or 600# pressure rating is required."
                  className="flex-1 p-1.5 border border-slate-300 rounded text-xs"
                />
                <button
                  type="button"
                  onClick={addBuyerQuestion}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded border border-slate-300"
                >
                  Add Question
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm transition flex items-center space-x-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
