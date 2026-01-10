import React, { useState, useEffect } from 'react';
import { LaundryItem } from './types';

interface AdminPanelProps {
  items: LaundryItem[];
  onItemsUpdate: (items: LaundryItem[]) => void;
  onClose: () => void;
}

interface NewItem {
  name: string;
  price: number;
  category: string;
  washType: string;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ items, onItemsUpdate, onClose }) => {
  const [newItem, setNewItem] = useState<NewItem>({
    name: '',
    price: 0,
    category: 'Clothing',
    washType: 'WASH+IRON'
  });
  
  const [editingItem, setEditingItem] = useState<LaundryItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Clothing', 'Bedding', 'Curtains', 'Leather', 'Delicate', 'Special'];
  const washTypes = ['WASH', 'DRY CLEAN', 'IRON', 'WASH+IRON', 'STEAM', 'SPECIAL'];

  // Filter items based on search and category
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || 
      (item as any).category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Add new item
  const handleAddItem = () => {
    if (!newItem.name.trim() || newItem.price <= 0) {
      alert('Please enter valid item name and price');
      return;
    }

    const item: LaundryItem = {
      id: Date.now().toString(),
      name: newItem.name.trim(),
      price: newItem.price,
      category: newItem.category,
      washType: newItem.washType
    } as LaundryItem;

    const updatedItems = [...items, item];
    onItemsUpdate(updatedItems);
    
    // Reset form
    setNewItem({
      name: '',
      price: 0,
      category: 'Clothing',
      washType: 'WASH+IRON'
    });

    alert(`✅ Item "${item.name}" added successfully!`);
  };

  // Edit item
  const handleEditItem = (item: LaundryItem) => {
    setEditingItem(item);
  };

  // Save edited item
  const handleSaveEdit = () => {
    if (!editingItem) return;

    const updatedItems = items.map(item => 
      item.id === editingItem.id ? editingItem : item
    );
    onItemsUpdate(updatedItems);
    setEditingItem(null);
    alert(`✅ Item "${editingItem.name}" updated successfully!`);
  };

  // Delete item
  const handleDeleteItem = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    if (window.confirm(`Delete "${item.name}"? This action cannot be undone.`)) {
      const updatedItems = items.filter(i => i.id !== itemId);
      onItemsUpdate(updatedItems);
      alert(`✅ Item "${item.name}" deleted successfully!`);
    }
  };

  // Bulk import items
  const handleBulkImport = () => {
    const csvText = prompt(`BULK IMPORT ITEMS (CSV Format):

Enter items in this format (one per line):
Item Name, Price, Category, Wash Type

Example:
Shirt (Cotton), 50, Clothing, WASH+IRON
Bedsheet (Double), 80, Bedding, WASH
Curtain (Heavy), 120, Curtains, DRY CLEAN

Paste your CSV data:`);

    if (!csvText) return;

    try {
      const lines = csvText.trim().split('\n');
      const newItems: LaundryItem[] = [];

      lines.forEach((line, index) => {
        const parts = line.split(',').map(p => p.trim());
        if (parts.length >= 2) {
          const [name, priceStr, category = 'Clothing', washType = 'WASH+IRON'] = parts;
          const price = parseFloat(priceStr);
          
          if (name && !isNaN(price) && price > 0) {
            newItems.push({
              id: `bulk-${Date.now()}-${index}`,
              name,
              price,
              category,
              washType
            } as LaundryItem);
          }
        }
      });

      if (newItems.length > 0) {
        const updatedItems = [...items, ...newItems];
        onItemsUpdate(updatedItems);
        alert(`✅ Successfully imported ${newItems.length} items!`);
      } else {
        alert('❌ No valid items found in the CSV data.');
      }
    } catch (error) {
      alert('❌ Error importing items. Please check the CSV format.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 bg-gray-700 border-b border-gray-600 flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            <i className="fas fa-cogs mr-2"></i> Admin Panel - Item Management
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="flex h-[calc(90vh-80px)]">
          {/* Left Panel - Add New Item */}
          <div className="w-1/3 p-6 border-r border-gray-700 bg-gray-900">
            <h3 className="text-lg font-bold mb-4 text-blue-400">
              <i className="fas fa-plus mr-2"></i> Add New Item
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-1">Item Name</label>
                <input
                  type="text"
                  className="w-full bg-gray-700 border border-gray-600 rounded p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Shirt (Cotton)"
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-400 mb-1">Price (₹)</label>
                <input
                  type="number"
                  className="w-full bg-gray-700 border border-gray-600 rounded p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                  value={newItem.price || ''}
                  onChange={(e) => setNewItem({...newItem, price: parseFloat(e.target.value) || 0})}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-400 mb-1">Category</label>
                <select
                  className="w-full bg-gray-700 border border-gray-600 rounded p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newItem.category}
                  onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                >
                  {categories.filter(c => c !== 'All').map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-400 mb-1">Wash Type</label>
                <select
                  className="w-full bg-gray-700 border border-gray-600 rounded p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newItem.washType}
                  onChange={(e) => setNewItem({...newItem, washType: e.target.value})}
                >
                  {washTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleAddItem}
                className="w-full bg-green-600 hover:bg-green-500 p-3 rounded font-bold transition-all"
              >
                <i className="fas fa-plus mr-2"></i> Add Item
              </button>

              <button
                onClick={handleBulkImport}
                className="w-full bg-blue-600 hover:bg-blue-500 p-3 rounded font-bold transition-all"
              >
                <i className="fas fa-upload mr-2"></i> Bulk Import (CSV)
              </button>
            </div>
          </div>

          {/* Right Panel - Item List */}
          <div className="flex-1 p-6 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-green-400">
                <i className="fas fa-list mr-2"></i> Items ({filteredItems.length})
              </h3>
              
              <div className="flex gap-4">
                {/* Search */}
                <input
                  type="text"
                  className="bg-gray-700 border border-gray-600 rounded px-3 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                
                {/* Category Filter */}
                <select
                  className="bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Items Table */}
            <div className="flex-1 overflow-y-auto border border-gray-700 rounded bg-gray-800">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-gray-700 text-xs text-gray-300 uppercase">
                  <tr>
                    <th className="p-3">Item Name</th>
                    <th className="p-3 text-center">Price</th>
                    <th className="p-3 text-center">Category</th>
                    <th className="p-3 text-center">Wash Type</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-10 text-center text-gray-500 italic">
                        No items found
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map(item => (
                      <tr key={item.id} className="border-b border-gray-700 hover:bg-gray-750">
                        <td className="p-3 font-medium">
                          {editingItem?.id === item.id ? (
                            <input
                              type="text"
                              className="bg-gray-600 border border-gray-500 rounded px-2 py-1 w-full"
                              value={editingItem.name}
                              onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                            />
                          ) : (
                            item.name
                          )}
                        </td>
                        <td className="p-3 text-center font-mono">
                          {editingItem?.id === item.id ? (
                            <input
                              type="number"
                              className="bg-gray-600 border border-gray-500 rounded px-2 py-1 w-20 text-center"
                              value={editingItem.price}
                              onChange={(e) => setEditingItem({...editingItem, price: parseFloat(e.target.value) || 0})}
                            />
                          ) : (
                            `₹${item.price}`
                          )}
                        </td>
                        <td className="p-3 text-center text-sm">
                          {editingItem?.id === item.id ? (
                            <select
                              className="bg-gray-600 border border-gray-500 rounded px-2 py-1"
                              value={(editingItem as any).category || 'Clothing'}
                              onChange={(e) => setEditingItem({...editingItem, category: e.target.value} as any)}
                            >
                              {categories.filter(c => c !== 'All').map(category => (
                                <option key={category} value={category}>{category}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="bg-blue-900 text-blue-300 px-2 py-1 rounded text-xs">
                              {(item as any).category || 'Clothing'}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center text-sm">
                          {editingItem?.id === item.id ? (
                            <select
                              className="bg-gray-600 border border-gray-500 rounded px-2 py-1"
                              value={(editingItem as any).washType || 'WASH+IRON'}
                              onChange={(e) => setEditingItem({...editingItem, washType: e.target.value} as any)}
                            >
                              {washTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="bg-green-900 text-green-300 px-2 py-1 rounded text-xs">
                              {(item as any).washType || 'WASH+IRON'}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex justify-center gap-2">
                            {editingItem?.id === item.id ? (
                              <>
                                <button
                                  onClick={handleSaveEdit}
                                  className="text-green-400 hover:text-green-300 p-1"
                                  title="Save"
                                >
                                  <i className="fas fa-check"></i>
                                </button>
                                <button
                                  onClick={() => setEditingItem(null)}
                                  className="text-gray-400 hover:text-gray-300 p-1"
                                  title="Cancel"
                                >
                                  <i className="fas fa-times"></i>
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleEditItem(item)}
                                  className="text-blue-400 hover:text-blue-300 p-1"
                                  title="Edit"
                                >
                                  <i className="fas fa-edit"></i>
                                </button>
                                <button
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="text-red-400 hover:text-red-300 p-1"
                                  title="Delete"
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;