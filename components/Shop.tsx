
import React from 'react';
import { ShopItem, PlayerState } from '../types';
import { SHOP_ITEMS, COUNTRY_DATA } from '../constants';
import { ShoppingCart, Lock, Shield, Zap, Smartphone, Briefcase, Trash2, WifiOff, BadgeCheck, Mic2 } from 'lucide-react';

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
        <div className="h-full w-full bg-zinc-950 overflow-hidden relative flex flex-col">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.1),transparent_50%)] pointer-events-none"></div>
            
            <div className="p-6 md:p-8 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm z-10 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                        <ShoppingBag size={24} className="text-purple-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold font-mono text-white tracking-tighter">BLACK_MARKET</h1>
                        <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest">Illicit Tools & Services</p>
                    </div>
                </div>
                <div className="text-right hidden md:block">
                    <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Available Crypto</div>
                    <div className="text-xl font-mono text-white font-bold">${player.money.toLocaleString()}</div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 relative z-0">
                 <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-8">
                    {SHOP_ITEMS.map(item => {
                        const costMultiplier = player.attributes.country === 'China' ? 1.2 : 1.0;
                        const cleanerLevel = player.skills['ops_3'] || 0;
                        const discount = 1 - (cleanerLevel * 0.05);
                        const finalCost = Math.floor(item.cost * costMultiplier * discount);
                        const canAfford = player.money >= finalCost;
                        
                        return (
                            <div key={item.id} className={`group relative bg-zinc-900/40 border transition-all duration-300 flex flex-col overflow-hidden ${canAfford ? 'border-zinc-800 hover:border-purple-500/50 hover:bg-zinc-900/60 hover:shadow-[0_0_30px_rgba(168,85,247,0.1)]' : 'border-zinc-800/50 opacity-50 grayscale'}`}>
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                                    {getIcon(item.icon)}
                                </div>
                                
                                <div className="p-6 flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`p-3 rounded-lg border ${canAfford ? 'bg-purple-900/20 border-purple-500/30 text-purple-400' : 'bg-zinc-800 border-zinc-700 text-zinc-500'}`}>
                                            {getIcon(item.icon)}
                                        </div>
                                        <div className="text-right">
                                            <div className={`font-mono font-bold text-lg ${canAfford ? 'text-white' : 'text-zinc-500'}`}>${finalCost}</div>
                                            {discount < 1 && <div className="text-[10px] text-green-500 line-through">${Math.floor(item.cost * costMultiplier)}</div>}
                                        </div>
                                    </div>
                                    
                                    <h3 className={`font-bold text-lg font-mono mb-2 ${canAfford ? 'text-white group-hover:text-purple-300' : 'text-zinc-500'}`}>{item.name}</h3>
                                    <p className="text-xs text-zinc-400 leading-relaxed min-h-[3em]">{item.description}</p>
                                    
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <span className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-500 uppercase font-mono tracking-wider">
                                            {item.usageContext === 'dashboard' ? 'INSTANT' : 'ACTIVE HACK'}
                                        </span>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => onBuy(item)} 
                                    disabled={!canAfford} 
                                    className={`w-full py-3 text-xs font-bold uppercase tracking-widest transition-all ${canAfford ? 'bg-zinc-900 hover:bg-purple-600 text-purple-400 hover:text-white border-t border-zinc-800 hover:border-purple-500' : 'bg-zinc-950 text-zinc-600 cursor-not-allowed border-t border-zinc-900'}`}
                                >
                                    {canAfford ? 'Purchase Unit' : 'Insufficient Funds'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

import { ShoppingBag } from 'lucide-react';
export default Shop;
