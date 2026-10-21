import { GoogleGenAI, Type } from '@google/genai';

async function getRequestBody(req: any): Promise<any> {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk: any) => {
      data += chunk;
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(data));
      } catch {
        resolve({});
      }
    });
  });
}

function getGeminiClient(): GoogleGenAI {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export function fallbackHeuristicExtraction(rawText: string) {
  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
  const items: any[] = [];
  let itemCounter = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isNumbered = /^(?:\d+[\.\)]|item\s*\d+|[-*•])\s*(.*)/i.exec(line);
    if (isNumbered || line.toLowerCase().includes('pump') || line.toLowerCase().includes('valve') || line.toLowerCase().includes('module') || line.toLowerCase().includes('machine')) {
      const content = isNumbered ? isNumbered[1] : line;
      
      const qtyMatch = content.match(/(\d+(?:,\d+)*(?:\.\d+)?)\s*(pcs|pieces|units|sets|meters|m|kg|tons|boxes|cartons)/i);
      const qty = qtyMatch ? parseFloat(qtyMatch[1].replace(/,/g, '')) : null;
      const unit = qtyMatch ? qtyMatch[2].toLowerCase() : 'units';

      items.push({
        id: `item-${Date.now()}-${itemCounter}`,
        itemNumber: itemCounter++,
        productName: content.slice(0, 60),
        category: 'General Industrial & Equipment',
        specifications: content,
        brandModel: content.includes('prefer') || content.includes('equivalent') ? 'Alternative acceptable' : 'Unspecified',
        quantity: qty,
        unit: unit,
        targetDeliveryLocation: 'As per buyer terms',
        targetDeliveryDate: '',
        commercialRequirements: 'Standard international export packaging & inspection certificate',
        sourceSnippet: line,
        isReviewed: false,
        isInferred: true,
        inferredFields: ['category', 'commercialRequirements'],
        missingFields: qty === null ? ['quantity'] : ['deliveryDate', 'detailedTolerances'],
        ambiguityNotes: ['Heuristic parsing used; human review strongly recommended.'],
        buyerQuestions: ['Please verify the exact quantity and unit specifications for this item.'],
      });
    }
  }

  if (items.length === 0) {
    items.push({
      id: `item-${Date.now()}-1`,
      itemNumber: 1,
      productName: 'Procurement Request Scope (Manual Itemization Required)',
      category: 'Unclassified Procurement',
      specifications: rawText.slice(0, 400),
      brandModel: 'Unspecified',
      quantity: null,
      unit: 'lot',
      targetDeliveryLocation: 'To be confirmed',
      targetDeliveryDate: '',
      commercialRequirements: 'To be confirmed',
      sourceSnippet: rawText.slice(0, 200),
      isReviewed: false,
      isInferred: true,
      inferredFields: ['quantity', 'unit'],
      missingFields: ['productName', 'quantity', 'specifications'],
      ambiguityNotes: ['Could not automatically distinguish discrete line items from text. Please edit or add rows.'],
      buyerQuestions: ['Please provide a line-by-line item breakdown with quantities and technical specs.'],
    });
  }

  return {
    success: true,
    rfqMetadata: {
      rfqNumber: `RFQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      title: 'Standardized Procurement Request',
      clientReference: 'CLIENT-REF-001',
      industry: 'Industrial & Commercial Supplies',
      createdDate: new Date().toISOString().split('T')[0],
      closingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      deliveryTerms: 'FOB / CIF as required',
      destinationPort: '',
      currency: 'USD',
      specialInstructions: 'All quotations must state validity, packaging specifications, and lead times.',
      rawInputText: rawText,
    },
    items,
    overallSummary: 'Extracted using local parser. Please review and refine the line items before exporting.',
    generalAmbiguities: ['Delivery destination and final Incoterms require buyer confirmation.'],
  };
}

export async function standardizeProcurement(rawText: string, contextInfo?: any) {
  if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
    throw new Error('Please provide raw text or document content to standardize.');
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const isRealApiKey = apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim().length > 15;

  if (!isRealApiKey) {
    console.log('Using robust heuristic extractor (no external key configured or offline mode).');
    return fallbackHeuristicExtraction(rawText);
  }

  const systemPrompt = `You are a Principal Sourcing Engineer and Tender Intermediary at Global Vantage Sourcing Assistant.
Your mission is to transform unstructured, messy buyer requests (emails, transcripts, specifications, tables) into an accurate, highly structured Request for Quotation (RFQ) product table for international suppliers.

CRITICAL INTEGRITY & COMPLIANCE RULES:
1. PRESERVE ORIGINAL MEANING: Never invent specifications, quantities, or certifications that the buyer did not mention or strongly imply.
2. DISTINGUISH EXPLICIT VS INFERRED:
   - "explicit": The buyer clearly and directly wrote the specification, brand, quantity, or delivery requirement.
   - "inferred": You deduced or normalized the information based on trade standards or context.
   - You must list which fields were inferred in "inferredFields".
3. DETECT MISSING INFORMATION & AMBIGUITIES:
   - For every line item, rigorously identify missing engineering or commercial parameters (e.g. pressure rating, electrical voltage/Hz, exact material grade, dimensions, surface finish, tolerance, connection type, or delivery port).
   - If a parameter is critical for a factory to quote but missing, put it in "missingFields", add an explanation in "ambiguityNotes", and draft a direct, polite question for the buyer in "buyerQuestions".
4. SOURCE SNIPPET:
   - For each item, capture the verbatim or near-verbatim snippet from the buyer's text in "sourceSnippet".
5. QUANTITY & UNIT:
   - Extract numerical quantity (null if not stated or ambiguous).
   - Normalize unit (pcs, units, sets, meters, kg, mt, pairs, rolls, etc.). If quantity was missing, do NOT fabricate a number.
6. METADATA:
   - Deduce RFQ title, estimated delivery terms (e.g., FOB Shanghai, CIF Rotterdam, DDP), destination port, currency (USD, EUR, etc.), and overall notes.`;

  const prompt = `Buyer's Original Raw Input Text:
----------------------------------------
${rawText}
----------------------------------------
${contextInfo ? `Additional Context from User: ${JSON.stringify(contextInfo)}` : ''}

Extract every distinct product or service required into the structured schema. Strictly output valid JSON matching the schema.`;

  const defaultTimeout = process.env.VERCEL ? 9000 : 25000;
  const timeoutMs = process.env.API_TIMEOUT_MS ? parseInt(process.env.API_TIMEOUT_MS, 10) : defaultTimeout;

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`AI extraction timed out (${Math.round(timeoutMs / 1000)}s threshold)`)), timeoutMs)
  );

  const ai = getGeminiClient();
  const geminiCall = ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: prompt,
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          rfqMetadata: {
            type: Type.OBJECT,
            properties: {
              rfqNumber: { type: Type.STRING, description: 'Generated unique RFQ code e.g. RFQ-2026-XXXX' },
              title: { type: Type.STRING, description: 'Descriptive professional RFQ title' },
              clientReference: { type: Type.STRING, description: 'Client or tender reference code if found, else empty' },
              industry: { type: Type.STRING, description: 'Specific industry sector' },
              createdDate: { type: Type.STRING, description: 'YYYY-MM-DD' },
              closingDate: { type: Type.STRING, description: 'Suggested quote submission deadline YYYY-MM-DD' },
              deliveryTerms: { type: Type.STRING, description: 'Incoterms and port/destination if stated' },
              destinationPort: { type: Type.STRING, description: 'Delivery city or port' },
              currency: { type: Type.STRING, description: 'Currency code e.g. USD, EUR' },
              specialInstructions: { type: Type.STRING, description: 'Mandatory supplier instructions, testing certs, payment terms' },
            },
            required: ['rfqNumber', 'title', 'deliveryTerms', 'currency'],
          },
          items: {
            type: Type.ARRAY,
            description: 'Array of standardized RFQ line items',
            items: {
              type: Type.OBJECT,
              properties: {
                itemNumber: { type: Type.INTEGER, description: 'Item sequential index starting at 1' },
                productName: { type: Type.STRING, description: 'Clean standardized product name' },
                category: { type: Type.STRING, description: 'Product category' },
                specifications: { type: Type.STRING, description: 'Detailed technical specifications, standards, materials, tolerances' },
                brandModel: { type: Type.STRING, description: 'Requested brand, model, or equivalent acceptable status' },
                quantity: { type: Type.NUMBER, description: 'Numeric quantity, or null if unspecified' },
                unit: { type: Type.STRING, description: 'Unit of measure e.g. pcs, sets, meters, kg' },
                targetDeliveryLocation: { type: Type.STRING, description: 'Delivery location if item-specific, else general' },
                targetDeliveryDate: { type: Type.STRING, description: 'Target date or lead time if mentioned' },
                commercialRequirements: { type: Type.STRING, description: 'Testing, inspection certs, packaging requirements' },
                sourceSnippet: { type: Type.STRING, description: 'Exact excerpt from input text for this item' },
                isInferred: { type: Type.BOOLEAN, description: 'True if any significant attribute was inferred' },
                inferredFields: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'List of fields deduced rather than explicitly stated',
                },
                missingFields: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'List of critical specs missing from the buyer note',
                },
                ambiguityNotes: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Ambiguities or conflicts detected in buyer request',
                },
                buyerQuestions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Engineering and commercial questions to send back to the buyer',
                },
              },
              required: [
                'itemNumber',
                'productName',
                'category',
                'specifications',
                'brandModel',
                'unit',
                'sourceSnippet',
                'isInferred',
                'inferredFields',
                'missingFields',
                'ambiguityNotes',
                'buyerQuestions',
              ],
            },
          },
          overallSummary: { type: Type.STRING, description: 'Executive summary of the extraction and procurement package' },
          generalAmbiguities: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Overall procurement package level ambiguities or missing commercial terms',
          },
        },
        required: ['rfqMetadata', 'items', 'overallSummary', 'generalAmbiguities'],
      },
    },
  });

  const response: any = await Promise.race([geminiCall, timeoutPromise]);
  const outputText = response.text;
  if (!outputText) {
    throw new Error('Gemini returned an empty response.');
  }

  const parsedJson = JSON.parse(outputText);

  const sanitizedItems = (parsedJson.items || []).map((item: any, idx: number) => ({
    ...item,
    id: `item-${Date.now()}-${idx + 1}`,
    itemNumber: idx + 1,
    isReviewed: false,
    quantity: typeof item.quantity === 'number' && !isNaN(item.quantity) ? item.quantity : null,
    unit: item.unit || 'pcs',
    inferredFields: Array.isArray(item.inferredFields) ? item.inferredFields : [],
    missingFields: Array.isArray(item.missingFields) ? item.missingFields : [],
    ambiguityNotes: Array.isArray(item.ambiguityNotes) ? item.ambiguityNotes : [],
    buyerQuestions: Array.isArray(item.buyerQuestions) ? item.buyerQuestions : [],
  }));

  const metadata = {
    ...parsedJson.rfqMetadata,
    id: `rfq-${Date.now()}`,
    createdDate: parsedJson.rfqMetadata?.createdDate || new Date().toISOString().split('T')[0],
    closingDate: parsedJson.rfqMetadata?.closingDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    rawInputText: rawText,
  };

  return {
    success: true,
    rfqMetadata: metadata,
    items: sanitizedItems,
    overallSummary: parsedJson.overallSummary || '',
    generalAmbiguities: parsedJson.generalAmbiguities || [],
  };
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Method not allowed. Use POST.' }));
    return;
  }

  try {
    const body = await getRequestBody(req);
    const { rawText, contextInfo } = body;

    const result = await standardizeProcurement(rawText, contextInfo);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(result));
  } catch (error: any) {
    console.error('Error in /api/standardize:', error);
    try {
      const body = await getRequestBody(req).catch(() => ({}));
      const fallback = fallbackHeuristicExtraction(body.rawText || '');
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          ...fallback,
          overallSummary: `AI standardizer encountered an error (${error.message || 'API error'}); used intelligent heuristic parser. Please review line items.`,
        })
      );
    } catch (fallbackError: any) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          success: false,
          error: `Standardization failed: ${error.message || 'Unknown processing error'}`,
        })
      );
    }
  }
}
