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
6. Provide detailed recipes with ingredients and instructions
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
          "ingredients": ["ingredient 1", "ingredient 2", "etc"],
          "instructions": ["step 1", "step 2", "etc"],
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

// Fallback meal plan generator (for when OpenAI is unavailable)
function generateFallbackMealPlan(
  profile: UserProfile,
  goals: NutritionGoals,
): WeeklyMealPlan {
  console.log("Using fallback meal plan generation");

  // Create a basic meal template based on dietary preferences
  const createMealForDay = (day: string): DayMealPlan => {
    const meals: Meal[] = [];

    // Breakfast
    if (profile.dietType === "vegan") {
      meals.push({
        type: "breakfast",
        name: "Overnight Oats with Berries",
        calories: Math.round(goals.dailyCalories * 0.2),
        protein: Math.round(goals.dailyProtein * 0.15),
        carbs: Math.round(goals.dailyCarbs * 0.25),
        fat: Math.round(goals.dailyFat * 0.15),
        prep_time: 10,
        image:
          "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400&h=300&fit=crop",
        description:
          "Creamy overnight oats with fresh berries and plant-based milk",
        ingredients: [
          "1/2 cup rolled oats",
          "1 cup oat milk",
          "1 tbsp chia seeds",
          "1/2 cup mixed berries",
          "1 tbsp maple syrup",
        ],
        instructions: [
          "Mix oats, milk, and chia seeds",
          "Refrigerate overnight",
          "Top with berries and maple syrup",
        ],
        tags: ["vegan", "high-fiber", "make-ahead"],
      });
    } else if (profile.dietType === "vegetarian") {
      meals.push({
        type: "breakfast",
        name: "Avocado Toast with Scrambled Eggs",
        calories: Math.round(goals.dailyCalories * 0.2),
        protein: Math.round(goals.dailyProtein * 0.2),
        carbs: Math.round(goals.dailyCarbs * 0.2),
        fat: Math.round(goals.dailyFat * 0.25),
        prep_time: 12,
        image:
          "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400&h=300&fit=crop",
        description:
          "Whole grain toast with creamy avocado and fluffy scrambled eggs",
        ingredients: [
          "2 slices whole grain bread",
          "1 ripe avocado",
          "2 eggs",
          "Salt and pepper",
          "Cherry tomatoes",
        ],
        instructions: [
          "Toast bread",
          "Mash avocado and spread on toast",
          "Scramble eggs and serve on top",
        ],
        tags: ["vegetarian", "high-protein", "quick"],
      });
    } else {
      meals.push({
        type: "breakfast",
        name: "Protein Smoothie Bowl",
        calories: Math.round(goals.dailyCalories * 0.2),
        protein: Math.round(goals.dailyProtein * 0.25),
        carbs: Math.round(goals.dailyCarbs * 0.2),
        fat: Math.round(goals.dailyFat * 0.15),
        prep_time: 8,
        image:
          "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400&h=300&fit=crop",
        description: "Protein-packed smoothie bowl with fresh fruits and nuts",
        ingredients: [
          "1 scoop protein powder",
          "1 banana",
          "1/2 cup berries",
          "1 tbsp almond butter",
          "Granola",
        ],
        instructions: [
          "Blend protein powder with banana and milk",
          "Pour into bowl",
          "Top with berries, nuts, and granola",
        ],
        tags: ["high-protein", "quick", "energizing"],
      });
    }

    // Add lunch and dinner based on dietary preferences
    // ... (similar logic for other meals)

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
  ].map((day) => createMealForDay(day));

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
