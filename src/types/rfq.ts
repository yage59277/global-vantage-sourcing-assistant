export type FieldSource = 'explicit' | 'inferred' | 'missing';

export interface FieldProvenance {
  field: string;
  source: FieldSource;
  confidence: number; // 0 to 1
  rationale?: string;
}

export interface RfqItem {
  id: string;
  itemNumber: number;
  productName: string;
  category: string;
  specifications: string;
  brandModel: string;
  quantity: number | null;
  unit: string;
  targetDeliveryLocation: string;
  targetDeliveryDate: string;
  commercialRequirements: string;
  sourceSnippet: string;
  
  // Human verification & provenance
  isReviewed: boolean;
  isInferred: boolean;
  inferredFields: string[]; // e.g. ['unit', 'specifications']
  missingFields: string[];  // e.g. ['quantity', 'voltage']
  ambiguityNotes: string[]; // e.g. ['Pressure rating not specified in buyer note']
  buyerQuestions: string[]; // Specific clarification question for buyer
}

export interface RfqMetadata {
  id: string;
  rfqNumber: string;
  title: string;
  clientReference: string;
  industry: string;
  createdDate: string;
  closingDate: string;
  deliveryTerms: string; // e.g. "FOB Shanghai" or "CIF Rotterdam"
  destinationPort: string;
  currency: string;
  specialInstructions: string;
  rawInputText: string;
  sourceFileName?: string;
  sourceFileType?: 'excel' | 'word' | 'pdf' | 'text';
}

export interface SourcingRequest {
  metadata: RfqMetadata;
  items: RfqItem[];
  status: 'draft' | 'analyzing' | 'review_required' | 'ready_for_export' | 'exported';
  totalAmbiguitiesCount: number;
}

export interface StandardizationResponse {
  success: boolean;
  rfqMetadata: Partial<RfqMetadata>;
  items: RfqItem[];
  overallSummary: string;
  generalAmbiguities: string[];
  error?: string;
}

export interface DocumentParseResponse {
  success: boolean;
  text: string;
  fileName: string;
  fileType: string;
  itemCountEstimate?: number;
  warnings?: string[];
  error?: string;
}
