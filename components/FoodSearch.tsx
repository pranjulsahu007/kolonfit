import React, { useState, useEffect } from 'react';
import { Search, Plus, Loader2, Utensils, ArrowLeft, Check, Scale } from 'lucide-react';
import { searchFoodDatabase } from '../services/geminiService';
import { FoodItem, MealType } from '../types';

interface FoodSearchProps {
  onAddFood: (food: FoodItem, meal: MealType) => void;
  selectedMeal: MealType;
}

export const FoodSearch: React.FC<FoodSearchProps> = ({ onAddFood, selectedMeal }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<FoodItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);
  
  // Configuration State for Step 2
  const [configAmount, setConfigAmount] = useState<string>('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setSelectedItem(null); // Reset selection
    setResults([]);

    const foods = await searchFoodDatabase(query);
    setResults(foods);
    setIsLoading(false);
  };

  const handleSelectFood = (food: FoodItem) => {
    setSelectedItem(food);
    // Default to the base amount (e.g. 100 for grams, 1 for piece)
    setConfigAmount(food.baseAmount?.toString() || '1');
  };

  const handleBackToResults = () => {
    setSelectedItem(null);
  };

  const handleConfirmAdd = () => {
    if (!selectedItem) return;

    const amount = parseFloat(configAmount);
    if (isNaN(amount) || amount <= 0) return;

    const baseAmount = selectedItem.baseAmount || 1;
    const ratio = amount / baseAmount;

    // Calculate final values based on the ratio
    const finalFood: FoodItem = {
        ...selectedItem,
        id: crypto.randomUUID(), // New ID for the added instance
        amount: amount,
        unit: selectedItem.baseUnit || 'serving',
        calories: Math.round(selectedItem.calories * ratio),
        protein: Math.round(selectedItem.protein * ratio),
        carbs: Math.round(selectedItem.carbs * ratio),
        fat: Math.round(selectedItem.fat * ratio),
        fiber: Math.round((selectedItem.fiber || 0) * ratio),
        sugar: Math.round((selectedItem.sugar || 0) * ratio),
        sodium: Math.round((selectedItem.sodium || 0) * ratio),
    };

    onAddFood(finalFood, selectedMeal);
    // Reset selection and query after adding
    setSelectedItem(null);
    setResults([]);
    setQuery('');
  };

  // --- Step 2: Configuration View ---
  if (selectedItem) {
    const amount = parseFloat(configAmount) || 0;
    const baseAmount = selectedItem.baseAmount || 1;
    const ratio = amount / baseAmount;
    const previewCalories = Math.round(selectedItem.calories * ratio);
    const unitLabel = selectedItem.baseUnit === 'piece' && amount !== 1 ? 'pieces' : selectedItem.baseUnit;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6 mb-6 relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <button 
                    onClick={handleBackToResults}
                    className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h3 className="text-xl font-bold text-slate-800">{selectedItem.name}</h3>
                    <p className="text-sm text-slate-500">Configure Portion</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left: Inputs */}
                <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wider">
                        {['g', 'ml', 'mg'].includes(selectedItem.baseUnit || '') ? 'Weight / Volume' : 'Quantity'}
                    </label>
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                            <input 
                                type="number" 
                                value={configAmount}
                                onChange={(e) => setConfigAmount(e.target.value)}
                                className="w-full text-3xl font-bold text-slate-800 border-b-2 border-emerald-200 focus:border-emerald-500 outline-none py-2 bg-transparent transition-colors placeholder-slate-200"
                                placeholder="0"
                                autoFocus
                            />
                        </div>
                        <div className="text-lg font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                            {unitLabel}
                        </div>
                    </div>
                    
                    <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                        {/* Quick suggestions based on unit */}
                        {selectedItem.baseUnit === 'g' && [50, 100, 150, 200, 250].map(val => (
                            <button 
                                key={val}
                                onClick={() => setConfigAmount(val.toString())}
                                className={`px-3 py-1 text-sm rounded-full border transition-colors ${parseFloat(configAmount) === val ? 'bg-emerald-100 border-emerald-500 text-emerald-700' : 'border-slate-200 text-slate-600 hover:border-emerald-300'}`}
                            >
                                {val}g
                            </button>
                        ))}
                         {selectedItem.baseUnit === 'piece' && [0.5, 1, 2, 3, 5].map(val => (
                            <button 
                                key={val}
                                onClick={() => setConfigAmount(val.toString())}
                                className={`px-3 py-1 text-sm rounded-full border transition-colors ${parseFloat(configAmount) === val ? 'bg-emerald-100 border-emerald-500 text-emerald-700' : 'border-slate-200 text-slate-600 hover:border-emerald-300'}`}
                            >
                                {val}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right: Preview Card */}
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex flex-col justify-between">
                    <div>
                        <div className="text-sm text-slate-400 font-medium uppercase tracking-wider mb-3">Nutrition Preview</div>
                        <div className="flex items-baseline gap-2 mb-4">
                            <span className="text-4xl font-bold text-emerald-600">{previewCalories}</span>
                            <span className="text-slate-500 font-medium">kcal</span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2">
                            <div className="bg-white p-2 rounded-lg border border-slate-100 text-center">
                                <div className="text-xs text-slate-400 mb-1">Protein</div>
                                <div className="font-semibold text-slate-700">{Math.round(selectedItem.protein * ratio)}g</div>
                            </div>
                            <div className="bg-white p-2 rounded-lg border border-slate-100 text-center">
                                <div className="text-xs text-slate-400 mb-1">Carbs</div>
                                <div className="font-semibold text-slate-700">{Math.round(selectedItem.carbs * ratio)}g</div>
                            </div>
                            <div className="bg-white p-2 rounded-lg border border-slate-100 text-center">
                                <div className="text-xs text-slate-400 mb-1">Fat</div>
                                <div className="font-semibold text-slate-700">{Math.round(selectedItem.fat * ratio)}g</div>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={handleConfirmAdd}
                        disabled={!amount || amount <= 0}
                        className="w-full mt-6 bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Plus size={20} /> Add to Meal
                    </button>
                </div>
            </div>
        </div>
    );
  }

  // --- Step 1: Search & Results ---
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        <Utensils size={20} className="text-emerald-500" />
        Find Food
      </h3>
      
      <form onSubmit={handleSearch} className="relative mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g., Chicken Breast, Almonds, Apple..."
          className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-700 placeholder-slate-400"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <button 
            type="submit"
            disabled={isLoading || !query}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'Search'}
        </button>
      </form>

      {/* Results Area */}
      <div className="space-y-3">
        {isLoading && (
            <div className="text-center py-8">
                <Loader2 className="animate-spin text-emerald-500 mx-auto mb-2" size={32} />
                <p className="text-slate-500 text-sm">Consulting AI database...</p>
            </div>
        )}

        {!isLoading && results.length > 0 && (
            <div className="grid gap-3">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Select an item</div>
                {results.map((food) => (
                    <div 
                        key={food.id} 
                        onClick={() => handleSelectFood(food)}
                        className="group flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50 hover:shadow-sm transition-all cursor-pointer bg-white"
                    >
                        <div>
                            <div className="font-semibold text-slate-800 group-hover:text-emerald-800">{food.name}</div>
                            <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                                <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 group-hover:bg-white/50">
                                    {/* Display base serving info */}
                                    Per {food.baseAmount} {food.baseUnit}
                                </span>
                                <span className="text-emerald-600 font-medium">{food.calories} kcal</span>
                            </div>
                        </div>
                        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-300 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                            <Scale size={16} />
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};