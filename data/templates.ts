import { DietPlan, MealType, WeeklyDietPlan, FoodItem, DAYS_OF_WEEK } from '../types';

export interface DietTemplate {
  id: string;
  name: string;
  description: string;
  tags: string[];
  totalCalories: number;
  macros: { p: number; c: number; f: number };
  weeklyPlan: WeeklyDietPlan;
}

// Intelligent Helper to Create Food Items with realistic units
const f = (name: string, cal: number, p: number, c: number, fat: number, amount: number = 1, unit: string = 'srv', category: string = 'General'): FoodItem => {
  let finalAmount = amount;
  let finalUnit = unit;

  // Auto-detect unit/amount if default 'srv' is used to provide proper scale values
  if (unit === 'srv' && amount === 1) {
     const n = name.toLowerCase();
     
     // Specific Items
     if (n.includes('egg') && !n.includes('whites') && !n.includes('plant')) { finalAmount = Math.max(1, Math.round(cal/70)); finalUnit = 'large'; }
     else if (n.includes('egg whites')) { finalAmount = Math.round(cal/17); finalUnit = 'large'; }
     
     // Meats & Fish (Cooked)
     else if (n.includes('chicken') || n.includes('turkey')) { finalAmount = Math.round(cal/1.65); finalUnit = 'g'; }
     else if (n.includes('salmon')) { finalAmount = Math.round(cal/2.1); finalUnit = 'g'; }
     else if (n.includes('fish') || n.includes('tilapia') || n.includes('cod') || n.includes('tuna')) { finalAmount = Math.round(cal/1.1); finalUnit = 'g'; }
     else if (n.includes('beef') || n.includes('steak') || n.includes('mutton') || n.includes('lamb')) { finalAmount = Math.round(cal/2.5); finalUnit = 'g'; }
     else if (n.includes('shrimp') || n.includes('prawn')) { finalAmount = Math.round(cal/1.0); finalUnit = 'g'; }
     else if (n.includes('pork') || n.includes('bacon') || n.includes('ham')) { finalAmount = Math.round(cal/3.0); finalUnit = 'g'; }
     
     // Grains & Carbs
     else if (n.includes('oats') || n.includes('oatmeal')) { finalAmount = Math.round(cal/3.8); finalUnit = 'g'; } // Dry
     else if (n.includes('rice')) { finalAmount = Math.round(cal/1.3); finalUnit = 'g'; } // Cooked
     else if (n.includes('quinoa')) { finalAmount = Math.round(cal/1.2); finalUnit = 'g'; }
     else if (n.includes('pasta') || n.includes('spaghetti') || n.includes('noodles')) { finalAmount = Math.round(cal/1.5); finalUnit = 'g'; }
     else if (n.includes('bread') || n.includes('toast')) { finalAmount = Math.max(1, Math.round(cal/90)); finalUnit = 'slice'; }
     else if (n.includes('bagel')) { finalAmount = 1; finalUnit = 'piece'; }
     else if (n.includes('wrap') || n.includes('tortilla') || n.includes('roti') || n.includes('chapati') || n.includes('naan')) { finalAmount = Math.max(1, Math.round(cal/120)); finalUnit = 'piece'; }
     else if (n.includes('potato')) { finalAmount = Math.round(cal/0.9); finalUnit = 'g'; }

     // Dairy
     else if (n.includes('yogurt') || n.includes('curd')) { finalAmount = Math.round(cal/0.6); finalUnit = 'g'; }
     else if (n.includes('milk')) { finalAmount = Math.round(cal/0.5); finalUnit = 'ml'; }
     else if (n.includes('cheese') || n.includes('paneer') || n.includes('mozzarella')) { finalAmount = Math.round(cal/3.0); finalUnit = 'g'; }
     else if (n.includes('butter') || n.includes('ghee') || n.includes('oil')) { finalAmount = Math.round(cal/9); finalUnit = 'g'; }

     // Fruits & Veg
     else if (n.includes('apple') || n.includes('pear') || n.includes('orange') || n.includes('peach')) { finalAmount = 1; finalUnit = 'medium'; }
     else if (n.includes('banana')) { finalAmount = 1; finalUnit = 'medium'; }
     else if (n.includes('berr')) { finalAmount = Math.round(cal/0.57); finalUnit = 'g'; }
     else if (n.includes('avocado')) { finalAmount = cal > 100 ? 0.5 : 0.25; finalUnit = 'medium'; }
     else if (n.includes('broccoli') || n.includes('bean') || n.includes('spinach') || n.includes('salad') || n.includes('veg') || n.includes('asparagus') || n.includes('zucchini')) { finalAmount = Math.round(cal/0.35); finalUnit = 'g'; }

     // Nuts & Seeds
     else if (n.includes('nut') || n.includes('almond') || n.includes('walnut') || n.includes('cashew') || n.includes('seeds')) { finalAmount = Math.round(cal/6); finalUnit = 'g'; }
     else if (n.includes('peanut butter')) { finalAmount = Math.round(cal/6); finalUnit = 'g'; }

     // Prepared/Misc
     else if (n.includes('protein') && (n.includes('shake') || n.includes('powder'))) { finalAmount = Math.max(1, Math.round(cal/110)); finalUnit = 'scoop'; }
     else if (n.includes('bar')) { finalAmount = 1; finalUnit = 'bar'; }
     else if (n.includes('smoothie')) { finalAmount = 1; finalUnit = 'glass'; }
     else if (n.includes('soup') || n.includes('curry') || n.includes('stew') || n.includes('dahl') || n.includes('chili')) { finalAmount = Math.round(cal/0.8); finalUnit = 'g'; }
     else if (n.includes('stir-fry')) { finalAmount = Math.round(cal/1.2); finalUnit = 'g'; }
     else if (n.includes('burrito') || n.includes('burger') || n.includes('sandwich') || n.includes('sub')) { finalAmount = 1; finalUnit = 'serving'; }
     
     // General Fallback
     else {
         finalAmount = Math.round(cal); // Very rough fallback
         finalUnit = 'g';
     }
  }

  return {
    id: crypto.randomUUID(),
    name, calories: cal, protein: p, carbs: c, fat,
    fiber: 0, sugar: 0, sodium: 0,
    servingSize: `${finalAmount} ${finalUnit}`,
    unit: finalUnit, amount: finalAmount,
    baseUnit: finalUnit, baseAmount: finalAmount, baseCalories: cal,
    category
  };
};

const createDay = (
  b: FoodItem[], 
  l: FoodItem[], 
  s: FoodItem[], 
  d: FoodItem[],
  em: FoodItem[] = [],      // Early Morning
  pre: FoodItem[] = [],     // Pre Workout
  post: FoodItem[] = [],    // Post Workout
  les: FoodItem[] = [],     // Late Evening Snack
  le: FoodItem[] = []       // Late Evening
): DietPlan => ({
  [MealType.EARLY_MORNING]: em,
  [MealType.BREAKFAST]: b,
  [MealType.MID_DAY_SNACK]: s,
  [MealType.LUNCH]: l,
  [MealType.PRE_WORKOUT]: pre,
  [MealType.POST_WORKOUT]: post,
  [MealType.LATE_EVENING_SNACK]: les,
  [MealType.DINNER]: d,
  [MealType.LATE_EVENING]: le,
});

// Helper to calculate stats from a plan
const calculateStats = (plan: WeeklyDietPlan) => {
  let totalCals = 0;
  let totalP = 0;
  let totalC = 0;
  let totalF = 0;

  DAYS_OF_WEEK.forEach(day => {
      Object.values(MealType).forEach(meal => {
          plan[day][meal].forEach(food => {
              totalCals += food.calories;
              totalP += food.protein;
              totalC += food.carbs;
              totalF += food.fat;
          });
      });
  });

  return {
      calories: Math.round(totalCals / 7),
      p: Math.round(totalP / 7),
      c: Math.round(totalC / 7),
      f: Math.round(totalF / 7)
  };
};

// Helper to create a week from 3 day variations (A, B, C)
const createVariedWeek = (dayA: DietPlan, dayB: DietPlan, dayC: DietPlan): WeeklyDietPlan => ({
  Monday: JSON.parse(JSON.stringify(dayA)),
  Tuesday: JSON.parse(JSON.stringify(dayB)),
  Wednesday: JSON.parse(JSON.stringify(dayA)),
  Thursday: JSON.parse(JSON.stringify(dayB)),
  Friday: JSON.parse(JSON.stringify(dayA)),
  Saturday: JSON.parse(JSON.stringify(dayC)),
  Sunday: JSON.parse(JSON.stringify(dayC)),
});

// --- Common Add-ons (Early Morning, Pre/Post, Late) ---
const em_detox = [f('Warm Water & Lemon', 2, 0, 0, 0, 1, 'glass')];
const em_coffee = [f('Black Coffee', 5, 0, 1, 0, 1, 'cup')];
const em_tea = [f('Green Tea', 0, 0, 0, 0, 1, 'cup')];
const pre_fruit = [f('Apple', 60, 0, 15, 0)];
const pre_carb = [f('Rice Cake & Honey', 80, 1, 19, 0)];
const post_shake = [f('Whey Protein', 120, 24, 2, 1, 1, 'scoop')];
const post_egg = [f('Egg Whites', 70, 14, 1, 0, 4, 'large')];
const late_tea = [f('Chamomile Tea', 0, 0, 0, 0, 1, 'cup')];
const late_casein = [f('Cottage Cheese', 90, 12, 4, 2, 100, 'g')];

// ==========================================
// 1. 800 KCAL (RAPID MINI-CUT)
// ==========================================
const week800: WeeklyDietPlan = {
  Monday: createDay([f('Egg Whites', 120, 25, 2, 0)], [f('Grilled Chicken', 200, 40, 0, 4)], [f('Apple', 80, 0, 20, 0)], [f('White Fish', 180, 35, 0, 2), f('Broccoli', 50, 4, 10, 0)], em_coffee, [], [], [], late_tea),
  Tuesday: createDay([f('Greek Yogurt', 120, 20, 8, 0)], [f('Tuna Salad', 220, 35, 5, 5)], [f('Berries', 50, 1, 12, 0)], [f('Turkey Mince', 200, 35, 0, 6), f('Green Beans', 40, 2, 8, 0)], em_tea, [], [], [], late_tea),
  Wednesday: createDay([f('Protein Shake', 110, 24, 2, 1)], [f('Shrimp', 180, 35, 1, 2)], [f('Almonds', 80, 3, 3, 7)], [f('Tofu Stir-fry', 200, 18, 10, 8)], em_coffee, [], [], [], late_tea),
  Thursday: createDay([f('Boiled Eggs', 140, 12, 1, 10, 2, 'large')], [f('Chicken Soup', 150, 25, 5, 3)], [f('Orange', 60, 1, 15, 0)], [f('Tilapia', 180, 35, 0, 3), f('Zucchini', 40, 2, 8, 0)], em_tea, [], [], [], late_tea),
  Friday: createDay([f('Cottage Cheese', 120, 22, 6, 1)], [f('Turkey Slices', 150, 30, 2, 2)], [f('Blueberries', 60, 1, 14, 0)], [f('Grilled Salmon (Small)', 250, 30, 0, 14)], em_detox, [], [], [], late_tea),
  Saturday: createDay([f('Egg White Omelette', 130, 26, 2, 0)], [f('Canned Salmon', 180, 30, 0, 6)], [f('Grapefruit', 50, 1, 13, 0)], [f('Lean Steak (Small)', 220, 35, 0, 8)], em_coffee, [], [], [], late_tea),
  Sunday: createDay([f('Protein Pancakes', 180, 25, 15, 2, 1, 'srv')], [f('Chicken Breast', 180, 35, 0, 3)], [f('Pear', 60, 0, 15, 0)], [f('Tuna Steak', 200, 40, 0, 4)], em_detox, [], [], [], late_tea)
};

// ==========================================
// 2. 1200 KCAL (STANDARD WEIGHT LOSS)
// ==========================================
const week1200: WeeklyDietPlan = {
  Monday: createDay([f('Oats', 200, 6, 35, 3)], [f('Chicken Sandwich', 350, 30, 40, 8, 1, 'sandwich')], [f('Yogurt', 100, 15, 6, 0)], [f('Salmon', 300, 35, 0, 18)], em_detox, [], [], [], late_tea),
  Tuesday: createDay([f('Eggs & Toast', 220, 15, 16, 11, 1, 'srv')], [f('Quinoa Salad', 320, 10, 45, 12)], [f('Apple', 80, 0, 20, 0)], [f('Steak & Greens', 390, 45, 8, 18)], em_detox, [], [], [], late_tea),
  Wednesday: createDay([f('Smoothie', 250, 20, 35, 2, 1, 'glass')], [f('Turkey Wrap', 330, 25, 35, 10, 1, 'wrap')], [f('Almonds', 100, 4, 4, 9)], [f('Stir-fry', 350, 35, 15, 15)], em_coffee, [], [], [], late_tea),
  Thursday: createDay([f('PB Toast', 220, 8, 20, 12, 1, 'srv')], [f('Lentil Soup', 300, 18, 40, 5)], [f('Pear', 80, 0, 20, 0)], [f('White Fish & Potato', 400, 42, 38, 8)], em_detox, [], [], [], late_tea),
  Friday: createDay([f('Yogurt & Granola', 250, 15, 35, 6)], [f('Tuna Sandwich', 350, 30, 35, 10, 1, 'sandwich')], [f('Orange', 60, 1, 15, 0)], [f('Tofu Curry', 320, 18, 15, 20)], em_coffee, [], [], [], late_tea),
  Saturday: createDay([f('Omelette', 220, 18, 5, 14)], [f('Chicken Rice', 380, 35, 45, 6)], [f('Grapes', 80, 1, 20, 0)], [f('Shrimp Pasta', 350, 25, 45, 8)], em_detox, [], [], [], late_tea),
  Sunday: createDay([f('Pancakes', 250, 6, 45, 6, 2, 'piece')], [f('Beef Salad', 350, 30, 15, 18)], [f('Chocolate', 100, 1, 10, 7)], [f('Roast Chicken', 360, 34, 10, 18)], em_coffee, [], [], [], late_tea)
};

// ==========================================
// 3. 1600 KCAL (BALANCED)
// ==========================================
const week1600 = createVariedWeek(
  createDay([f('Oats & Honey', 400, 12, 60, 12)], [f('Chicken Burrito', 500, 40, 50, 15, 1, 'burrito')], [f('Protein Bar', 200, 20, 20, 8)], [f('Salmon & Spuds', 500, 35, 40, 20)], em_coffee, [], [f('Banana', 90, 1, 23, 0)], [], late_tea),
  createDay([f('Avo Toast & Eggs', 450, 18, 35, 25)], [f('Turkey Pasta', 550, 35, 70, 12)], [f('Yogurt & Fruit', 150, 15, 20, 0)], [f('Steak & Veg', 450, 50, 10, 22)], em_tea, [], [f('Apple', 60, 0, 15, 0)], [], late_tea),
  createDay([f('Bagel Sandwich', 400, 15, 50, 12, 1, 'sandwich')], [f('Tuna Salad', 450, 30, 40, 18)], [f('Banana & Nuts', 200, 4, 30, 8)], [f('Curry & Rice', 550, 35, 60, 18)], em_detox, [], [f('Pear', 60, 0, 15, 0)], [], late_tea)
);

// ==========================================
// 4. 2000 KCAL (MAINTENANCE)
// ==========================================
const week2000 = createVariedWeek(
  createDay([f('Large Oats', 550, 15, 70, 20)], [f('Chicken Bowl', 650, 50, 80, 12)], [f('Yogurt & Nuts', 250, 18, 15, 12)], [f('Salmon Dinner', 550, 40, 50, 22)], em_detox, pre_fruit, post_shake, [], late_tea),
  createDay([f('Bacon & Eggs', 600, 30, 35, 35)], [f('Chili & Rice', 600, 45, 70, 15)], [f('Smoothie', 300, 30, 35, 5, 1, 'glass')], [f('Steak & Fries', 500, 50, 40, 25)], em_coffee, pre_fruit, post_shake, [], late_tea),
  createDay([f('Bagel Deluxe', 450, 12, 55, 18)], [f('Sushi Platter', 600, 30, 90, 10, 12, 'piece')], [f('Bar & Fruit', 300, 22, 35, 10)], [f('Carbonara', 650, 25, 75, 30)], em_tea, pre_fruit, post_shake, [], late_tea)
);

// ==========================================
// 5. 2400 KCAL (PERFORMANCE)
// ==========================================
const week2400 = createVariedWeek(
  createDay([f('Pro Oats XL', 650, 35, 80, 15)], [f('Chicken Beans Rice', 800, 60, 100, 15)], [f('Mass Shake', 400, 30, 50, 8, 1, 'bottle')], [f('Steak Dinner', 550, 50, 50, 20)], em_detox, pre_carb, post_shake, [f('Dark Chocolate', 100, 1, 10, 6)], late_casein),
  createDay([f('Big Breakfast', 600, 30, 40, 30)], [f('Pasta Bolognese', 850, 45, 110, 25)], [f('PB Sandwich', 350, 10, 45, 15)], [f('Salmon Bowl', 600, 40, 60, 22)], em_coffee, pre_carb, post_shake, [f('Berries', 50, 1, 12, 0)], late_casein),
  createDay([f('Bagel & Lox', 550, 25, 60, 20)], [f('Footlong Sub', 900, 50, 100, 28, 1, 'sub')], [f('Yogurt & Honey', 300, 20, 40, 5)], [f('Beef Curry', 650, 40, 70, 25)], em_tea, pre_carb, post_shake, [f('Almonds', 80, 3, 3, 7)], late_casein)
);

// ==========================================
// 6. KETO FAT BURN (1400 KCAL)
// ==========================================
const weekKeto = createVariedWeek(
  createDay([f('Scrambled Eggs (3)', 240, 18, 2, 18, 3, 'large')], [f('Cobb Salad', 500, 35, 8, 35)], [f('Almonds', 160, 6, 6, 14)], [f('Salmon & Asparagus', 500, 35, 5, 35)], em_coffee, [], [], [], late_tea),
  createDay([f('Bacon & Eggs', 350, 20, 2, 28)], [f('Tuna Mayo Salad', 450, 30, 5, 32)], [f('Cheese Stick', 100, 7, 1, 8, 1, 'piece')], [f('Burger Patty & Cheese', 500, 40, 2, 35)], em_coffee, [], [], [], late_tea),
  createDay([f('Keto Coffee', 200, 2, 2, 22, 1, 'cup')], [f('Chicken Caesar (No Croutons)', 450, 35, 6, 30)], [f('Macadamia Nuts', 200, 2, 4, 21)], [f('Steak & Broccoli', 550, 45, 8, 35)], em_coffee, [], [], [], late_tea)
);

// ==========================================
// 7. VEGETARIAN BALANCED (1500 KCAL)
// ==========================================
const weekVeg = createVariedWeek(
  createDay([f('Oats & Milk', 300, 10, 45, 6)], [f('Lentil Soup & Bread', 400, 18, 60, 8)], [f('Apple', 60, 0, 15, 0)], [f('Paneer Curry & Rice', 700, 25, 60, 35)], em_detox, [], [], [], late_tea),
  createDay([f('Yogurt Parfait', 350, 15, 50, 8)], [f('Chickpea Salad', 400, 12, 45, 15)], [f('Nuts', 150, 5, 5, 12)], [f('Tofu Stir-fry', 600, 25, 50, 25)], em_tea, [], [], [], late_tea),
  createDay([f('Toast & Peanut Butter', 300, 10, 35, 14)], [f('Rajma & Rice', 450, 15, 70, 10)], [f('Fruit Smoothie', 200, 5, 40, 2)], [f('Veggie Pizza (Home)', 550, 20, 70, 18)], em_coffee, [], [], [], late_tea)
);

// ==========================================
// 8. VEGAN WHOLE FOODS (1600 KCAL)
// ==========================================
const weekVegan = createVariedWeek(
  createDay([f('Tofu Scramble', 300, 20, 15, 12)], [f('Quinoa Bowl', 500, 18, 70, 14)], [f('Walnuts', 200, 4, 4, 18)], [f('Lentil Dahl', 600, 25, 80, 15)], em_detox, [f('Banana', 90, 1, 23, 0)], [], [], late_tea),
  createDay([f('Green Smoothie', 300, 15, 50, 5)], [f('Hummus Wrap', 500, 15, 60, 20)], [f('Apple', 80, 0, 20, 0)], [f('Bean Chili & Rice', 700, 25, 100, 15)], em_detox, [f('Pear', 60, 0, 15, 0)], [], [], late_tea),
  createDay([f('Oatmeal & Flax', 350, 10, 55, 8)], [f('Chickpea Curry', 450, 15, 60, 12)], [f('Almonds', 150, 5, 5, 12)], [f('Tempeh Stir-fry', 650, 30, 50, 30)], em_detox, [f('Orange', 60, 1, 15, 0)], [], [], late_tea)
);

// ==========================================
// 9. HIGH PROTEIN CUT (1800 KCAL)
// ==========================================
const weekHighPro = createVariedWeek(
  createDay([f('Egg Whites & Toast', 300, 30, 30, 5, 1, 'serving')], [f('Chicken & Rice', 600, 50, 70, 10)], [f('Protein Shake', 150, 25, 5, 2, 1, 'scoop')], [f('White Fish & Potato', 750, 50, 80, 15)], em_coffee, pre_fruit, [], [], late_tea),
  createDay([f('Omelette (3 Eggs)', 350, 20, 5, 25, 3, 'large')], [f('Turkey Sandwich', 500, 40, 50, 12)], [f('Greek Yogurt', 150, 15, 8, 0)], [f('Steak & Salad', 800, 60, 20, 45)], em_coffee, pre_fruit, [], [], late_tea),
  createDay([f('Protein Pancakes', 350, 30, 40, 6)], [f('Tuna Salad Bowl', 500, 40, 30, 18)], [f('Beef Jerky', 150, 25, 5, 3)], [f('Chicken & Veg', 800, 60, 40, 35)], em_coffee, pre_fruit, [], [], late_tea)
);

// ==========================================
// 10. MEDITERRANEAN LIFESTYLE (1700 KCAL)
// ==========================================
const weekMed = createVariedWeek(
  createDay([f('Greek Yogurt & Honey', 300, 15, 30, 10)], [f('Chicken Greek Salad', 500, 35, 15, 25)], [f('Fruit', 100, 1, 25, 0)], [f('Salmon & Quinoa', 800, 40, 60, 35)], em_detox, [], [], [], late_tea),
  createDay([f('Avocado Toast', 400, 10, 35, 22)], [f('Lentil & Feta Salad', 450, 18, 40, 20)], [f('Olives & Nuts', 150, 2, 4, 14)], [f('Grilled Fish & Veg', 700, 40, 30, 35)], em_detox, [], [], [], late_tea),
  createDay([f('Oats & Berries', 350, 10, 50, 8)], [f('Hummus & Falafel', 550, 15, 60, 25)], [f('Orange', 80, 1, 18, 0)], [f('Shrimp Pasta', 720, 30, 80, 25)], em_detox, [], [], [], late_tea)
);

// ==========================================
// 11. PALEO PERFORMANCE (2200 KCAL)
// ==========================================
const weekPaleo = createVariedWeek(
  createDay([f('Eggs & Spinach', 400, 20, 5, 30)], [f('Chicken Avocado Salad', 700, 45, 15, 45)], [f('Almonds', 300, 10, 10, 25)], [f('Steak & Sweet Potato', 800, 60, 50, 35)], em_coffee, pre_fruit, post_egg, [], late_tea),
  createDay([f('Bacon & Eggs', 500, 25, 2, 40)], [f('Burger (No Bun)', 650, 40, 5, 50)], [f('Fruit', 150, 1, 35, 0)], [f('Salmon & Asparagus', 900, 50, 10, 60)], em_coffee, pre_fruit, post_egg, [], late_tea),
  createDay([f('Paleo Pancakes', 450, 15, 30, 25)], [f('Tuna Nicoise', 600, 35, 20, 35)], [f('Beef Jerky & Nuts', 350, 30, 10, 20)], [f('Pork Chop & Apple', 800, 50, 40, 40)], em_coffee, pre_fruit, post_egg, [], late_tea)
);

// ==========================================
// 12. MUSCLE GAIN STANDARD (2800 KCAL)
// ==========================================
const weekMuscle = createVariedWeek(
  createDay([f('Big Oats', 600, 20, 90, 15)], [f('Chicken Pasta', 900, 60, 100, 20)], [f('Shake & Bagel', 500, 35, 60, 8)], [f('Steak & Rice', 800, 50, 80, 25)], em_detox, pre_carb, post_shake, [f('Banana', 90, 1, 23, 0)], late_casein),
  createDay([f('Eggs & Toast XL', 700, 35, 60, 30)], [f('Burrito Bowl', 950, 60, 110, 35)], [f('Yogurt & Nuts', 400, 20, 30, 20)], [f('Salmon Dinner', 750, 45, 60, 30)], em_coffee, pre_carb, post_shake, [f('Apple', 80, 0, 20, 0)], late_casein),
  createDay([f('Pancakes & Syrup', 800, 20, 120, 20)], [f('Turkey Sub Footlong', 900, 50, 100, 25)], [f('Mass Shake', 500, 40, 60, 10, 1, 'bottle')], [f('Beef Curry', 600, 40, 70, 20)], em_tea, pre_carb, post_shake, [f('Pear', 80, 0, 20, 0)], late_casein)
);

// ==========================================
// 13. CLEAN BULKING (3200 KCAL)
// ==========================================
const weekBulk = createVariedWeek(
  createDay([f('Oats/PB/Whey', 800, 40, 90, 25)], [f('Chicken/Rice/Avo', 1000, 70, 100, 30)], [f('Shake & Oats', 600, 40, 70, 10)], [f('Steak & Sweet Potato', 800, 60, 70, 30)], em_detox, pre_carb, post_shake, [f('Sandwich', 300, 10, 35, 12)], late_casein),
  createDay([f('6 Eggs & Toast', 900, 50, 60, 45)], [f('Double Pasta', 1100, 70, 140, 30)], [f('Sandwich & Milk', 500, 25, 60, 15)], [f('Salmon & Rice XL', 700, 50, 60, 25)], em_coffee, pre_carb, post_shake, [f('Protein Bar', 200, 20, 20, 8)], late_casein),
  createDay([f('Waffles & Eggs', 1000, 40, 110, 40)], [f('Double Burger Meal', 1200, 70, 100, 55)], [f('Mass Gainer', 600, 50, 80, 8, 1, 'srv')], [f('Chicken Curry XL', 400, 40, 40, 10)], em_tea, pre_carb, post_shake, [f('Bagel', 250, 8, 48, 2)], late_casein)
);

// ==========================================
// 14. INTERMITTENT FASTING (1500 KCAL)
// ==========================================
const weekIF = createVariedWeek(
  createDay([f('Black Coffee', 5, 0, 1, 0, 1, 'cup')], [f('Chicken Wrap XL', 700, 50, 60, 25, 1, 'wrap')], [f('Protein Bar', 200, 20, 20, 8, 1, 'bar')], [f('Steak Salad', 600, 45, 15, 35)], em_coffee, [], [], [], late_tea),
  createDay([f('Water & Lemon', 0, 0, 0, 0, 1, 'glass')], [f('Burrito Bowl', 750, 45, 80, 25)], [f('Yogurt & Fruit', 250, 15, 40, 2)], [f('Salmon & Veg', 500, 35, 10, 30)], em_detox, [], [], [], late_tea),
  createDay([f('Tea (Unsweetened)', 5, 0, 1, 0, 1, 'cup')], [f('Pasta & Chicken', 800, 50, 90, 20)], [f('Nuts', 200, 5, 5, 18)], [f('Omelette (4 Eggs)', 500, 28, 5, 35, 4, 'large')], em_tea, [], [], [], late_tea)
);

// ==========================================
// 15. BUDGET FRIENDLY (1800 KCAL)
// ==========================================
const weekBudget = createVariedWeek(
  createDay([f('Oats & Milk', 300, 12, 45, 8)], [f('Egg Fried Rice', 600, 25, 80, 18)], [f('Banana', 100, 1, 25, 0)], [f('Chicken Thighs & Potato', 800, 50, 60, 35)], em_detox, [], [], [], late_tea),
  createDay([f('Eggs & Toast', 350, 18, 30, 15)], [f('Tuna Pasta Bake', 650, 40, 80, 15)], [f('Apple', 80, 0, 20, 0)], [f('Bean Chili & Rice', 720, 30, 100, 15)], em_detox, [], [], [], late_tea),
  createDay([f('PB Sandwich', 400, 15, 40, 20, 1, 'sandwich')], [f('Lentil Soup & Bread', 500, 25, 80, 10)], [f('Yogurt', 150, 10, 15, 4)], [f('Sausage & Mash', 750, 30, 60, 40)], em_detox, [], [], [], late_tea)
);

// --- AGGREGATE TEMPLATES ---
const allWeeks = [
  { w: week800, name: 'Rapid Mini-Cut (800 kcal)', desc: 'Aggressive 7-day fat loss plan.', tags: ['Aggressive', 'Low Cal'] },
  { w: week1200, name: 'Standard Weight Loss (1200 kcal)', desc: 'Sustainable deficit for steady progress.', tags: ['Fat Loss', 'Standard'] },
  { w: week1600, name: 'Balanced Lifestyle (1600 kcal)', desc: 'Moderate deficit with variety.', tags: ['Balanced', 'Moderate'] },
  { w: week2000, name: 'Active Maintenance (2000 kcal)', desc: 'For active individuals or slow cuts.', tags: ['Maintenance', 'Variety'] },
  { w: week2400, name: 'Performance & Bulk (2400 kcal)', desc: 'Fuel for hard training.', tags: ['Performance', 'Gain'] },
  
  { w: weekKeto, name: 'Keto Fat Burn (1400 kcal)', desc: 'High fat, very low carb for ketosis.', tags: ['Keto', 'Low Carb'] },
  { w: weekVeg, name: 'Vegetarian Balanced (1500 kcal)', desc: 'Meat-free plan with dairy & eggs.', tags: ['Vegetarian', 'Healthy'] },
  { w: weekVegan, name: 'Vegan Whole Foods (1600 kcal)', desc: '100% plant-based nutrient dense.', tags: ['Vegan', 'Plant Based'] },
  { w: weekHighPro, name: 'High Protein Cut (1800 kcal)', desc: 'Max protein for muscle retention.', tags: ['High Protein', 'Cutting'] },
  { w: weekMed, name: 'Mediterranean (1700 kcal)', desc: 'Heart healthy fats and grains.', tags: ['Health', 'Balanced'] },
  
  { w: weekPaleo, name: 'Paleo Performance (2200 kcal)', desc: 'No grains, dairy or processed food.', tags: ['Paleo', 'Clean'] },
  { w: weekMuscle, name: 'Muscle Gain (2800 kcal)', desc: 'High energy for hypertrophy.', tags: ['Bulking', 'High Cal'] },
  { w: weekBulk, name: 'Clean Bulking (3200 kcal)', desc: 'Serious calories for hardgainers.', tags: ['Bulking', 'Massive'] },
  { w: weekIF, name: 'Intermittent Fasting (1500 kcal)', desc: 'Skipped breakfast, larger meals.', tags: ['Fasting', 'Simple'] },
  { w: weekBudget, name: 'Budget Friendly (1800 kcal)', desc: 'Cost-effective nutritious meals.', tags: ['Budget', 'Simple'] },
];

export const SAMPLE_TEMPLATES: DietTemplate[] = allWeeks.map((item, idx) => {
    const stats = calculateStats(item.w);
    return {
        id: `temp_${idx + 1}`,
        name: item.name,
        description: item.desc,
        tags: [...item.tags, `${stats.calories} kcal`],
        totalCalories: stats.calories,
        macros: { p: stats.p, c: stats.c, f: stats.f },
        weeklyPlan: item.w
    };
});
