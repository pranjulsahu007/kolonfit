import { FoodItem } from "../types";
import { FOOD_DATABASE } from "../data/foodDatabase";

/**
 * Searches for food items using the local database.
 * Returns a list of potential matches with base measurement units.
 */
export const searchFoodDatabase = async (query: string): Promise<FoodItem[]> => {
  if (!query.trim()) return [];

  // Simulate a small network delay for better UX feel (optional)
  await new Promise(resolve => setTimeout(resolve, 300));

  const lowerQuery = query.toLowerCase().trim();
  
  // Filter the local database
  const results = FOOD_DATABASE.filter(item => {
    const matchName = item.name.toLowerCase().includes(lowerQuery);
    const matchCategory = item.category?.toLowerCase().includes(lowerQuery);
    return matchName || matchCategory;
  });

  // Limit results to 20 items to prevent huge lists
  const limitedResults = results.slice(0, 20);

  // Map to FoodItem structure, generating a new ID for this instance
  return limitedResults.map(item => ({
    ...item,
    id: crypto.randomUUID(), // Assign a fresh ID for the usage instance
  }));
};