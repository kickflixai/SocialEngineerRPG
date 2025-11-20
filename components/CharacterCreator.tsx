
import React, { useState } from 'react';
import { PlayerAttributes } from '../types';
import { generatePlayerAvatar } from '../services/geminiService';
import { Loader2, Sparkles, ChevronRight, User, Hash, Globe, Shirt, Smile, Glasses, ChevronLeft, CheckCircle2, Edit3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { COUNTRIES, CLOTHING_STYLES, FACIAL_FEATURES, ACCESSORIES, AGES, COUNTRY_DATA } from '../constants';

interface Props {
  onComplete: (attrs: PlayerAttributes) => void;
}

const CharacterCreator: React.FC<Props> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<PlayerAttributes>({
    name: '',
    gender: 'Male',
    age: AGES[1],
    country: COUNTRIES[0],
    archetype: 'Street Hustler', // Default
    clothing: CLOTHING_STYLES[0],
    facialFeatures: FACIAL_FEATURES[0],
    accessories: ACCESSORIES[0],
    avatarUrl: ''
  });
  
  const [customArchetype, setCustomArchetype] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    const finalArchetype = customArchetype.trim() ? customArchetype : "Unknown Drifter";
    const finalData = { ...formData, archetype: finalArchetype };
    setFormData(finalData);
    
    try {
      const url = await generatePlayerAvatar(finalData);
      setFormData(prev => ({ ...prev, avatarUrl: url }));
      setStep(5); // Go to review
    } catch (error) {
      alert("Failed to generate avatar. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const StepIndicator = () => (
    <div className="flex justify-between mb-6 md:mb-8 relative z-10 px-2">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-zinc-800 -z-10"></div>
        {[1, 2, 3, 4, 5].map(i => (
            <div 
                key={i} 
                className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-bold transition-colors ${step >= i ? 'bg-green-500 text-black' : 'bg-zinc-900 border border-zinc-700 text-zinc-500'}`}
            >
                {i}
            </div>
        ))}
    </div>
  );

  return (
    <div className="w-full max-w-5xl bg-zinc-950/90 border border-zinc-800/50 backdrop-blur-xl rounded-2xl p-4 md:p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col h-full md:h-[80vh]">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

      <div className="text-center mb-6 shrink-0 pt-4 md:pt-0">
        <h2 className="text-3xl md:text-4xl font-mono font-bold text-white mb-2 tracking-tight">IDENTITY SYNTHESIS</h2>
        <p className="text-zinc-400 text-xs md:text-sm uppercase tracking-widest">Create your digital persona</p>
      </div>

      <StepIndicator />

      <div className="flex-1 overflow-y-auto custom-scrollbar px-2">
      <AnimatePresence mode="wait">
        {step === 1 && (
            <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
            >
                <h3 className="text-lg md:text-xl font-bold text-white border-b border-zinc-800 pb-2 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-green-500 uppercase mb-2 flex items-center gap-2"><User size={14}/> Alias</label>
                        <input 
                            type="text" 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded p-4 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all"
                            placeholder="e.g. John Doe"
                        />
                    </div>
                     <div>
                        <label className="block text-xs font-bold text-green-500 uppercase mb-2 flex items-center gap-2"><Hash size={14}/> Age Group</label>
                        <select 
                            value={formData.age}
                            onChange={(e) => setFormData({...formData, age: e.target.value})}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded p-4 text-white outline-none"
                        >
                            {AGES.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-green-500 uppercase mb-2">Gender</label>
                    <div className="grid grid-cols-3 gap-2">
                        {['Male', 'Female', 'Non-Binary'].map(g => (
                            <button
                                key={g}
                                onClick={() => setFormData({...formData, gender: g})}
                                className={`p-3 rounded border text-xs md:text-sm ${formData.gender === g ? 'border-green-500 bg-green-500/20 text-white' : 'border-zinc-800 text-zinc-400 hover:border-zinc-600'}`}
                            >
                                {g}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex justify-end mt-8 pb-8">
                    <button onClick={() => setStep(2)} disabled={!formData.name} className="w-full md:w-auto px-8 py-3 bg-white text-black font-bold rounded hover:bg-zinc-200 disabled:opacity-50">Select Origin &rarr;</button>
                </div>
            </motion.div>
        )}

        {step === 2 && (
             <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
            >
                <h3 className="text-lg md:text-xl font-bold text-white border-b border-zinc-800 pb-2 mb-4 flex items-center gap-2">
                    <Globe size={20}/> Select Origin
                </h3>
                <p className="text-zinc-400 text-sm">Where are you operating from? Your location determines starting resources and local heat.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {COUNTRIES.map(countryKey => {
                        const country = COUNTRY_DATA[countryKey];
                        return (
                            <button
                                key={countryKey}
                                onClick={() => setFormData({...formData, country: countryKey})}
                                className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden group ${
                                    formData.country === countryKey
                                    ? 'bg-zinc-800/80 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.2)]' 
                                    : 'bg-zinc-900/40 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-600'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className={`font-bold font-mono text-lg ${formData.country === countryKey ? 'text-green-400' : 'text-white'}`}>
                                        {country.name}
                                    </h4>
                                    {formData.country === countryKey && <CheckCircle2 size={20} className="text-green-500"/>}
                                </div>
                                <p className="text-zinc-400 text-xs italic mb-3 h-auto md:h-10 overflow-hidden">{country.description}</p>
                                
                                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                                    <div className="bg-green-900/20 p-2 rounded border border-green-900/30">
                                        <div className="text-green-500 font-bold mb-1 uppercase">PERK: {country.perkName}</div>
                                        <div className="text-zinc-300">{country.perkDescription}</div>
                                    </div>
                                    <div className="bg-red-900/20 p-2 rounded border border-red-900/30">
                                        <div className="text-red-500 font-bold mb-1 uppercase">FLAW: {country.weaknessName}</div>
                                        <div className="text-zinc-300">{country.weaknessDescription}</div>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div className="flex justify-between mt-8 pb-8">
                    <button onClick={() => setStep(1)} className="text-zinc-400 hover:text-white">Back</button>
                    <button onClick={() => setStep(3)} className="px-8 py-3 bg-white text-black font-bold rounded hover:bg-zinc-200">Next Step &rarr;</button>
                </div>
            </motion.div>
        )}

        {step === 3 && (
            <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
            >
                <h3 className="text-lg md:text-xl font-bold text-white border-b border-zinc-800 pb-2 mb-4">Visual Aesthetics</h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-purple-400 uppercase mb-2 flex items-center gap-2"><Shirt size={14}/> Clothing</label>
                        <select value={formData.clothing} onChange={(e) => setFormData({...formData, clothing: e.target.value})} className="w-full bg-zinc-900 border border-zinc-700 rounded p-4 text-white outline-none">
                            {CLOTHING_STYLES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-purple-400 uppercase mb-2 flex items-center gap-2"><Smile size={14}/> Facial Features</label>
                        <select value={formData.facialFeatures} onChange={(e) => setFormData({...formData, facialFeatures: e.target.value})} className="w-full bg-zinc-900 border border-zinc-700 rounded p-4 text-white outline-none">
                            {FACIAL_FEATURES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-purple-400 uppercase mb-2 flex items-center gap-2"><Glasses size={14}/> Accessories</label>
                        <select value={formData.accessories} onChange={(e) => setFormData({...formData, accessories: e.target.value})} className="w-full bg-zinc-900 border border-zinc-700 rounded p-4 text-white outline-none">
                            {ACCESSORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>
                <div className="flex justify-between mt-8 pb-8">
                    <button onClick={() => setStep(2)} className="text-zinc-400 hover:text-white">Back</button>
                    <button onClick={() => setStep(4)} className="px-8 py-3 bg-white text-black font-bold rounded hover:bg-zinc-200">Next Step &rarr;</button>
                </div>
            </motion.div>
        )}

        {step === 4 && (
            <motion.div 
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
            >
                <h3 className="text-lg md:text-xl font-bold text-white border-b border-zinc-800 pb-2 mb-4 flex items-center gap-2">
                    <Edit3 size={20}/> Character Backstory
                </h3>
                
                <div>
                    <label className="block text-xs font-bold text-blue-400 uppercase mb-2">Defined Role / Archetype (Optional)</label>
                    <p className="text-zinc-500 text-xs mb-4">
                        Describe who you are. This will influence your avatar generation and style.
                        <br/>If left blank, you will be a generic Drifter.
                    </p>
                    <textarea
                        value={customArchetype}
                        onChange={(e) => setCustomArchetype(e.target.value)}
                        placeholder="e.g. Disgraced Wall Street Broker, Retired Military General, Bored Teenager with a Laptop, Crypto Influencer, Angry Ex-Employee..."
                        className="w-full h-32 bg-zinc-900 border border-zinc-700 rounded-xl p-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none font-mono text-sm"
                        maxLength={100}
                    />
                    <div className="flex justify-between mt-2">
                        <span className="text-[10px] text-zinc-600">MAX 100 CHARACTERS</span>
                        <span className="text-[10px] text-zinc-600">{customArchetype.length}/100</span>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold mr-2">Examples:</span>
                    {['Corporate Professional', 'Street Hustler', 'Friendly Neighbor', 'Tech Nerd'].map(ex => (
                        <button 
                            key={ex} 
                            onClick={() => setCustomArchetype(ex)}
                            className="text-[10px] px-2 py-1 bg-zinc-800 rounded border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500"
                        >
                            {ex}
                        </button>
                    ))}
                </div>

                <div className="flex justify-between mt-8 pt-6 border-t border-zinc-800 pb-8">
                    <button onClick={() => setStep(3)} className="text-zinc-400 hover:text-white">Back</button>
                    <button 
                        onClick={handleGenerate}
                        disabled={loading}
                        className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-green-900/20 disabled:opacity-70"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
                        {loading ? 'SYNTHESIZING...' : 'GENERATE IDENTITY'}
                    </button>
                </div>
            </motion.div>
        )}

        {step === 5 && (
            <motion.div 
                key="step5"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-8 h-full flex flex-col justify-center"
            >
                <div className="relative w-48 h-48 md:w-64 md:h-64 mx-auto rounded-xl overflow-hidden border-4 border-zinc-800 shadow-[0_0_50px_rgba(34,197,94,0.2)] group">
                    <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-center p-6">
                        <div>
                            <h3 className="text-xl md:text-2xl font-bold text-white">{formData.name}</h3>
                            <p className="text-green-400 font-mono text-xs md:text-sm uppercase tracking-wider">{formData.archetype}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto text-sm text-zinc-400 w-full">
                    <div className="bg-zinc-900 p-3 rounded border border-zinc-800">
                        <span className="text-zinc-500 block text-xs uppercase">Origin</span>
                        <span className="text-white font-bold">{formData.country}</span>
                    </div>
                    <div className="bg-zinc-900 p-3 rounded border border-zinc-800">
                        <span className="text-zinc-500 block text-xs uppercase">Age</span>
                        <span className="text-white font-bold">{formData.age}</span>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 justify-center mt-auto pb-8">
                    <button onClick={() => setStep(4)} className="px-6 py-3 border border-zinc-700 rounded hover:bg-zinc-900 text-zinc-300 w-full md:w-auto">Regenerate</button>
                    <button 
                        onClick={() => onComplete(formData)}
                        className="px-8 py-3 bg-white text-black font-bold rounded flex items-center justify-center gap-2 hover:bg-zinc-200 w-full md:w-auto"
                    >
                        Confirm Identity <ChevronRight size={18} />
                    </button>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
};

export default CharacterCreator;
