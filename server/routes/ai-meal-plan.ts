import { RequestHandler } from "express";
import OpenAI from "openai";
import {
  GenerateMealPlanRequest,
  GenerateMealPlanResponse,
  WeeklyMealPlan,
  UserProfile,
  NutritionGoals,
  DayMealPlan,
  Meal,
} from "@shared/diet-api";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "demo_key",
});

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

// Create personalized AI prompt for meal generation
function createMealPlanPrompt(
  profile: UserProfile,
  goals: NutritionGoals,
): string {
  const dietaryRestrictions = [
    profile.dietType === "vegan" ? "vegan (no animal products)" : "",
    profile.dietType === "vegetarian" ? "vegetarian (no meat or fish)" : "",
    profile.allergies.length > 0
      ? `allergic to: ${profile.allergies.join(", ")}`
      : "",
    profile.restrictions.length > 0
      ? `dietary restrictions: ${profile.restrictions.join(", ")}`
      : "",
  ]
    .filter(Boolean)
    .join(", ");

  return `Create a personalized 7-day meal plan for a ${profile.age}-year-old ${profile.gender} who weighs ${profile.weight}kg and is ${profile.height}cm tall.

PERSONAL DETAILS:
- Activity Level: ${profile.activityLevel}
- Goal: ${profile.goal} weight
- Diet Type: ${profile.dietType}
- Meals per day: ${profile.mealsPerDay}
- Cooking time preference: ${profile.cookingTime}
- Dietary restrictions: ${dietaryRestrictions || "none"}

NUTRITION TARGETS (per day):
- Calories: ${goals.dailyCalories}
- Protein: ${goals.dailyProtein}g
- Carbs: ${goals.dailyCarbs}g  
- Fat: ${goals.dailyFat}g

CRITICAL ALLERGY WARNING: ${profile.allergies.length > 0 ? `This person is ALLERGIC to: ${profile.allergies.join(", ").toUpperCase()}. DO NOT include these ingredients in ANY meal, recipe, or ingredient list. This is a MEDICAL REQUIREMENT.` : "No food allergies reported."}

REQUIREMENTS:
1. Generate exactly 7 days (Monday through Sunday)
2. Each day should have ${profile.mealsPerDay} meals (breakfast, lunch, dinner${profile.mealsPerDay > 3 ? " + snacks" : ""})
3. Strictly follow the dietary restrictions (${profile.dietType})
4. ${profile.allergies.length > 0 ? `ABSOLUTELY AVOID all foods containing: ${profile.allergies.join(", ")}` : "No allergy restrictions"}
5. Include realistic cooking times based on preference (${profile.cookingTime})
6. Provide VERY DETAILED recipes with specific measurements and comprehensive step-by-step cooking instructions
7. Include high-quality, appealing meal names
8. Vary the cuisine types for interesting variety across all 7 days
9. Ensure each day has completely different meals (no repetition)
10. Ensure nutritional balance meets the targets

OUTPUT FORMAT - Return valid JSON only:
{
  "days": [
    {
      "day": "Monday",
      "meals": [
        {
          "type": "breakfast",
          "name": "Descriptive Meal Name",
          "calories": 350,
          "protein": 15,
          "carbs": 45,
          "fat": 12,
          "prep_time": 15,
                    "image": "https://images.unsplash.com/photo-[relevant-food-photo]?w=400&h=300&fit=crop",
          "description": "Appealing description of the meal",
          "ingredients": ["1 cup ingredient 1", "2 tbsp ingredient 2", "etc with specific measurements"],
          "instructions": ["Detailed step 1 with specific temperatures, times, and techniques", "Comprehensive step 2 with cooking methods and tips", "Complete step 3 with plating and serving suggestions"],
          "tags": ["relevant", "tags", "here"]
        }
      ],
      "totalCalories": 1800,
      "totalProtein": 120,
      "totalCarbs": 180,
      "totalFat": 70
    }
  ],
  "userProfile": ${JSON.stringify(profile)},
  "generatedAt": "${new Date().toISOString()}",
  "totalWeeklyCalories": 12600,
  "averageDailyCalories": 1800
}

Generate creative, delicious, and nutritionally balanced meals that this person will actually want to eat!`;
}

// Check if ingredient contains any allergens
function containsAllergen(ingredient: string, allergies: string[]): boolean {
  return allergies.some((allergy) =>
    ingredient.toLowerCase().includes(allergy.toLowerCase()),
  );
}

// Filter meal ingredients to exclude allergens
function filterAllergens(ingredients: string[], allergies: string[]): string[] {
  return ingredients.filter(
    (ingredient) => !containsAllergen(ingredient, allergies),
  );
}

// Fallback meal plan generator with allergy-safe variety
function generateFallbackMealPlan(
  profile: UserProfile,
  goals: NutritionGoals,
): WeeklyMealPlan {
  console.log("Using fallback meal plan generation with allergy filtering");

  // Define meal options by category that respect dietary restrictions
  const mealDatabase = {
    vegan: {
      breakfasts: [
        {
          name: "Overnight Oats with Berries",
          base_ingredients: [
            "rolled oats",
            "oat milk",
            "chia seeds",
            "mixed berries",
            "maple syrup",
          ],
          description:
            "Creamy overnight oats with fresh berries and plant-based milk",
        },
        {
          name: "Avocado Toast with Hummus",
          base_ingredients: [
            "whole grain bread",
            "avocado",
            "hummus",
            "tomatoes",
            "hemp seeds",
          ],
          description:
            "Protein-rich toast with creamy avocado and chickpea hummus",
        },
        {
          name: "Green Smoothie Bowl",
          base_ingredients: [
            "spinach",
            "banana",
            "mango",
            "coconut milk",
            "granola",
            "coconut flakes",
          ],
          description:
            "Nutrient-packed green smoothie bowl with tropical fruits",
        },
        {
          name: "Chia Pudding Parfait",
          base_ingredients: [
            "chia seeds",
            "almond milk",
            "vanilla",
            "strawberries",
            "chopped almonds",
          ],
          description: "Protein-rich chia pudding layered with fresh fruit",
        },
      ],
      lunches: [
        {
          name: "Mediterranean Quinoa Bowl",
          base_ingredients: [
            "quinoa",
            "chickpeas",
            "cucumber",
            "tomatoes",
            "olives",
            "tahini",
          ],
          description:
            "Mediterranean-inspired bowl with protein-rich quinoa and fresh vegetables",
        },
        {
          name: "Lentil Soup with Bread",
          base_ingredients: [
            "red lentils",
            "vegetables",
            "vegetable broth",
            "whole grain bread",
            "olive oil",
          ],
          description:
            "Hearty lentil soup packed with plant protein and vegetables",
        },
        {
          name: "Buddha Bowl",
          base_ingredients: [
            "brown rice",
            "roasted vegetables",
            "tofu",
            "avocado",
            "sesame seeds",
          ],
          description:
            "Colorful Buddha bowl with roasted vegetables and marinated tofu",
        },
      ],
      dinners: [
        {
          name: "Vegetable Stir-fry with Tofu",
          base_ingredients: [
            "firm tofu",
            "mixed vegetables",
            "brown rice",
            "soy sauce",
            "sesame oil",
          ],
          description:
            "Asian-inspired stir-fry with protein-rich tofu and fresh vegetables",
        },
        {
          name: "Lentil Curry with Rice",
          base_ingredients: [
            "red lentils",
            "coconut milk",
            "curry spices",
            "brown rice",
            "spinach",
          ],
          description:
            "Creamy lentil curry with aromatic spices served over brown rice",
        },
        {
          name: "Stuffed Bell Peppers",
          base_ingredients: [
            "bell peppers",
            "quinoa",
            "black beans",
            "corn",
            "tomatoes",
          ],
          description:
            "Colorful bell peppers stuffed with quinoa and black bean mixture",
        },
      ],
    },
    vegetarian: {
      breakfasts: [
        {
          name: "Greek Yogurt Parfait",
          base_ingredients: [
            "Greek yogurt",
            "granola",
            "honey",
            "mixed berries",
            "chopped walnuts",
          ],
          description:
            "Protein-rich Greek yogurt layered with fresh fruits and nuts",
        },
        {
          name: "Vegetable Omelet",
          base_ingredients: [
            "eggs",
            "spinach",
            "mushrooms",
            "cheese",
            "whole grain toast",
          ],
          description: "Fluffy omelet packed with fresh vegetables and cheese",
        },
        {
          name: "Pancakes with Fruit",
          base_ingredients: [
            "whole wheat flour",
            "milk",
            "eggs",
            "fresh berries",
            "maple syrup",
          ],
          description: "Whole wheat pancakes topped with fresh seasonal fruit",
        },
        {
          name: "Breakfast Burrito",
          base_ingredients: [
            "whole wheat tortilla",
            "scrambled eggs",
            "cheese",
            "avocado",
            "salsa",
          ],
          description: "Protein-packed breakfast burrito with fresh avocado",
        },
      ],
      lunches: [
        {
          name: "Caprese Salad with Bread",
          base_ingredients: [
            "fresh mozzarella",
            "tomatoes",
            "basil",
            "balsamic vinegar",
            "whole grain bread",
          ],
          description:
            "Classic Italian salad with fresh mozzarella and ripe tomatoes",
        },
        {
          name: "Vegetarian Pasta",
          base_ingredients: [
            "whole wheat pasta",
            "marinara sauce",
            "vegetables",
            "parmesan cheese",
            "olive oil",
          ],
          description:
            "Hearty pasta with seasonal vegetables and rich tomato sauce",
        },
        {
          name: "Grilled Cheese & Soup",
          base_ingredients: [
            "whole grain bread",
            "cheese",
            "tomato soup",
            "butter",
          ],
          description:
            "Classic comfort food combination with whole grain bread",
        },
      ],
      dinners: [
        {
          name: "Vegetarian Lasagna",
          base_ingredients: [
            "lasagna noodles",
            "ricotta cheese",
            "vegetables",
            "marinara sauce",
            "mozzarella",
          ],
          description:
            "Layered pasta dish with creamy ricotta and fresh vegetables",
        },
        {
          name: "Mushroom Risotto",
          base_ingredients: [
            "arborio rice",
            "mushrooms",
            "vegetable broth",
            "parmesan cheese",
            "white wine",
          ],
          description: "Creamy risotto with sautéed mushrooms and parmesan",
        },
        {
          name: "Stuffed Eggplant",
          base_ingredients: [
            "eggplant",
            "quinoa",
            "tomatoes",
            "cheese",
            "herbs",
          ],
          description:
            "Mediterranean-style stuffed eggplant with quinoa filling",
        },
      ],
    },
    omnivore: {
      breakfasts: [
        {
          name: "Protein Scramble",
          base_ingredients: [
            "eggs",
            "turkey bacon",
            "vegetables",
            "cheese",
            "whole grain toast",
          ],
          description: "High-protein breakfast scramble with lean turkey bacon",
        },
        {
          name: "Smoothie Bowl",
          base_ingredients: [
            "protein powder",
            "banana",
            "berries",
            "granola",
            "almond butter",
          ],
          description:
            "Protein-packed smoothie bowl with fresh fruits and nuts",
        },
        {
          name: "Oatmeal with Protein",
          base_ingredients: ["oats", "protein powder", "milk", "nuts", "fruit"],
          description:
            "Hearty oatmeal enhanced with protein powder and fresh toppings",
        },
      ],
      lunches: [
        {
          name: "Chicken Salad",
          base_ingredients: [
            "grilled chicken",
            "mixed greens",
            "vegetables",
            "olive oil dressing",
          ],
          description:
            "Fresh salad with grilled chicken and seasonal vegetables",
        },
        {
          name: "Turkey Wrap",
          base_ingredients: [
            "whole wheat tortilla",
            "turkey",
            "vegetables",
            "hummus",
          ],
          description: "Lean turkey wrap with fresh vegetables and hummus",
        },
        {
          name: "Salmon Bowl",
          base_ingredients: ["salmon", "quinoa", "vegetables", "avocado"],
          description: "Nutritious bowl with omega-3 rich salmon and quinoa",
        },
      ],
      dinners: [
        {
          name: "Grilled Chicken Dinner",
          base_ingredients: [
            "chicken breast",
            "sweet potato",
            "broccoli",
            "olive oil",
          ],
          description:
            "Lean grilled chicken with roasted sweet potato and steamed broccoli",
        },
        {
          name: "Fish and Vegetables",
          base_ingredients: ["white fish", "vegetables", "brown rice", "herbs"],
          description: "Baked fish with seasonal vegetables and brown rice",
        },
        {
          name: "Lean Beef Stir-fry",
          base_ingredients: [
            "lean beef",
            "vegetables",
            "brown rice",
            "soy sauce",
          ],
          description: "Quick stir-fry with lean beef and fresh vegetables",
        },
      ],
    },
  };

  const createMealForDay = (day: string, dayIndex: number): DayMealPlan => {
    const meals: Meal[] = [];
    const dietMeals = mealDatabase[profile.dietType] || mealDatabase.omnivore;

    // Select different meals for each day to ensure variety
    const breakfastOption =
      dietMeals.breakfasts[dayIndex % dietMeals.breakfasts.length];
    const lunchOption = dietMeals.lunches[dayIndex % dietMeals.lunches.length];
    const dinnerOption = dietMeals.dinners[dayIndex % dietMeals.dinners.length];

    // Filter ingredients to remove allergens
    const safeBreakfastIngredients = filterAllergens(
      breakfastOption.base_ingredients,
      profile.allergies,
    );
    const safeLunchIngredients = filterAllergens(
      lunchOption.base_ingredients,
      profile.allergies,
    );
    const safeDinnerIngredients = filterAllergens(
      dinnerOption.base_ingredients,
      profile.allergies,
    );

    // If all ingredients are filtered out due to allergies, use safe alternatives
    if (safeBreakfastIngredients.length === 0) {
      safeBreakfastIngredients.push("oats", "plant milk", "fruit", "nuts");
    }
    if (safeLunchIngredients.length === 0) {
      safeLunchIngredients.push("vegetables", "beans", "rice", "olive oil");
    }
    if (safeDinnerIngredients.length === 0) {
      safeDinnerIngredients.push(
        "vegetables",
        "quinoa",
        "plant protein",
        "herbs",
      );
    }

    // Create breakfast
    meals.push({
      type: "breakfast",
      name: breakfastOption.name,
      calories: Math.round(goals.dailyCalories * 0.25),
      protein: Math.round(goals.dailyProtein * 0.2),
      carbs: Math.round(goals.dailyCarbs * 0.3),
      fat: Math.round(goals.dailyFat * 0.2),
      prep_time: 15,
      image:
        "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400&h=300&fit=crop",
      description: breakfastOption.description,
      ingredients: safeBreakfastIngredients,
      instructions: [
        "Prepare all ingredients",
        "Follow cooking method for main components",
        "Combine and serve fresh",
      ],
      tags: [profile.dietType, "breakfast", "nutritious"],
    });

    // Create lunch
    meals.push({
      type: "lunch",
      name: lunchOption.name,
      calories: Math.round(goals.dailyCalories * 0.35),
      protein: Math.round(goals.dailyProtein * 0.4),
      carbs: Math.round(goals.dailyCarbs * 0.35),
      fat: Math.round(goals.dailyFat * 0.35),
      prep_time: 25,
      image:
        "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop",
      description: lunchOption.description,
      ingredients: safeLunchIngredients,
      instructions: [
        "Prep all ingredients",
        "Cook main components according to recipe",
        "Combine and season to taste",
      ],
      tags: [profile.dietType, "lunch", "balanced"],
    });

    // Create dinner
    meals.push({
      type: "dinner",
      name: dinnerOption.name,
      calories: Math.round(goals.dailyCalories * 0.4),
      protein: Math.round(goals.dailyProtein * 0.4),
      carbs: Math.round(goals.dailyCarbs * 0.35),
      fat: Math.round(goals.dailyFat * 0.45),
      prep_time: 35,
      image:
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop",
      description: dinnerOption.description,
      ingredients: safeDinnerIngredients,
      instructions: [
        "Prepare all ingredients",
        "Cook main dish according to method",
        "Plate and serve hot",
      ],
      tags: [profile.dietType, "dinner", "satisfying"],
    });

    const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
    const totalProtein = meals.reduce((sum, meal) => sum + meal.protein, 0);
    const totalCarbs = meals.reduce((sum, meal) => sum + meal.carbs, 0);
    const totalFat = meals.reduce((sum, meal) => sum + meal.fat, 0);

    return {
      day,
      meals,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
    };
  };

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ].map((day, index) => createMealForDay(day, index));

  const totalWeeklyCalories = days.reduce(
    (sum, day) => sum + day.totalCalories,
    0,
  );

  return {
    days,
    userProfile: profile,
    generatedAt: new Date().toISOString(),
    totalWeeklyCalories,
    averageDailyCalories: Math.round(totalWeeklyCalories / 7),
  };
}

export const generateAIMealPlan: RequestHandler = async (req, res) => {
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

    let mealPlan: WeeklyMealPlan;

    // Check if OpenAI API key is available
    if (
      process.env.OPENAI_API_KEY &&
      process.env.OPENAI_API_KEY !== "demo_key"
    ) {
      try {
        console.log("Generating AI-powered meal plan...");

        const prompt = createMealPlanPrompt(userProfile, goals);

        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are a professional nutritionist and chef. Generate personalized, realistic, and delicious meal plans in valid JSON format. Focus on nutritional balance, dietary restrictions, and user preferences.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 4000,
        });

        const aiResponse = completion.choices[0]?.message?.content;

        if (!aiResponse) {
          throw new Error("No response from AI");
        }

        // Parse the AI response
        const parsedPlan = JSON.parse(aiResponse);
        mealPlan = parsedPlan;

        console.log("AI meal plan generated successfully");
      } catch (aiError) {
        console.error("AI generation failed, using fallback:", aiError);
        mealPlan = generateFallbackMealPlan(userProfile, goals);
      }
    } else {
      console.log("No OpenAI API key configured, using fallback meal plan");
      mealPlan = generateFallbackMealPlan(userProfile, goals);
    }

    const response: GenerateMealPlanResponse = {
      success: true,
      mealPlan,
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
