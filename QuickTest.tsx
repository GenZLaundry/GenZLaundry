// QUICK TEST COMPONENT - TSC TL240 + SP POS891US
// Simple test interface to verify your printer setup

import React, { useState } from 'react';
import { dualPrinterManager } from './DualPrinterManager';

export const QuickTest: React.FC = () => {
  const [status, setStatus] = useState('Ready to test printers');
  const [isConnecting, setIsConnecting] = useState(false);

  const testConnection = async () => {
    setIsConnecting(true);
    setStatus('🔌 Connecting to printers...');
    
    try {
      const results = await dualPrinterManager.connectAllPrinters();
      
      if (results.thermal && results.tsc) {
        setStatus('✅ Both printers connected successfully!');
      } else if (results.thermal) {
        setStatus('⚠️ Only SP POS891US connected. Check TSC TL240.');
      } else if (results.tsc) {
        setStatus('⚠️ Only TSC TL240 connected. Check SP POS891US.');
      } else {
        setStatus('❌ No printers connected. Check USB connections.');
      }
    } catch (error) {
      setStatus(`❌ Error: ${(error as Error).message}`);
    }
    
    setIsConnecting(false);
  };

  const testPrint = async () => {
    setStatus('🖨️ Testing print functionality...');
    
    try {
      const testResults = await dualPrinterManager.testAllPrinters();
      
      if (testResults.thermal && testResults.tsc) {
        setStatus('✅ Both printers working perfectly!');
      } else {
        setStatus('⚠️ Some printers failed. Check connections.');
      }
    } catch (error) {
      setStatus(`❌ Print test failed: ${(error as Error).message}`);
    }
  };

  return (
    <div style={{
      maxWidth: '600px',
      margin: '50px auto',
      padding: '30px',
      background: 'white',
      borderRadius: '10px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{
        textAlign: 'center',
        color: '#333',
        marginBottom: '30px'
      }}>
        🖨️ TSC TL240 + SP POS891US Test
      </h1>
      
      <div style={{
        background: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <p style={{ fontSize: '16px', color: '#666' }}>{status}</p>
      </div>
      
      <div style={{
        display: 'flex',
        gap: '15px',
        justifyContent: 'center'
      }}>
        <button
          onClick={testConnection}
          disabled={isConnecting}
          style={{
            padding: '12px 24px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: isConnecting ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            opacity: isConnecting ? 0.6 : 1
          }}
        >
          {isConnecting ? '🔄 Connecting...' : '🔌 Connect Printers'}
        </button>
        
        <button
          onClick={testPrint}
          style={{
            padding: '12px 24px',
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          🧪 Test Print
        </button>
      </div>
      
      <div style={{
        marginTop: '30px',
        padding: '15px',
        background: '#e3f2fd',
        borderRadius: '6px',
        fontSize: '14px'
      }}>
        <strong>Instructions:</strong>
        <ol style={{ marginTop: '10px', paddingLeft: '20px' }}>
          <li>Make sure both printers are powered on</li>
          <li>Connect via USB to your computer</li>
          <li>Use Chrome or Edge browser</li>
          <li>Click "Connect Printers" and allow permissions</li>
          <li>Click "Test Print" to verify functionality</li>
        </ol>
      </div>
    </div>
  );
};

export default QuickTest;