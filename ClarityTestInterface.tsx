import React, { useState } from 'react';
import { CLARITY_PRESETS, generateClarityCSS, enhanceThermalPrint, testClarityPresets, getPrinterRecommendations } from './ThermalClarityOptimizer';
import { printDensityTest, copyDensityTestCommands, DENSITY_LEVELS, getRecommendedDensity } from './PrinterDensityAdjuster';

const ClarityTestInterface: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<keyof typeof CLARITY_PRESETS>('standard');
  const [printerModel, setPrinterModel] = useState('');
  const [paperAge, setPaperAge] = useState<'new' | 'good' | 'old'>('good');
  const [printerCondition, setPrinterCondition] = useState<'new' | 'good' | 'worn'>('good');

  const testSampleReceipt = () => {
    const testHTML = `
      <div class="thermal-content">
        <div class="business-name text-xl">CLARITY TEST RECEIPT</div>
        <div class="text-sm">Testing Text Clarity</div>
        <div class="text-sm">Preset: ${selectedPreset.toUpperCase()}</div>
        <div class="receipt-divider">================================</div>
        <div class="bill-number text-base">Bill No: CLARITY-001</div>
        <div class="text-sm">Date: ${new Date().toLocaleDateString()}</div>
        <div class="receipt-divider">--------------------------------</div>
        <div class="text-sm">Sample Item 1    x2    ₹100   ₹200</div>
        <div class="text-sm">Sample Item 2    x1    ₹150   ₹150</div>
        <div class="text-sm">Long Item Name Test x1 ₹50    ₹50</div>
        <div class="receipt-divider">--------------------------------</div>
        <div class="text-sm">Subtotal:                    ₹400</div>
        <div class="text-sm">Discount:                    ₹50</div>
        <div class="text-sm">GST (18%):                   ₹63</div>
        <div class="receipt-divider">================================</div>
        <div class="total-amount text-lg">TOTAL: ₹413</div>
        <div class="receipt-divider">================================</div>
        <div class="text-xs">Thank you for your business!</div>
        <div class="text-xs">Visit again soon!</div>
      </div>
    `;

    const enhancedHTML = enhanceThermalPrint(testHTML, selectedPreset);
    const printWindow = window.open('', '_blank', 'width=320,height=700,scrollbars=yes');
    
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Thermal Clarity Test - ${selectedPreset.toUpperCase()}</title>
          <meta charset="UTF-8">
        </head>
        <body>
          <div style="padding: 20px; font-family: Arial, sans-serif;">
            <h2>Thermal Print Clarity Test</h2>
            <p><strong>Preset:</strong> ${selectedPreset.toUpperCase()}</p>
            <p><strong>Settings:</strong></p>
            <ul>
              <li>Font Size: ${CLARITY_PRESETS[selectedPreset].fontSize}pt</li>
              <li>Font Weight: ${CLARITY_PRESETS[selectedPreset].fontWeight}</li>
              <li>Letter Spacing: ${CLARITY_PRESETS[selectedPreset].letterSpacing}px</li>
              <li>Line Height: ${CLARITY_PRESETS[selectedPreset].lineHeight}</li>
            </ul>
            <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px; margin: 10px 0;">
              🖨️ Print Test Receipt
            </button>
            <hr>
            ${enhancedHTML}
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const getRecommendedPreset = () => {
    if (printerModel.trim()) {
      const recommended = getPrinterRecommendations(printerModel);
      setSelectedPreset(recommended);
      alert(`Recommended preset for "${printerModel}": ${recommended.toUpperCase()}`);
    } else {
      alert('Please enter your printer model first');
    }
  };

  const showPresetDetails = (preset: keyof typeof CLARITY_PRESETS) => {
    const settings = CLARITY_PRESETS[preset];
    return (
      <div className="preset-details" style={{ 
        background: '#f5f5f5', 
        padding: '10px', 
        margin: '5px 0', 
        borderRadius: '5px',
        fontSize: '12px'
      }}>
        <strong>{preset.toUpperCase()}:</strong><br/>
        Font: {settings.fontSize}pt, Weight: {settings.fontWeight}<br/>
        Spacing: {settings.letterSpacing}px, Line: {settings.lineHeight}<br/>
        Density: {settings.density}, Speed: {settings.speed}
      </div>
    );
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>🖨️ Thermal Print Clarity Optimizer</h2>
      <p>Test different clarity settings to find the best one for your thermal printer.</p>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Your Printer Model (optional):
        </label>
        <input
          type="text"
          value={printerModel}
          onChange={(e) => setPrinterModel(e.target.value)}
          placeholder="e.g., SP POS891US, TSC TL240, Epson TM-T20"
          style={{ 
            width: '300px', 
            padding: '8px', 
            border: '1px solid #ccc', 
            borderRadius: '4px',
            marginRight: '10px'
          }}
        />
        <button 
          onClick={getRecommendedPreset}
          style={{ 
            padding: '8px 15px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Get Recommendation
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
          Select Clarity Preset:
        </label>
        
        {Object.keys(CLARITY_PRESETS).map((preset) => (
          <div key={preset} style={{ marginBottom: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', cursor: 'pointer' }}>
              <input
                type="radio"
                name="preset"
                value={preset}
                checked={selectedPreset === preset}
                onChange={(e) => setSelectedPreset(e.target.value as keyof typeof CLARITY_PRESETS)}
                style={{ marginRight: '10px', marginTop: '5px' }}
              />
              <div>
                <strong>{preset.charAt(0).toUpperCase() + preset.slice(1)} Quality</strong>
                {showPresetDetails(preset as keyof typeof CLARITY_PRESETS)}
              </div>
            </label>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={testSampleReceipt}
          style={{
            padding: '15px 30px',
            fontSize: '16px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          🧪 Test Selected Preset
        </button>
        
        <button
          onClick={testClarityPresets}
          style={{
            padding: '15px 30px',
            fontSize: '16px',
            backgroundColor: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          📊 Compare All Presets
        </button>

        <button
          onClick={printDensityTest}
          style={{
            padding: '15px 30px',
            fontSize: '16px',
            backgroundColor: '#fd7e14',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          🔧 Test Printer Density
        </button>

        <button
          onClick={copyDensityTestCommands}
          style={{
            padding: '15px 30px',
            fontSize: '16px',
            backgroundColor: '#6f42c1',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          📋 Copy ESC/POS Test
        </button>
      </div>

      <div style={{ 
        background: '#f8f9fa', 
        padding: '15px', 
        borderRadius: '5px',
        marginBottom: '20px',
        border: '1px solid #dee2e6'
      }}>
        <h3>🎯 Density Recommendation:</h3>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'inline-block', width: '150px', fontWeight: 'bold' }}>
            Paper Quality:
          </label>
          <select 
            value={paperAge} 
            onChange={(e) => setPaperAge(e.target.value as 'new' | 'good' | 'old')}
            style={{ padding: '5px', marginRight: '20px' }}
          >
            <option value="new">New/Fresh Paper</option>
            <option value="good">Good Quality Paper</option>
            <option value="old">Old/Faded Paper</option>
          </select>

          <label style={{ display: 'inline-block', width: '150px', fontWeight: 'bold' }}>
            Printer Condition:
          </label>
          <select 
            value={printerCondition} 
            onChange={(e) => setPrinterCondition(e.target.value as 'new' | 'good' | 'worn')}
            style={{ padding: '5px' }}
          >
            <option value="new">New Printer Head</option>
            <option value="good">Good Condition</option>
            <option value="worn">Worn/Old Head</option>
          </select>
        </div>
        
        <div style={{ 
          background: '#e9ecef', 
          padding: '10px', 
          borderRadius: '3px',
          fontWeight: 'bold',
          color: '#495057'
        }}>
          Recommended Density: {getRecommendedDensity(paperAge, printerCondition).toUpperCase()} 
          (Level {DENSITY_LEVELS[getRecommendedDensity(paperAge, printerCondition)].level})
        </div>
      </div>

      <div style={{ 
        background: '#e9ecef', 
        padding: '15px', 
        borderRadius: '5px',
        marginTop: '20px'
      }}>
        <h3>💡 Clarity Tips:</h3>
        <ul style={{ marginLeft: '20px' }}>
          <li><strong>High Quality:</strong> For 203+ DPI printers (TSC, Zebra)</li>
          <li><strong>Standard:</strong> For most thermal receipt printers (Epson, Star)</li>
          <li><strong>Low Quality:</strong> For older or low-resolution printers</li>
          <li>Test each preset to see which works best with your specific printer</li>
          <li>Bold text generally prints clearer on thermal printers</li>
          <li>Larger fonts with more spacing improve readability</li>
        </ul>
      </div>

      <div style={{ 
        background: '#fff3cd', 
        padding: '15px', 
        borderRadius: '5px',
        marginTop: '15px',
        border: '1px solid #ffeaa7'
      }}>
        <h3>🔧 Additional Printer Settings:</h3>
        <p>For best results, also check your printer's physical settings:</p>
        <ul style={{ marginLeft: '20px' }}>
          <li>Print density/darkness: Medium to high</li>
          <li>Print speed: Slower speeds often produce clearer text</li>
          <li>Paper quality: Use good quality thermal paper</li>
          <li>Printer head cleaning: Clean regularly for consistent quality</li>
        </ul>
      </div>
    </div>
  );
};

export default ClarityTestInterface;