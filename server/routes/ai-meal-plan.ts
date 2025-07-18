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

CRITICAL GOAL-BASED MEAL REQUIREMENTS:
${profile.goal === "lose" ? "- WEIGHT LOSS FOCUS: Prioritize high-protein, low-calorie, nutrient-dense meals. Choose lean proteins, non-starchy vegetables, and complex carbs. Avoid fried foods, heavy sauces, and high-calorie ingredients. Create satisfying meals under calorie targets that promote fat loss." : ""}
${profile.goal === "gain" ? "- WEIGHT GAIN FOCUS: Prioritize calorie-dense, nutrient-rich meals with healthy fats and protein. Include nuts, avocados, whole grains, and larger portions. Add extra olive oil, nut butters, and protein-rich ingredients. Create hearty, filling meals for muscle building." : ""}
${profile.goal === "maintain" ? "- WEIGHT MAINTENANCE FOCUS: Create balanced, sustainable meals with moderate portions. Include good variety of proteins, carbs, and healthy fats. Focus on nutritional balance and meal satisfaction for long-term adherence." : ""}

CRITICAL DIETARY REQUIREMENTS:
${profile.dietType === "vegan" ? "- VEGAN ONLY: NO animal products whatsoever. No meat, fish, dairy, eggs, honey, or any animal-derived ingredients." : ""}
${profile.dietType === "vegetarian" ? "- VEGETARIAN ONLY: NO meat or fish. Dairy and eggs are allowed, but absolutely no chicken, beef, pork, fish, seafood, or any meat products." : ""}
${profile.dietType === "omnivore" ? "- OMNIVORE: All food types allowed including meat, fish, dairy, and plant foods." : ""}

CRITICAL ALLERGY WARNING: ${profile.allergies.length > 0 ? `This person is ALLERGIC to: ${profile.allergies.join(", ").toUpperCase()}. DO NOT include these ingredients in ANY meal, recipe, or ingredient list. This is a MEDICAL REQUIREMENT.` : "No food allergies reported."}

REQUIREMENTS:
1. Generate exactly 7 days (Monday through Sunday)
2. Each day should have ${profile.mealsPerDay} meals (breakfast, lunch, dinner${profile.mealsPerDay > 3 ? " + snacks" : ""})
3. STRICTLY ADHERE to the ${profile.dietType.toUpperCase()} diet - this is NON-NEGOTIABLE
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
  console.log(`Generating fallback meals for diet type: ${profile.dietType}`);

  const mealDatabase = {
    vegan: {
      breakfasts: [
        {
          name: "Overnight Oats with Berries",
          base_ingredients: [
            "1/2 cup rolled oats",
            "1 cup oat milk",
            "2 tbsp chia seeds",
            "1/2 cup mixed berries",
            "1 tbsp maple syrup",
          ],
          description:
            "Creamy overnight oats with fresh berries and plant-based milk",
          instructions: [
            "In a mason jar or bowl, combine 1/2 cup rolled oats with 2 tbsp chia seeds",
            "Pour in 1 cup of oat milk and stir thoroughly to prevent clumping",
            "Add 1 tbsp maple syrup and mix well to distribute sweetness evenly",
            "Cover tightly and refrigerate for at least 4 hours or overnight for best texture",
            "In the morning, stir the mixture to break up any settled ingredients",
            "Top with 1/2 cup fresh mixed berries (blueberries, strawberries, raspberries)",
            "Optional: add extra toppings like chopped nuts, coconut flakes, or additional maple syrup",
            "Serve chilled and enjoy within 2-3 days for optimal freshness",
          ],
        },
        {
          name: "Avocado Toast with Hummus",
          base_ingredients: [
            "2 slices whole grain bread",
            "1 ripe avocado",
            "3 tbsp hummus",
            "1 medium tomato",
            "1 tbsp hemp seeds",
          ],
          description:
            "Protein-rich toast with creamy avocado and chickpea hummus",
          instructions: [
            "Toast 2 slices of whole grain bread until golden brown and crispy",
            "While bread is toasting, cut 1 ripe avocado in half and remove the pit",
            "Scoop avocado flesh into a bowl and mash with a fork until creamy but still slightly chunky",
            "Season mashed avocado with a pinch of salt, pepper, and optional lemon juice",
            "Spread 1.5 tbsp hummus evenly on each slice of toasted bread",
            "Layer the mashed avocado on top of the hummus",
            "Slice 1 medium tomato into 1/4-inch thick rounds",
            "Arrange tomato slices on top of the avocado",
            "Sprinkle 1 tbsp hemp seeds over each toast for added protein and crunch",
            "Serve immediately while toast is still warm and crispy",
          ],
        },
        {
          name: "Green Smoothie Bowl",
          base_ingredients: [
            "2 cups fresh spinach",
            "1 frozen banana",
            "1/2 cup frozen mango",
            "1/2 cup coconut milk",
            "1/4 cup granola",
            "2 tbsp coconut flakes",
          ],
          description:
            "Nutrient-packed green smoothie bowl with tropical fruits",
          instructions: [
            "Add 2 cups fresh spinach to blender first (this helps with blending)",
            "Add 1 frozen banana (broken into chunks) and 1/2 cup frozen mango pieces",
            "Pour in 1/2 cup coconut milk - start with less and add more if needed for consistency",
            "Blend on high speed for 60-90 seconds until completely smooth and creamy",
            "Stop and scrape down sides of blender if needed, then blend again",
            "The mixture should be thick enough to eat with a spoon, not drink",
            "Pour smoothie into a chilled bowl for best presentation",
            "Arrange toppings in rows or sections: 1/4 cup granola on one side",
            "Sprinkle 2 tbsp coconut flakes across the surface",
            "Add extra fresh fruit if desired (berries, sliced banana, kiwi)",
            "Serve immediately while cold and enjoy with a spoon",
          ],
        },
        {
          name: "Chia Pudding Parfait",
          base_ingredients: [
            "3 tbsp chia seeds",
            "1 cup almond milk",
            "1 tsp vanilla extract",
            "1 cup sliced strawberries",
            "1/4 cup chopped almonds",
          ],
          description: "Protein-rich chia pudding layered with fresh fruit",
          instructions: [
            "In a medium bowl, whisk together 3 tbsp chia seeds with 1 cup almond milk",
            "Add 1 tsp vanilla extract and whisk vigorously for 2 minutes to prevent clumping",
            "Let mixture sit for 5 minutes, then whisk again to break up any clumps",
            "Cover and refrigerate for at least 2 hours or overnight until thick and pudding-like",
            "While chia pudding sets, wash and slice 1 cup of fresh strawberries",
            "Roughly chop 1/4 cup almonds for added texture and protein",
            "To assemble: spoon 1/3 of chia pudding into bottom of glass or jar",
            "Layer with 1/3 of sliced strawberries and sprinkle with chopped almonds",
            "Repeat layers two more times, ending with strawberries and almonds on top",
            "Serve chilled and consume within 3 days for best quality",
            "Tip: Make several servings at once for easy grab-and-go breakfasts",
          ],
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
            "1 cup Greek yogurt",
            "1/3 cup granola",
            "2 tbsp honey",
            "1/2 cup mixed berries",
            "1/4 cup chopped walnuts",
          ],
          description:
            "Protein-rich Greek yogurt layered with fresh fruits and nuts",
          instructions: [
            "Start with a clear glass or jar to showcase the beautiful layers",
            "Spoon 1/3 of the Greek yogurt into the bottom of the container",
            "Drizzle with 1/2 tbsp honey and gently swirl with a knife for marbled effect",
            "Add a layer of 1/3 of the mixed berries and 1/3 of the granola",
            "Repeat layering process: yogurt, honey, berries, granola",
            "Finish with final layer of yogurt on top",
            "Sprinkle chopped walnuts evenly across the surface",
            "Drizzle remaining honey on top for extra sweetness",
            "Refrigerate for 10 minutes to let granola soften slightly",
            "Serve chilled with a long spoon to enjoy all layers together",
          ],
        },
        {
          name: "Vegetable Omelet",
          base_ingredients: [
            "3 large eggs",
            "1 cup fresh spinach",
            "1/2 cup sliced mushrooms",
            "1/4 cup shredded cheese",
            "2 slices whole grain toast",
          ],
          description: "Fluffy omelet packed with fresh vegetables and cheese",
          instructions: [
            "Heat 1 tbsp oil or butter in a non-stick 8-inch pan over medium heat",
            "Sauté sliced mushrooms for 3-4 minutes until golden and moisture evaporates",
            "Add spinach to pan and cook for 1-2 minutes until wilted, then remove vegetables",
            "In a bowl, whisk 3 eggs with 2 tbsp water, salt, and pepper until well combined",
            "Add a bit more butter to the pan and heat until foaming subsides",
            "Pour beaten eggs into pan, tilting to distribute evenly across bottom",
            "Let eggs set for 30 seconds, then gently push edges toward center with spatula",
            "Tilt pan to let uncooked egg flow underneath the cooked portion",
            "When eggs are almost set but still slightly wet on top, add vegetables to one half",
            "Sprinkle cheese over vegetables and let melt for 30 seconds",
            "Carefully fold omelet in half using spatula, covering the filling",
            "Slide onto plate and serve immediately with toasted whole grain bread",
            "Garnish with fresh herbs if desired for added flavor and color",
          ],
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
          name: "Grilled Chicken Caesar Salad",
          base_ingredients: [
            "6 oz grilled chicken breast",
            "romaine lettuce",
            "parmesan cheese",
            "caesar dressing",
            "croutons",
          ],
          description:
            "Classic Caesar salad with perfectly seasoned grilled chicken",
          instructions: [
            "Season 6 oz chicken breast with salt, pepper, and garlic powder",
            "Grill chicken for 6-7 minutes per side until internal temp reaches 165°F",
            "Let chicken rest for 5 minutes, then slice into strips",
            "Wash and chop romaine lettuce into bite-sized pieces",
            "Toss lettuce with Caesar dressing until well coated",
            "Top with sliced chicken, parmesan cheese, and croutons",
          ],
        },
        {
          name: "Turkey and Bacon Club Wrap",
          base_ingredients: [
            "whole wheat tortilla",
            "4 oz sliced turkey",
            "3 strips bacon",
            "lettuce",
            "tomato",
            "mayo",
          ],
          description:
            "Hearty wrap with turkey, crispy bacon, and fresh vegetables",
          instructions: [
            "Cook 3 strips of bacon until crispy, then drain on paper towels",
            "Warm tortilla in microwave for 15 seconds",
            "Spread thin layer of mayo across the tortilla",
            "Layer turkey, crispy bacon, lettuce, and tomato",
            "Roll tightly and cut diagonally in half",
          ],
        },
        {
          name: "Salmon Teriyaki Bowl",
          base_ingredients: [
            "6 oz salmon fillet",
            "jasmine rice",
            "broccoli",
            "teriyaki sauce",
            "sesame seeds",
          ],
          description:
            "Asian-inspired bowl with glazed salmon and steamed vegetables",
          instructions: [
            "Marinate salmon in teriyaki sauce for 30 minutes",
            "Cook jasmine rice according to package directions",
            "Steam broccoli until bright green and tender-crisp",
            "Pan-sear salmon skin-side down for 4 minutes, then flip",
            "Serve salmon over rice with broccoli and sesame seeds",
          ],
        },
        {
          name: "Beef Stir-Fry",
          base_ingredients: [
            "6 oz lean beef strips",
            "mixed bell peppers",
            "snap peas",
            "brown rice",
            "soy sauce",
            "fresh ginger",
          ],
          description: "Quick stir-fry with tender beef and crisp vegetables",
          instructions: [
            "Slice beef into thin strips against the grain",
            "Heat oil in wok over high heat until smoking",
            "Stir-fry beef for 2-3 minutes until browned",
            "Add vegetables and stir-fry 3-4 minutes until crisp-tender",
            "Add soy sauce and ginger, stir-fry 1 more minute",
            "Serve hot over cooked brown rice",
          ],
        },
      ],
      dinners: [
        {
          name: "Herb-Crusted Chicken with Roasted Vegetables",
          base_ingredients: [
            "6 oz chicken breast",
            "sweet potato",
            "brussels sprouts",
            "olive oil",
            "fresh herbs",
          ],
          description:
            "Juicy herb-crusted chicken with perfectly roasted root vegetables",
          instructions: [
            "Preheat oven to 425°F and line baking sheet with parchment",
            "Rub chicken breast with olive oil, salt, pepper, and fresh herbs",
            "Cut sweet potato and brussels sprouts into uniform pieces",
            "Toss vegetables with olive oil, salt, and pepper",
            "Roast vegetables for 15 minutes, then add chicken to same pan",
            "Cook for 20-25 more minutes until chicken reaches 165°F internal temp",
            "Let chicken rest 5 minutes before slicing and serving",
          ],
        },
        {
          name: "Pan-Seared Salmon with Quinoa",
          base_ingredients: [
            "6 oz salmon fillet",
            "quinoa",
            "asparagus",
            "lemon",
            "dill",
          ],
          description:
            "Perfectly seared salmon with fluffy quinoa and fresh asparagus",
          instructions: [
            "Cook quinoa in vegetable broth according to package directions",
            "Trim asparagus and steam until bright green and tender",
            "Season salmon with salt, pepper, and fresh dill",
            "Heat oil in pan over medium-high heat until shimmering",
            "Sear salmon skin-side up for 4 minutes, then flip carefully",
            "Cook 3-4 more minutes until fish flakes easily",
            "Serve over quinoa with asparagus and lemon wedges",
          ],
        },
        {
          name: "Lean Beef and Sweet Potato Skillet",
          base_ingredients: [
            "6 oz lean ground beef",
            "diced sweet potato",
            "bell peppers",
            "onions",
            "cumin",
          ],
          description:
            "One-pan dinner with seasoned ground beef and colorful vegetables",
          instructions: [
            "Heat large skillet over medium-high heat",
            "Cook ground beef, breaking it up with spoon until browned",
            "Remove beef and set aside, leaving 1 tbsp fat in pan",
            "Add diced sweet potato and cook 8-10 minutes until tender",
            "Add bell peppers and onions, cook 5 more minutes",
            "Return beef to pan, season with cumin, salt, and pepper",
            "Cook 2-3 more minutes until heated through",
          ],
        },
      ],
    },
  };

  const createMealForDay = (day: string, dayIndex: number): DayMealPlan => {
    const meals: Meal[] = [];

    console.log(`Creating meals for ${day}, diet type: ${profile.dietType}`);

    // Ensure we have the right diet type
    let selectedDietType = profile.dietType;
    if (!mealDatabase[selectedDietType]) {
      console.log(
        `Diet type ${selectedDietType} not found, defaulting to omnivore`,
      );
      selectedDietType = "omnivore";
    }

    const dietMeals = mealDatabase[selectedDietType];
    console.log(
      `Using diet meals for: ${selectedDietType}, breakfast options: ${dietMeals.breakfasts.length}`,
    );

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
      instructions: breakfastOption.instructions || [
        "Gather all ingredients and prepare your workspace",
        "Follow the specific preparation method for your main ingredient",
        "Combine ingredients according to recipe proportions",
        "Cook or prepare using appropriate technique (mixing, cooking, blending)",
        "Taste and adjust seasoning if needed",
        "Plate attractively and serve immediately while fresh",
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
      instructions: lunchOption.instructions || [
        "Start by washing and prepping all vegetables and ingredients",
        "Heat cooking oil in a large pan or pot over medium heat",
        "Begin with aromatics (onions, garlic) and cook until fragrant, about 2-3 minutes",
        "Add main protein or grain components and cook according to their requirements",
        "Incorporate vegetables in order of cooking time (hardest first, softest last)",
        "Season with salt, pepper, and any spices throughout the cooking process",
        "Add liquids (broth, sauces) if needed and simmer until everything is tender",
        "Taste and adjust seasoning - add more salt, acid, or spices as needed",
        "Let rest for 2-3 minutes before serving to allow flavors to meld",
        "Serve hot with any garnishes or side accompaniments",
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
      instructions: lunchOption.instructions || [
        "Preheat oven to appropriate temperature if baking (usually 375-400°F)",
        "Gather and measure all ingredients before starting to cook",
        "Prepare your mise en place: wash, chop, and organize all components",
        "Start with the component that takes longest to cook (grains, proteins, root vegetables)",
        "Heat oil in appropriate cookware over medium-high heat until shimmering",
        "Season main protein with salt and pepper, then sear or cook until golden",
        "Remove protein and set aside, using the same pan for vegetables to build flavors",
        "Cook vegetables in batches if needed to avoid overcrowding the pan",
        "Return protein to pan and add any sauces, broths, or seasonings",
        "Reduce heat and simmer until everything is cooked through and tender",
        "Check for doneness: proteins should reach safe internal temperatures",
        "Turn off heat and let dish rest for 5 minutes to redistribute juices",
        "Plate elegantly, drizzling with any pan sauces or garnishing with fresh herbs",
        "Serve immediately while hot and enjoy!",
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
