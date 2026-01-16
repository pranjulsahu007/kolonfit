import React from 'react';
import { SAMPLE_TEMPLATES, DietTemplate } from '../data/templates';
import { Zap, Droplet, Flame, LayoutTemplate, Plus, Search } from 'lucide-react';

interface TemplatesViewProps {
  onUseTemplate: (template: DietTemplate) => void;
}

export const TemplatesView: React.FC<TemplatesViewProps> = ({ onUseTemplate }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Diet Templates</h1>
          <p className="text-slate-500">Library of pre-built nutrition plans.</p>
        </div>
        <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-2">
            <Plus size={18} /> New Template
        </button>
      </div>

       {/* Search Bar */}
       <div className="relative mb-6">
        <input 
            type="text" 
            placeholder="Search templates..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
        />
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SAMPLE_TEMPLATES.map((template) => (
              <div key={template.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all flex flex-col h-full group">
                <div className="p-5 flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">{template.name}</h3>
                    <div className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2 py-1 rounded-lg border border-emerald-100">
                        {template.totalCalories} kcal
                    </div>
                  </div>
                  
                  <p className="text-slate-500 text-sm mb-4 line-clamp-3">{template.description}</p>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {template.tags.map(tag => (
                        <span key={tag} className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                            {tag}
                        </span>
                    ))}
                  </div>

                  {/* Macro Preview */}
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <div className="text-center p-2 bg-blue-50 rounded-lg border border-blue-100">
                        <Zap size={14} className="mx-auto text-blue-500 mb-1" />
                        <div className="text-xs font-bold text-slate-700">{template.macros.p}g</div>
                    </div>
                    <div className="text-center p-2 bg-amber-50 rounded-lg border border-amber-100">
                        <Droplet size={14} className="mx-auto text-amber-500 mb-1" />
                        <div className="text-xs font-bold text-slate-700">{template.macros.c}g</div>
                    </div>
                    <div className="text-center p-2 bg-rose-50 rounded-lg border border-rose-100">
                        <Flame size={14} className="mx-auto text-rose-500 mb-1" />
                        <div className="text-xs font-bold text-slate-700">{template.macros.f}g</div>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50/50 rounded-b-xl">
                  <button 
                    onClick={() => onUseTemplate(template)}
                    className="w-full py-2.5 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <LayoutTemplate size={16} /> Use This Template
                  </button>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
};