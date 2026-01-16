import React from 'react';
import { X, User, Calendar, Target, AlertCircle } from 'lucide-react';
import { MOCK_CLIENTS } from '../data/clients';

interface ClientsListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClientsListModal: React.FC<ClientsListModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-white">
          <div>
            <h2 className="text-xl font-bold text-slate-800">My Clients</h2>
            <p className="text-slate-500 text-sm">Manage your active roster.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
            <div className="grid gap-3">
                {MOCK_CLIENTS.map(client => (
                    <div 
                        key={client.id}
                        className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between hover:shadow-md transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-lg font-bold border border-emerald-200">
                                {client.initials}
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 text-lg group-hover:text-emerald-700 transition-colors">{client.name}</h4>
                                <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                                    <span className="flex items-center gap-1"><Target size={12} /> {client.goal}</span>
                                    <span className="flex items-center gap-1"><Calendar size={12} /> Last active: {client.lastCheckIn}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                            <div className="text-right hidden sm:block">
                                <div className="text-xs text-slate-400 mb-1">Target</div>
                                <div className="font-bold text-slate-700">{client.targetCalories} kcal</div>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                client.status === 'Active' ? 'bg-green-100 text-green-700' :
                                client.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                                'bg-slate-100 text-slate-500'
                            }`}>
                                {client.status}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="mt-8 flex items-center justify-center gap-2 text-slate-400 text-sm">
                <AlertCircle size={16} />
                <span>Showing all {MOCK_CLIENTS.length} clients</span>
            </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-white flex justify-end">
            <button 
                onClick={onClose}
                className="px-6 py-2 bg-slate-100 text-slate-600 font-semibold rounded-lg hover:bg-slate-200 transition-colors"
            >
                Close
            </button>
        </div>
      </div>
    </div>
  );
};