import React, { useState } from 'react';
import HybridPrintingSolution from './HybridPrintingSolution';
import ClarityTestInterface from './ClarityTestInterface';
import './App.css';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'main' | 'clarity'>('main');

  return (
    <div className="App">
      <div style={{ 
        borderBottom: '2px solid #ddd', 
        marginBottom: '20px',
        padding: '10px 0'
      }}>
        <button
          onClick={() => setActiveTab('main')}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            backgroundColor: activeTab === 'main' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'main' ? 'white' : '#333',
            border: '1px solid #ddd',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          🖨️ Main Printing System
        </button>
        <button
          onClick={() => setActiveTab('clarity')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'clarity' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'clarity' ? 'white' : '#333',
            border: '1px solid #ddd',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          🔧 Text Clarity Optimizer
        </button>
      </div>

      {activeTab === 'main' && <HybridPrintingSolution />}
      {activeTab === 'clarity' && <ClarityTestInterface />}
    </div>
  );
};

export default App;