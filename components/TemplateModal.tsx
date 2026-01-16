import React, { useState, useEffect } from 'react';
import { X, Check, Activity, Zap, Droplet, Flame, Save, Plus, ArrowLeft, LayoutTemplate, FilePlus } from 'lucide-react';
import { DietTemplate } from '../data/templates';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: DietTemplate) => void;
  templates: DietTemplate[];
  onCreateTemplate: (name: string, description: string) => void;
  onStartNewDraft: () => void;
  initialView?: 'list' | 'create';
}

export const TemplateModal: React.FC<TemplateModalProps> = ({ 
  isOpen, 
  onClose, 
  onSelectTemplate, 
  templates, 
  onCreateTemplate,
  onStartNewDraft,
  initialView = 'list'
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDesc, setNewTemplateDesc] = useState('');

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsCreating(initialView === 'create');
      setNewTemplateName('');
      setNewTemplateDesc('');
    }
  }, [isOpen, initialView]);

  if (!isOpen) return null;

  const handleCancelCreation = () => {
    // If we started in create mode (from main page "Save as Template"), closing cancels the modal
    if (initialView === 'create') {
        onClose();
    } else {
        setIsCreating(false);
    }
  };

  const handleSaveCreation = () => {
    if (!newTemplateName.trim()) return;
    onCreateTemplate(newTemplateName, newTemplateDesc);
    // Switch to list view to show the new template is there
    setIsCreating(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3">
            {isCreating && initialView !== 'create' && (
                <button onClick={handleCancelCreation} className="p-1 -ml-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100">
                    <ArrowLeft size={20} />
                </button>
            )}
            <div>
                <h2 className="text-2xl font-bold text-slate-800">
                    {isCreating ? 'Save Current Plan as Template' : 'Diet Templates'}
                </h2>
                <p className="text-slate-500 text-sm">
                    {isCreating 
                        ? 'Name your current draft to save it for future use.' 
                        : 'Choose a template to start from or create a new one.'}
                </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Toolbar (Only visible when not creating) */}
        {!isCreating && (
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-end gap-3">
                 <button 
                    onClick={onStartNewDraft}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors shadow-sm"
                 >
                    <FilePlus size={18} /> Start New Draft
                 </button>
            </div>
        )}

        {/* Content Body */}
        <div className="overflow-y-auto p-6 bg-slate-50 flex-1">
          
          {isCreating ? (
             <div className="max-w-lg mx-auto bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-900 mb-2">Template Name</label>
                        <input 
                            type="text" 
                            value={newTemplateName}
                            onChange={(e) => setNewTemplateName(e.target.value)}
                            placeholder="e.g., Summer Cut 2026"
                            className="w-full px-4 py-3 bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-900 mb-2">Description</label>
                        <textarea 
                            value={newTemplateDesc}
                            onChange={(e) => setNewTemplateDesc(e.target.value)}
                            placeholder="Briefly describe who this plan is for..."
                            rows={4}
                            className="w-full px-4 py-3 bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none placeholder:text-slate-400"
                        />
                    </div>

                    <div className="flex gap-4 pt-2">
                        <button 
                            onClick={handleCancelCreation}
                            className="flex-1 py-3 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleSaveCreation}
                            disabled={!newTemplateName.trim()}
                            className="flex-1 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <Save size={18} />
                            Save Template
                        </button>
                    </div>
                </div>
             </div>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template) => (
                  <div key={template.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all flex flex-col h-full group">
                    <div className="p-5 flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-bold text-slate-800 group-hover:text-emerald-700 transition-colors line-clamp-1">{template.name}</h3>
                        <div className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2 py-1 rounded-lg border border-emerald-100 whitespace-nowrap">
                            {Math.round(template.totalCalories)} kcal
                        </div>
                      </div>
                      
                      <p className="text-slate-500 text-sm mb-4 line-clamp-3 min-h-[3rem]">{template.description}</p>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        {template.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                {tag}
                            </span>
                        ))}
                      </div>

                      {/* Macro Preview */}
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        <div className="text-center p-2 bg-blue-50 rounded-lg border border-blue-100">
                            <Zap size={14} className="mx-auto text-blue-500 mb-1" />
                            <div className="text-xs font-bold text-slate-700">{Math.round(template.macros.p)}g</div>
                        </div>
                        <div className="text-center p-2 bg-amber-50 rounded-lg border border-amber-100">
                            <Droplet size={14} className="mx-auto text-amber-500 mb-1" />
                            <div className="text-xs font-bold text-slate-700">{Math.round(template.macros.c)}g</div>
                        </div>
                        <div className="text-center p-2 bg-rose-50 rounded-lg border border-rose-100">
                            <Flame size={14} className="mx-auto text-rose-500 mb-1" />
                            <div className="text-xs font-bold text-slate-700">{Math.round(template.macros.f)}g</div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border-t border-slate-100 bg-slate-50/50 rounded-b-xl">
                      <button 
                        onClick={() => onSelectTemplate(template)}
                        className="w-full py-2.5 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all shadow-sm flex items-center justify-center gap-2"
                      >
                        <LayoutTemplate size={16} /> Import Plan
                      </button>
                    </div>
                  </div>
                ))}
             </div>
          )}
        </div>
      </div>
    </div>
  );
};