import React, { useState, useMemo, useEffect } from 'react';
import { X, Search, CheckCircle, ChevronRight, User, Calendar, Target, AlertCircle } from 'lucide-react';
import { Client, WeeklyDietPlan, MealType, DAYS_OF_WEEK } from '../types';

interface ClientAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  dietPlan: WeeklyDietPlan;
  onAssign: (client: Client) => void;
  clients: Client[];
  initialClient?: Client | null;
}

type Step = 'SELECT' | 'CONFIRM' | 'SUCCESS';

export const ClientAssignmentModal: React.FC<ClientAssignmentModalProps> = ({ 
  isOpen, 
  onClose, 
  dietPlan, 
  onAssign, 
  clients, 
  initialClient 
}) => {
  const [step, setStep] = useState<Step>('SELECT');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Reset state when opening
  // We only want this to run when the modal first opens, not when props update (like client data after assignment)
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      if (initialClient) {
        setSelectedClient(initialClient);
        setStep('CONFIRM');
      } else {
        setSelectedClient(null);
        setStep('SELECT');
      }
    }
  }, [isOpen]); // Removed initialClient from dependencies to prevent reset on update

  // Filter clients using the passed prop
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate Weekly Average Stats
  const planAverages = useMemo(() => {
    let t = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    
    DAYS_OF_WEEK.forEach(day => {
        const dayPlan = dietPlan[day];
        Object.values(MealType).forEach((mealType) => {
            dayPlan[mealType].forEach((food) => {
                t.calories += food.calories;
                t.protein += food.protein;
                t.carbs += food.carbs;
                t.fat += food.fat;
            });
        });
    });

    // Divide by 7 to get daily average
    return {
        calories: t.calories / 7,
        protein: t.protein / 7,
        carbs: t.carbs / 7,
        fat: t.fat / 7
    };
  }, [dietPlan]);

  if (!isOpen) return null;

  const handleClose = () => {
    onClose();
  };

  const handleConfirmAssignment = () => {
    if (selectedClient) {
        onAssign(selectedClient);
        setStep('SUCCESS');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-white">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
                {step === 'SELECT' && 'Select Client'}
                {step === 'CONFIRM' && 'Confirm Assignment'}
                {step === 'SUCCESS' && 'Success'}
            </h2>
            {step === 'SELECT' && <p className="text-slate-500 text-sm">Who is this weekly plan for?</p>}
            {step === 'CONFIRM' && <p className="text-slate-500 text-sm">Review weekly averages before assigning.</p>}
          </div>
          <button 
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
            
            {/* STEP 1: SELECT CLIENT */}
            {step === 'SELECT' && (
                <div className="space-y-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search clients..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-700"
                            autoFocus
                        />
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    </div>

                    <div className="space-y-2">
                        {filteredClients.map(client => (
                            <div 
                                key={client.id}
                                onClick={() => setSelectedClient(client)}
                                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                                    selectedClient?.id === client.id 
                                    ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500' 
                                    : 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-sm'
                                }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold border ${selectedClient?.id === client.id ? 'bg-emerald-200 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                        {client.initials}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-slate-800">{client.name}</h4>
                                        <div className="flex items-center gap-3 text-xs text-slate-500">
                                            <span className="flex items-center gap-1"><Target size={12} /> {client.goal}</span>
                                            <span className="flex items-center gap-1"><Calendar size={12} /> Check-in: {client.lastCheckIn}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`text-xs font-medium px-2 py-1 rounded-full ${client.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                        {client.status}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* STEP 2: CONFIRMATION */}
            {step === 'CONFIRM' && selectedClient && (
                <div className="space-y-6">
                    {/* Client Card */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold border border-emerald-200">
                            {selectedClient.initials}
                        </div>
                        <div>
                            <div className="text-sm text-slate-500">Assigning to</div>
                            <h3 className="font-bold text-slate-800 text-lg">{selectedClient.name}</h3>
                        </div>
                        {initialClient && (
                            <button 
                                onClick={() => { setStep('SELECT'); setSelectedClient(null); }}
                                className="ml-auto text-xs text-emerald-600 font-bold hover:underline"
                            >
                                Change
                            </button>
                        )}
                    </div>

                    {/* Comparison Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-xl border border-slate-200">
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Avg. Daily Calories</div>
                            <div className="text-2xl font-bold text-slate-800">{Math.round(planAverages.calories)}</div>
                            <div className="text-xs text-slate-500 mt-1">Based on 7-day plan</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-200">
                             <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Client Target</div>
                             <div className="text-2xl font-bold text-slate-800">{selectedClient.targetCalories}</div>
                             <div className="text-xs text-slate-500 mt-1">Goal requirement</div>
                        </div>
                    </div>

                    {/* Variance Warning */}
                    {Math.abs(planAverages.calories - selectedClient.targetCalories) > 200 && (
                        <div className="flex items-start gap-3 p-4 bg-amber-50 text-amber-800 rounded-xl border border-amber-200">
                            <AlertCircle size={20} className="shrink-0 mt-0.5" />
                            <div className="text-sm">
                                <span className="font-bold block mb-1">Calorie Discrepancy</span>
                                This plan averages {Math.abs(Math.round(planAverages.calories - selectedClient.targetCalories))} calories {planAverages.calories > selectedClient.targetCalories ? 'over' : 'under'} the client's target per day.
                            </div>
                        </div>
                    )}

                    <div className="bg-white p-4 rounded-xl border border-slate-200">
                         <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Avg. Daily Macros</div>
                         <div className="flex justify-between text-sm">
                            <div className="text-center">
                                <div className="font-bold text-blue-600">{Math.round(planAverages.protein)}g</div>
                                <div className="text-slate-500 text-xs">Protein</div>
                            </div>
                            <div className="w-px bg-slate-100"></div>
                            <div className="text-center">
                                <div className="font-bold text-amber-500">{Math.round(planAverages.carbs)}g</div>
                                <div className="text-slate-500 text-xs">Carbs</div>
                            </div>
                            <div className="w-px bg-slate-100"></div>
                            <div className="text-center">
                                <div className="font-bold text-rose-500">{Math.round(planAverages.fat)}g</div>
                                <div className="text-slate-500 text-xs">Fat</div>
                            </div>
                         </div>
                    </div>
                </div>
            )}

            {/* STEP 3: SUCCESS */}
            {step === 'SUCCESS' && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle size={40} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">Weekly Plan Assigned!</h3>
                    <p className="text-slate-600 max-w-xs mx-auto mb-8">
                        The full 7-day diet plan has been successfully assigned to <span className="font-semibold text-emerald-600">{selectedClient?.name}</span>.
                    </p>
                </div>
            )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-white">
            {step === 'SELECT' && (
                <button 
                    onClick={() => setStep('CONFIRM')}
                    disabled={!selectedClient}
                    className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    Continue <ChevronRight size={18} />
                </button>
            )}

            {step === 'CONFIRM' && (
                 <div className="flex gap-3">
                    {!initialClient && (
                        <button 
                            onClick={() => setStep('SELECT')}
                            className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
                        >
                            Back
                        </button>
                    )}
                    <button 
                        onClick={handleConfirmAssignment}
                        className="flex-[2] py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 w-full"
                    >
                        Confirm & Assign
                    </button>
                 </div>
            )}

            {step === 'SUCCESS' && (
                <button 
                    onClick={handleClose}
                    className="w-full py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors"
                >
                    Close
                </button>
            )}
        </div>
      </div>
    </div>
  );
};