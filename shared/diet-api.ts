export interface UserProfile {
  age: number;
  gender: "male" | "female" | "other";
  height: number; // cm
  weight: number; // kg
  activityLevel: "sedentary" | "light" | "moderate" | "very";
  goal: "lose" | "maintain" | "gain";
  dietType: "omnivore" | "vegetarian" | "vegan";
  allergies: string[];
  restrictions: string[];
  mealsPerDay: number;
  cookingTime: "quick" | "moderate" | "elaborate" | "mixed";
  budget?: "low" | "medium" | "high" | "flexible";
}

export interface Meal {
  type: "breakfast" | "lunch" | "dinner" | "snack";
  name: string;
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  prep_time: number; // minutes
  image: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  tags: string[];
}

export interface DayMealPlan {
  day: string;
  meals: Meal[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export interface WeeklyMealPlan {
  days: DayMealPlan[];
  userProfile: UserProfile;
  generatedAt: string;
  totalWeeklyCalories: number;
  averageDailyCalories: number;
}

export interface GenerateMealPlanRequest {
  userProfile: UserProfile;
}

export interface GenerateMealPlanResponse {
  success: boolean;
  mealPlan?: WeeklyMealPlan;
  error?: string;
}

export interface NutritionGoals {
  dailyCalories: number;
  dailyProtein: number;
  dailyCarbs: number;
  dailyFat: number;
  tdee: number; // Total Daily Energy Expenditure
}
