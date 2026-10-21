# Global Vantage Sourcing Assistant — Windows Beginner Developer Guide

Welcome! This application was built specifically for independent sourcing agents, tender intermediaries, and procurement consultants.

---

## 1. Quick Start on Windows (PowerShell or VS Code)

### Prerequisites
1. **Node.js (Version 20 LTS or 22 LTS)**:
   - Download the Windows Installer (.msi) from [nodejs.org](https://nodejs.org).
   - Check the box during installation to "Automatically install the necessary tools".
2. **Terminal**:
   - You can use **Windows PowerShell**, **Command Prompt (cmd)**, or the integrated terminal inside **Visual Studio Code** (`Ctrl + ~`).

### Step-by-Step Installation
Open PowerShell in the project directory:

```powershell
# 1. Install all required dependencies
npm install

# 2. Copy the example environment file to .env
copy .env.example .env
```

Open the newly created `.env` file in Notepad or VS Code and insert your Gemini API Key:
```env
GEMINI_API_KEY="your-actual-gemini-api-key"
```

### Starting the Application
```powershell
# Starts the full-stack Express server + Vite frontend
npm run dev
```

Now open your web browser and navigate to:
```
http://localhost:3000
```

---

## 2. Complete Testing & Verification Workflow

To verify that the application is genuinely working, perform the following verification cycle:

1. **Test Ingestion & Parsing**:
   - Navigate to **"1. Ingest & Parse"**.
   - Either drag and drop an Excel (`.xlsx`), Word (`.docx`), or text-based PDF (`.pdf`), OR click one of the **"Quick-Test Synthetic Sample Requests"** (e.g., *Industrial Process Valves & Pumps* or *Beverage Bottling Line*).
   - Click **"Standardize & Structure RFQ"**.

2. **Verify That Edits Survive**:
   - Go to **"2. Product Matrix"**.
   - Click the pencil icon on any item or edit the quantity or specifications.
   - Switch to **"3. Ambiguities & Review"** and then to **"4. RFQ Export"**.
   - Notice that your changes remain intact across the entire workflow and are auto-saved to your local library!

3. **Verify Downloads**:
   - On the **"4. RFQ Export"** screen, click **"Download Excel (.xlsx)"**.
   - Open the generated `.xlsx` file in Microsoft Excel. Notice the clean header rows, the standardized product specifications, and the distinct **Supplier Bid Section** pre-formatted for suppliers to input unit prices and lead times.
   - Click **"Download Word (.docx)"**.
   - Open the generated `.docx` file in Microsoft Word. Verify the formal RFQ layout, instructions to bidders, and bidder signature block.

4. **Verify Gap & Ambiguity Detection**:
   - Notice that items with missing parameters (e.g. unconfirmed ANSI pressure rating on valves, missing electrical voltage on machines) are highlighted in red and amber.
   - Open **"3. Ambiguities & Review"** and use **"Copy Email"** to inspect the pre-drafted clarification email for the buyer.

---

## 3. Architecture & Data Model (Maintainability)

The project is structured with modular separation of concerns:

- `server.ts`: Full-stack Node.js server.
  - Keeps the Gemini API key strictly server-side (never exposed to browser bundles).
  - Handles parsing of binary `.xlsx`, `.docx`, and `.pdf` files.
  - Formats Gemini prompts with strict integrity rules (never inventing specifications or quantities).
- `src/types/rfq.ts`: Portable data model for sourcing requests, line items, provenance flags, and RFQ metadata.
- `src/utils/excelExport.ts`: Generates native `.xlsx` workbooks using SheetJS.
- `src/utils/wordExport.ts`: Generates native `.docx` files using the `docx` library.
- `src/utils/sampleData.ts`: Realistic multi-product industrial equipment scenarios for instant verification.
- `src/components/`:
  - `Navbar.tsx`: Top navigation with request indicators and quick actions.
  - `IngestWorkspace.tsx`: File dropzone and text analysis workspace.
  - `ProductTable.tsx`: High-density editable product matrix with search, sorting, filtering, and provenance tracking.
  - `ClarificationsPanel.tsx`: Ambiguity checklist and automated buyer email generator.
  - `ExportSection.tsx`: Excel, Word, and text RFQ generation with live preview.
  - `ItemEditModal.tsx`: Detailed modal editor for individual line items.
  - `SavedRequestsModal.tsx`: Local storage request manager with JSON backup import/export.

---

## 4. Honest Version 1 Scope & Limitations

As specified in the project brief for **Version 1 (Request Standardizer)**:

| Feature Area | Current Status in V1 | Next Phase (V2 Roadmap) |
|---|---|---|
| **Scanned Image PDFs** | Scanned PDFs with no selectable text layer are transparently reported and rejected with helpful advice (no fake success). | Future optical character recognition (OCR) pipeline. |
| **Data Storage** | Zero-cost client-side LocalStorage with complete JSON Backup Import/Export. | Relational database (e.g. PostgreSQL) and user authentication when multi-seat collaboration is needed. |
| **Supplier Offer Evaluation** | Version 1 generates supplier-ready bid sheets with blank pricing columns. | V2 will add supplier quote comparison matrix, landed cost calculation, and offer generation. |
| **AI Reliability** | Server-side Gemini 3.8 Flash with structured schema validation + intelligent local fallback parser. | Multi-agent RFP verification and cross-referencing. |
