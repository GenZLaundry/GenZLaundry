// THERMAL PRINT CLARITY OPTIMIZER
// Advanced settings to improve text clarity on thermal printers

export interface ClaritySettings {
  fontSize: number;
  fontWeight: 'normal' | 'bold' | 'bolder';
  letterSpacing: number;
  lineHeight: number;
  fontFamily: string[];
  textStroke: number;
  density: number;
  speed: number;
}

// Optimized settings for different thermal printer types
export const CLARITY_PRESETS = {
  // High-quality thermal printers (203+ DPI)
  highQuality: {
    fontSize: 11,
    fontWeight: 'bold' as const,
    letterSpacing: 0.5,
    lineHeight: 1.3,
    fontFamily: ['Courier New', 'Consolas', 'Monaco', 'monospace'],
    textStroke: 0.1,
    density: 12,
    speed: 3
  },
  
  // Standard thermal printers (150-203 DPI)
  standard: {
    fontSize: 12,
    fontWeight: 'bold' as const,
    letterSpacing: 0.8,
    lineHeight: 1.4,
    fontFamily: ['Courier New', 'Consolas', 'monospace'],
    textStroke: 0.2,
    density: 14,
    speed: 2
  },
  
  // Low-quality thermal printers (<150 DPI)
  lowQuality: {
    fontSize: 14,
    fontWeight: 'bolder' as const,
    letterSpacing: 1.0,
    lineHeight: 1.5,
    fontFamily: ['Courier New', 'monospace'],
    textStroke: 0.3,
    density: 16,
    speed: 1
  }
};

// Generate optimized CSS for thermal printing
export const generateClarityCSS = (preset: keyof typeof CLARITY_PRESETS = 'standard'): string => {
  const settings = CLARITY_PRESETS[preset];
  
  return `
/* THERMAL CLARITY OPTIMIZED CSS - ${preset.toUpperCase()} PRESET */
@media print {
  @page {
    size: 80mm auto !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  
  * {
    margin: 0 !important;
    padding: 0 !important;
    box-sizing: border-box !important;
  }
  
  body {
    width: 80mm !important;
    height: auto !important;
    margin: 0 !important;
    padding: 3mm !important;
    font-family: ${settings.fontFamily.map(f => `'${f}'`).join(', ')} !important;
    font-size: ${settings.fontSize}pt !important;
    font-weight: ${settings.fontWeight} !important;
    line-height: ${settings.lineHeight} !important;
    letter-spacing: ${settings.letterSpacing}px !important;
    background: white !important;
    color: black !important;
    -webkit-font-smoothing: none !important;
    -moz-osx-font-smoothing: unset !important;
    -webkit-text-stroke: ${settings.textStroke}px black !important;
    text-rendering: optimizeLegibility !important;
  }
  
  .thermal-content {
    width: 100% !important;
    height: auto !important;
  }
  
  /* Text size variations */
  .text-xs { font-size: ${settings.fontSize - 2}pt !important; font-weight: ${settings.fontWeight} !important; }
  .text-sm { font-size: ${settings.fontSize - 1}pt !important; font-weight: ${settings.fontWeight} !important; }
  .text-base { font-size: ${settings.fontSize}pt !important; font-weight: ${settings.fontWeight} !important; }
  .text-lg { font-size: ${settings.fontSize + 2}pt !important; font-weight: ${settings.fontWeight} !important; }
  .text-xl { font-size: ${settings.fontSize + 4}pt !important; font-weight: ${settings.fontWeight} !important; }
  .text-2xl { font-size: ${settings.fontSize + 6}pt !important; font-weight: ${settings.fontWeight} !important; }
  
  /* Enhanced clarity for important elements */
  .business-name,
  .total-amount,
  .bill-number {
    font-weight: bolder !important;
    -webkit-text-stroke: ${settings.textStroke + 0.1}px black !important;
    letter-spacing: ${settings.letterSpacing + 0.2}px !important;
  }
  
  /* Ensure proper spacing */
  .receipt-section {
    margin-bottom: 2mm !important;
  }
  
  .receipt-divider {
    margin: 1.5mm 0 !important;
    font-weight: normal !important;
  }
}
`;
};

// ESC/POS commands for enhanced clarity
export const generateClarityESCPOS = (preset: keyof typeof CLARITY_PRESETS = 'standard') => {
  const settings = CLARITY_PRESETS[preset];
  
  return {
    // Initialize with clarity settings
    init: '\x1B\x40', // Initialize printer
    
    // Font settings for clarity
    setFont: (size: 'small' | 'normal' | 'large' = 'normal') => {
      switch (size) {
        case 'small': return '\x1B\x21\x08'; // Bold small
        case 'large': return '\x1B\x21\x18'; // Bold large
        default: return '\x1B\x21\x08'; // Bold normal
      }
    },
    
    // Enhanced text commands
    printClearText: (text: string, bold: boolean = true) => {
      let command = '';
      if (bold) command += '\x1B\x21\x08'; // Bold
      command += text;
      if (bold) command += '\x1B\x21\x00'; // Reset
      return command;
    },
    
    // Density and speed commands (printer-specific)
    setDensity: (density: number = settings.density) => `\x1B\x7E\x44${String.fromCharCode(density)}`,
    setSpeed: (speed: number = settings.speed) => `\x1B\x7E\x53${String.fromCharCode(speed)}`,
    
    // Line spacing for clarity
    setLineSpacing: (spacing: number = Math.round(settings.lineHeight * 10)) => 
      `\x1B\x33${String.fromCharCode(spacing)}`,
  };
};

// Apply clarity settings to existing thermal print function
export const enhanceThermalPrint = (htmlContent: string, preset: keyof typeof CLARITY_PRESETS = 'standard'): string => {
  const clarityCSS = generateClarityCSS(preset);
  
  // Inject clarity CSS into HTML
  const cssInjection = `<style>${clarityCSS}</style>`;
  
  if (htmlContent.includes('<head>')) {
    return htmlContent.replace('</head>', `${cssInjection}</head>`);
  } else if (htmlContent.includes('<html>')) {
    return htmlContent.replace('<html>', `<html><head>${cssInjection}</head>`);
  } else {
    return `<html><head>${cssInjection}</head><body>${htmlContent}</body></html>`;
  }
};

// Test different clarity presets
export const testClarityPresets = () => {
  const testHTML = `
    <div class="thermal-content">
      <div class="business-name text-xl">TEST BUSINESS NAME</div>
      <div class="text-sm">123 Test Street, Test City</div>
      <div class="text-sm">Phone: +91 98765 43210</div>
      <div class="receipt-divider">================================</div>
      <div class="bill-number text-base">Bill No: TEST-001</div>
      <div class="text-sm">Customer: Test Customer</div>
      <div class="receipt-divider">--------------------------------</div>
      <div class="text-sm">Test Item 1 x 2 = ₹200</div>
      <div class="text-sm">Test Item 2 x 1 = ₹150</div>
      <div class="receipt-divider">--------------------------------</div>
      <div class="total-amount text-lg">TOTAL: ₹350</div>
      <div class="receipt-divider">================================</div>
      <div class="text-xs">Thank you for your business!</div>
    </div>
  `;
  
  // Generate test pages for each preset
  Object.keys(CLARITY_PRESETS).forEach(preset => {
    const enhancedHTML = enhanceThermalPrint(testHTML, preset as keyof typeof CLARITY_PRESETS);
    const printWindow = window.open('', '_blank', 'width=320,height=600');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Clarity Test - ${preset.toUpperCase()}</title>
        </head>
        <body>
          <h3>Clarity Preset: ${preset.toUpperCase()}</h3>
          ${enhancedHTML}
          <br><button onclick="window.print()">Print Test</button>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
  });
};

// Printer-specific clarity recommendations
export const getPrinterRecommendations = (printerModel: string): keyof typeof CLARITY_PRESETS => {
  const model = printerModel.toLowerCase();
  
  if (model.includes('tsc') || model.includes('zebra') || model.includes('203dpi')) {
    return 'highQuality';
  } else if (model.includes('epson') || model.includes('star') || model.includes('citizen')) {
    return 'standard';
  } else {
    return 'lowQuality'; // Conservative approach for unknown printers
  }
};

export default {
  CLARITY_PRESETS,
  generateClarityCSS,
  generateClarityESCPOS,
  enhanceThermalPrint,
  testClarityPresets,
  getPrinterRecommendations
};