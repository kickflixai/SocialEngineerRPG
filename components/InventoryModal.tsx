import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package } from 'lucide-react';
import { SHOP_ITEMS } from '../constants';
import { ShopItem } from '../types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    inventory: string[];
    onUseItem: (item: ShopItem) => void;
    context: 'dashboard' | 'scam';
}

const InventoryModal: React.FC<Props> = ({ isOpen, onClose, inventory, onUseItem, context }) => {
    if (!isOpen) return null;

    // Group inventory items
    const groupedItems: Record<string, number> = {};
    inventory.forEach(id => {
        groupedItems[id] = (groupedItems[id] || 0) + 1;
    });

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            >
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-2xl h-[70vh] flex flex-col shadow-2xl relative overflow-hidden"
                >
                    <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                        <h2 className="text-xl font-bold font-mono text-white flex items-center gap-3">
                            <Package className="text-purple-500" /> INVENTORY_BACKPACK
                        </h2>
                        <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                        {Object.keys(groupedItems).length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-zinc-500">
                                <Package size={48} className="mb-4 opacity-20" />
                                <p>No items in inventory.</p>
                                <p className="text-xs mt-2">Visit the Black Market to acquire tools.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {Object.keys(groupedItems).map(itemId => {
                                    const itemDef = SHOP_ITEMS.find(i => i.id === itemId);
                                    if (!itemDef) return null;

                                    const count = groupedItems[itemId];
                                    const isUsable = itemDef.usageContext === 'any' || itemDef.usageContext === context;

                                    return (
                                        <div key={itemId} className={`bg-zinc-900/50 border rounded-xl p-4 flex flex-col justify-between transition-all ${isUsable ? 'border-zinc-700 hover:border-purple-500/50' : 'border-zinc-800 opacity-50'}`}>
                                            <div>
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="font-bold text-white">{itemDef.name}</h3>
                                                    <span className="bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded text-xs font-mono">x{count}</span>
                                                </div>
                                                <p className="text-xs text-zinc-400 mb-4 min-h-[2.5em]">{itemDef.description}</p>
                                            </div>
                                            
                                            <button 
                                                onClick={() => {
                                                    if (isUsable) {
                                                        onUseItem(itemDef);
                                                        if (count === 1) {
                                                            // Close if it was the last one of this type? 
                                                            // Probably keep open for UX unless empty
                                                        }
                                                    }
                                                }}
                                                disabled={!isUsable}
                                                className={`w-full py-2 rounded text-xs font-bold uppercase tracking-wider ${
                                                    isUsable 
                                                    ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/20' 
                                                    : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                                                }`}
                                            >
                                                {isUsable ? 'Deploy Item' : `Use in ${itemDef.usageContext === 'scam' ? 'Active Hack' : 'Dashboard'}`}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default InventoryModal;