import React, { useState, useMemo } from 'react';
import { WeeklyDietPlan, MealType, DAYS_OF_WEEK, FoodItem, Client, DietPlan } from '../types';
import { 
  Home, Calendar, User, Dumbbell, MessageSquare, Apple, Bell,
  ChevronLeft, ChevronRight, CheckCircle2, Circle, RefreshCw, 
  Utensils, Flame, Footprints, Moon, Check, LogIn, Activity,
  Settings, Camera, Edit3, ArrowUp, Plus, Search, X
} from 'lucide-react';
import { Logo } from './Logo';

interface ClientMobileAppProps {
  weeklyPlan: WeeklyDietPlan;
  clients: Client[];
  onExit: () => void;
  onUpdateClient: (client: Client) => void;
}

type AppView = 'profile-select' | 'home' | 'nutrition' | 'workout' | 'chat' | 'profile' | 'assessment' | 'cycle-tracking';

// Helper for empty plan if needed
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

export const ClientMobileApp: React.FC<ClientMobileAppProps> = ({ weeklyPlan: draftPlan, clients, onExit, onUpdateClient }) => {
  const [currentView, setCurrentView] = useState<AppView>('profile-select');
  const [currentDayIndex, setCurrentDayIndex] = useState(2); // Default to Wednesday for demo
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  
  // Modal States
  const [isCycleUpdateOpen, setIsCycleUpdateOpen] = useState(false);
  const [isSymptomLogOpen, setIsSymptomLogOpen] = useState(false);
  const [loggingSymptoms, setLoggingSymptoms] = useState<string[]>([]);
  
  // Tracking State: Record<"Day-Meal-FoodId", boolean>
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  // Assessment Form State
  const [assessmentGender, setAssessmentGender] = useState<'Male'|'Female'|'Prefer not to say'>('Male');
  const [periodDate, setPeriodDate] = useState('2026-01-12');
  const [cycleLength, setCycleLength] = useState('28');
  const [periodDuration, setPeriodDuration] = useState('5');
  const [isRegular, setIsRegular] = useState(true);
  const [symptoms, setSymptoms] = useState<string[]>([]);

  // Derive plan based on selection
  const activePlan: WeeklyDietPlan = useMemo(() => {
    if (selectedClient) {
        return selectedClient.currentPlan || createEmptyWeeklyPlan();
    }
    return draftPlan; // Fallback to draft if "Preview" is selected
  }, [selectedClient, draftPlan]);

  const currentDay = DAYS_OF_WEEK[currentDayIndex];
  const todaysPlan = activePlan[currentDay];

  // --- ACTIONS ---
  const toggleFoodItem = (meal: string, foodId: string) => {
    const key = `${currentDay}-${meal}-${foodId}`;
    setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Centralized function to reset/sync form with client data
  const syncFormWithClient = (client: Client | null) => {
    if (!client) return;

    // 1. Sync Gender
    setAssessmentGender(client.gender || 'Male');

    // 2. Sync Menstrual Data or Reset Defaults
    if (client.menstrualData) {
        setPeriodDate(client.menstrualData.lastPeriodStartDate);
        setCycleLength(client.menstrualData.cycleLength.toString());
        setPeriodDuration(client.menstrualData.periodDuration.toString());
        setIsRegular(client.menstrualData.isRegular);
        setSymptoms(client.menstrualData.symptoms);
    } else {
        // Important: Reset to defaults so previous client's data doesn't leak
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        
        setPeriodDate(`${yyyy}-${mm}-${dd}`);
        setCycleLength('28');
        setPeriodDuration('5');
        setIsRegular(true);
        setSymptoms([]);
    }
  };

  const handleSelectClient = (client: Client) => {
      setSelectedClient(client);
      syncFormWithClient(client);
      setCurrentView('home');
  };

  const handlePreviewDraft = () => {
      setSelectedClient(null);
      setCurrentView('home');
  };

  const toggleSymptom = (sym: string) => {
      if (symptoms.includes(sym)) {
          setSymptoms(prev => prev.filter(s => s !== sym));
      } else {
          setSymptoms(prev => [...prev, sym]);
      }
  };

  const handleSaveAssessment = () => {
    if (!selectedClient) return;

    let menstrualData = undefined;
    if (assessmentGender === 'Female') {
        menstrualData = {
            lastPeriodStartDate: periodDate,
            cycleLength: parseInt(cycleLength) || 28,
            periodDuration: parseInt(periodDuration) || 5,
            isRegular: isRegular,
            symptoms: symptoms
        };
    }

    const updatedClient: Client = {
        ...selectedClient,
        gender: assessmentGender,
        menstrualData: menstrualData
    };
    
    // Update local state
    setSelectedClient(updatedClient);
    
    // Update parent state (Global Sync)
    onUpdateClient(updatedClient);
    
    // Navigate
    setCurrentView('profile');
  };

  const handleQuickPeriodUpdate = (type: 'today' | 'yesterday') => {
      if (!selectedClient || !selectedClient.menstrualData) return;
      
      // Use '2026-01-14' as today reference since the app is mocking that date
      const todayMock = new Date('2026-01-14');
      const date = new Date(todayMock);
      
      if (type === 'yesterday') date.setDate(date.getDate() - 1);
      
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      
      const updatedClient: Client = {
          ...selectedClient,
          menstrualData: {
              ...selectedClient.menstrualData,
              lastPeriodStartDate: dateStr
          }
      };
      
      // Update Global State
      setSelectedClient(updatedClient);
      onUpdateClient(updatedClient);
      
      // Sync local form state so Assessment View is consistent if visited later
      setPeriodDate(dateStr);
      
      setIsCycleUpdateOpen(false);
  };

  // --- SYMPTOM LOGGING ---
  const openSymptomLog = () => {
      if (selectedClient?.menstrualData) {
          setLoggingSymptoms([...selectedClient.menstrualData.symptoms]);
      } else {
          setLoggingSymptoms([]);
      }
      setIsSymptomLogOpen(true);
  };

  const toggleLoggingSymptom = (sym: string) => {
      if (loggingSymptoms.includes(sym)) {
          setLoggingSymptoms(prev => prev.filter(s => s !== sym));
      } else {
          setLoggingSymptoms(prev => [...prev, sym]);
      }
  };

  const saveSymptoms = () => {
      if (!selectedClient || !selectedClient.menstrualData) return;
      
      const updatedClient = {
          ...selectedClient,
          menstrualData: {
              ...selectedClient.menstrualData,
              symptoms: loggingSymptoms
          }
      };
      
      setSelectedClient(updatedClient);
      onUpdateClient(updatedClient);
      setSymptoms(loggingSymptoms); // Sync the assessment form state as well
      setIsSymptomLogOpen(false);
  };

  // --- SUB-COMPONENTS ---

  const ProfileSelectView = () => (
    <div className="flex-1 overflow-y-auto no-scrollbar bg-white px-6 py-8 flex flex-col items-center">
        <div className="mb-10 mt-2">
            <Logo variant="dark" className="scale-110" />
        </div>

        <div className="w-full space-y-4 mb-8">
            {clients.map(client => (
                <button 
                    key={client.id}
                    onClick={() => handleSelectClient(client)}
                    className="w-full bg-slate-50 hover:bg-white p-4 rounded-xl flex items-center gap-4 transition-all group border border-slate-100 hover:border-emerald-500 shadow-sm hover:shadow-md"
                >
                    <div className="h-12 w-12 rounded-full bg-white text-slate-700 flex items-center justify-center font-bold border border-slate-200 group-hover:border-emerald-200 group-hover:text-emerald-600 transition-colors text-lg shadow-sm">
                        {client.initials}
                    </div>
                    <div className="text-left flex-1">
                        <div className="font-bold text-slate-800 text-lg group-hover:text-emerald-700 transition-colors">{client.name}</div>
                    </div>
                </button>
            ))}
        </div>

        <div className="mt-4 w-full pb-8">
            <button 
                onClick={handlePreviewDraft}
                className="w-full py-3 text-slate-400 font-medium hover:text-slate-600 transition-colors text-sm"
            >
                Guest Mode
            </button>
        </div>
    </div>
  );

  const AssessmentView = () => (
    <div className="flex-1 overflow-y-auto no-scrollbar bg-white pb-24 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 sticky top-0 bg-white z-10">
            <button onClick={() => setCurrentView('profile')} className="p-2 -ml-2 text-slate-400 hover:text-slate-600">
                <ChevronLeft size={24} />
            </button>
            <h2 className="text-lg font-bold text-slate-900">Fitness Assessment</h2>
            <div className="w-8"></div>
        </div>

        <div className="p-6">
             {/* Progress Bar */}
             <div className="flex gap-2 mb-8">
                <div className="h-1 flex-1 bg-emerald-500 rounded-full"></div>
                <div className="h-1 flex-1 bg-slate-100 rounded-full"></div>
                <div className="h-1 flex-1 bg-slate-100 rounded-full"></div>
             </div>
             <div className="text-center text-xs text-slate-400 font-bold uppercase tracking-wider mb-6">1 of 3 • General Information</div>

             {/* Form */}
             <div className="space-y-6">
                
                {/* Gender Selection */}
                <div>
                    <label className="block text-sm font-bold text-slate-900 mb-3">Gender *</label>
                    <div className="space-y-2">
                        {['Female', 'Male', 'Prefer not to say'].map(opt => (
                            <button 
                                key={opt}
                                onClick={() => setAssessmentGender(opt as any)}
                                className={`w-full p-4 rounded-xl border text-left font-medium transition-all ${
                                    assessmentGender === opt 
                                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-1 ring-emerald-500' 
                                    : 'bg-white border-slate-200 text-slate-600'
                                }`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Conditional Menstrual Flow */}
                {assessmentGender === 'Female' && (
                    <div className="animate-in slide-in-from-top-4 duration-300 space-y-6 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="h-2 w-2 rounded-full bg-pink-500"></div>
                            <h3 className="font-bold text-slate-800">Menstrual Cycle Details</h3>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-2">Last period start date</label>
                            <div className="relative">
                                <input 
                                    type="date" 
                                    value={periodDate}
                                    onChange={(e) => setPeriodDate(e.target.value)}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 outline-none text-slate-800 appearance-none relative z-10 bg-transparent"
                                />
                                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">Avg. Cycle (Days)</label>
                                <input 
                                    type="number" 
                                    value={cycleLength}
                                    onChange={(e) => setCycleLength(e.target.value)}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 outline-none text-slate-800"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">Duration (Days)</label>
                                <input 
                                    type="number" 
                                    value={periodDuration}
                                    onChange={(e) => setPeriodDuration(e.target.value)}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 outline-none text-slate-800"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-3">Cycle Regularity</label>
                            <div className="flex bg-slate-100 p-1 rounded-xl">
                                <button 
                                    onClick={() => setIsRegular(true)}
                                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${isRegular ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}
                                >
                                    Regular
                                </button>
                                <button 
                                    onClick={() => setIsRegular(false)}
                                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${!isRegular ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}
                                >
                                    Irregular
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-3">Common Symptoms</label>
                            <div className="flex flex-wrap gap-2">
                                {['Cramps', 'Headache', 'Bloating', 'Mood Swings', 'Fatigue', 'Acne', 'Back Pain'].map(sym => (
                                    <button 
                                        key={sym}
                                        onClick={() => toggleSymptom(sym)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                                            symptoms.includes(sym)
                                            ? 'bg-pink-50 border-pink-200 text-pink-700'
                                            : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                                        }`}
                                    >
                                        {sym}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
             </div>
        </div>

        <div className="p-6 mt-auto">
             <button 
                onClick={handleSaveAssessment}
                className="w-full py-3.5 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-colors"
             >
                Save & Continue
             </button>
        </div>
    </div>
  );

  const CycleTrackingView = () => {
    if (!selectedClient?.menstrualData) return null;

    const todayDate = new Date('2026-01-14'); // Simulated Today
    const lastStart = new Date(selectedClient.menstrualData.lastPeriodStartDate);
    const cycleLen = selectedClient.menstrualData.cycleLength;
    const periodDur = selectedClient.menstrualData.periodDuration;

    // Calculate Cycle Day
    const diffTime = Math.abs(todayDate.getTime() - lastStart.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const currentCycleDay = (diffDays % cycleLen) + 1;

    // Determine Phase
    let phase = '';
    let phaseDesc = '';
    let phaseChanges: string[] = [];
    let phaseRange = '';
    let phaseColor = 'text-purple-600';

    const ovulationDay = cycleLen - 14;
    const fertileStart = ovulationDay - 5;
    const fertileEnd = ovulationDay + 1;

    if (currentCycleDay <= periodDur) {
        phase = 'Menstrual';
        phaseDesc = 'Shedding of the uterine lining.';
        phaseChanges = ['Low Energy', 'Cramps', 'Iron Drop'];
        phaseRange = `Days 1-${periodDur}`;
        phaseColor = 'text-pink-500';
    } else if (currentCycleDay < fertileStart) {
        phase = 'Follicular';
        phaseDesc = 'Rising estrogen, improved insulin sensitivity.';
        phaseChanges = ['High Energy', 'Estrogen Rise', 'Anabolic'];
        phaseRange = `Days ${periodDur + 1}-${fertileStart - 1}`;
        phaseColor = 'text-blue-500';
    } else if (currentCycleDay <= fertileEnd) {
        phase = 'Ovulation';
        phaseDesc = 'Peak estrogen and fertility window.';
        phaseChanges = ['Peak Strength', 'High Libido', 'Confidence'];
        phaseRange = `Days ${fertileStart}-${fertileEnd}`;
        phaseColor = 'text-purple-600';
    } else {
        phase = 'Luteal';
        phaseDesc = 'Progesterone rises, body temp increases.';
        phaseChanges = ['Higher Metabolism', 'Cravings', 'Bloating'];
        phaseRange = `Days ${fertileEnd + 1}-${cycleLen}`;
        phaseColor = 'text-orange-500';
    }

    // Generate Calendar Strip
    const startOfWeek = new Date(todayDate);
    startOfWeek.setDate(todayDate.getDate() - todayDate.getDay()); // Sunday

    const calendarDays = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        
        // Calculate relative cycle day for this specific date
        const dDiff = Math.floor((d.getTime() - lastStart.getTime()) / (1000 * 60 * 60 * 24));
        const cDay = (dDiff % cycleLen) + 1;
        
        let status = 'none';
        if (cDay <= periodDur) status = 'period';
        else if (cDay >= fertileStart && cDay <= fertileEnd) status = 'fertile';

        calendarDays.push({ date: d, dayNum: d.getDate(), dayName: ['S','M','T','W','T','F','S'][d.getDay()], status, cDay });
    }

    return (
        <div className="flex-1 relative flex flex-col bg-[#FDF9FF] h-full overflow-hidden">
             {/* Header Section */}
             <div className="bg-white px-5 pt-12 pb-6 shadow-sm z-20 sticky top-0 border-b border-purple-50 shrink-0">
                <div className="flex items-center justify-between mb-4">
                    <button onClick={() => setCurrentView('home')} className="p-2 -ml-2 text-slate-400 hover:text-slate-600">
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className="text-lg font-bold text-slate-900">Cycle Tracking</h1>
                    <div className="flex gap-2">
                        <button className="p-2 text-slate-400"><Bell size={20}/></button>
                        <button className="p-2 text-slate-400"><Search size={20}/></button>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">January 2026</h2>
                        <div className="text-slate-500 text-sm font-medium mt-1">Cycle Day {currentCycleDay}</div>
                    </div>
                    <button 
                        onClick={() => setIsCycleUpdateOpen(true)}
                        className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-full shadow-sm hover:border-purple-300 hover:text-purple-600 transition-all"
                    >
                        Update Cycle
                    </button>
                </div>

                {/* Calendar Strip */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-2">
                    <div className="flex justify-between mb-4">
                        {calendarDays.map((day, idx) => (
                            <div key={idx} className="flex flex-col items-center gap-2">
                                <span className="text-xs font-bold text-slate-400">{day.dayName}</span>
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold transition-all relative ${
                                    day.dayNum === todayDate.getDate() ? 'bg-slate-900 text-white shadow-md z-10' : 
                                    day.status === 'period' ? 'bg-transparent text-pink-500' :
                                    day.status === 'fertile' ? 'bg-transparent text-[#7C5CFC]' :
                                    'text-slate-700'
                                }`}>
                                    {day.dayNum}
                                    {/* Circle Indicators */}
                                    {day.status === 'period' && day.dayNum !== todayDate.getDate() && <div className="absolute inset-0 bg-pink-100 rounded-full -z-10"></div>}
                                    {day.status === 'fertile' && day.dayNum !== todayDate.getDate() && <div className="absolute inset-0 bg-[#7C5CFC]/10 rounded-full -z-10"></div>}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center justify-center gap-6 text-xs font-medium">
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-pink-500"></div>
                            <span className="text-slate-600">Period</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#7C5CFC]"></div>
                            <span className="text-slate-600">Fertile Window</span>
                        </div>
                    </div>
                </div>
             </div>

             {/* Content */}
             <div className="flex-1 overflow-y-auto no-scrollbar p-5 pb-32">
                {/* Phase Card */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
                    <h3 className="text-base font-bold text-slate-900 mb-4">Current Phase Details</h3>
                    
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                            <ArrowUp size={20} />
                        </div>
                        <div>
                            <h4 className={`text-2xl font-bold ${phaseColor}`}>{phase}</h4>
                            <div className="text-slate-400 text-xs font-bold uppercase tracking-wide">{phaseRange}</div>
                        </div>
                    </div>

                    <div className="border-t border-slate-100 pt-4 mb-4">
                        <div className="text-sm font-bold text-slate-900 mb-1">What to Expect:</div>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            {phaseDesc}
                        </p>
                    </div>

                    <div>
                        <div className="text-sm font-bold text-slate-900 mb-3">Physiological Changes:</div>
                        <div className="flex flex-wrap gap-2">
                            {phaseChanges.map(tag => (
                                <span key={tag} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold border border-blue-100">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
             </div>

             {/* Log Symptom Button (Positioned Absolute within Relative Wrapper) */}
             <div className="absolute bottom-8 right-5 z-30">
                 <button 
                    onClick={openSymptomLog}
                    className="flex items-center gap-2 pl-4 pr-5 py-3.5 bg-[#7C5CFC] text-white rounded-full font-bold shadow-lg shadow-purple-200 hover:scale-105 transition-transform active:scale-95"
                 >
                     <Plus size={20} /> Log Symptom
                 </button>
             </div>

             {/* Verification Modal Overlay */}
             {isCycleUpdateOpen && (
                 <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200">
                     <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 duration-300">
                         <h3 className="text-lg font-bold text-slate-900 mb-2">Verify Cycle Data</h3>
                         <p className="text-slate-500 text-sm mb-6">Is the current cycle tracking accurate? If your period started, update it here.</p>
                         
                         <div className="space-y-3">
                             <button 
                                 onClick={() => handleQuickPeriodUpdate('today')}
                                 className="w-full py-3 bg-pink-500 text-white font-bold rounded-xl hover:bg-pink-600 transition-colors flex items-center justify-center gap-2"
                             >
                                 <CheckCircle2 size={18} /> Period Started Today
                             </button>
                             {/* REMOVED: Period Started Yesterday Button as requested */}
                             <button 
                                 onClick={() => {
                                     setIsCycleUpdateOpen(false);
                                     syncFormWithClient(selectedClient);
                                     setCurrentView('assessment');
                                 }}
                                 className="w-full py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                             >
                                 Edit Dates Manually
                             </button>
                         </div>
                         <button 
                             onClick={() => setIsCycleUpdateOpen(false)}
                             className="w-full mt-4 py-2 text-slate-400 font-medium text-sm hover:text-slate-600 transition-colors"
                         >
                             Cancel
                         </button>
                     </div>
                 </div>
             )}

             {/* Log Symptoms Modal Overlay */}
             {isSymptomLogOpen && (
                 <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200">
                     <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 duration-300">
                         <div className="flex items-center justify-between mb-4">
                             <h3 className="text-lg font-bold text-slate-900">Log Symptoms</h3>
                             <button onClick={() => setIsSymptomLogOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
                         </div>
                         <p className="text-slate-500 text-sm mb-6">Select all that apply for today.</p>
                         
                         <div className="flex flex-wrap gap-2 mb-8">
                            {['Cramps', 'Headache', 'Bloating', 'Mood Swings', 'Fatigue', 'Acne', 'Back Pain', 'Insomnia', 'Cravings', 'Nausea'].map(sym => (
                                <button 
                                    key={sym}
                                    onClick={() => toggleLoggingSymptom(sym)}
                                    className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                                        loggingSymptoms.includes(sym)
                                        ? 'bg-purple-100 border-purple-300 text-purple-700'
                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                    }`}
                                >
                                    {sym}
                                </button>
                            ))}
                         </div>

                         <button 
                             onClick={saveSymptoms}
                             className="w-full py-3 bg-[#7C5CFC] text-white font-bold rounded-xl hover:opacity-90 transition-colors shadow-lg shadow-purple-100"
                         >
                             Save Changes
                         </button>
                     </div>
                 </div>
             )}
        </div>
    );
  };

  const ProfileView = () => (
      <div className="flex-1 overflow-y-auto no-scrollbar bg-[#F8FAFC] pb-24">
          <div className="bg-white p-6 pb-8 rounded-b-[40px] shadow-sm border-b border-slate-100">
             <div className="flex items-center justify-between mb-4">
                 <button onClick={() => setCurrentView('home')}><ChevronLeft className="text-slate-800" /></button>
                 <h1 className="text-xl font-bold text-slate-900">Settings</h1>
                 <div className="w-6"></div>
             </div>

             <div className="flex flex-col items-center mt-6">
                 <div className="relative">
                     <div className="h-24 w-24 rounded-full bg-slate-100 border-4 border-white shadow-lg flex items-center justify-center text-3xl font-bold text-slate-400 overflow-hidden">
                        {selectedClient?.initials}
                     </div>
                     <div className="absolute bottom-0 right-0 h-8 w-8 bg-emerald-500 rounded-full flex items-center justify-center text-white border-2 border-white cursor-pointer">
                        <Camera size={14} />
                     </div>
                 </div>
                 <h2 className="mt-4 text-xl font-bold text-slate-900">{selectedClient?.name || 'Guest User'}</h2>
                 <p className="text-slate-500 text-sm">hustlerair300@gmail.com</p>
                 
                 <button className="mt-5 px-6 py-2 bg-emerald-50 text-emerald-700 font-semibold rounded-full text-sm hover:bg-emerald-100 transition-colors">
                    Edit Profile
                 </button>
             </div>
          </div>

          <div className="px-6 py-8 space-y-8">
              {/* Fitness Assessment Card */}
              <div className="space-y-3">
                  <h3 className="font-bold text-slate-900 text-lg">Fitness Assessment</h3>
                  
                  <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3">
                     <CheckCircle2 className="text-emerald-500 shrink-0" size={20} />
                     <span className="text-sm text-emerald-800 font-medium">Assessment completed on 10/1/2026</span>
                  </div>

                  <button 
                    onClick={() => {
                        // Resync form state before opening assessment view to ensure fresh data
                        syncFormWithClient(selectedClient);
                        setCurrentView('assessment');
                    }}
                    className="w-full bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all group"
                  >
                      <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                          <Edit3 size={20} />
                      </div>
                      <div className="text-left flex-1">
                          <div className="font-bold text-slate-900">Edit Assessment</div>
                          <div className="text-xs text-slate-500 mt-0.5">Update your fitness and nutrition assessment</div>
                      </div>
                      <ChevronRight className="text-slate-300 group-hover:text-slate-500" size={20} />
                  </button>
              </div>

              {/* Subscription Card */}
              <div className="space-y-3">
                  <h3 className="font-bold text-slate-900 text-lg">My Subscription</h3>
                  
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                      <div className="flex items-start gap-4 mb-4">
                          <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                             <Activity size={20} />
                          </div>
                          <div>
                              <div className="font-bold text-slate-900">Personal Coaching Plan - 1 Month</div>
                              <div className="text-xs font-bold text-emerald-600 mt-1">13 days remaining</div>
                          </div>
                      </div>
                      
                      <div className="bg-slate-50 rounded-xl p-3">
                          <div className="text-xs text-slate-500 mb-1">Expires on:</div>
                          <div className="text-sm font-bold text-slate-900">January 29, 2026</div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
  );

  const BottomNav = () => (
    <div className="absolute bottom-6 left-6 right-6 h-16 bg-white rounded-full shadow-2xl flex items-center justify-between px-6 z-30 border border-slate-100">
      <button onClick={() => setCurrentView('home')} className={`p-2 transition-all ${currentView === 'home' ? 'bg-emerald-100 text-emerald-600 rounded-full' : 'text-slate-400'}`}>
        <Home size={24} fill={currentView === 'home' ? "currentColor" : "none"} />
      </button>
      <button onClick={() => setCurrentView('chat')} className={`p-2 transition-all ${currentView === 'chat' ? 'bg-emerald-100 text-emerald-600 rounded-full' : 'text-slate-400'}`}>
        <MessageSquare size={24} />
      </button>
      <button onClick={() => setCurrentView('workout')} className={`p-2 transition-all ${currentView === 'workout' ? 'bg-emerald-100 text-emerald-600 rounded-full' : 'text-slate-400'}`}>
        <Dumbbell size={24} />
      </button>
      <button onClick={() => setCurrentView('nutrition')} className={`p-2 transition-all ${currentView === 'nutrition' ? 'bg-emerald-100 text-emerald-600 rounded-full' : 'text-slate-400'}`}>
        <Apple size={24} />
      </button>
      <button onClick={() => setCurrentView('profile')} className={`p-2 transition-all ${currentView === 'profile' || currentView === 'assessment' ? 'bg-emerald-100 text-emerald-600 rounded-full' : 'text-slate-400'}`}>
        <User size={24} />
      </button>
    </div>
  );

  const HomeView = () => {
    // Basic cycle calculation for the home tile
    let cycleSummary = null;
    if (selectedClient?.menstrualData) {
        const todayDate = new Date('2026-01-14');
        const lastStart = new Date(selectedClient.menstrualData.lastPeriodStartDate);
        const diffDays = Math.floor(Math.abs(todayDate.getTime() - lastStart.getTime()) / (1000 * 60 * 60 * 24));
        const currentDay = (diffDays % selectedClient.menstrualData.cycleLength) + 1;
        
        // Determine phase name for tile
        let phaseName = 'Luteal';
        const fertileStart = selectedClient.menstrualData.cycleLength - 19; // Rough calc
        const fertileEnd = selectedClient.menstrualData.cycleLength - 13;

        if (currentDay <= selectedClient.menstrualData.periodDuration) phaseName = 'Menstrual';
        else if (currentDay < fertileStart) phaseName = 'Follicular';
        else if (currentDay <= fertileEnd) phaseName = 'Ovulation';
        
        cycleSummary = { day: currentDay, phase: phaseName };
    }

    return (
    <div className="flex-1 overflow-y-auto no-scrollbar bg-[#F8FAFC] p-5 pb-24">
       {/* Header */}
       <div className="flex items-center justify-between mb-6 pt-2">
          <div>
             <h1 className="text-slate-500 font-medium">Hello {selectedClient ? selectedClient.name.split(' ')[0] : 'Guest'},</h1>
             <h2 className="text-2xl font-bold text-slate-900">January 14, 2026</h2>
          </div>
          <div className="flex gap-3">
             <button className="h-10 w-10 bg-white rounded-full flex items-center justify-center border border-slate-100 shadow-sm text-slate-700">
                <Bell size={20} />
             </button>
             <button className="h-10 w-10 bg-white rounded-full flex items-center justify-center border border-slate-100 shadow-sm text-slate-700">
                <Calendar size={20} />
             </button>
          </div>
       </div>

       {/* Date Pills */}
       <div className="flex gap-3 mb-8 overflow-x-auto no-scrollbar">
          <button className="px-6 py-2 bg-emerald-500 text-white rounded-full text-sm font-semibold shadow-lg shadow-emerald-200 whitespace-nowrap">
             Today
          </button>
          <button className="px-6 py-2 bg-white text-slate-700 border border-slate-200 rounded-full text-sm font-semibold whitespace-nowrap">
             Last Week
          </button>
          <button className="px-6 py-2 bg-white text-slate-700 border border-slate-200 rounded-full text-sm font-semibold whitespace-nowrap">
             Last Month
          </button>
       </div>

       {/* Stats Grid */}
       <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 relative">
             <div className="absolute top-5 right-5 text-slate-300"><ChevronRight size={16} /></div>
             <div className="h-10 w-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-3">
                <Utensils size={20} />
             </div>
             <div className="text-2xl font-bold text-slate-900">{selectedClient ? selectedClient.targetCalories : 2200}</div>
             <div className="text-xs text-slate-500 font-medium mt-1">Calories Target</div>
          </div>
           <div className="bg-[#FFF8E7] p-5 rounded-3xl shadow-sm border border-[#FDEECC] relative">
             <div className="h-10 w-10 bg-white/50 rounded-full flex items-center justify-center text-amber-500 mb-3">
                <Flame size={20} />
             </div>
             <div className="text-2xl font-bold text-slate-900">450</div>
             <div className="text-xs text-slate-500 font-medium mt-1">Active Calories</div>
          </div>
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 relative">
             <div className="absolute top-5 right-5 text-slate-300"><ChevronRight size={16} /></div>
             <div className="h-10 w-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-3">
                <Footprints size={20} />
             </div>
             <div className="text-2xl font-bold text-slate-900">8,432</div>
             <div className="text-xs text-slate-500 font-medium mt-1">Steps</div>
          </div>
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 relative">
             <div className="absolute top-5 right-5 text-slate-300"><ChevronRight size={16} /></div>
             <div className="h-10 w-10 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 mb-3">
                <Moon size={20} />
             </div>
             <div className="text-2xl font-bold text-slate-900">7h 20m</div>
             <div className="text-xs text-slate-500 font-medium mt-1">Sleep</div>
          </div>
       </div>

       {/* Weight Progress */}
       <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-4">
          <div className="flex items-center justify-between">
             <h3 className="text-xl font-bold text-slate-900">Weight Progress</h3>
             <div className="flex items-center gap-3">
                <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                   <TrendingUpIcon /> -1.3 kg
                </span>
                <button className="text-slate-400">
                   <RefreshCw size={18} />
                </button>
             </div>
          </div>
       </div>

       {/* Cycle Tracking Tile (Conditional) */}
       {selectedClient?.menstrualData && cycleSummary && (
           <div 
             onClick={() => setCurrentView('cycle-tracking')}
             className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden cursor-pointer active:scale-95 transition-transform"
           >
               <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-50 rounded-bl-[80px] -z-0 opacity-50"></div>
               <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-[#7C5CFC]/10 text-[#7C5CFC] flex items-center justify-center">
                          <Activity size={24} />
                      </div>
                      <div>
                          <h3 className="text-lg font-bold text-slate-900">Cycle Tracking</h3>
                          <p className="text-slate-500 text-xs font-medium mt-0.5">
                              Day {cycleSummary.day} • <span className="text-[#7C5CFC]">{cycleSummary.phase} Phase</span>
                          </p>
                      </div>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                      <ChevronRight size={20} />
                  </div>
               </div>
           </div>
       )}
    </div>
  );
  };

  const NutritionView = () => {
    // Calculate progress for the progress bar
    const allMealFoods = Object.values(todaysPlan).flat() as FoodItem[];
    const totalItems = allMealFoods.length;
    
    const checkedCount = allMealFoods.reduce((acc: number, food: FoodItem) => {
        let mealName = '';
        (Object.entries(todaysPlan) as [string, FoodItem[]][]).forEach(([m, foods]) => {
            if(foods.find((f) => f.id === food.id)) mealName = m;
        });
        return acc + (checkedItems[`${currentDay}-${mealName}-${food.id}`] ? 1 : 0);
    }, 0);
    
    const progress = totalItems > 0 ? (checkedCount / totalItems) * 100 : 0;

    return (
        <div className="flex-1 overflow-y-auto no-scrollbar bg-[#F8FAFC] pb-24">
           {/* Header */}
           <div className="bg-white px-5 pt-12 pb-6 rounded-b-[32px] shadow-sm z-20 relative border-b border-slate-100">
              <div className="flex items-center justify-between mb-6">
                 <button onClick={() => setCurrentView('home')} className="p-2 -ml-2 text-slate-400 hover:text-slate-600">
                    <ChevronLeft size={24} />
                 </button>
                 <h1 className="text-xl font-bold text-slate-900">My Nutrition</h1>
                 <div className="w-8"></div> {/* Spacer */}
              </div>
              
              {/* Day Switcher */}
              <div className="flex overflow-x-auto no-scrollbar gap-3 mb-6 pb-2">
                 {DAYS_OF_WEEK.map((day, idx) => (
                    <button 
                        key={day}
                        onClick={() => setCurrentDayIndex(idx)}
                        className={`flex flex-col items-center justify-center min-w-[3.5rem] h-16 rounded-2xl transition-all ${
                            day === currentDay 
                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 scale-105' 
                            : 'bg-slate-50 text-slate-400 border border-slate-100'
                        }`}
                    >
                        <span className="text-[10px] font-bold uppercase opacity-80">{day.substring(0, 3)}</span>
                        <span className="text-lg font-bold">{14 + idx}</span>
                    </button>
                 ))}
              </div>

              {/* Progress Bar */}
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">
                 <span>Daily Progress</span>
                 <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                 <div className="h-full bg-emerald-500 transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
              </div>
           </div>
    
           <div className="px-5 space-y-6 mt-6 pb-6">
              {allMealFoods.length === 0 && (
                   <div className="text-center py-12 text-slate-400">
                       <p>No diet plan assigned for this day.</p>
                   </div>
              )}

              {Object.values(MealType).map((meal) => {
                  const foods = todaysPlan[meal];
                  if (foods.length === 0) return null; // Don't show empty meal cards

                  const totalMealCals = Math.round(foods.reduce((a, b) => a + b.calories, 0));
                  const allChecked = foods.every(f => checkedItems[`${currentDay}-${meal}-${f.id}`]);

                  return (
                      <div key={meal} className={`transition-all duration-300 ${allChecked ? 'opacity-60 grayscale-[0.5]' : 'opacity-100'}`}>
                          <div className="flex items-end justify-between mb-3 px-1">
                              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                  {meal}
                                  {allChecked && <CheckCircle2 size={16} className="text-emerald-500" />}
                              </h3>
                              <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                                  {totalMealCals} kcal
                              </span>
                          </div>

                          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                              {foods.map((food, idx) => {
                                  const isChecked = checkedItems[`${currentDay}-${meal}-${food.id}`];
                                  return (
                                      <div 
                                        key={food.id}
                                        onClick={() => toggleFoodItem(meal, food.id)}
                                        className={`relative p-4 flex items-center gap-4 transition-all cursor-pointer border-b border-slate-50 last:border-0 hover:bg-slate-50 active:scale-[0.99] ${
                                            isChecked ? 'bg-slate-50/50' : 'bg-white'
                                        }`}
                                      >
                                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${
                                              isChecked 
                                              ? 'bg-emerald-500 border-emerald-500 text-white' 
                                              : 'border-slate-200 text-transparent'
                                          }`}>
                                              <Check size={14} strokeWidth={3} />
                                          </div>

                                          <div className="flex-1">
                                              <div className="flex items-center justify-between mb-1">
                                                  <span className={`text-[15px] font-bold transition-all ${isChecked ? 'text-slate-400 line-through decoration-2 decoration-slate-200' : 'text-slate-800'}`}>
                                                      {food.name}
                                                  </span>
                                                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${
                                                      isChecked 
                                                      ? 'bg-slate-100 text-slate-400' 
                                                      : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                                  }`}>
                                                      {food.amount} {food.unit}
                                                  </span>
                                              </div>
                                              {!isChecked && (
                                                  <div className="text-[11px] text-slate-400 font-medium">
                                                      {food.calories} cal • {food.protein}g Protein
                                                  </div>
                                              )}
                                          </div>
                                      </div>
                                  );
                              })}
                          </div>
                      </div>
                  );
              })}
              <div className="h-8"></div>
           </div>
        </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-[375px] h-[812px] bg-[#F8FAFC] rounded-[40px] shadow-2xl overflow-hidden relative border-[8px] border-slate-800 flex flex-col">
        
        {/* Status Bar */}
        <div className="h-12 flex items-end justify-between px-6 pb-2 text-xs font-bold z-10 shrink-0 transition-colors bg-white text-slate-900">
            <span>09:41</span>
            <div className="flex gap-1.5 items-center">
                <SignalIcon />
                <WifiIcon />
                <BatteryIcon />
            </div>
        </div>

        {/* Content Area */}
        {currentView === 'profile-select' && <ProfileSelectView />}
        {currentView === 'home' && <HomeView />}
        {currentView === 'nutrition' && <NutritionView />}
        {currentView === 'profile' && <ProfileView />}
        {currentView === 'assessment' && <AssessmentView />}
        {currentView === 'cycle-tracking' && <CycleTrackingView />}
        
        {(currentView !== 'home' && currentView !== 'nutrition' && currentView !== 'profile-select' && currentView !== 'profile' && currentView !== 'assessment' && currentView !== 'cycle-tracking') && (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
               Work in progress...
            </div>
        )}

        {/* Bottom Navigation - Hide on Profile Select and sub-pages */}
        {currentView !== 'profile-select' && currentView !== 'assessment' && currentView !== 'cycle-tracking' && <BottomNav />}

        {/* Exit Button (Overlay) */}
        <button 
            onClick={onExit}
            className="absolute top-3 left-4 z-50 bg-black/80 text-white px-3 py-1 rounded-full text-[10px] backdrop-blur-md hover:bg-black transition-colors"
        >
            Exit
        </button>

      </div>
    </div>
  );
};

// --- Helper Icons for exact look ---
const TrendingUpIcon = () => (
   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
);

const SignalIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M2 20h20V2z" /></svg>
);

const WifiIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12.01 21.49L23.64 7c-.45-.34-4.93-4-11.64-4C5.28 3 .81 6.66.36 7l11.63 14.49.01.01.01-.01z" /></svg>
);

const BatteryIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.73 0 1.33-.6 1.33-1.33V5.33C17 4.6 16.4 4 15.67 4z" /></svg>
);