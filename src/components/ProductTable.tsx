import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  Copy,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  FileSearch,
  ArrowUpDown,
  Tag,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import { RfqItem } from '../types/rfq';

interface ProductTableProps {
  items: RfqItem[];
  onUpdateItem: (updatedItem: RfqItem) => void;
  onAddItem: () => void;
  onDeleteItem: (itemId: string) => void;
  onDuplicateItem: (itemId: string) => void;
  onOpenEditModal: (item: RfqItem) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  items,
  onUpdateItem,
  onAddItem,
  onDeleteItem,
  onDuplicateItem,
  onOpenEditModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'needs_review' | 'has_missing' | 'verified'>('all');
  const [sortField, setSortField] = useState<'itemNumber' | 'productName' | 'quantity' | 'isReviewed'>('itemNumber');
  const [sortAsc, setSortAsc] = useState(true);
  const [activeSnippetPopover, setActiveSnippetPopover] = useState<string | null>(null);

  // Sorting and filtering logic
  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];

    // Filter
    if (filterType === 'needs_review') {
      result = result.filter((item) => item.isInferred || !item.isReviewed);
    } else if (filterType === 'has_missing') {
      result = result.filter((item) => item.missingFields.length > 0);
    } else if (filterType === 'verified') {
      result = result.filter((item) => item.isReviewed);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.productName.toLowerCase().includes(q) ||
          item.specifications.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.brandModel.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (sortField === 'quantity') {
        valA = valA === null ? -1 : valA;
        valB = valB === null ? -1 : valB;
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });

    return result;
  }, [items, searchQuery, filterType, sortField, sortAsc]);

  const handleSort = (field: 'itemNumber' | 'productName' | 'quantity' | 'isReviewed') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const toggleReviewed = (item: RfqItem) => {
    onUpdateItem({
      ...item,
      isReviewed: !item.isReviewed,
    });
  };

  return (
    <div className="space-y-4">
      {/* Table Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items, specs, brands..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto">
          <span className="text-xs text-slate-400 flex items-center shrink-0">
            <Filter className="w-3.5 h-3.5 mr-1" />
            Filter:
          </span>
          <button
            onClick={() => setFilterType('all')}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition shrink-0 ${
              filterType === 'all'
                ? 'bg-blue-100 text-blue-800 font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({items.length})
          </button>
          <button
            onClick={() => setFilterType('needs_review')}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition shrink-0 flex items-center space-x-1 ${
              filterType === 'needs_review'
                ? 'bg-amber-100 text-amber-900 font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Needs Review</span>
          </button>
          <button
            onClick={() => setFilterType('has_missing')}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition shrink-0 flex items-center space-x-1 ${
              filterType === 'has_missing'
                ? 'bg-red-100 text-red-900 font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <AlertTriangle className="w-3 h-3 text-red-500" />
            <span>Missing Specs</span>
          </button>
          <button
            onClick={() => setFilterType('verified')}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition shrink-0 flex items-center space-x-1 ${
              filterType === 'verified'
                ? 'bg-emerald-100 text-emerald-900 font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Verified</span>
          </button>
        </div>

        {/* Add Row Action */}
        <button
          onClick={onAddItem}
          className="w-full md:w-auto px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm flex items-center justify-center space-x-1.5 transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product Row</span>
        </button>
      </div>

      {/* Main High-Density Product Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[650px] relative">
          <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider text-[11px] sticky top-0 z-10 border-b border-slate-200">
              <tr>
                <th
                  onClick={() => handleSort('itemNumber')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-100 w-12 text-center"
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>#</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('productName')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100 min-w-[200px]"
                >
                  <div className="flex items-center space-x-1">
                    <span>Product &amp; Category</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 min-w-[300px]">Technical Specifications</th>
                <th className="py-3 px-4 min-w-[150px]">Brand / Model</th>
                <th
                  onClick={() => handleSort('quantity')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-100 text-right w-24"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Qty</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3 text-center w-20">Unit</th>
                <th className="py-3 px-4 min-w-[150px]">Delivery &amp; Incoterms</th>
                <th className="py-3 px-3 text-center w-36">Provenance</th>
                <th
                  onClick={() => handleSort('isReviewed')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-100 text-center w-24"
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>Status</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3 text-center w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredAndSortedItems.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-medium text-slate-600 mb-1">No products found</p>
                    <p className="text-xs">
                      Try adjusting your search query or filter, or add a product row.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredAndSortedItems.map((item, idx) => {
                  const hasMissing = item.missingFields.length > 0;
                  const isInferred = item.isInferred;

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-blue-50/40 transition group ${
                        item.isReviewed ? 'bg-emerald-50/20' : hasMissing ? 'bg-red-50/15' : ''
                      }`}
                    >
                      {/* Item # */}
                      <td className="py-3 px-3 text-center font-mono font-medium text-slate-500">
                        {item.itemNumber || idx + 1}
                      </td>

                      {/* Product Name & Category */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 leading-snug">
                          {item.productName}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center mt-0.5 space-x-1">
                          <Tag className="w-3 h-3 text-slate-400" />
                          <span>{item.category || 'General Equipment'}</span>
                        </div>
                      </td>

                      {/* Specifications */}
                      <td className="py-3 px-4">
                        <div className="text-slate-700 leading-relaxed max-w-sm line-clamp-3">
                          {item.specifications}
                        </div>
                        {item.commercialRequirements && (
                          <div className="text-[10px] text-slate-500 italic mt-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                            Standards: {item.commercialRequirements}
                          </div>
                        )}
                        {/* Missing fields alert badge */}
                        {item.missingFields.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {item.missingFields.map((mf, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center text-[10px] bg-red-100 text-red-800 px-1.5 py-0.5 rounded font-medium"
                              >
                                <AlertTriangle className="w-2.5 h-2.5 mr-1" />
                                Missing: {mf}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Brand / Model */}
                      <td className="py-3 px-4">
                        <span className="text-slate-800 font-medium">
                          {item.brandModel || 'Open / Any suitable'}
                        </span>
                      </td>

                      {/* Quantity */}
                      <td className="py-3 px-3 text-right">
                        {item.quantity !== null && item.quantity !== undefined ? (
                          <span className="font-mono font-bold text-slate-900 text-sm">
                            {item.quantity.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-amber-600 font-medium bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 text-[10px]">
                            Unspecified
                          </span>
                        )}
                      </td>

                      {/* Unit */}
                      <td className="py-3 px-3 text-center">
                        <span className="bg-slate-100 text-slate-700 font-mono px-2 py-0.5 rounded text-[11px] font-medium">
                          {item.unit || 'pcs'}
                        </span>
                      </td>

                      {/* Delivery */}
                      <td className="py-3 px-4">
                        <div className="text-slate-700 font-medium">
                          {item.targetDeliveryLocation || 'Per RFQ terms'}
                        </div>
                        {item.targetDeliveryDate && (
                          <div className="text-[10px] text-slate-500">
                            Target: {item.targetDeliveryDate}
                          </div>
                        )}
                      </td>

                      {/* Provenance Badge (Explicit vs Inferred) */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex flex-col items-center space-y-1">
                          {isInferred ? (
                            <span className="inline-flex items-center text-[10px] bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full font-semibold border border-sky-200">
                              <Sparkles className="w-2.5 h-2.5 mr-1 text-sky-600" />
                              AI Inferred
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-semibold border border-slate-200">
                              Buyer Explicit
                            </span>
                          )}

                          {/* Source Snippet Inspector Popover */}
                          {item.sourceSnippet && (
                            <div className="relative">
                              <button
                                onClick={() =>
                                  setActiveSnippetPopover(
                                    activeSnippetPopover === item.id ? null : item.id
                                  )
                                }
                                className="text-[10px] text-blue-600 hover:text-blue-800 underline flex items-center font-medium"
                              >
                                <FileSearch className="w-2.5 h-2.5 mr-0.5" />
                                Source text
                              </button>

                              {activeSnippetPopover === item.id && (
                                <div className="absolute right-0 top-6 z-20 w-72 p-3 bg-slate-900 text-white rounded-lg shadow-xl text-left text-xs border border-slate-700">
                                  <div className="flex items-center justify-between border-b border-slate-700 pb-1.5 mb-1.5">
                                    <span className="font-semibold text-slate-300">
                                      Original Buyer Snippet
                                    </span>
                                    <button
                                      onClick={() => setActiveSnippetPopover(null)}
                                      className="text-slate-400 hover:text-white"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                  <p className="font-mono text-[11px] text-slate-200 leading-relaxed italic bg-slate-800 p-2 rounded">
                                    "{item.sourceSnippet}"
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Verified Status */}
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => toggleReviewed(item)}
                          className={`inline-flex items-center px-2 py-1 rounded text-[11px] font-semibold transition ${
                            item.isReviewed
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          }`}
                        >
                          {item.isReviewed ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                              Verified
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-3 h-3 mr-1 text-amber-600" />
                              Review
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => onOpenEditModal(item)}
                            title="Edit row details"
                            className="p-1 rounded text-slate-500 hover:text-blue-600 hover:bg-slate-100"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDuplicateItem(item.id)}
                            title="Duplicate row"
                            className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteItem(item.id)}
                            title="Delete row"
                            className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Summary */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing <span className="font-semibold text-slate-800">{filteredAndSortedItems.length}</span>{' '}
            of <span className="font-semibold text-slate-800">{items.length}</span> product items
          </div>
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5" />
              {items.filter((i) => i.isReviewed).length} Verified by Sourcing Agent
            </span>
            <span className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-amber-500 mr-1.5" />
              {items.filter((i) => !i.isReviewed).length} Pending Review
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
