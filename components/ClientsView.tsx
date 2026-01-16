import React, { useState } from 'react';
import { Search, Filter, MoreHorizontal, Target, Calendar, Plus, X } from 'lucide-react';
import { Client } from '../types';

interface ClientsViewProps {
  clients: Client[];
  onAssignPlan: (client: Client) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({ clients, onAssignPlan }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tooltipClient, setTooltipClient] = useState<string | null>(null);

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper to check if a client is currently in cycle based on today's date
  const isClientInPeriod = (client: Client) => {
    if (client.gender !== 'Female' || !client.menstrualData) return false;
    
    // Hardcoded "Today" for consistency with the mock app date (Jan 14, 2026)
    // In a real app, use new Date()
    const today = new Date('2026-01-14'); 
    
    const lastStart = new Date(client.menstrualData.lastPeriodStartDate);
    const diffTime = Math.abs(today.getTime() - lastStart.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

    // Note: diffDays is 1-based index roughly (0 diff is same day). 
    // If started Jan 12, today Jan 14. diff is 2 days. 
    // If duration is 5, they are on day 3. So yes, in period.
    return diffDays >= 0 && diffDays < client.menstrualData.periodDuration;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clients</h1>
          <p className="text-slate-500">Manage your active roster and check-ins.</p>
        </div>
        <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 font-medium hover:bg-slate-50 transition-colors flex items-center gap-2">
                <Filter size={18} /> Filter
            </button>
            <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-2">
                <Plus size={18} /> Add Client
            </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <input 
            type="text" 
            placeholder="Search clients by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
        />
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map(client => (
            <div key={client.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all group relative">
                <div className="absolute top-4 right-4">
                    <button className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100">
                        <MoreHorizontal size={20} />
                    </button>
                </div>
                
                <div className="flex items-center gap-4 mb-4">
                    <div className="relative">
                        <div className="h-14 w-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl font-bold border-2 border-white shadow-sm ring-2 ring-emerald-50">
                            {client.initials}
                        </div>
                        {/* Period Indicator */}
                        {isClientInPeriod(client) && (
                            <div className="relative">
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setTooltipClient(tooltipClient === client.id ? null : client.id);
                                    }}
                                    className="absolute -bottom-1 -right-1 h-5 w-5 bg-pink-500 border-2 border-white rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform z-10" 
                                    title="Currently in cycle"
                                >
                                    <div className="h-2 w-2 bg-white rounded-full animate-pulse"></div>
                                </button>
                                
                                {/* Tooltip Popup */}
                                {tooltipClient === client.id && client.menstrualData && (
                                    <div 
                                        onClick={(e) => e.stopPropagation()} 
                                        className="absolute top-8 left-1/2 -translate-x-1/2 bg-white p-4 rounded-xl shadow-xl border border-pink-100 w-64 z-50 text-left animate-in zoom-in-95 duration-200"
                                    >
                                        {/* Arrow */}
                                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-t border-l border-pink-100 rotate-45"></div>
                                        
                                        <div className="relative z-10">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-bold text-slate-800 text-sm">Period Details</h4>
                                                <button onClick={(e) => { e.stopPropagation(); setTooltipClient(null); }} className="text-slate-400 hover:text-slate-600"><X size={14}/></button>
                                            </div>
                                            <div className="space-y-2 text-xs">
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Started:</span>
                                                    <span className="font-medium text-slate-700">{client.menstrualData.lastPeriodStartDate}</span>
                                                </div>
                                                 <div className="flex justify-between">
                                                    <span className="text-slate-500">Cycle Length:</span>
                                                    <span className="font-medium text-slate-700">{client.menstrualData.cycleLength} days</span>
                                                </div>
                                                 <div className="flex justify-between">
                                                    <span className="text-slate-500">Duration:</span>
                                                    <span className="font-medium text-slate-700">{client.menstrualData.periodDuration} days</span>
                                                </div>
                                                {client.menstrualData.symptoms.length > 0 && (
                                                    <div className="pt-1 border-t border-pink-50 mt-1">
                                                        <span className="text-slate-500 block mb-1">Symptoms:</span>
                                                        <div className="flex flex-wrap gap-1">
                                                            {client.menstrualData.symptoms.map(s => (
                                                                <span key={s} className="px-1.5 py-0.5 bg-pink-50 text-pink-600 rounded text-[10px] font-medium">{s}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 text-lg">{client.name}</h3>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide ${
                            client.status === 'Active' ? 'bg-green-100 text-green-700' :
                            client.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                            'bg-slate-100 text-slate-500'
                        }`}>
                            {client.status}
                        </span>
                    </div>
                </div>

                <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                        <Target size={16} className="text-slate-400" />
                        <span>Goal: <span className="font-medium text-slate-900">{client.goal}</span></span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                        <Calendar size={16} className="text-slate-400" />
                        <span>Last active: <span className="font-medium text-slate-900">{client.lastCheckIn}</span></span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                        <div className="w-4 flex justify-center text-slate-400 font-bold text-xs">Cal</div>
                        <span>Target: <span className="font-medium text-slate-900">{client.targetCalories} kcal</span></span>
                    </div>
                </div>

                <div className="flex gap-2 border-t border-slate-100 pt-4">
                     <button className="flex-1 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200">
                        View Profile
                     </button>
                     <button 
                        onClick={() => onAssignPlan(client)}
                        className="flex-1 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
                     >
                        Assign Plan
                     </button>
                </div>
            </div>
        ))}
        {filteredClients.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500">
                No clients found matching "{searchTerm}"
            </div>
        )}
      </div>
    </div>
  );
};