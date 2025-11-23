import React from 'react';
import { ShopItem, PlayerState } from '../types';
import { SHOP_ITEMS } from '../constants';
import { ShoppingBag, Lock, WifiOff, BadgeCheck, Mic2, Smartphone, Briefcase, Trash2, ShoppingCart } from 'lucide-react';

interface Props {
    player: PlayerState;
    onBuy: (item: ShopItem) => void;
}

const Shop: React.FC<Props> = ({ player, onBuy }) => {
    
    const getIcon = (iconName: string) => {
        switch(iconName) {
            case 'Smartphone': return <Smartphone size={24}/>;
            case 'Mic2': return <Mic2 size={24}/>;
            case 'Briefcase': return <Briefcase size={24}/>;
            case 'Trash2': return <Trash2 size={24}/>;
            case 'Lock': return <Lock size={24}/>;
            case 'WifiOff': return <WifiOff size={24}/>;
            case 'BadgeCheck': return <BadgeCheck size={24}/>;
            default: return <ShoppingCart size={24}/>;
        }
    }

    return (
        <div className="h-full w-full bg-black relative flex flex-col font-mono overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(168,85,247,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
            
            {/* Header */}
            <div className="p-6 md:p-8 border-b border-purple-900/30 bg-black z-10 flex justify-between items-center shrink-0 relative">
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-900/50 to-transparent"></div>
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-500/10 border border-purple-500/30">
                        <ShoppingBag size={24} className="text-purple-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tighter">BLACK_MARKET <span className="text-purple-500 text-sm align-super">v3.0</span></h1>
                        <p className="text-purple-900/80 text-xs font-bold uppercase tracking-[0.3em]">Illicit Goods & Services</p>
                    </div>
                </div>
                <div className="text-right hidden md:block">
                    <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Encrypted Wallet</div>
                    <div className="text-xl font-mono text-purple-400 font-bold drop-shadow-[0_0_5px_rgba(168,85,247,0.5)]">${player.money.toLocaleString()}</div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 relative z-0">
                 <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-8">
                    {SHOP_ITEMS.map(item => {
                        const costMultiplier = player.attributes.country === 'China' ? 1.2 : 1.0;
                        const cleanerLevel = player.skills['ops_3'] || 0;
                        const discount = 1 - (cleanerLevel * 0.05);
                        const finalCost = Math.floor(item.cost * costMultiplier * discount);
                        const canAfford = player.money >= finalCost;
                        
                        return (
                            <button 
                                key={item.id} 
                                onClick={() => canAfford && onBuy(item)}
                                disabled={!canAfford}
                                className={`group relative flex flex-col text-left transition-all duration-300 overflow-hidden h-full min-h-[220px] border ${canAfford ? 'border-zinc-800 bg-black hover:border-purple-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]' : 'border-zinc-900 bg-black/50 opacity-50 cursor-not-allowed'}`}
                            >
                                {/* Corner Brackets */}
                                {canAfford && (
                                    <>
                                        <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-purple-500/0 group-hover:border-purple-500 transition-colors"></div>
                                        <div className="absolute top-0 right-0 w-2 h-2 border-r border-t border-purple-500/0 group-hover:border-purple-500 transition-colors"></div>
                                        <div className="absolute bottom-0 left-0 w-2 h-2 border-l border-b border-purple-500/0 group-hover:border-purple-500 transition-colors"></div>
                                        <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-purple-500/0 group-hover:border-purple-500 transition-colors"></div>
                                    </>
                                )}

                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all group-hover:scale-110">
                                    {getIcon(item.icon)}
                                </div>
                                
                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`p-2 border ${canAfford ? 'bg-purple-900/10 border-purple-500/30 text-purple-400' : 'bg-zinc-900 border-zinc-800 text-zinc-600'}`}>
                                            {getIcon(item.icon)}
                                        </div>
                                    </div>
                                    
                                    <h3 className={`font-bold text-sm font-mono mb-2 uppercase tracking-wide ${canAfford ? 'text-white group-hover:text-purple-300' : 'text-zinc-600'}`}>{item.name}</h3>
                                    <p className="text-[10px] text-zinc-500 leading-relaxed mb-4 flex-1">{item.description}</p>
                                    
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className={`px-1.5 py-0.5 border text-[9px] uppercase tracking-wider ${item.usageContext === 'dashboard' ? 'border-blue-900/30 text-blue-500 bg-blue-900/10' : 'border-red-900/30 text-red-500 bg-red-900/10'}`}>
                                            {item.usageContext === 'dashboard' ? 'PASSIVE' : 'ACTIVE_HACK'}
                                        </span>
                                    </div>
                                </div>

                                <div className={`p-3 border-t flex justify-between items-center ${canAfford ? 'bg-zinc-900/30 border-zinc-800 group-hover:bg-purple-900/10 group-hover:border-purple-500/30' : 'bg-zinc-950 border-zinc-900'}`}>
                                    <div className="flex flex-col">
                                        <span className={`font-mono font-bold ${canAfford ? 'text-white' : 'text-zinc-600'}`}>${finalCost}</span>
                                        {discount < 1 && <span className="text-[9px] text-zinc-600 line-through">${Math.floor(item.cost * costMultiplier)}</span>}
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${canAfford ? 'text-purple-500 group-hover:text-white' : 'text-zinc-700'}`}>
                                        {canAfford ? 'BUY UNIT >' : 'LOCKED'}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Shop;