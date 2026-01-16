
export enum MealType {
  EARLY_MORNING = 'Early Morning',
  BREAKFAST = 'Breakfast',
  MID_DAY_SNACK = 'Mid Day Snack',
  LUNCH = 'Lunch',
  PRE_WORKOUT = 'Pre Workout',
  POST_WORKOUT = 'Post Workout',
  LATE_EVENING_SNACK = 'Late Evening Snack',
  DINNER = 'Dinner',
  LATE_EVENING = 'Late Evening'
}

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export const DAYS_OF_WEEK: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export interface MenstrualData {
  lastPeriodStartDate: string; // YYYY-MM-DD
  cycleLength: number; // days
  periodDuration: number; // days
  isRegular: boolean;
  symptoms: string[];
}

export interface Client {
  id: string;
  name: string;
  initials: string;
  gender?: 'Male' | 'Female' | 'Prefer not to say';
  menstrualData?: MenstrualData;
  goal: string;
  targetCalories: number;
  lastCheckIn: string;
  status: 'Active' | 'Pending' | 'Paused';
  currentPlan?: WeeklyDietPlan;
}

export interface FoodItem {
  id: string;
  name: string;
  // Current calculated values for the assigned portion
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  
  // Display info
  servingSize: string; // Original text description e.g. "1 medium"
  
  // Portion tracking
  unit: string;        // e.g., 'g', 'ml', 'piece', 'cup', 'oz'
  amount: number;      // e.g., 150, 10, 1
  
  // Base values for recalculation (optional, useful for editing later)
  baseUnit?: string;
  baseAmount?: number;
  baseCalories?: number;
  
  category?: string;
}

export interface DietPlan {
  [MealType.EARLY_MORNING]: FoodItem[];
  [MealType.BREAKFAST]: FoodItem[];
  [MealType.MID_DAY_SNACK]: FoodItem[];
  [MealType.LUNCH]: FoodItem[];
  [MealType.PRE_WORKOUT]: FoodItem[];
  [MealType.POST_WORKOUT]: FoodItem[];
  [MealType.LATE_EVENING_SNACK]: FoodItem[];
  [MealType.DINNER]: FoodItem[];
  [MealType.LATE_EVENING]: FoodItem[];
}

export type WeeklyDietPlan = {
  [key in DayOfWeek]: DietPlan;
};

export interface DailyTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}
