import React from 'react';

// Pure Thermal Receipt Component - NO A4 behavior
interface ThermalReceiptProps {
  businessName: string;
  address: string;
  phone: string;
  billNumber: string;
  customerName?: string;
  items: Array<{
    name: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
  subtotal: number;
  discount?: number;
  deliveryCharge?: number;
  gst?: number;
  grandTotal: number;
  thankYouMessage?: string;
}

const ThermalReceipt: React.FC<ThermalReceiptProps> = ({
  businessName,
  address,
  phone,
  billNumber,
  customerName,
  items,
  subtotal,
  discount = 0,
  deliveryCharge = 0,
  gst = 0,
  grandTotal,
  thankYouMessage = "Thank you for your business!"
}) => {
  const currentDate = new Date().toLocaleString('en-IN', {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="thermal-receipt-container">
      {/* Business Header */}
      <div className="receipt-header">
        <div className="business-name">{businessName}</div>
        <div className="business-address">{address}</div>
        <div className="business-phone">Ph: {phone}</div>
      </div>

      {/* Divider */}
      <div className="divider">================================</div>

      {/* Bill Info */}
      <div className="bill-info">
        <div className="bill-row">
          <span>Bill No: {billNumber}</span>
          <span>Date: {currentDate}</span>
        </div>
        {customerName && (
          <div className="customer-name">Customer: {customerName}</div>
        )}
      </div>

      {/* Divider */}
      <div className="divider">================================</div>

      {/* Items Header */}
      <div className="items-header">
        <span className="item-name-col">ITEM</span>
        <span className="qty-col">QTY</span>
        <span className="rate-col">RATE</span>
        <span className="amt-col">AMT</span>
      </div>
      <div className="divider">--------------------------------</div>

      {/* Items List */}
      <div className="items-list">
        {items.map((item, index) => (
          <div key={index} className="item-row">
            <span className="item-name-col">{item.name}</span>
            <span className="qty-col">{item.quantity}</span>
            <span className="rate-col">₹{item.rate}</span>
            <span className="amt-col">₹{item.amount}</span>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="divider">--------------------------------</div>

      {/* Totals Section */}
      <div className="totals-section">
        <div className="total-row">
          <span>Subtotal:</span>
          <span>₹{subtotal}</span>
        </div>
        {discount > 0 && (
          <div className="total-row">
            <span>Discount:</span>
            <span>-₹{discount}</span>
          </div>
        )}
        {deliveryCharge > 0 && (
          <div className="total-row">
            <span>Delivery:</span>
            <span>₹{deliveryCharge}</span>
          </div>
        )}
        {gst > 0 && (
          <div className="total-row">
            <span>GST:</span>
            <span>₹{gst}</span>
          </div>
        )}
      </div>

      {/* Grand Total */}
      <div className="divider">================================</div>
      <div className="grand-total">
        <span>TOTAL:</span>
        <span>₹{grandTotal}</span>
      </div>
      <div className="divider">================================</div>

      {/* Thank You */}
      <div className="thank-you">
        <div>{thankYouMessage}</div>
      </div>
    </div>
  );
};

export default ThermalReceipt;