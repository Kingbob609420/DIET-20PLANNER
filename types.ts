// User Profile Types
export interface UserProfile {
  age: number;
  gender: 'male' | 'female' | 'other' | '';
  height: number; // cm
  weight: number; // kg
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'very' | '';
  goal: 'lose' | 'maintain' | 'gain' | '';
  dietType: 'omnivore' | 'vegetarian' | 'vegan' | '';
  allergies: string[];
  restrictions: string[];
  mealsPerDay: number;
  cookingTime: 'quick' | 'moderate' | 'elaborate' | 'mixed';
  budget: 'low' | 'medium' | 'high' | 'flexible';
}

// Meal Types
export interface Meal {
  id: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  prepTime: number; // minutes
  description: string;
  ingredients: string[];
  instructions: string[];
  tags: string[];
}

export interface DayMealPlan {
  id: string;
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
  generatedAt: Date;
  totalWeeklyCalories: number;
  averageDailyCalories: number;
}

// Meal Plan Generator
export class MealPlanGenerator {
  static generateSampleMealPlan(profile: UserProfile): WeeklyMealPlan {
    const baseCalories = this.calculateBaseCalories(profile);
    const days: DayMealPlan[] = [];
    
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    dayNames.forEach(dayName => {
      const meals = this.generateMealsForDay(profile, baseCalories);
      const dayPlan: DayMealPlan = {
        id: Math.random().toString(36).substr(2, 9),
        day: dayName,
        meals: meals,
        totalCalories: meals.reduce((sum, meal) => sum + meal.calories, 0),
        totalProtein: meals.reduce((sum, meal) => sum + meal.protein, 0),
        totalCarbs: meals.reduce((sum, meal) => sum + meal.carbs, 0),
        totalFat: meals.reduce((sum, meal) => sum + meal.fat, 0)
      };
      days.push(dayPlan);
    });
    
    const totalWeeklyCalories = days.reduce((sum, day) => sum + day.totalCalories, 0);
    
    return {
      days,
      userProfile: profile,
      generatedAt: new Date(),
      totalWeeklyCalories,
      averageDailyCalories: Math.round(totalWeeklyCalories / 7)
    };
  }
  
  private static calculateBaseCalories(profile: UserProfile): number {
    let bmr: number;
    
    // Harris-Benedict equation
    if (profile.gender === 'male') {
      bmr = 88.362 + (13.397 * profile.weight) + (4.799 * profile.height) - (5.677 * profile.age);
    } else {
      bmr = 447.593 + (9.247 * profile.weight) + (3.098 * profile.height) - (4.330 * profile.age);
    }
    
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      very: 1.725,
      '': 1.375
    };
    
    const tdee = bmr * activityMultipliers[profile.activityLevel || ''];
    
    const goalAdjustments = {
      lose: -500,
      maintain: 0,
      gain: 500,
      '': 0
    };
    
    return Math.round(tdee + goalAdjustments[profile.goal || '']);
  }
  
  private static generateMealsForDay(profile: UserProfile, targetCalories: number): Meal[] {
    const meals: Meal[] = [];
    
    const breakfastCalories = Math.round(targetCalories * 0.25);
    const lunchCalories = Math.round(targetCalories * 0.35);
    const dinnerCalories = Math.round(targetCalories * 0.3);
    const snackCalories = Math.round(targetCalories * 0.1);
    
    meals.push(this.generateMeal('breakfast', breakfastCalories, profile.dietType));
    meals.push(this.generateMeal('lunch', lunchCalories, profile.dietType));
    meals.push(this.generateMeal('dinner', dinnerCalories, profile.dietType));
    
    if (profile.mealsPerDay > 3) {
      meals.push(this.generateMeal('snack', snackCalories, profile.dietType));
    }
    
    return meals;
  }
  
  private static generateMeal(
    type: Meal['type'], 
    targetCalories: number, 
    dietType: UserProfile['dietType']
  ): Meal {
    const sampleMeals: Record<Meal['type'], Array<{
      name: string;
      protein: number;
      carbs: number;
      fat: number;
      ingredients: string[];
      instructions: string[];
    }>> = {
      breakfast: [
        {
          name: 'Oatmeal with Berries',
          protein: 12, carbs: 45, fat: 8,
          ingredients: ['Rolled oats', 'Mixed berries', 'Almond milk', 'Honey'],
          instructions: ['Cook oats with almond milk', 'Top with berries and honey']
        },
        {
          name: 'Avocado Toast',
          protein: 15, carbs: 35, fat: 18,
          ingredients: ['Whole grain bread', 'Avocado', 'Tomato', 'Lemon'],
          instructions: ['Toast bread', 'Mash avocado', 'Add tomato and lemon']
        },
        {
          name: 'Greek Yogurt Parfait',
          protein: 20, carbs: 30, fat: 5,
          ingredients: ['Greek yogurt', 'Granola', 'Berries', 'Honey'],
          instructions: ['Layer yogurt with granola and berries']
        }
      ],
      lunch: [
        {
          name: 'Quinoa Buddha Bowl',
          protein: 18, carbs: 55, fat: 12,
          ingredients: ['Quinoa', 'Chickpeas', 'Spinach', 'Sweet potato'],
          instructions: ['Cook quinoa', 'Roast vegetables', 'Combine with chickpeas']
        },
        {
          name: 'Mediterranean Salad',
          protein: 25, carbs: 20, fat: 15,
          ingredients: ['Chicken breast', 'Mixed greens', 'Cherry tomatoes', 'Feta'],
          instructions: ['Grill chicken', 'Toss with vegetables and feta']
        },
        {
          name: 'Lentil Soup',
          protein: 16, carbs: 40, fat: 6,
          ingredients: ['Red lentils', 'Vegetables', 'Vegetable broth', 'Spices'],
          instructions: ['Simmer lentils with vegetables and spices']
        }
      ],
      dinner: [
        {
          name: 'Baked Salmon with Vegetables',
          protein: 40, carbs: 25, fat: 15,
          ingredients: ['Salmon fillet', 'Broccoli', 'Sweet potato', 'Olive oil'],
          instructions: ['Bake salmon and vegetables with herbs']
        },
        {
          name: 'Vegetable Stir-fry',
          protein: 12, carbs: 35, fat: 10,
          ingredients: ['Tofu', 'Mixed vegetables', 'Brown rice', 'Soy sauce'],
          instructions: ['Stir-fry vegetables and tofu', 'Serve over rice']
        },
        {
          name: 'Pasta Primavera',
          protein: 15, carbs: 60, fat: 8,
          ingredients: ['Whole wheat pasta', 'Seasonal vegetables', 'Olive oil', 'Herbs'],
          instructions: ['Cook pasta', 'Sauté vegetables', 'Combine with herbs']
        }
      ],
      snack: [
        {
          name: 'Apple with Almond Butter',
          protein: 6, carbs: 25, fat: 8,
          ingredients: ['Apple', 'Almond butter'],
          instructions: ['Slice apple', 'Serve with almond butter']
        },
        {
          name: 'Trail Mix',
          protein: 8, carbs: 20, fat: 12,
          ingredients: ['Nuts', 'Dried fruit', 'Seeds'],
          instructions: ['Mix ingredients together']
        },
        {
          name: 'Hummus with Vegetables',
          protein: 4, carbs: 15, fat: 6,
          ingredients: ['Hummus', 'Carrot sticks', 'Cucumber'],
          instructions: ['Cut vegetables', 'Serve with hummus']
        }
      ]
    };
    
    const mealOptions = sampleMeals[type];
    const selectedMeal = mealOptions[Math.floor(Math.random() * mealOptions.length)];
    
    // Scale macros to match target calories
    const baseMacroCalories = (selectedMeal.protein * 4) + (selectedMeal.carbs * 4) + (selectedMeal.fat * 9);
    const scaleFactor = targetCalories / baseMacroCalories;
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      type,
      name: selectedMeal.name,
      calories: targetCalories,
      protein: Math.round(selectedMeal.protein * scaleFactor),
      carbs: Math.round(selectedMeal.carbs * scaleFactor),
      fat: Math.round(selectedMeal.fat * scaleFactor),
      prepTime: type === 'snack' ? 5 : 30,
      description: `A delicious and nutritious ${type} option tailored to your dietary preferences.`,
      ingredients: selectedMeal.ingredients,
      instructions: selectedMeal.instructions,
      tags: [dietType || 'balanced', 'healthy', 'nutritious']
    };
  }
}

// Constants for form options
export const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentary', description: 'Little to no exercise, desk job' },
  { value: 'light', label: 'Lightly Active', description: 'Light exercise 1-3 days per week' },
  { value: 'moderate', label: 'Moderately Active', description: 'Moderate exercise 3-5 days per week' },
  { value: 'very', label: 'Very Active', description: 'Hard exercise 6-7 days per week' }
];

export const GOALS = [
  { value: 'lose', label: 'Lose Weight', description: 'Create a caloric deficit for weight loss' },
  { value: 'maintain', label: 'Maintain Weight', description: 'Maintain current weight with balanced nutrition' },
  { value: 'gain', label: 'Gain Weight', description: 'Build muscle and increase healthy weight' }
];

export const DIET_TYPES = [
  { value: 'omnivore', label: 'Non-Vegetarian', description: 'Includes meat, fish, dairy, and plant foods' },
  { value: 'vegetarian', label: 'Vegetarian', description: 'Plant foods, dairy, and eggs (no meat or fish)' },
  { value: 'vegan', label: 'Vegan', description: 'Plant foods only (no animal products)' }
];

export const ALLERGIES = ['Nuts', 'Dairy', 'Eggs', 'Soy', 'Gluten', 'Shellfish'];

export const COOKING_TIMES = [
  { value: 'quick', label: 'Quick (15-30 minutes)' },
  { value: 'moderate', label: 'Moderate (30-60 minutes)' },
  { value: 'elaborate', label: 'Elaborate (60+ minutes)' },
  { value: 'mixed', label: 'Mixed (variety of times)' }
];

export const BUDGETS = [
  { value: 'low', label: 'Budget-friendly' },
  { value: 'medium', label: 'Moderate' },
  { value: 'high', label: 'Premium ingredients' },
  { value: 'flexible', label: 'Flexible' }
];
