import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { FoodItem, DietPlan, MealType } from '../types';
import { Zap, Activity, Droplet, Flame, Info } from 'lucide-react';

interface NutritionSidebarProps {
  dietPlan: DietPlan;
  targets: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export const NutritionSidebar: React.FC<NutritionSidebarProps> = ({ dietPlan, targets }) => {
  
  // Calculate total nutrition stats
  const totals = useMemo(() => {
    let t = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 };
    Object.values(MealType).forEach((mealType) => {
      dietPlan[mealType].forEach((food) => {
        t.calories += food.calories;
        t.protein += food.protein;
        t.carbs += food.carbs;
        t.fat += food.fat;
        t.fiber += food.fiber || 0;
        t.sugar += food.sugar || 0;
        t.sodium += food.sodium || 0;
      });
    });
    return t;
  }, [dietPlan]);

  // Distinct colors for macros
  const COLORS = {
    protein: '#3b82f6', // Blue-500
    carbs: '#f59e0b',   // Amber-500
    fat: '#f43f5e',     // Rose-500
    empty: '#f1f5f9'    // Slate-100
  };

  const macroData = [
    { name: 'Protein', value: Math.round(totals.protein), color: COLORS.protein }, 
    { name: 'Carbs', value: Math.round(totals.carbs), color: COLORS.carbs },
    { name: 'Fat', value: Math.round(totals.fat), color: COLORS.fat },
  ];

  const calculatePercentage = (current: number, target: number) => {
    return Math.min(100, Math.max(0, (current / target) * 100));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-6 h-fit overflow-y-auto max-h-[calc(100vh-3rem)]">
      <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Activity className="text-emerald-500" size={24} />
        Daily Summary
      </h2>

      {/* Main Calories Ring - Increased Height to prevent clipping */}
      <div className="mb-8 flex flex-col items-center justify-center relative py-4">
         <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={[{ value: totals.calories }, { value: Math.max(0, targets.calories - totals.calories) }]}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={90}
                        startAngle={90}
                        endAngle={-270}
                        dataKey="value"
                        stroke="none"
                        paddingAngle={2}
                    >
                        <Cell key="val" fill="#10b981" cornerRadius={10} />
                        <Cell key="rem" fill="#f1f5f9" />
                    </Pie>
                    <text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle" className="text-4xl font-bold fill-slate-800" style={{ fontSize: '2.5rem' }}>
                        {Math.round(totals.calories)}
                    </text>
                    <text x="50%" y="60%" textAnchor="middle" dominantBaseline="middle" className="text-sm font-medium fill-slate-500">
                        / {targets.calories} kcal
                    </text>
                </PieChart>
            </ResponsiveContainer>
         </div>
      </div>

      {/* Macro Breakdown Chart */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wider border-b border-slate-100 pb-2">Macro Breakdown</h3>
        <div className="flex flex-row items-center justify-between mt-4">
            <div className="h-32 w-32 min-w-[128px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={macroData}
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius={60}
                    dataKey="value"
                    stroke="none"
                  >
                    {macroData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                    itemStyle={{ color: '#1e293b', fontWeight: 600 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex-1 pl-4 space-y-2">
                {macroData.map((macro, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: macro.color }}></span>
                            <span className="text-slate-600 font-medium">{macro.name}</span>
                        </div>
                        <span className="font-bold text-slate-800">{macro.value}g</span>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* Detailed Progress Bars */}
      <div className="space-y-5 mb-8">
        
        {/* Protein */}
        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="font-medium text-slate-700 flex items-center gap-1.5">
                <Zap size={14} className="text-blue-500" /> Protein
            </span>
            <span className="text-slate-500">{Math.round(totals.protein)} / {targets.protein}g</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div 
                className="bg-blue-500 h-2.5 rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${calculatePercentage(totals.protein, targets.protein)}%` }}
            ></div>
          </div>
        </div>

        {/* Carbs */}
        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="font-medium text-slate-700 flex items-center gap-1.5">
                <Droplet size={14} className="text-amber-500" /> Carbs
            </span>
            <span className="text-slate-500">{Math.round(totals.carbs)} / {targets.carbs}g</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div 
                className="bg-amber-500 h-2.5 rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${calculatePercentage(totals.carbs, targets.carbs)}%` }}
            ></div>
          </div>
        </div>

        {/* Fats */}
        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="font-medium text-slate-700 flex items-center gap-1.5">
                <Flame size={14} className="text-rose-500" /> Fat
            </span>
            <span className="text-slate-500">{Math.round(totals.fat)} / {targets.fat}g</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div 
                className="bg-rose-500 h-2.5 rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${calculatePercentage(totals.fat, targets.fat)}%` }}
            ></div>
          </div>
        </div>

      </div>

      {/* Micronutrients Section */}
      <div className="border-t border-slate-100 pt-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wider flex items-center gap-2">
            <Info size={14} /> Micronutrients
        </h3>
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-3 rounded-lg">
                <div className="text-xs text-slate-500 mb-1">Fiber</div>
                <div className="text-lg font-bold text-slate-700">{Math.round(totals.fiber)}g</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg">
                <div className="text-xs text-slate-500 mb-1">Sugar</div>
                <div className="text-lg font-bold text-slate-700">{Math.round(totals.sugar)}g</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg col-span-2">
                <div className="flex justify-between items-end">
                    <div>
                        <div className="text-xs text-slate-500 mb-1">Sodium</div>
                        <div className="text-lg font-bold text-slate-700">{Math.round(totals.sodium)}mg</div>
                    </div>
                    <div className="text-xs text-slate-400">
                        {totals.sodium > 2300 ? <span className="text-amber-500">High</span> : 'Normal'}
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100">
        <button className="w-full py-3 bg-emerald-900 text-white rounded-xl font-semibold hover:bg-emerald-800 transition-colors shadow-lg shadow-emerald-200">
            Publish to Client App
        </button>
      </div>
    </div>
  );
};