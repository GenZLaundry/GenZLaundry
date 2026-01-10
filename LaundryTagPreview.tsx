import React from 'react';
import { LaundryTag } from './TSCLabelPrinter';

interface LaundryTagPreviewProps {
  tag: LaundryTag;
  showBorder?: boolean;
}

const LaundryTagPreview: React.FC<LaundryTagPreviewProps> = ({ 
  tag, 
  showBorder = true 
}) => {
  // Simulate 50mm x 25mm label dimensions (scaled for screen)
  const scale = 4; // 4x scale for visibility
  const widthPx = 50 * scale; // 200px
  const heightPx = 25 * scale; // 100px

  const customerText = tag.customerPhone ? 
    `${tag.customerName.substring(0, 10)} ${tag.customerPhone.slice(-4)}` : 
    tag.customerName.substring(0, 14);

  return (
    <div 
      className="relative bg-white text-black font-mono text-xs leading-tight overflow-hidden"
      style={{ 
        width: `${widthPx}px`, 
        height: `${heightPx}px`,
        border: showBorder ? '2px solid #000' : 'none',
        fontSize: '8px'
      }}
    >
      {/* Laundry name (top left) */}
      <div 
        className="absolute font-bold"
        style={{ 
          top: '4px', 
          left: '4px',
          fontSize: '9px'
        }}
      >
        {tag.laundryName}
      </div>
      
      {/* Bill number (top right) */}
      <div 
        className="absolute text-right"
        style={{ 
          top: '4px', 
          right: '4px',
          fontSize: '7px'
        }}
      >
        {tag.billNumber}
      </div>
      
      {/* Customer info (second line) */}
      <div 
        className="absolute"
        style={{ 
          top: '18px', 
          left: '4px',
          fontSize: '7px'
        }}
      >
        {customerText}
      </div>
      
      {/* Item name (center, larger) */}
      <div 
        className="absolute font-bold"
        style={{ 
          top: '32px', 
          left: '4px',
          fontSize: '11px',
          fontWeight: 'bold'
        }}
      >
        {tag.itemName.toUpperCase().substring(0, 12)}
      </div>
      
      {/* Wash type (bottom left) */}
      {tag.washType && (
        <div 
          className="absolute"
          style={{ 
            bottom: '4px', 
            left: '4px',
            fontSize: '7px'
          }}
        >
          {tag.washType}
        </div>
      )}
      
      {/* Tag counter (bottom right, prominent) */}
      {tag.tagIndex && tag.totalTags && (
        <div 
          className="absolute font-bold bg-black text-white px-1 rounded-sm"
          style={{ 
            bottom: '4px', 
            right: '4px',
            fontSize: '9px',
            minWidth: '20px',
            textAlign: 'center'
          }}
        >
          {tag.tagIndex}/{tag.totalTags}
        </div>
      )}
      
      {/* Barcode placeholder (right side) */}
      {tag.barcode && (
        <div 
          className="absolute bg-black"
          style={{ 
            top: '20px', 
            right: '20px',
            width: '30px',
            height: '20px',
            background: 'repeating-linear-gradient(90deg, black 0px, black 1px, white 1px, white 2px)'
          }}
          title={`Barcode: ${tag.barcode}`}
        />
      )}
      
      {/* QR Code placeholder (alternative to barcode) */}
      {tag.qrCode && !tag.barcode && (
        <div 
          className="absolute bg-black"
          style={{ 
            top: '20px', 
            right: '8px',
            width: '20px',
            height: '20px',
            background: 'repeating-conic-gradient(black 0deg, black 90deg, white 90deg, white 180deg)'
          }}
          title={`QR Code: ${tag.qrCode}`}
        />
      )}
    </div>
  );
};

// Component to preview multiple tags
export const LaundryTagsPreview: React.FC<{ 
  tags: LaundryTag[];
  title?: string;
}> = ({ tags, title = "Laundry Tags Preview" }) => {
  return (
    <div className="bg-gray-100 p-4 rounded-lg">
      <h3 className="text-lg font-bold mb-4 text-gray-800">{title}</h3>
      <div className="grid grid-cols-2 gap-4">
        {tags.map((tag, index) => (
          <div key={index} className="flex flex-col items-center">
            <LaundryTagPreview tag={tag} />
            <div className="text-xs text-gray-600 mt-2 text-center">
              Tag {index + 1}: {tag.itemName}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 text-xs text-gray-500">
        <p>• Actual size: 50mm × 25mm</p>
        <p>• Preview shown at 4x scale for visibility</p>
        <p>• Tag counter (1/3, 2/3, etc.) shown in bottom right</p>
      </div>
    </div>
  );
};

export default LaundryTagPreview;