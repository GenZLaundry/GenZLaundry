
import React from 'react';
import { Order } from '../types';
import { X, Printer, Tag } from 'lucide-react';

const ItemTokenModal: React.FC<{ order: Order, onClose: () => void }> = ({ order, onClose }) => {
  // Flatten items into individual tags
  const tags: { name: string, index: number, total: number }[] = [];
  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
  
  let currentCount = 0;
  order.items.forEach(item => {
    for (let i = 0; i < item.quantity; i++) {
      currentCount++;
      tags.push({
        name: item.name,
        index: currentCount,
        total: totalItems
      });
    }
  });

  return (
    <div className="fixed inset-0 z-[250] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-6 no-print">
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl"><Tag size={20}/></div>
             <h3 className="text-xl font-black tracking-tighter">Garment Tags ({totalItems})</h3>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-50 rounded-full text-slate-400"><X size={20}/></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-10 bg-slate-50 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {tags.map((tag, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm font-mono text-xs">
                <div className="flex justify-between items-start mb-4">
                  <span className="font-black text-slate-900 text-base">#{order.tokenNumber}</span>
                  <span className="bg-slate-900 text-white px-2 py-0.5 rounded text-[10px]">{tag.index} / {tag.total}</span>
                </div>
                <p className="font-bold text-slate-700 uppercase mb-2 truncate">{tag.name}</p>
                <div className="border-t border-dashed border-slate-100 pt-2 flex justify-between items-center text-[10px]">
                  <span className="text-slate-400 uppercase tracking-widest">{order.userName.split(' ')[0]}</span>
                  <span className="text-slate-300">LaundryLedger</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 bg-white border-t border-slate-100">
          <div className="flex items-center gap-4 bg-amber-50 p-4 rounded-2xl border border-amber-100 mb-6">
            <Tag className="text-amber-600 shrink-0" size={18} />
            <p className="text-[10px] font-bold text-amber-700 leading-tight uppercase tracking-wider">
              Warning: These tags are formatted for small adhesive or staple-on labels. Ensure printer scale is set to 100%.
            </p>
          </div>
          <button 
            onClick={() => window.print()}
            className="w-full bg-slate-900 text-white font-black uppercase text-xs tracking-widest py-5 rounded-2xl shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all"
          >
            <Printer size={20} />
            Print All Garment Slips
          </button>
        </div>
      </div>

      {/* Actual Hidden Print Element */}
      <div className="print-only fixed inset-0 bg-white">
        {tags.map((tag, i) => (
          <div key={i} className="laundry-tag tag-page-break">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '18px', fontWeight: 'bold' }}>#{order.tokenNumber}</span>
              <span style={{ border: '1px solid #000', padding: '1px 4px', fontSize: '12px' }}>{tag.index} / {tag.total}</span>
            </div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', margin: '5px 0' }}>{tag.name}</div>
            <div style={{ fontSize: '12px', borderTop: '1px dashed #000', paddingTop: '5px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ textTransform: 'uppercase' }}>{order.userName}</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItemTokenModal;
