import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { FoodItem } from '../types';

interface EditFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedFood: FoodItem) => void;
  food: FoodItem | null;
}

export const EditFoodModal: React.FC<EditFoodModalProps> = ({ isOpen, onClose, onUpdate, food }) => {
  const [amountStr, setAmountStr] = useState('');

  useEffect(() => {
    if (isOpen && food) {
      setAmountStr(food.amount.toString());
    }
  }, [isOpen, food]);

  if (!isOpen || !food) return null;

  // Calculation Logic
  // Fallback to current values if base values are missing to ensure robustness
  const baseAmount = food.baseAmount || food.amount; 
  const baseUnit = food.baseUnit || food.unit;
  
  // Calculate base nutrient density
  const baseCalories = food.baseCalories !== undefined ? food.baseCalories : (food.calories / food.amount) * baseAmount;
  // Calculate per-unit-amount density for macros if base isn't stored, or derive from base
  const proteinDensity = food.protein / food.amount;
  const carbsDensity = food.carbs / food.amount;
  const fatDensity = food.fat / food.amount;
  const fiberDensity = (food.fiber || 0) / food.amount;
  const sugarDensity = (food.sugar || 0) / food.amount;
  const sodiumDensity = (food.sodium || 0) / food.amount;

  const currentAmount = parseFloat(amountStr) || 0;
  
  // Calculate new values
  // We use density * newAmount directly as it's cleaner than ratio from base for everything
  const newCalories = Math.round((baseCalories / baseAmount) * currentAmount);
  const newProtein = Math.round(proteinDensity * currentAmount);
  const newCarbs = Math.round(carbsDensity * currentAmount);
  const newFat = Math.round(fatDensity * currentAmount);
  
  const unitLabel = baseUnit === 'piece' && currentAmount !== 1 ? 'pieces' : baseUnit;

  const handleSave = () => {
     if (currentAmount <= 0) return;
     
     const updatedFood: FoodItem = {
         ...food,
         amount: currentAmount,
         calories: newCalories,
         protein: newProtein,
         carbs: newCarbs,
         fat: newFat,
         fiber: Math.round(fiberDensity * currentAmount),
         sugar: Math.round(sugarDensity * currentAmount),
         sodium: Math.round(sodiumDensity * currentAmount),
     };
     
     onUpdate(updatedFood);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
            <h3 className="font-bold text-slate-800">Edit Portion</h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
            </button>
        </div>
        
        <div className="p-6">
            <div className="mb-6">
                <h4 className="text-lg font-bold text-slate-800 mb-1">{food.name}</h4>
                <p className="text-sm text-slate-500">Adjust the quantity below</p>
            </div>

            <div className="flex items-center gap-4 mb-8">
                <div className="flex-1">
                     <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Amount ({unitLabel})
                    </label>
                    <input 
                        type="number" 
                        value={amountStr}
                        onChange={(e) => setAmountStr(e.target.value)}
                        className="w-full text-3xl font-bold text-slate-900 bg-transparent border-b-2 border-emerald-200 focus:border-emerald-500 outline-none py-2 transition-colors placeholder-slate-300"
                        autoFocus
                    />
                </div>
                
                 {/* Quick Suggestions */}
                 <div className="flex flex-col gap-2">
                    {baseUnit === 'g' && [50, 100, 150, 200].map(val => (
                         <button key={val} onClick={() => setAmountStr(val.toString())} className="text-xs px-2 py-1 bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 rounded transition-colors">
                             {val}g
                         </button>
                    ))}
                    {baseUnit === 'ml' && [100, 200, 250, 330].map(val => (
                         <button key={val} onClick={() => setAmountStr(val.toString())} className="text-xs px-2 py-1 bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 rounded transition-colors">
                             {val}ml
                         </button>
                    ))}
                    {baseUnit === 'piece' && [0.5, 1, 2, 3].map(val => (
                         <button key={val} onClick={() => setAmountStr(val.toString())} className="text-xs px-2 py-1 bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 rounded transition-colors">
                             {val}
                         </button>
                    ))}
                 </div>
            </div>

            {/* Preview */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">New Totals</div>
                <div className="flex justify-between items-end">
                    <div>
                        <span className="text-3xl font-bold text-emerald-600">{newCalories}</span>
                        <span className="text-sm text-slate-500 font-medium ml-1">kcal</span>
                    </div>
                    <div className="flex gap-4 text-sm">
                        <div className="text-center">
                            <span className="block font-bold text-slate-700">{newProtein}g</span>
                            <span className="text-xs text-slate-400">Prot</span>
                        </div>
                        <div className="text-center">
                            <span className="block font-bold text-slate-700">{newCarbs}g</span>
                            <span className="text-xs text-slate-400">Carbs</span>
                        </div>
                        <div className="text-center">
                            <span className="block font-bold text-slate-700">{newFat}g</span>
                            <span className="text-xs text-slate-400">Fat</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">
                Cancel
            </button>
            <button 
                onClick={handleSave}
                disabled={currentAmount <= 0}
                className="flex-1 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                <Check size={18} /> Update Item
            </button>
        </div>
      </div>
    </div>
  );
};