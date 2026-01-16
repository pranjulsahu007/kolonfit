import React, { useState } from 'react';
import { MealType, DietPlan, FoodItem, DailyTargets, WeeklyDietPlan, DayOfWeek, DAYS_OF_WEEK, Client } from './types';
import { FoodSearch } from './components/FoodSearch';
import { MealSection } from './components/MealSection';
import { NutritionSidebar } from './components/NutritionSidebar';
import { TemplateModal } from './components/TemplateModal';
import { ClientAssignmentModal } from './components/ClientAssignmentModal';
import { EditFoodModal } from './components/EditFoodModal';
import { ClientMobileApp } from './components/ClientMobileApp';
import { ClientsView } from './components/ClientsView';
import { Logo } from './components/Logo';
import { DietTemplate, SAMPLE_TEMPLATES } from './data/templates';
import { MOCK_CLIENTS } from './data/clients';
import { LayoutTemplate, Send, Save, Smartphone, User } from 'lucide-react';

// Helper for deep copy to ensure fresh state
const createEmptyDailyPlan = (): DietPlan => ({
  [MealType.EARLY_MORNING]: [],
  [MealType.BREAKFAST]: [],
  [MealType.MID_DAY_SNACK]: [],
  [MealType.LUNCH]: [],
  [MealType.PRE_WORKOUT]: [],
  [MealType.POST_WORKOUT]: [],
  [MealType.LATE_EVENING_SNACK]: [],
  [MealType.DINNER]: [],
  [MealType.LATE_EVENING]: [],
});

const createEmptyWeeklyPlan = (): WeeklyDietPlan => ({
  Monday: createEmptyDailyPlan(),
  Tuesday: createEmptyDailyPlan(),
  Wednesday: createEmptyDailyPlan(),
  Thursday: createEmptyDailyPlan(),
  Friday: createEmptyDailyPlan(),
  Saturday: createEmptyDailyPlan(),
  Sunday: createEmptyDailyPlan(),
});

const initialWeeklyPlan = createEmptyWeeklyPlan();

const defaultTargets: DailyTargets = {
  calories: 2200,
  protein: 160,
  carbs: 220,
  fat: 75,
};

type View = 'planner' | 'clients' | 'mobile';

const App: React.FC = () => {
  // Set default view to 'clients'
  const [currentView, setCurrentView] = useState<View>('clients');
  
  // State for Data
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyDietPlan>(initialWeeklyPlan);
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
  const [templates, setTemplates] = useState<DietTemplate[]>(SAMPLE_TEMPLATES);
  
  // Track which client we are currently editing the plan for
  const [activeClient, setActiveClient] = useState<Client | null>(null);

  // Planner UI State
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Monday');
  const [activeMeal, setActiveMeal] = useState<MealType>(MealType.BREAKFAST);
  
  // Modals UI State
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [templateModalView, setTemplateModalView] = useState<'list' | 'create'>('list');
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<{food: FoodItem, meal: MealType} | null>(null);

  // --- ACTIONS ---

  const handleAddFood = (food: FoodItem, meal: MealType) => {
    setWeeklyPlan((prev) => ({
      ...prev,
      [selectedDay]: {
        ...prev[selectedDay],
        [meal]: [...prev[selectedDay][meal], food],
      }
    }));
  };

  const handleRemoveFood = (foodId: string, meal: MealType) => {
    setWeeklyPlan((prev) => ({
      ...prev,
      [selectedDay]: {
        ...prev[selectedDay],
        [meal]: prev[selectedDay][meal].filter((f) => f.id !== foodId),
      }
    }));
  };

  const handleEditFood = (food: FoodItem, meal: MealType) => {
    setEditingFood({ food, meal });
  };

  const handleUpdateFood = (updatedFood: FoodItem) => {
    if (!editingFood) return;
    setWeeklyPlan((prev) => ({
        ...prev,
        [selectedDay]: {
            ...prev[selectedDay],
            [editingFood.meal]: prev[selectedDay][editingFood.meal].map((f) => 
                f.id === updatedFood.id ? updatedFood : f
            ),
        }
    }));
    setEditingFood(null);
  };

  // --- TEMPLATE ACTIONS ---
  const handleLoadTemplate = (template: DietTemplate) => {
    setWeeklyPlan(JSON.parse(JSON.stringify(template.weeklyPlan)));
    setIsTemplateModalOpen(false);
    setCurrentView('planner');
  };

  const handleStartNewDraft = () => {
    setWeeklyPlan(createEmptyWeeklyPlan());
    setActiveClient(null); // Clear active client for new draft
    setIsTemplateModalOpen(false);
    setCurrentView('planner');
    setSelectedDay('Monday');
  };

  const handleCreateTemplate = (name: string, description: string) => {
    let totalCals = 0;
    let totalP = 0;
    let totalC = 0;
    let totalF = 0;

    DAYS_OF_WEEK.forEach(day => {
        Object.values(MealType).forEach(meal => {
            weeklyPlan[day][meal].forEach(food => {
                totalCals += food.calories;
                totalP += food.protein;
                totalC += food.carbs;
                totalF += food.fat;
            });
        });
    });

    const avgCals = Math.round(totalCals / 7);
    const avgP = Math.round(totalP / 7);
    const avgC = Math.round(totalC / 7);
    const avgF = Math.round(totalF / 7);

    const newTemplate: DietTemplate = {
        id: crypto.randomUUID(),
        name,
        description,
        tags: ['Custom', `${avgCals} kcal`],
        totalCalories: avgCals,
        macros: { p: avgP, c: avgC, f: avgF },
        weeklyPlan: JSON.parse(JSON.stringify(weeklyPlan))
    };

    setTemplates(prev => [newTemplate, ...prev]);
  };

  const handleOpenImport = () => {
      setTemplateModalView('list');
      setIsTemplateModalOpen(true);
  };

  const handleSavePlan = () => {
      setTemplateModalView('create');
      setIsTemplateModalOpen(true);
  };

  // --- ASSIGNMENT & UPDATE ACTIONS ---
  
  const handleAssignPlanToClient = (targetClient: Client) => {
    // Create the updated client object with the current plan
    const updatedClient: Client = {
        ...targetClient,
        status: 'Active',
        lastCheckIn: 'Just now',
        currentPlan: JSON.parse(JSON.stringify(weeklyPlan)) // Deep copy to persist snapshot
    };

    setClients(prevClients => prevClients.map(c => 
        c.id === targetClient.id ? updatedClient : c
    ));

    // If we are currently editing for this client, update the reference
    if (activeClient && activeClient.id === targetClient.id) {
        setActiveClient(updatedClient);
    }
  };

  // Called from ClientMobileApp when user updates their profile/assessment
  const handleUpdateClient = (updatedClient: Client) => {
    setClients(prevClients => prevClients.map(c => 
        c.id === updatedClient.id ? updatedClient : c
    ));
    if (activeClient && activeClient.id === updatedClient.id) {
        setActiveClient(updatedClient);
    }
  };

  const handleNavigateFromClientsToPlan = (client: Client) => {
    // Set this client as active so the Planner knows who we are editing for
    setActiveClient(client);

    // Load their existing plan or a fresh one
    if (client.currentPlan) {
        setWeeklyPlan(JSON.parse(JSON.stringify(client.currentPlan)));
    } else {
        setWeeklyPlan(createEmptyWeeklyPlan());
    }
    setCurrentView('planner');
  };

  const handleBackToClients = () => {
    setCurrentView('clients');
    setActiveClient(null);
  };

  // --- VIEW RENDERING ---

  if (currentView === 'mobile') {
      return (
        <ClientMobileApp 
            weeklyPlan={weeklyPlan} 
            clients={clients} 
            onExit={() => setCurrentView('clients')} 
            onUpdateClient={handleUpdateClient}
        />
      );
  }

  const renderPlanner = () => {
    const currentDietPlan = weeklyPlan[selectedDay];

    return (
      <div className="animate-in fade-in duration-300">
         {/* Page Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Diet Plan Editor</h1>
                <p className="text-slate-500">
                    {activeClient 
                        ? <span>Drafting plan for <span className="text-emerald-600 font-bold">{activeClient.name}</span></span> 
                        : <span>Drafting a new plan • <span className="text-slate-400">Unassigned</span></span>
                    }
                </p>
            </div>
            <div className="flex gap-3">
                <button 
                    id="save-btn"
                    onClick={handleSavePlan}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 font-medium hover:bg-slate-50 transition-colors flex items-center gap-2 min-w-[100px] justify-center"
                >
                    <Save size={16} /> Save Template
                </button>
                <button 
                    onClick={handleOpenImport}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 font-medium hover:bg-slate-50 transition-colors flex items-center gap-2"
                >
                    <LayoutTemplate size={16} /> Import
                </button>
                <button 
                    onClick={() => setIsAssignmentModalOpen(true)}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200 flex items-center gap-2"
                >
                    <Send size={16} /> {activeClient ? 'Assign to Client' : 'Assign to...'}
                </button>
            </div>
        </div>

        {/* Day Selector */}
        <div className="bg-white rounded-xl border border-slate-200 mb-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between p-1">
            <div className="flex overflow-x-auto no-scrollbar w-full">
                {DAYS_OF_WEEK.map((day) => (
                    <button
                        key={day}
                        onClick={() => setSelectedDay(day)}
                        className={`flex-1 px-5 py-3 text-sm font-semibold whitespace-nowrap transition-all rounded-lg ${
                            selectedDay === day 
                            ? 'bg-emerald-50 text-emerald-700 shadow-sm' 
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                        {day}
                    </button>
                ))}
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
                <FoodSearch onAddFood={handleAddFood} selectedMeal={activeMeal} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.values(MealType).map((mealType) => (
                         <MealSection 
                            key={mealType}
                            mealType={mealType}
                            foods={currentDietPlan[mealType]}
                            onRemoveFood={handleRemoveFood}
                            onEditFood={handleEditFood}
                            onSelectForAdd={setActiveMeal}
                            isActive={activeMeal === mealType}
                        />
                    ))}
                </div>
            </div>
            <div className="lg:col-span-4">
                <NutritionSidebar dietPlan={currentDietPlan} targets={defaultTargets} />
            </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      
      {/* Navigation Header */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div 
                className="flex items-center gap-2 cursor-pointer" 
                onClick={() => setCurrentView('clients')}
            >
                <div className="flex items-center gap-2 px-2 py-1">
                    <Logo />
                </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1 bg-slate-50 p-1 rounded-lg">
                <button 
                    onClick={() => setCurrentView('clients')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${currentView === 'clients' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                    Clients
                </button>
                <button 
                    onClick={() => setCurrentView('planner')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${currentView === 'planner' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                    Planner
                </button>
            </div>

            <div className="flex items-center gap-4">
                <div className="h-6 w-px bg-slate-200 hidden md:block"></div>
                <button 
                  onClick={() => setCurrentView('mobile')}
                  className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium"
                >
                    <Smartphone size={16} /> Client App View
                </button>
                <button className="h-9 w-9 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors">
                    <User size={18} />
                </button>
            </div>
        </div>
      </nav>

      {/* Main Content Router */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'planner' && renderPlanner()}
        {currentView === 'clients' && <ClientsView clients={clients} onAssignPlan={handleNavigateFromClientsToPlan} />}
      </main>

      {/* Global Modals */}
      <TemplateModal 
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        templates={templates}
        onSelectTemplate={handleLoadTemplate}
        onCreateTemplate={handleCreateTemplate}
        onStartNewDraft={handleStartNewDraft}
        initialView={templateModalView}
      />
      
      <ClientAssignmentModal 
        isOpen={isAssignmentModalOpen} 
        onClose={() => setIsAssignmentModalOpen(false)}
        dietPlan={weeklyPlan}
        onAssign={handleAssignPlanToClient}
        clients={clients}
        initialClient={activeClient}
      />

      <EditFoodModal
        isOpen={!!editingFood}
        onClose={() => setEditingFood(null)}
        food={editingFood?.food || null}
        onUpdate={handleUpdateFood}
      />

    </div>
  );
};

export default App;