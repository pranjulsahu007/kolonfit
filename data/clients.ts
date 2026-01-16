
import { Client } from '../types';

// NOTE: For demo purposes, we assume "Today" is Jan 14, 2026.
// Preet's period started Jan 12, so she is currently on day 3 of 5 (Active Cycle).

export const MOCK_CLIENTS: Client[] = [
  { id: '1', name: 'Pranjul Sahu', initials: 'PS', gender: 'Male', goal: 'Muscle Gain', targetCalories: 2800, lastCheckIn: 'Today', status: 'Active' },
  { 
    id: '2', 
    name: 'Preet Sandhu', 
    initials: 'PS', 
    gender: 'Female',
    menstrualData: {
        lastPeriodStartDate: '2026-01-12',
        cycleLength: 28,
        periodDuration: 5,
        isRegular: true,
        symptoms: ['Cramps', 'Mood Swings']
    },
    goal: 'Fat Loss', 
    targetCalories: 1800, 
    lastCheckIn: 'Yesterday', 
    status: 'Active' 
  },
  { id: '3', name: 'Rajbir Singh', initials: 'RS', gender: 'Male', goal: 'Strength', targetCalories: 3000, lastCheckIn: '2 days ago', status: 'Active' },
  { id: '4', name: 'Saurabh Verma', initials: 'SV', gender: 'Male', goal: 'Maintenance', targetCalories: 2400, lastCheckIn: '5 hours ago', status: 'Active' },
  { id: '5', name: 'Rajeev', initials: 'R', gender: 'Male', goal: 'General Health', targetCalories: 2200, lastCheckIn: '1 week ago', status: 'Pending' },
  { 
    id: '6', 
    name: 'Harleen', 
    initials: 'H', 
    gender: 'Female',
    menstrualData: {
        lastPeriodStartDate: '2025-12-25', // Not currently in cycle
        cycleLength: 30,
        periodDuration: 5,
        isRegular: true,
        symptoms: ['Fatigue']
    },
    goal: 'Fat Loss', 
    targetCalories: 1600, 
    lastCheckIn: '3 days ago', 
    status: 'Active' 
  },
  { id: '7', name: 'Vaishali', initials: 'V', gender: 'Female', goal: 'Toning', targetCalories: 1900, lastCheckIn: 'Today', status: 'Active' },
  { id: '8', name: 'Bipul', initials: 'B', gender: 'Male', goal: 'Muscle Gain', targetCalories: 2600, lastCheckIn: '4 days ago', status: 'Paused' },
  { id: '9', name: 'Sonu', initials: 'S', gender: 'Male', goal: 'Weight Loss', targetCalories: 2000, lastCheckIn: 'Yesterday', status: 'Active' },
  { id: '10', name: 'Rajesh', initials: 'R', gender: 'Male', goal: 'Endurance', targetCalories: 2500, lastCheckIn: 'Just now', status: 'Active' },
  { id: '11', name: 'Avesh', initials: 'A', gender: 'Male', goal: 'Athletics', targetCalories: 3200, lastCheckIn: '2 days ago', status: 'Active' },
  { id: '12', name: 'Satinder', initials: 'S', gender: 'Male', goal: 'Recomp', targetCalories: 2300, lastCheckIn: '6 hours ago', status: 'Active' },
];
