// CONNECTION HELPER - Step-by-step printer connection guide
// TSC TL240 + SP POS891US Manual Connection

import React, { useState } from 'react';

export const ConnectionHelper: React.FC = () => {
  const [step, setStep] = useState(1);
  const [connectionStatus, setConnectionStatus] = useState({
    thermal: false,
    tsc: false,
    webSerial: false
  });

  const checkWebSerialSupport = () => {
    const supported = 'serial' in navigator;
    setConnectionStatus(prev => ({ ...prev, webSerial: supported }));
    
    if (supported) {
      setStep(2);
    } else {
      alert('❌ Web Serial API not supported!\n\nPlease use:\n• Google Chrome\n• Microsoft Edge\n• Opera\n\nAnd make sure you\'re on HTTPS or localhost');
    }
  };

  const connectThermalPrinter = async () => {
    try {
      const port = await (navigator as any).serial.requestPort({
        filters: [
          { usbVendorId: 0x0416 }, // Star Micronics
          { usbVendorId: 0x04B8 }, // Epson
          { usbVendorId: 0x154F }, // Generic thermal
        ]
      });

      await port.open({
        baudRate: 9600,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
        flowControl: 'none'
      });

      setConnectionStatus(prev => ({ ...prev, thermal: true }));
      alert('✅ SP POS891US Connected Successfully!');
      setStep(3);

    } catch (error) {
      alert(`❌ SP POS891US Connection Failed:\n\n${(error as Error).message}\n\nTry:\n• Check USB connection\n• Ensure printer is powered on\n• Select correct device from list`);
    }
  };

  const connectTSCPrinter = async () => {
    try {
      const port = await (navigator as any).serial.requestPort({
        filters: [
          { usbVendorId: 0x1203 }, // TSC Auto ID Technology
          { usbVendorId: 0x0471 }, // TSC alternative
        ]
      });

      await port.open({
        baudRate: 9600,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
        flowControl: 'none'
      });

      setConnectionStatus(prev => ({ ...prev, tsc: true }));
      alert('✅ TSC TL240 Connected Successfully!');
      setStep(4);

    } catch (error) {
      alert(`❌ TSC TL240 Connection Failed:\n\n${(error as Error).message}\n\nTry:\n• Check USB connection\n• Ensure printer is powered on\n• Select correct device from list`);
    }
  };

  return (
    <div style={{
      maxWidth: '600px',
      margin: '20px auto',
      padding: '30px',
      background: 'white',
      borderRadius: '10px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '30px' }}>
        🔌 Printer Connection Helper
      </h2>

      {/* Step 1: Check Web Serial Support */}
      <div style={{
        padding: '20px',
        background: step === 1 ? '#e3f2fd' : '#f5f5f5',
        borderRadius: '8px',
        marginBottom: '15px',
        border: step === 1 ? '2px solid #2196F3' : '1px solid #ddd'
      }}>
        <h3 style={{ color: '#333', marginBottom: '10px' }}>
          Step 1: Check Browser Compatibility
        </h3>
        <p style={{ color: '#666', marginBottom: '15px' }}>
          Web Serial API Status: {connectionStatus.webSerial ? '✅ Supported' : '❓ Unknown'}
        </p>
        <button
          onClick={checkWebSerialSupport}
          style={{
            padding: '10px 20px',
            background: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Check Browser Support
        </button>
      </div>

      {/* Step 2: Connect SP POS891US */}
      <div style={{
        padding: '20px',
        background: step === 2 ? '#e8f5e8' : '#f5f5f5',
        borderRadius: '8px',
        marginBottom: '15px',
        border: step === 2 ? '2px solid #4CAF50' : '1px solid #ddd',
        opacity: step >= 2 ? 1 : 0.5
      }}>
        <h3 style={{ color: '#333', marginBottom: '10px' }}>
          Step 2: Connect SP POS891US (Receipt Printer)
        </h3>
        <p style={{ color: '#666', marginBottom: '15px' }}>
          Status: {connectionStatus.thermal ? '✅ Connected' : '❌ Disconnected'}
        </p>
        <ul style={{ color: '#666', marginBottom: '15px', paddingLeft: '20px' }}>
          <li>Ensure SP POS891US is powered on</li>
          <li>Connect via USB cable</li>
          <li>Click button and select your thermal printer</li>
        </ul>
        <button
          onClick={connectThermalPrinter}
          disabled={step < 2}
          style={{
            padding: '10px 20px',
            background: step >= 2 ? '#4CAF50' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: step >= 2 ? 'pointer' : 'not-allowed'
          }}
        >
          Connect SP POS891US
        </button>
      </div>

      {/* Step 3: Connect TSC TL240 */}
      <div style={{
        padding: '20px',
        background: step === 3 ? '#fff3e0' : '#f5f5f5',
        borderRadius: '8px',
        marginBottom: '15px',
        border: step === 3 ? '2px solid #FF9800' : '1px solid #ddd',
        opacity: step >= 3 ? 1 : 0.5
      }}>
        <h3 style={{ color: '#333', marginBottom: '10px' }}>
          Step 3: Connect TSC TL240 (Label Printer)
        </h3>
        <p style={{ color: '#666', marginBottom: '15px' }}>
          Status: {connectionStatus.tsc ? '✅ Connected' : '❌ Disconnected'}
        </p>
        <ul style={{ color: '#666', marginBottom: '15px', paddingLeft: '20px' }}>
          <li>Ensure TSC TL240 is powered on</li>
          <li>Connect via USB cable</li>
          <li>Load 50×30mm labels</li>
          <li>Click button and select TSC device</li>
        </ul>
        <button
          onClick={connectTSCPrinter}
          disabled={step < 3}
          style={{
            padding: '10px 20px',
            background: step >= 3 ? '#FF9800' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: step >= 3 ? 'pointer' : 'not-allowed'
          }}
        >
          Connect TSC TL240
        </button>
      </div>

      {/* Step 4: Success */}
      {step >= 4 && (
        <div style={{
          padding: '20px',
          background: '#e8f5e8',
          borderRadius: '8px',
          border: '2px solid #4CAF50',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#4CAF50', marginBottom: '10px' }}>
            🎉 Both Printers Connected!
          </h3>
          <p style={{ color: '#666' }}>
            Your TSC TL240 and SP POS891US are ready for professional bill and tag printing.
          </p>
        </div>
      )}

      {/* Troubleshooting */}
      <div style={{
        marginTop: '20px',
        padding: '15px',
        background: '#fff3cd',
        borderRadius: '6px',
        fontSize: '14px'
      }}>
        <strong>💡 Troubleshooting Tips:</strong>
        <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
          <li><strong>No devices found:</strong> Check USB connections and power</li>
          <li><strong>Permission denied:</strong> Click "Allow" when browser asks</li>
          <li><strong>Connection fails:</strong> Try different USB ports</li>
          <li><strong>Wrong browser:</strong> Use Chrome or Edge only</li>
        </ul>
      </div>
    </div>
  );
};

export default ConnectionHelper;