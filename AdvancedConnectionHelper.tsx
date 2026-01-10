// ADVANCED CONNECTION HELPER - Detailed device detection
// Shows exactly what USB devices are available

import React, { useState } from 'react';

export const AdvancedConnectionHelper: React.FC = () => {
  const [availablePorts, setAvailablePorts] = useState<any[]>([]);
  const [connectionLog, setConnectionLog] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  const addLog = (message: string) => {
    setConnectionLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const checkWebSerial = () => {
    if ('serial' in navigator) {
      addLog('✅ Web Serial API is supported');
      return true;
    } else {
      addLog('❌ Web Serial API not supported - Use Chrome or Edge');
      return false;
    }
  };

  const scanForDevices = async () => {
    if (!checkWebSerial()) return;
    
    setIsScanning(true);
    addLog('🔍 Scanning for existing connected devices...');
    
    try {
      // Get already granted ports
      const ports = await (navigator as any).serial.getPorts();
      setAvailablePorts(ports);
      
      if (ports.length > 0) {
        addLog(`📱 Found ${ports.length} previously connected device(s)`);
        ports.forEach((port: any, index: number) => {
          addLog(`   Device ${index + 1}: ${port.constructor.name}`);
        });
      } else {
        addLog('📱 No previously connected devices found');
        addLog('💡 You need to request permission for new devices');
      }
    } catch (error) {
      addLog(`❌ Error scanning devices: ${(error as Error).message}`);
    }
    
    setIsScanning(false);
  };

  const requestNewDevice = async () => {
    if (!checkWebSerial()) return;
    
    addLog('🔌 Requesting new device connection...');
    addLog('📋 Browser will show device selection dialog');
    
    try {
      // Request any serial device (no filters to see all available)
      const port = await (navigator as any).serial.requestPort();
      
      addLog('✅ Device selected successfully!');
      addLog(`📱 Device info: ${port.constructor.name}`);
      
      // Try to get device info
      const info = port.getInfo();
      if (info.usbVendorId) {
        addLog(`🔍 Vendor ID: 0x${info.usbVendorId.toString(16).toUpperCase()}`);
        
        // Identify printer type by vendor ID
        if (info.usbVendorId === 0x1203) {
          addLog('🏷️ Detected: TSC printer (likely TL240)');
        } else if (info.usbVendorId === 0x0416) {
          addLog('🧾 Detected: Star Micronics printer (likely SP POS891US)');
        } else {
          addLog(`❓ Unknown vendor ID: 0x${info.usbVendorId.toString(16)}`);
        }
      }
      
      // Try to open the port
      await port.open({
        baudRate: 9600,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
        flowControl: 'none'
      });
      
      addLog('✅ Port opened successfully!');
      addLog('🎉 Printer connection established');
      
      // Close the port for now
      await port.close();
      addLog('📝 Connection test complete - port closed');
      
    } catch (error) {
      const errorMsg = (error as Error).message;
      addLog(`❌ Connection failed: ${errorMsg}`);
      
      if (errorMsg.includes('No port selected')) {
        addLog('💡 This means:');
        addLog('   • No devices were shown in the dialog, OR');
        addLog('   • You clicked Cancel instead of selecting a device');
        addLog('');
        addLog('🔧 Try these solutions:');
        addLog('   1. Make sure printers are powered ON');
        addLog('   2. Check USB cables are properly connected');
        addLog('   3. Try different USB ports');
        addLog('   4. Install printer drivers from manufacturer');
        addLog('   5. Restart your computer');
      }
    }
  };

  const requestSpecificPrinter = async (printerType: 'thermal' | 'tsc') => {
    if (!checkWebSerial()) return;
    
    const filters = printerType === 'thermal' 
      ? [
          { usbVendorId: 0x0416 }, // Star Micronics
          { usbVendorId: 0x04B8 }, // Epson
          { usbVendorId: 0x154F }, // Generic thermal
        ]
      : [
          { usbVendorId: 0x1203 }, // TSC Auto ID Technology
          { usbVendorId: 0x0471 }, // TSC alternative
        ];
    
    addLog(`🔌 Requesting ${printerType === 'thermal' ? 'SP POS891US' : 'TSC TL240'} connection...`);
    
    try {
      const port = await (navigator as any).serial.requestPort({ filters });
      addLog(`✅ ${printerType === 'thermal' ? 'Thermal' : 'TSC'} printer selected!`);
      
      await port.open({
        baudRate: 9600,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
        flowControl: 'none'
      });
      
      addLog(`🎉 ${printerType === 'thermal' ? 'SP POS891US' : 'TSC TL240'} connected successfully!`);
      await port.close();
      
    } catch (error) {
      addLog(`❌ ${printerType === 'thermal' ? 'Thermal' : 'TSC'} connection failed: ${(error as Error).message}`);
    }
  };

  const clearLog = () => {
    setConnectionLog([]);
  };

  return (
    <div style={{
      maxWidth: '800px',
      margin: '20px auto',
      padding: '20px',
      background: 'white',
      borderRadius: '10px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      fontFamily: 'monospace'
    }}>
      <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '20px', fontFamily: 'Arial' }}>
        🔧 Advanced Printer Connection Diagnostics
      </h2>

      {/* Control Buttons */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '10px',
        marginBottom: '20px'
      }}>
        <button
          onClick={scanForDevices}
          disabled={isScanning}
          style={{
            padding: '10px',
            background: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isScanning ? 'not-allowed' : 'pointer',
            opacity: isScanning ? 0.6 : 1
          }}
        >
          {isScanning ? '🔄 Scanning...' : '🔍 Scan Devices'}
        </button>

        <button
          onClick={requestNewDevice}
          style={{
            padding: '10px',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          🔌 Request Any Device
        </button>

        <button
          onClick={() => requestSpecificPrinter('thermal')}
          style={{
            padding: '10px',
            background: '#FF9800',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          🧾 Connect SP POS891US
        </button>

        <button
          onClick={() => requestSpecificPrinter('tsc')}
          style={{
            padding: '10px',
            background: '#9C27B0',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          🏷️ Connect TSC TL240
        </button>

        <button
          onClick={clearLog}
          style={{
            padding: '10px',
            background: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          🗑️ Clear Log
        </button>
      </div>

      {/* Connection Log */}
      <div style={{
        background: '#f8f9fa',
        border: '1px solid #e9ecef',
        borderRadius: '5px',
        padding: '15px',
        maxHeight: '400px',
        overflowY: 'auto',
        fontSize: '12px',
        lineHeight: '1.4'
      }}>
        <h3 style={{ marginBottom: '10px', fontFamily: 'Arial', color: '#333' }}>
          📊 Connection Log:
        </h3>
        {connectionLog.length === 0 ? (
          <div style={{ color: '#666', fontStyle: 'italic' }}>
            Click "Scan Devices" to start diagnostics...
          </div>
        ) : (
          connectionLog.map((log, index) => (
            <div key={index} style={{ marginBottom: '3px', color: '#333' }}>
              {log}
            </div>
          ))
        )}
      </div>

      {/* Instructions */}
      <div style={{
        marginTop: '20px',
        padding: '15px',
        background: '#e3f2fd',
        borderRadius: '6px',
        fontSize: '14px',
        fontFamily: 'Arial'
      }}>
        <strong>📋 Instructions:</strong>
        <ol style={{ marginTop: '10px', paddingLeft: '20px' }}>
          <li><strong>Scan Devices:</strong> Check for previously connected printers</li>
          <li><strong>Request Any Device:</strong> See all available USB serial devices</li>
          <li><strong>Connect Specific:</strong> Try connecting to your exact printer model</li>
          <li><strong>Check Log:</strong> See detailed connection information and errors</li>
        </ol>
        
        <div style={{ marginTop: '15px', padding: '10px', background: '#fff3cd', borderRadius: '4px' }}>
          <strong>⚠️ If no devices appear:</strong>
          <ul style={{ marginTop: '5px', paddingLeft: '20px' }}>
            <li>Install printer drivers from manufacturer websites</li>
            <li>Check Device Manager for USB Serial devices</li>
            <li>Try different USB ports or cables</li>
            <li>Restart printers and computer</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdvancedConnectionHelper;