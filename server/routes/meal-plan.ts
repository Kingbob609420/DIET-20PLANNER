import { RequestHandler } from "express";
import {
  GenerateMealPlanRequest,
  GenerateMealPlanResponse,
  WeeklyMealPlan,
  UserProfile,
  NutritionGoals,
  DayMealPlan,
  Meal,
} from "@shared/diet-api";

// Sample meal database (in a real app, this would be a proper database)
const sampleMeals: Meal[] = [
  // Breakfast options
  {
    type: "breakfast",
    name: "Quinoa Berry Bowl",
    calories: 350,
    protein: 12,
    carbs: 45,
    fat: 15,
    prep_time: 15,
    image:
      "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400&h=300&fit=crop",
    description:
      "A nutritious start to your day with quinoa, mixed berries, and almond milk",
    ingredients: [
      "1 cup cooked quinoa",
      "1/2 cup mixed berries",
      "1/4 cup almonds",
      "1 tbsp honey",
      "1/2 cup almond milk",
    ],
    instructions: [
      "Cook quinoa according to package instructions",
      "Top with fresh berries and almonds",
      "Drizzle with honey and serve with almond milk",
    ],
    tags: ["vegan", "high-protein", "gluten-free"],
  },
  {
    type: "breakfast",
    name: "Avocado Toast with Poached Egg",
    calories: 380,
    protein: 15,
    carbs: 30,
    fat: 22,
    prep_time: 12,
    image:
      "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400&h=300&fit=crop",
    description:
      "Whole grain toast topped with creamy avocado and a perfectly poached egg",
    ingredients: [
      "2 slices whole grain bread",
      "1 ripe avocado",
      "2 eggs",
      "Salt and pepper",
      "Red pepper flakes",
    ],
    instructions: [
      "Toast bread until golden",
      "Mash avocado and spread on toast",
      "Poach eggs and place on top",
    ],
    tags: ["vegetarian", "high-fiber", "protein"],
  },

  // Lunch options
  {
    type: "lunch",
    name: "Mediterranean Chickpea Salad",
    calories: 450,
    protein: 18,
    carbs: 55,
    fat: 20,
    prep_time: 20,
    image:
      "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop",
    description:
      "Fresh and vibrant salad with chickpeas, vegetables, and tahini dressing",
    ingredients: [
      "1 can chickpeas, drained",
      "2 cups mixed greens",
      "1 cucumber, diced",
      "1/2 red onion, sliced",
      "2 tbsp tahini",
      "1 lemon, juiced",
    ],
    instructions: [
      "Rinse and drain chickpeas",
      "Combine all vegetables in a large bowl",
      "Whisk tahini with lemon juice and pour over salad",
    ],
    tags: ["vegetarian", "high-fiber", "mediterranean"],
  },
  {
    type: "lunch",
    name: "Turkey and Hummus Wrap",
    calories: 420,
    protein: 25,
    carbs: 45,
    fat: 18,
    prep_time: 10,
    image:
      "https://images.unsplash.com/photo-1551782450-17144efb9c50?w=400&h=300&fit=crop",
    description:
      "Lean turkey wrapped with fresh vegetables and hummus in a whole wheat tortilla",
    ingredients: [
      "1 whole wheat tortilla",
      "4 oz sliced turkey",
      "3 tbsp hummus",
      "Lettuce, tomato, cucumber",
      "Red bell pepper",
    ],
    instructions: [
      "Spread hummus on tortilla",
      "Layer turkey and vegetables",
      "Roll tightly and slice in half",
    ],
    tags: ["high-protein", "portable", "balanced", "non-vegetarian", "meat"],
  },

  // Dinner options
  {
    type: "dinner",
    name: "Grilled Salmon with Sweet Potato",
    calories: 550,
    protein: 40,
    carbs: 35,
    fat: 25,
    prep_time: 30,
    image:
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop",
    description:
      "Perfectly grilled salmon with roasted sweet potato and steamed broccoli",
    ingredients: [
      "6 oz salmon fillet",
      "1 medium sweet potato",
      "1 cup broccoli",
      "2 tbsp olive oil",
      "Lemon slices",
      "Herbs for seasoning",
    ],
    instructions: [
      "Season salmon with herbs and grill for 4-5 minutes per side",
      "Roast sweet potato at 400°F for 25 minutes",
      "Steam broccoli until tender",
    ],
    tags: ["high-protein", "omega-3", "low-carb", "non-vegetarian", "fish"],
  },
  {
    type: "dinner",
    name: "Vegetable Stir-fry with Tofu",
    calories: 480,
    protein: 22,
    carbs: 45,
    fat: 18,
    prep_time: 25,
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop",
    description:
      "Colorful mix of fresh vegetables stir-fried with protein-rich tofu",
    ingredients: [
      "6 oz firm tofu",
      "2 cups mixed vegetables",
      "1 cup brown rice",
      "2 tbsp soy sauce",
      "1 tbsp sesame oil",
      "Ginger and garlic",
    ],
    instructions: [
      "Press and cube tofu, then pan-fry until golden",
      "Stir-fry vegetables with garlic and ginger",
      "Combine with tofu and serve over rice",
    ],
    tags: ["vegan", "high-protein", "asian"],
  },

  // Snack options
  {
    type: "snack",
    name: "Greek Yogurt with Nuts",
    calories: 250,
    protein: 20,
    carbs: 15,
    fat: 12,
    prep_time: 5,
    image:
      "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop",
    description: "Creamy Greek yogurt topped with mixed nuts and honey",
    ingredients: [
      "1 cup Greek yogurt",
      "1/4 cup mixed nuts",
      "1 tsp honey",
      "Cinnamon to taste",
    ],
    instructions: [
      "Add yogurt to bowl",
      "Top with nuts and drizzle with honey",
      "Sprinkle with cinnamon",
    ],
    tags: ["high-protein", "probiotics", "quick"],
  },
  {
    type: "snack",
    name: "Apple with Almond Butter",
    calories: 220,
    protein: 8,
    carbs: 25,
    fat: 12,
    prep_time: 2,
    image:
      "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&h=300&fit=crop",
    description: "Crisp apple slices with creamy almond butter",
    ingredients: ["1 medium apple", "2 tbsp almond butter"],
    instructions: [
      "Core and slice apple",
      "Serve with almond butter for dipping",
    ],
    tags: ["natural", "fiber", "healthy-fats"],
  },
];

// Calculate TDEE and nutrition goals
function calculateNutritionGoals(profile: UserProfile): NutritionGoals {
  // Mifflin-St Jeor Equation
  let bmr: number;
  if (profile.gender === "male") {
    bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5;
  } else {
    bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161;
  }

  // Activity multipliers
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    very: 1.725,
  };

  const tdee = bmr * activityMultipliers[profile.activityLevel];

  // Adjust calories based on goal
  let dailyCalories: number;
  switch (profile.goal) {
    case "lose":
      dailyCalories = tdee - 500; // 500 calorie deficit for ~1 lb/week loss
      break;
    case "gain":
      dailyCalories = tdee + 300; // 300 calorie surplus for healthy weight gain
      break;
    default:
      dailyCalories = tdee;
  }

  // Macronutrient distribution (rough guidelines)
  const dailyProtein = profile.weight * 1.6; // 1.6g per kg body weight
  const dailyFat = (dailyCalories * 0.25) / 9; // 25% of calories from fat
  const dailyCarbs = (dailyCalories - dailyProtein * 4 - dailyFat * 9) / 4;

  return {
    dailyCalories: Math.round(dailyCalories),
    dailyProtein: Math.round(dailyProtein),
    dailyCarbs: Math.round(dailyCarbs),
    dailyFat: Math.round(dailyFat),
    tdee: Math.round(tdee),
  };
}

// Filter meals based on dietary preferences
function filterMealsByDiet(meals: Meal[], profile: UserProfile): Meal[] {
  return meals.filter((meal) => {
    // Define non-vegetarian ingredients
    const meatIngredients = [
      "beef",
      "chicken",
      "turkey",
      "pork",
      "lamb",
      "bacon",
      "ham",
      "sausage",
      "salmon",
      "tuna",
      "fish",
      "shrimp",
      "crab",
      "lobster",
      "seafood",
      "meat",
    ];

    const animalProducts = [
      "milk",
      "cheese",
      "yogurt",
      "butter",
      "cream",
      "eggs",
      "honey",
    ];

    // Check if meal contains meat or fish
    const hasMeatOrFish =
      meal.tags.includes("non-vegetarian") ||
      meal.tags.includes("meat") ||
      meal.tags.includes("fish") ||
      meal.ingredients.some((ingredient) =>
        meatIngredients.some((meat) =>
          ingredient.toLowerCase().includes(meat.toLowerCase()),
        ),
      );

    // Check if meal contains any animal products
    const hasAnimalProducts = meal.ingredients.some((ingredient) =>
      animalProducts.some((animal) =>
        ingredient.toLowerCase().includes(animal.toLowerCase()),
      ),
    );

    // Filter by diet type
    if (profile.dietType === "vegan") {
      // Vegans: exclude all animal products
      if (!meal.tags.includes("vegan") || hasMeatOrFish || hasAnimalProducts) {
        return false;
      }
    } else if (profile.dietType === "vegetarian") {
      // Vegetarians: exclude meat and fish, but allow dairy/eggs
      if (hasMeatOrFish) {
        return false;
      }
    }
    // omnivore/non-vegetarian: no restrictions

    // Filter by allergies
    for (const allergy of profile.allergies) {
      if (
        meal.tags.includes(allergy.toLowerCase()) ||
        meal.ingredients.some((ing) =>
          ing.toLowerCase().includes(allergy.toLowerCase()),
        )
      ) {
        return false;
      }
    }

    return true;
  });
}

// Generate a daily meal plan
function generateDayPlan(
  day: string,
  availableMeals: Meal[],
  goals: NutritionGoals,
  profile: UserProfile,
): DayMealPlan {
  const dayMeals: Meal[] = [];

  // Get meals by type
  const breakfasts = availableMeals.filter((m) => m.type === "breakfast");
  const lunches = availableMeals.filter((m) => m.type === "lunch");
  const dinners = availableMeals.filter((m) => m.type === "dinner");
  const snacks = availableMeals.filter((m) => m.type === "snack");

  // Select one meal of each main type
  if (breakfasts.length > 0) {
    dayMeals.push(breakfasts[Math.floor(Math.random() * breakfasts.length)]);
  }
  if (lunches.length > 0) {
    dayMeals.push(lunches[Math.floor(Math.random() * lunches.length)]);
  }
  if (dinners.length > 0) {
    dayMeals.push(dinners[Math.floor(Math.random() * dinners.length)]);
  }

  // Add snacks based on meals per day preference
  const snacksNeeded = Math.max(0, profile.mealsPerDay - 3);
  for (let i = 0; i < snacksNeeded && snacks.length > 0; i++) {
    dayMeals.push(snacks[Math.floor(Math.random() * snacks.length)]);
  }

  // Calculate totals
  const totalCalories = dayMeals.reduce((sum, meal) => sum + meal.calories, 0);
  const totalProtein = dayMeals.reduce((sum, meal) => sum + meal.protein, 0);
  const totalCarbs = dayMeals.reduce((sum, meal) => sum + meal.carbs, 0);
  const totalFat = dayMeals.reduce((sum, meal) => sum + meal.fat, 0);

  return {
    day,
    meals: dayMeals,
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFat,
  };
}

export const generateMealPlan: RequestHandler = async (req, res) => {
  try {
    const { userProfile }: GenerateMealPlanRequest = req.body;

    if (!userProfile) {
      const response: GenerateMealPlanResponse = {
        success: false,
        error: "User profile is required",
      };
      return res.status(400).json(response);
    }

    // Calculate nutrition goals
    const goals = calculateNutritionGoals(userProfile);

    // Filter meals based on dietary preferences
    const availableMeals = filterMealsByDiet(sampleMeals, userProfile);

    if (availableMeals.length === 0) {
      const response: GenerateMealPlanResponse = {
        success: false,
        error: "No meals available for your dietary preferences",
      };
      return res.status(400).json(response);
    }

    // Generate 7-day meal plan
    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    const dayPlans: DayMealPlan[] = days.map((day) =>
      generateDayPlan(day, availableMeals, goals, userProfile),
    );

    const totalWeeklyCalories = dayPlans.reduce(
      (sum, day) => sum + day.totalCalories,
      0,
    );

    const weeklyMealPlan: WeeklyMealPlan = {
      days: dayPlans,
      userProfile,
      generatedAt: new Date().toISOString(),
      totalWeeklyCalories,
      averageDailyCalories: Math.round(totalWeeklyCalories / 7),
    };

    const response: GenerateMealPlanResponse = {
      success: true,
      mealPlan: weeklyMealPlan,
    };

    res.json(response);
  } catch (error) {
    console.error("Error generating meal plan:", error);
    const response: GenerateMealPlanResponse = {
      success: false,
      error: "Internal server error",
    };
    res.status(500).json(response);
  }
};

export const getNutritionGoals: RequestHandler = async (req, res) => {
  try {
    const userProfile: UserProfile = req.body;

    if (!userProfile) {
      return res.status(400).json({ error: "User profile is required" });
    }

    const goals = calculateNutritionGoals(userProfile);
    res.json({ success: true, goals });
  } catch (error) {
    console.error("Error calculating nutrition goals:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
