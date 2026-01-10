// PRINTER TEST INTERFACE - TSC TL240 + SP POS891US
// Quick testing and verification for your specific printers

import React, { useState, useEffect } from 'react';
import { dualPrinterManager } from './DualPrinterManager';
import { PRINTER_SPECS } from './PrinterConfig';

export const PrinterTestInterface: React.FC = () => {
  const [printerStatus, setPrinterStatus] = useState({ thermal: false, tsc: false });
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    updateStatus();
  }, []);

  const updateStatus = () => {
    const status = dualPrinterManager.getPrinterStatus();
    setPrinterStatus({
      thermal: status.thermal.connected,
      tsc: status.tsc.connected
    });
  };

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const connectPrinters = async () => {
    setIsConnecting(true);
    addResult('🔌 Starting printer connection...');
    
    try {
      const results = await dualPrinterManager.connectAllPrinters();
      
      if (results.thermal) {
        addResult('✅ SP POS891US connected successfully');
      } else {
        addResult('❌ SP POS891US connection failed');
      }
      
      if (results.tsc) {
        addResult('✅ TSC TL240 connected successfully');
      } else {
        addResult('❌ TSC TL240 connection failed');
      }
      
      updateStatus();
      
    } catch (error) {
      addResult(`❌ Connection error: ${(error as Error).message}`);
    }
    
    setIsConnecting(false);
  };

  const testAllPrinters = async () => {
    setIsTesting(true);
    addResult('🧪 Starting printer tests...');
    
    try {
      const results = await dualPrinterManager.testAllPrinters();
      
      if (results.thermal) {
        addResult('✅ SP POS891US test print successful');
      } else {
        addResult('❌ SP POS891US test print failed');
      }
      
      if (results.tsc) {
        addResult('✅ TSC TL240 test print successful');
      } else {
        addResult('❌ TSC TL240 test print failed');
      }
      
    } catch (error) {
      addResult(`❌ Test error: ${(error as Error).message}`);
    }
    
    setIsTesting(false);
  };

  const testSampleOrder = async () => {
    addResult('📋 Testing complete laundry order...');
    
    try {
      const sampleOrder = dualPrinterManager.generateSampleOrder();
      const result = await dualPrinterManager.processLaundryOrder(sampleOrder);
      
      if (result.billPrinted && result.tagsPrinted) {
        addResult('✅ Complete order test successful - Bill & Tags printed');
      } else if (result.billPrinted) {
        addResult('⚠️ Partial success - Bill printed, Tags failed');
      } else if (result.tagsPrinted) {
        addResult('⚠️ Partial success - Tags printed, Bill failed');
      } else {
        addResult('❌ Complete order test failed');
      }
      
      if (result.errors.length > 0) {
        result.errors.forEach(error => addResult(`❌ Error: ${error}`));
      }
      
    } catch (error) {
      addResult(`❌ Order test error: ${(error as Error).message}`);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="printer-test-interface">
      <style>{`
        .printer-test-interface {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: #f5f5f5;
          min-height: 100vh;
        }
        
        .test-header {
          background: linear-gradient(135deg, #2196F3 0%, #21CBF3 100%);
          color: white;
          padding: 20px;
          border-radius: 10px;
          margin-bottom: 20px;
          text-align: center;
        }
        
        .printer-cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }
        
        .printer-card {
          background: white;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          border-left: 5px solid #ddd;
        }
        
        .printer-card.connected {
          border-left-color: #4CAF50;
        }
        
        .printer-card.disconnected {
          border-left-color: #f44336;
        }
        
        .status-indicator {
          display: inline-block;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          margin-right: 10px;
        }
        
        .status-connected { background: #4CAF50; }
        .status-disconnected { background: #f44336; }
        
        .printer-specs {
          font-size: 12px;
          color: #666;
          margin-top: 10px;
        }
        
        .test-controls {
          background: white;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          margin-bottom: 20px;
        }
        
        .control-buttons {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }
        
        .test-btn {
          padding: 15px 20px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        
        .test-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .test-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #2196F3 0%, #21CBF3 100%);
          color: white;
        }
        
        .btn-success {
          background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
          color: white;
        }
        
        .btn-warning {
          background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
          color: white;
        }
        
        .btn-danger {
          background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
          color: white;
        }
        
        .test-results {
          background: white;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }
        
        .results-log {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 5px;
          padding: 15px;
          max-height: 300px;
          overflow-y: auto;
          font-family: 'Courier New', monospace;
          font-size: 14px;
        }
        
        .log-entry {
          margin-bottom: 5px;
          padding: 2px 0;
        }
        
        .log-entry:last-child {
          margin-bottom: 0;
        }
        
        .spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid #f3f3f3;
          border-top: 2px solid #3498db;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* Header */}
      <div className="test-header">
        <h1>🖨️ Printer Test Interface</h1>
        <p>TSC TL240 Barcode Printer + SP POS891US Thermal Receipt Printer</p>
      </div>

      {/* Printer Status Cards */}
      <div className="printer-cards">
        <div className={`printer-card ${printerStatus.thermal ? 'connected' : 'disconnected'}`}>
          <h3>
            <span className={`status-indicator ${printerStatus.thermal ? 'status-connected' : 'status-disconnected'}`}></span>
            {PRINTER_SPECS.thermal.model}
          </h3>
          <p>Status: {printerStatus.thermal ? 'Connected ✅' : 'Disconnected ❌'}</p>
          <div className="printer-specs">
            <div>Paper Width: {PRINTER_SPECS.thermal.paperWidth}mm</div>
            <div>Max Chars/Line: {PRINTER_SPECS.thermal.maxCharsPerLine}</div>
            <div>Cut Type: {PRINTER_SPECS.thermal.cutType}</div>
          </div>
        </div>

        <div className={`printer-card ${printerStatus.tsc ? 'connected' : 'disconnected'}`}>
          <h3>
            <span className={`status-indicator ${printerStatus.tsc ? 'status-connected' : 'status-disconnected'}`}></span>
            {PRINTER_SPECS.tsc.model}
          </h3>
          <p>Status: {printerStatus.tsc ? 'Connected ✅' : 'Disconnected ❌'}</p>
          <div className="printer-specs">
            <div>Resolution: {PRINTER_SPECS.tsc.dpi} DPI</div>
            <div>Max Width: {PRINTER_SPECS.tsc.maxWidth}mm</div>
            <div>Label Size: 50×30mm (recommended)</div>
          </div>
        </div>
      </div>

      {/* Test Controls */}
      <div className="test-controls">
        <h3>🧪 Test Controls</h3>
        <div className="control-buttons">
          <button 
            className="test-btn btn-primary" 
            onClick={connectPrinters}
            disabled={isConnecting}
          >
            {isConnecting ? <span className="spinner"></span> : '🔌'}
            Connect Printers
          </button>

          <button 
            className="test-btn btn-success" 
            onClick={testAllPrinters}
            disabled={isTesting || (!printerStatus.thermal && !printerStatus.tsc)}
          >
            {isTesting ? <span className="spinner"></span> : '🧪'}
            Test Both Printers
          </button>

          <button 
            className="test-btn btn-warning" 
            onClick={testSampleOrder}
            disabled={!printerStatus.thermal || !printerStatus.tsc}
          >
            📋 Test Complete Order
          </button>

          <button 
            className="test-btn btn-danger" 
            onClick={clearResults}
          >
            🗑️ Clear Results
          </button>
        </div>
      </div>

      {/* Test Results */}
      <div className="test-results">
        <div className="results-header">
          <h3>📊 Test Results</h3>
          <small>{testResults.length} entries</small>
        </div>
        <div className="results-log">
          {testResults.length === 0 ? (
            <div style={{color: '#666', fontStyle: 'italic'}}>
              No test results yet. Click "Connect Printers" to start testing.
            </div>
          ) : (
            testResults.map((result, index) => (
              <div key={index} className="log-entry">
                {result}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Help */}
      <div style={{marginTop: '20px', padding: '15px', background: '#e3f2fd', borderRadius: '8px', fontSize: '14px'}}>
        <strong>💡 Quick Help:</strong>
        <ul style={{margin: '10px 0', paddingLeft: '20px'}}>
          <li><strong>Connect Printers:</strong> Establishes USB serial connections to both printers</li>
          <li><strong>Test Both Printers:</strong> Sends test prints to verify functionality</li>
          <li><strong>Test Complete Order:</strong> Simulates a full laundry order with bill + tags</li>
          <li><strong>Browser Requirements:</strong> Chrome or Edge with Web Serial API support</li>
        </ul>
      </div>
    </div>
  );
};

export default PrinterTestInterface;