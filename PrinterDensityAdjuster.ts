// PRINTER DENSITY ADJUSTER - SP POS891US SPECIFIC
// Commands to adjust print density for clearer text

export interface DensitySettings {
  level: number; // 0-15 (0=lightest, 15=darkest)
  description: string;
  recommended: string[];
}

// Density levels for SP POS891US
export const DENSITY_LEVELS: Record<string, DensitySettings> = {
  veryLight: {
    level: 3,
    description: 'Very Light - For high-quality thermal paper',
    recommended: ['High-quality paper', 'New printer head', 'Fast printing']
  },
  light: {
    level: 6,
    description: 'Light - Standard setting for good paper',
    recommended: ['Good quality paper', 'Normal conditions']
  },
  medium: {
    level: 9,
    description: 'Medium - Balanced setting (recommended)',
    recommended: ['Standard thermal paper', 'Most conditions', 'Best clarity']
  },
  dark: {
    level: 12,
    description: 'Dark - For older paper or worn printer head',
    recommended: ['Older thermal paper', 'Worn printer head', 'Faded prints']
  },
  veryDark: {
    level: 15,
    description: 'Very Dark - Maximum darkness',
    recommended: ['Very old paper', 'Last resort', 'May cause smearing']
  }
};

// ESC/POS commands for SP POS891US density adjustment
export const SP_DENSITY_COMMANDS = {
  // Set print density (0-15)
  setDensity: (level: number): string => {
    const clampedLevel = Math.max(0, Math.min(15, level));
    return `\x1B\x7E\x44${String.fromCharCode(clampedLevel)}`;
  },
  
  // Set print speed (affects clarity)
  setSpeed: (speed: 1 | 2 | 3 | 4 | 5): string => {
    return `\x1B\x7E\x53${String.fromCharCode(speed)}`;
  },
  
  // Initialize printer with optimal settings
  initWithClarity: (densityLevel: number = 9, speed: number = 3): string => {
    return '\x1B\x40' + // Initialize
           SP_DENSITY_COMMANDS.setDensity(densityLevel) +
           SP_DENSITY_COMMANDS.setSpeed(speed as 1 | 2 | 3 | 4 | 5);
  },
  
  // Test print with different densities
  generateDensityTest: (): string => {
    let testCommands = '\x1B\x40'; // Initialize
    
    testCommands += '\x1B\x61\x01'; // Center align
    testCommands += '\x1B\x21\x08'; // Bold
    testCommands += 'DENSITY TEST PRINT\n';
    testCommands += '\x1B\x21\x00'; // Normal
    testCommands += '='.repeat(32) + '\n';
    
    // Test each density level
    Object.entries(DENSITY_LEVELS).forEach(([key, settings]) => {
      testCommands += SP_DENSITY_COMMANDS.setDensity(settings.level);
      testCommands += `Density ${settings.level} (${key.toUpperCase()})\n`;
      testCommands += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ\n';
      testCommands += '0123456789 !@#$%^&*()\n';
      testCommands += 'The quick brown fox jumps\n';
      testCommands += '-'.repeat(32) + '\n';
    });
    
    testCommands += '='.repeat(32) + '\n';
    testCommands += 'Choose the clearest density\n';
    testCommands += 'and update your settings.\n\n';
    
    // Cut paper
    testCommands += '\x1B\x69'; // Partial cut
    
    return testCommands;
  }
};

// Generate density adjustment HTML for web printing
export const generateDensityTestHTML = (): string => {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>Thermal Printer Density Test</title>
  <style>
    @media print {
      @page { size: 80mm auto; margin: 0; }
      body { 
        width: 80mm; 
        margin: 0; 
        padding: 3mm; 
        font-family: 'Courier New', monospace; 
        font-size: 10pt;
        line-height: 1.2;
      }
    }
    .density-section {
      margin-bottom: 5mm;
      page-break-inside: avoid;
    }
    .density-label {
      font-weight: bold;
      text-align: center;
      margin-bottom: 2mm;
    }
    .test-text {
      font-family: 'Courier New', monospace;
      line-height: 1.1;
    }
    .divider {
      text-align: center;
      margin: 2mm 0;
    }
  </style>
</head>
<body>
  <div class="density-label">THERMAL PRINTER DENSITY TEST</div>
  <div class="divider">=================================</div>
  
  ${Object.entries(DENSITY_LEVELS).map(([key, settings]) => `
    <div class="density-section">
      <div class="density-label">DENSITY ${settings.level} (${key.toUpperCase()})</div>
      <div class="test-text">ABCDEFGHIJKLMNOPQRSTUVWXYZ</div>
      <div class="test-text">abcdefghijklmnopqrstuvwxyz</div>
      <div class="test-text">0123456789 !@#$%^&*()</div>
      <div class="test-text">The quick brown fox jumps over</div>
      <div class="test-text">₹123.45 Bill#001 Date:${new Date().toLocaleDateString()}</div>
      <div class="divider">---------------------------------</div>
    </div>
  `).join('')}
  
  <div class="density-label">INSTRUCTIONS:</div>
  <div class="test-text">1. Print this test page</div>
  <div class="test-text">2. Find the clearest density level</div>
  <div class="test-text">3. Update your printer settings</div>
  <div class="test-text">4. Use that density for all prints</div>
  
  <div style="margin-top: 10mm; text-align: center; font-size: 8pt;">
    Generated: ${new Date().toLocaleString()}
  </div>
</body>
</html>
  `;
};

// Print density test page
export const printDensityTest = () => {
  const testHTML = generateDensityTestHTML();
  const printWindow = window.open('', '_blank', 'width=320,height=700');
  
  if (printWindow) {
    printWindow.document.write(testHTML);
    printWindow.document.close();
    
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 500);
    };
  } else {
    alert('Please allow popups to print the density test');
  }
};

// Copy ESC/POS density test commands to clipboard
export const copyDensityTestCommands = () => {
  const commands = SP_DENSITY_COMMANDS.generateDensityTest();
  
  if (navigator.clipboard) {
    navigator.clipboard.writeText(commands).then(() => {
      alert('✅ Density test commands copied to clipboard!\n\nPaste these into your thermal printer software to test different density levels.');
    });
  } else {
    // Fallback
    const textArea = document.createElement('textarea');
    textArea.value = commands;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    alert('✅ Density test commands copied!');
  }
};

// Get recommended density based on paper age and printer condition
export const getRecommendedDensity = (paperAge: 'new' | 'good' | 'old', printerCondition: 'new' | 'good' | 'worn'): keyof typeof DENSITY_LEVELS => {
  if (paperAge === 'new' && printerCondition === 'new') return 'light';
  if (paperAge === 'new' && printerCondition === 'good') return 'medium';
  if (paperAge === 'good' && printerCondition === 'new') return 'medium';
  if (paperAge === 'good' && printerCondition === 'good') return 'medium';
  if (paperAge === 'old' || printerCondition === 'worn') return 'dark';
  return 'medium'; // Default safe choice
};

export default {
  DENSITY_LEVELS,
  SP_DENSITY_COMMANDS,
  generateDensityTestHTML,
  printDensityTest,
  copyDensityTestCommands,
  getRecommendedDensity
};