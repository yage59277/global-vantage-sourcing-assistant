import { SourcingRequest } from '../types/rfq';

export interface SampleRequestTemplate {
  id: string;
  title: string;
  category: string;
  sourceType: string;
  description: string;
  rawText: string;
  preparsedData: SourcingRequest;
}

export const SAMPLE_REQUESTS: SampleRequestTemplate[] = [
  {
    id: 'sample-valves-pumps',
    title: 'Industrial Process Valves & Slurry Centrifugal Pumps Package',
    category: 'Heavy Industrial & Petrochemical',
    sourceType: 'Messy Client Inquiry Email',
    description: '4 industrial products with high technical requirements, mixed brands, missing flange pressure ratings, and strict API/ISO testing.',
    rawText: `FROM: Marcus Vance <m.vance@apex-petrochem.com>
TO: Global Vantage Procurement Team
DATE: October 14, 2026
SUBJECT: Urgent RFQ: Replacement valve package & transfer pumps for Plant 4 Expansion

Hi Team,

We need urgent supplier pricing and lead times for the following items for our Texas coastal facility:

1. Centrifugal Chemical Process Pumps: Need 4 units. Must be ANSI B73.1 standard or equivalent heavy duty chemical slurry pump. Casing in CD4MCu or Duplex 2205 stainless steel for handling corrosive brine with 5% solids. Capacity around 250 GPM at 140 ft total dynamic head. Prefer Goulds 3196 or Flowserve Durco Mark 3 equivalent. Motors should be 15 HP, 460V / 3 Phase / 60 Hz explosion proof Class I Div 1. Target delivery: August 2026, FOB Houston Port. Note: we need API 682 dual cartridge seals included with plan 53A piping.

2. Flanged High-Pressure Cast Steel Gate Valves: 24 pieces. 6-inch nominal bore, bolted bonnet, OS&Y. Body material ASTM A216 WCB with 13% chrome trim (Trim 8). Raised face flanges. You must ask the vendor if they can supply ANSI Class 300 or 600 - our piping engineer did not confirm the exact rating yet, quote Class 300 base with Class 600 adder. Must be fire safe certified to API 607.

3. Stainless Steel Wafer Style Butterfly Valves: 18 units. Size 8", lug/wafer type, 316SS body and disc with PTFE seat. Lever operated for sizes up to 8", but if 8" requires gear operator please quote gear. Pressure rating PN16 / 150#.

4. Basket Strainers (Simplex): 6 sets. 4-inch flanged ends, cast iron or ductile iron body, stainless steel 304 perforated screen with 40 mesh lining. Working pressure minimum 200 PSI. Need differential pressure gauge tapings included.

Please ensure all manufacturers provide EN 10204 3.1 material test certificates. Payment terms: 30% advance, 70% against Bill of Lading. Quote validity must be 60 days.`,
    preparsedData: {
      metadata: {
        id: 'sample-valves-pumps-meta',
        rfqNumber: 'GV-2026-VALV-001',
        title: 'Industrial Process Valves & Slurry Centrifugal Pumps Package',
        clientReference: 'APEX-P4-EXP-2026',
        industry: 'Petrochemical / Industrial Fluid Handling',
        createdDate: '2026-10-15',
        closingDate: '2026-11-15',
        deliveryTerms: 'FOB Houston Port',
        destinationPort: 'Houston, USA',
        currency: 'USD',
        specialInstructions: 'EN 10204 3.1 material test certs mandatory. Vendor must clarify API 607 fire-safe certification.',
        rawInputText: '',
        sourceFileType: 'text',
      },
      status: 'review_required',
      totalAmbiguitiesCount: 3,
      items: [
        {
          id: 'item-vp-1',
          itemNumber: 1,
          productName: 'Chemical Slurry Centrifugal Process Pump',
          category: 'Pumps & Fluid Handling',
          specifications: 'ANSI B73.1 standard heavy-duty slurry pump; Casing material CD4MCu or Duplex 2205 SS; 250 GPM @ 140 ft TDH; 15 HP motor 460V/3Ph/60Hz explosion-proof Class I Div 1; API 682 dual cartridge mechanical seal with Plan 53A piping',
          brandModel: 'Goulds 3196 or Flowserve Durco Mark 3 equivalent',
          quantity: 4,
          unit: 'units',
          targetDeliveryLocation: 'FOB Houston Port',
          targetDeliveryDate: '2026-08-31',
          commercialRequirements: 'API 682 seal plan; EN 10204 3.1 inspection certificate',
          sourceSnippet: 'Centrifugal Chemical Process Pumps: Need 4 units. Must be ANSI B73.1 standard... Prefer Goulds 3196 or Flowserve Durco Mark 3 equivalent.',
          isReviewed: false,
          isInferred: false,
          inferredFields: [],
          missingFields: [],
          ambiguityNotes: ['Confirm if mechanical seal barrier fluid reservoir is included in skid scope.'],
          buyerQuestions: ['Is the seal flush plan 53A reservoir tank and instrumentation within supplier battery limits?']
        },
        {
          id: 'item-vp-2',
          itemNumber: 2,
          productName: 'Cast Steel Flanged Gate Valve',
          category: 'Valves',
          specifications: '6" nominal bore; Bolted bonnet, OS&Y (Outside Screw and Yoke); Body ASTM A216 WCB; Trim 8 (13% Chrome); RF (Raised Face) flanges; API 607 Fire Safe certified',
          brandModel: 'Unspecified (Open to qualified API 600 approved brands)',
          quantity: 24,
          unit: 'pcs',
          targetDeliveryLocation: 'FOB Houston Port',
          targetDeliveryDate: '2026-08-31',
          commercialRequirements: 'API 607 fire-safe certification; EN 10204 3.1 MTR',
          sourceSnippet: 'Flanged High-Pressure Cast Steel Gate Valves: 24 pieces. 6-inch nominal bore... You must ask the vendor if they can supply ANSI Class 300 or 600 - our piping engineer did not confirm the exact rating yet',
          isReviewed: false,
          isInferred: true,
          inferredFields: ['specifications'],
          missingFields: ['Pressure Class (Class 300 vs Class 600 unconfirmed)'],
          ambiguityNotes: ['Piping engineer has not finalized ANSI pressure rating (Class 300 vs 600).'],
          buyerQuestions: ['Please confirm the exact ANSI pressure class (Class 300 or Class 600) for the 6" gate valves before issuing final purchase order.']
        },
        {
          id: 'item-vp-3',
          itemNumber: 3,
          productName: 'Stainless Steel Wafer Butterfly Valve',
          category: 'Valves',
          specifications: '8" size; Wafer / Lug type body; Material 316 Stainless Steel body and disc; Resilient PTFE seat; Rating PN16 / Class 150#; Manual gear operator or 10-position lever',
          brandModel: 'Open / Standard industrial grade',
          quantity: 18,
          unit: 'units',
          targetDeliveryLocation: 'FOB Houston Port',
          targetDeliveryDate: '2026-08-31',
          commercialRequirements: 'Pressure test report to EN 12266-1',
          sourceSnippet: 'Stainless Steel Wafer Style Butterfly Valves: 18 units. Size 8", lug/wafer type, 316SS body and disc with PTFE seat... if 8" requires gear operator please quote gear.',
          isReviewed: false,
          isInferred: true,
          inferredFields: ['specifications'],
          missingFields: [],
          ambiguityNotes: ['Actuation method: Buyer noted "lever operated up to 8", but if 8" requires gear operator please quote gear". Standard 8" butterfly valves normally require worm gear operators.'],
          buyerQuestions: ['Do you require manual worm gear operator with handwheel, or 10-position locking lever for the 8" valves? (Gear operator strongly recommended for 8" line size).']
        },
        {
          id: 'item-vp-4',
          itemNumber: 4,
          productName: 'Simplex Basket Strainer with DP Gauge Tappings',
          category: 'Filtration & Piping Auxiliaries',
          specifications: '4" flanged ends; Body: Cast Iron or Ductile Iron; Screen: 304 Stainless Steel perforated basket with 40-mesh internal wire cloth liner; Working pressure: 200 PSI minimum; Dual 1/4" NPT differential pressure gauge taps included',
          brandModel: 'Open (Eaton, Armstrong, or equivalent)',
          quantity: 6,
          unit: 'sets',
          targetDeliveryLocation: 'FOB Houston Port',
          targetDeliveryDate: '2026-08-31',
          commercialRequirements: 'Hydrostatic pressure test cert',
          sourceSnippet: 'Basket Strainers (Simplex): 6 sets. 4-inch flanged ends, cast iron or ductile iron body, stainless steel 304 perforated screen with 40 mesh lining. Working pressure minimum 200 PSI.',
          isReviewed: true,
          isInferred: false,
          inferredFields: [],
          missingFields: [],
          ambiguityNotes: [],
          buyerQuestions: []
        }
      ]
    }
  },
  {
    id: 'sample-food-automation',
    title: 'Beverage Bottling Line & Packaging Automation Equipment',
    category: 'Food, Beverage & Packaging Machinery',
    sourceType: 'Multi-item Tender WhatsApp Transcript',
    description: 'Stainless steel sanitary conveyors, automatic rotary rinser, and vacuum capper with food contact certifications and missing electrical spec.',
    rawText: `[10:14 AM, Oct 12, 2026] Jan Kowalski: Morning! Sourcing list for our brewery packaging upgrade:
1) Automatic Rotary Bottle Rinser - 16 rinsing clamps, suitable for 330ml and 500ml glass beer bottles. Speed: 3,000 to 4,000 bottles/hour. Complete sanitary SUS304 frame and water recycling filtration tank. Must have no-bottle no-rinse sensors.
2) High-speed In-line Capping Machine: Crown cork 26mm for beer bottles. Vibratory bowl sorter, magnetic torque capping heads. 4 heads minimum.
3) Modu-link Stainless Steel Bottle Conveyor line: Total length 45 meters. Width 82.5mm POM slat chain, stainless 304 side frames with adjustable guide rails and drip trays. Need 3 drive stations with SEW Eurodrive motor gearboxes (or ABB/Nord). Variable speed inverter control included.
Delivery CIF Gdansk Port by November 2026. All machines must have CE Declaration of Conformity and FDA food grade silicone/EPDM seals.
Budget is tight, need prices in EUR. Oh and check with supplier about spare parts kit for 1 year operation!`,
    preparsedData: {
      metadata: {
        id: 'sample-food-automation-meta',
        rfqNumber: 'GV-2026-BEV-004',
        title: 'Beverage Bottling Line & Packaging Automation Equipment',
        clientReference: 'WARSAW-BREW-V1',
        industry: 'Food & Beverage Processing Machinery',
        createdDate: '2026-10-15',
        closingDate: '2026-11-20',
        deliveryTerms: 'CIF Gdansk Port',
        destinationPort: 'Gdansk, Poland',
        currency: 'EUR',
        specialInstructions: 'CE Declaration of Conformity required. FDA compliant food-grade seals. Include 1-year spare parts kit.',
        rawInputText: '',
        sourceFileType: 'text',
      },
      status: 'review_required',
      totalAmbiguitiesCount: 2,
      items: [
        {
          id: 'item-food-1',
          itemNumber: 1,
          productName: 'Automatic Rotary Bottle Rinser (16 Clamps)',
          category: 'Bottling Machinery',
          specifications: '16 rinsing clamps; Capacity 3,000 - 4,000 BPH for 330ml & 500ml glass bottles; SUS304 construction; Water recycling tank with multi-stage filter; Optical sensor for no-bottle no-rinse control',
          brandModel: 'Open to European / Asian high-tier manufacturers',
          quantity: 1,
          unit: 'set',
          targetDeliveryLocation: 'CIF Gdansk Port',
          targetDeliveryDate: '2026-11-30',
          commercialRequirements: 'CE Declaration of Conformity; FDA compliance certificate for elastomeric seals; 1-year essential spares',
          sourceSnippet: 'Automatic Rotary Bottle Rinser - 16 rinsing clamps, suitable for 330ml and 500ml glass beer bottles. Speed: 3,000 to 4,000 bottles/hour.',
          isReviewed: false,
          isInferred: true,
          inferredFields: ['specifications'],
          missingFields: ['Electrical Supply Voltage/Frequency (e.g. 400V 50Hz 3-phase)'],
          ambiguityNotes: ['Factory power supply (voltage / frequency) not specified.'],
          buyerQuestions: ['What is the factory power supply specification (e.g. 400V / 50Hz / 3-Phase)?']
        },
        {
          id: 'item-food-2',
          itemNumber: 2,
          productName: 'Automatic 4-Head Rotary Crown Capping Machine',
          category: 'Bottling Machinery',
          specifications: '4 capping heads; Magnetic torque control; Cap size: standard 26mm crown cork; Automatic vibratory bowl feeder and chute with photodetector; SUS304 guarding with safety interlocks',
          brandModel: 'Open',
          quantity: 1,
          unit: 'set',
          targetDeliveryLocation: 'CIF Gdansk Port',
          targetDeliveryDate: '2026-11-30',
          commercialRequirements: 'CE mark; Machine manual in English',
          sourceSnippet: 'High-speed In-line Capping Machine: Crown cork 26mm for beer bottles. Vibratory bowl sorter, magnetic torque capping heads. 4 heads minimum.',
          isReviewed: false,
          isInferred: false,
          inferredFields: [],
          missingFields: ['Compressed Air Pressure & Flow requirement'],
          ambiguityNotes: ['Compressed air supply parameters unstated.'],
          buyerQuestions: ['Does your facility have dry compressed air available at 6-8 bar for pneumatic capping?']
        },
        {
          id: 'item-food-3',
          itemNumber: 3,
          productName: 'Sanitary Stainless Steel Slat Chain Bottle Conveyor Line',
          category: 'Conveying & Material Handling',
          specifications: '45m total length; 82.5mm width POM low-friction slat chain; SUS304 side frames; Drip tray with drain ports; 3 drive stations with SEW Eurodrive (or ABB/Nord) geared motors; Variable frequency drive (VFD) speed adjustment',
          brandModel: 'SEW-Eurodrive / Nord / ABB drives specified',
          quantity: 45,
          unit: 'meters',
          targetDeliveryLocation: 'CIF Gdansk Port',
          targetDeliveryDate: '2026-11-30',
          commercialRequirements: 'Food contact materials declaration',
          sourceSnippet: 'Modu-link Stainless Steel Bottle Conveyor line: Total length 45 meters. Width 82.5mm POM slat chain, stainless 304 side frames... 3 drive stations with SEW Eurodrive motor gearboxes',
          isReviewed: true,
          isInferred: false,
          inferredFields: [],
          missingFields: [],
          ambiguityNotes: [],
          buyerQuestions: []
        }
      ]
    }
  },
  {
    id: 'sample-solar-bess',
    title: 'Utility-Scale Solar PV Modules & Inverters Tender',
    category: 'Renewable Energy & Electrical Infrastructure',
    sourceType: 'Procurement Schedule Document',
    description: 'Tier-1 bifacial N-type PV modules and 125kW string inverters with strict warranty, efficiency, and delivery packaging requirements.',
    rawText: `PROJECT TITAN SOLAR 15MWp EXPANSION
Procurement Lot 1 & Lot 2 Material Specification:

Item 1: N-Type TOPCon Bifacial Dual-Glass Solar Modules
Total DC Capacity required: 8.5 MWp (Approximately 14,400 modules assuming 590W rating).
Minimum module efficiency: 22.5%.
Dimensions max: 2278 x 1134 x 30mm.
Connector: Original MC4-EVO2 or compatible.
Tier-1 BloombergNEF manufacturer list only (e.g. Longi, JinkoSolar, Trina, or Canadian Solar).
Warranty: 12-year product warranty, 30-year linear performance degradation warranty (<0.4%/yr).
Delivery: DDP Site, Valencia, Spain, in batches between Sept - Oct 2026.

Item 2: Grid-Tied Three-Phase String Inverters 125kW
Quantity: 68 units.
Rated AC output: 125 kVA @ 400V / 50Hz, 3-Phase + PE.
Minimum 10 MPPT trackers, max input voltage 1100V DC.
Efficiency: Maximum >98.8%, European >98.4%.
Protection: IP66 enclosure, Type II AC and DC surge protection.
Approved brands: Sungrow SG125CX or Huawei SUN2000-115KTL or equivalent Tier 1.
Communication: RS485 and Ethernet with Modbus TCP protocol.

Packaging & Transport: Sea shipping in heavy duty reinforced wooden crates with tilt/impact indicator sensors.`,
    preparsedData: {
      metadata: {
        id: 'sample-solar-bess-meta',
        rfqNumber: 'GV-2026-SOLAR-012',
        title: 'Utility-Scale Solar PV Modules & Inverters Tender',
        clientReference: 'TITAN-15MW-SPAIN',
        industry: 'Renewable Energy & Solar Infrastructure',
        createdDate: '2026-10-15',
        closingDate: '2026-11-30',
        deliveryTerms: 'DDP Site, Valencia, Spain',
        destinationPort: 'Valencia, Spain',
        currency: 'EUR',
        specialInstructions: 'BNEF Tier-1 manufacturers only. Sea packaging with tilt and impact indicators. 30-year linear degradation warranty.',
        rawInputText: '',
        sourceFileType: 'text',
      },
      status: 'ready_for_export',
      totalAmbiguitiesCount: 1,
      items: [
        {
          id: 'item-sol-1',
          itemNumber: 1,
          productName: 'N-Type TOPCon Bifacial Dual-Glass Solar PV Modules (590W+)',
          category: 'Solar PV Modules',
          specifications: 'N-Type TOPCon Bifacial technology; Dual-glass; Min 590Wp rated power; Min 22.5% efficiency; Dimensions max 2278x1134x30mm; MC4-EVO2 connectors; 30-yr linear performance warranty (<0.4%/yr degradation)',
          brandModel: 'Tier-1 BNEF: Longi, JinkoSolar, Trina Solar, or Canadian Solar',
          quantity: 14400,
          unit: 'pcs',
          targetDeliveryLocation: 'DDP Site, Valencia, Spain',
          targetDeliveryDate: '2026-10-15',
          commercialRequirements: 'IEC 61215, IEC 61730 certifications; Factory flash test reports per pallet',
          sourceSnippet: 'N-Type TOPCon Bifacial Dual-Glass Solar Modules... Total DC Capacity required: 8.5 MWp (Approximately 14,400 modules assuming 590W rating). Tier-1 BloombergNEF manufacturer list only',
          isReviewed: true,
          isInferred: false,
          inferredFields: [],
          missingFields: [],
          ambiguityNotes: ['Palletization quantity and container packing efficiency depends on supplier frame thickness.'],
          buyerQuestions: ['Will the unloading site have overhead cranes or heavy forklifts for double-stacked 40ft HQ container unloading?']
        },
        {
          id: 'item-sol-2',
          itemNumber: 2,
          productName: 'Three-Phase Grid-Tied String Inverter 125kW',
          category: 'Power Inverters & Conversion',
          specifications: '125 kVA @ 400V 50Hz AC; Min 10 MPPTs, 1100V max DC; Max efficiency >98.8%, Euro >98.4%; IP66 rating; Integrated Type II DC & AC SPDs; RS485 & Ethernet Modbus TCP',
          brandModel: 'Sungrow SG125CX or Huawei SUN2000-115KTL or approved equal',
          quantity: 68,
          unit: 'units',
          targetDeliveryLocation: 'DDP Site, Valencia, Spain',
          targetDeliveryDate: '2026-09-30',
          commercialRequirements: 'Spanish grid code compliance (UNE 217001 / UNE 217002 / RD 647)',
          sourceSnippet: 'Grid-Tied Three-Phase String Inverters 125kW. Quantity: 68 units. Rated AC output: 125 kVA @ 400V / 50Hz, 3-Phase + PE... Approved brands: Sungrow SG125CX or Huawei SUN2000-115KTL',
          isReviewed: true,
          isInferred: false,
          inferredFields: [],
          missingFields: [],
          ambiguityNotes: [],
          buyerQuestions: []
        }
      ]
    }
  }
];
