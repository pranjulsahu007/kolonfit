import React from 'react';
import { Users, FileText, Activity, Plus, ArrowRight, TrendingUp } from 'lucide-react';
import { Client } from '../types';

interface DashboardProps {
  onNavigate: (view: 'dashboard' | 'planner' | 'clients' | 'templates' | 'mobile') => void;
  clients: Client[];
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, clients }) => {
  const activeClients = clients.filter(c => c.status === 'Active').length;
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Welcome back, Coach</h1>
        <p className="text-slate-500 mt-1">Here's what's happening with your clients today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group cursor-pointer" onClick={() => onNavigate('clients')}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Users size={24} />
            </div>
            <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">+2 this week</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">{activeClients}</div>
          <div className="text-sm text-slate-500 mt-1">Active Clients</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => onNavigate('templates')}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
              <FileText size={24} />
            </div>
            <span className="text-sm font-medium text-slate-500">Drafts saved</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">7</div>
          <div className="text-sm text-slate-500 mt-1">Diet Plans</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
              <Activity size={24} />
            </div>
             <span className="text-sm font-medium text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full">High</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">89%</div>
          <div className="text-sm text-slate-500 mt-1">Client Adherence</div>
        </div>
      </div>

      {/* Main Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => onNavigate('planner')}
              className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
            >
              <div className="h-12 w-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm">
                <Plus size={24} />
              </div>
              <span className="font-semibold text-slate-700 group-hover:text-emerald-700">Create New Plan</span>
            </button>
            <button 
              onClick={() => onNavigate('clients')}
              className="flex flex-col items-center justify-center p-6 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
            >
              <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm">
                <Users size={24} />
              </div>
              <span className="font-semibold text-slate-700 group-hover:text-blue-700">Manage Clients</span>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>
            <button className="text-sm text-emerald-600 font-medium hover:underline flex items-center gap-1">
                View All <ArrowRight size={14} />
            </button>
          </div>
          <div className="space-y-4">
            {[
              { text: 'Assigned diet plan to John Doe', time: '2 hours ago', icon: <FileText size={14} />, color: 'bg-emerald-100 text-emerald-600' },
              { text: 'Sarah Smith completed weekly check-in', time: '5 hours ago', icon: <Activity size={14} />, color: 'bg-blue-100 text-blue-600' },
              { text: 'New client registration: Mike Ross', time: 'Yesterday', icon: <Users size={14} />, color: 'bg-purple-100 text-purple-600' },
              { text: 'Updated "Rapid Fat Loss" template', time: '2 days ago', icon: <TrendingUp size={14} />, color: 'bg-orange-100 text-orange-600' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 pb-3 border-b border-slate-50 last:border-0 last:pb-0 hover:bg-slate-50 p-2 rounded-lg transition-colors -mx-2">
                <div className={`mt-1 p-2 rounded-full ${item.color}`}>
                  {item.icon}
                </div>
                <div>
                  <p className="text-sm text-slate-700 font-medium">{item.text}</p>
                  <p className="text-xs text-slate-400">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};