
import React from 'react';
import { ShopItem, PlayerState } from '../types';
import { SHOP_ITEMS, COUNTRY_DATA } from '../constants';

interface Props {
    player: PlayerState;
    onBuy: (item: ShopItem) => void;
}

const Shop: React.FC<Props> = ({ player, onBuy }) => {
    return (
        <div className="p-6 md:p-12 max-w-7xl mx-auto h-full overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {SHOP_ITEMS.map(item => {
                    const countryStats = COUNTRY_DATA[player.attributes.country];
                    const costMultiplier = player.attributes.country === 'China' ? 1.2 : 1.0;
                    // Cleaner Crew (Ops 3) Discount
                    const cleanerLevel = player.skills['ops_3'] || 0;
                    const discount = 1 - (cleanerLevel * 0.05);
                    
                    const finalCost = Math.floor(item.cost * costMultiplier * discount);
                    const canAfford = player.money >= finalCost;
                    
                    return (
                        <div key={item.id} className={`bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl flex flex-col justify-between ${canAfford ? 'hover:border-purple-500/50' : 'opacity-50'}`}>
                            <div>
                                <h3 className="font-bold text-lg text-white">{item.name}</h3>
                                <p className="text-purple-500 font-mono font-bold">${finalCost}</p>
                                <p className="text-zinc-400 text-sm mt-2">{item.description}</p>
                            </div>
                            <button onClick={() => onBuy(item)} disabled={!canAfford} className="mt-4 w-full py-2 bg-purple-600 rounded font-bold disabled:bg-zinc-800 disabled:text-zinc-600">Purchase</button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Shop;
