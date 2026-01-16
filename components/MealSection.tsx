import React from 'react';
import { Trash2, PlusCircle, Coffee, Sun, Moon, Cookie, Edit2, Sunrise, Zap, Dumbbell, Utensils } from 'lucide-react';
import { FoodItem, MealType } from '../types';

interface MealSectionProps {
  mealType: MealType;
  foods: FoodItem[];
  onRemoveFood: (foodId: string, meal: MealType) => void;
  onEditFood: (food: FoodItem, meal: MealType) => void;
  onSelectForAdd: (meal: MealType) => void;
  isActive: boolean;
}

const MealIcon = ({ type }: { type: MealType }) => {
    switch (type) {
        case MealType.EARLY_MORNING: return <Sunrise size={20} className="text-orange-300" />;
        case MealType.BREAKFAST: return <Coffee size={20} className="text-orange-500" />;
        case MealType.MID_DAY_SNACK: return <Cookie size={20} className="text-amber-400" />;
        case MealType.LUNCH: return <Sun size={20} className="text-yellow-500" />;
        case MealType.PRE_WORKOUT: return <Dumbbell size={20} className="text-rose-500" />;
        case MealType.POST_WORKOUT: return <Zap size={20} className="text-blue-500" />;
        case MealType.LATE_EVENING_SNACK: return <Utensils size={20} className="text-indigo-400" />;
        case MealType.DINNER: return <Utensils size={20} className="text-indigo-600" />;
        case MealType.LATE_EVENING: return <Moon size={20} className="text-purple-500" />;
        default: return <Sun size={20} className="text-slate-400" />;
    }
};

export const MealSection: React.FC<MealSectionProps> = ({ mealType, foods, onRemoveFood, onEditFood, onSelectForAdd, isActive }) => {
  
  const totalCals = Math.round(foods.reduce((acc, f) => acc + f.calories, 0));

  return (
    <div className={`rounded-2xl border transition-all duration-300 ${isActive ? 'border-emerald-500 ring-1 ring-emerald-500/20 shadow-md bg-white' : 'border-slate-200 bg-white/50 hover:bg-white hover:border-emerald-200'}`}>
      <div className="p-4 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isActive ? 'bg-emerald-50' : 'bg-slate-50'}`}>
                <MealIcon type={mealType} />
            </div>
            <div>
                <h3 className="font-bold text-slate-800">{mealType}</h3>
                <p className="text-xs text-slate-500 font-medium">{totalCals} kcal planned</p>
            </div>
        </div>
        <button 
            onClick={() => onSelectForAdd(mealType)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-emerald-100 text-emerald-700' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'}`}
        >
            <PlusCircle size={16} />
            Add Food
        </button>
      </div>

      <div className="p-2">
        {foods.length === 0 ? (
            <div className="py-6 text-center" onClick={() => onSelectForAdd(mealType)}>
                <p className="text-sm text-slate-400 italic cursor-pointer hover:text-emerald-500 transition-colors">No foods added yet. Click to add.</p>
            </div>
        ) : (
            <div className="space-y-1">
                {foods.map((food) => (
                    <div key={food.id} className="group flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors">
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-slate-700">{food.name}</span>
                                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full border border-slate-200">
                                    {food.amount} {food.unit}
                                </span>
                            </div>
                            <div className="text-xs text-slate-400 flex gap-3 mt-0.5">
                                <span className="text-emerald-600/80 font-medium">{food.calories} kcal</span>
                                <span className="hidden group-hover:inline-flex gap-2">
                                    <span>P:{food.protein}</span>
                                    <span>C:{food.carbs}</span>
                                    <span>F:{food.fat}</span>
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={() => onEditFood(food, mealType)}
                                className="p-1.5 text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-all"
                                title="Edit Portion"
                            >
                                <Edit2 size={16} />
                            </button>
                            <button 
                                onClick={() => onRemoveFood(food.id, mealType)}
                                className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
                                title="Remove Item"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};