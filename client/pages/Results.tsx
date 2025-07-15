import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Utensils,
  ArrowLeft,
  Clock,
  Users,
  Star,
  Download,
  Share2,
  Calendar,
  ChefHat,
  Zap,
  Heart,
  Leaf,
  Target,
  Info,
} from "lucide-react";

interface MealPlan {
  day: string;
  meals: {
    type: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    prep_time: number;
    image: string;
    description: string;
    ingredients: string[];
    instructions: string[];
    tags: string[];
  }[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export default function Results() {
  const location = useLocation();
  const { formData } = location.state || {};
  const [mealPlan, setMealPlan] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(0);

  useEffect(() => {
    // Simulate AI meal plan generation
    const generateMealPlan = () => {
      const sampleMealPlan: MealPlan[] = [
        {
          day: "Monday",
          totalCalories: 1800,
          totalProtein: 120,
          totalCarbs: 180,
          totalFat: 70,
          meals: [
            {
              type: "Breakfast",
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
              tags: ["Vegan", "High Protein", "Gluten-Free"],
            },
            {
              type: "Lunch",
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
              tags: ["Vegetarian", "High Fiber", "Mediterranean"],
            },
            {
              type: "Dinner",
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
              tags: ["High Protein", "Omega-3", "Low Carb"],
            },
            {
              type: "Snack",
              name: "Greek Yogurt with Nuts",
              calories: 250,
              protein: 20,
              carbs: 15,
              fat: 12,
              prep_time: 5,
              image:
                "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop",
              description:
                "Creamy Greek yogurt topped with mixed nuts and honey",
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
              tags: ["High Protein", "Probiotics", "Quick"],
            },
          ],
        },
        // Add more days...
        {
          day: "Tuesday",
          totalCalories: 1750,
          totalProtein: 115,
          totalCarbs: 175,
          totalFat: 65,
          meals: [
            {
              type: "Breakfast",
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
              tags: ["Vegetarian", "High Fiber", "Protein"],
            },
            {
              type: "Lunch",
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
              tags: ["High Protein", "Portable", "Balanced"],
            },
            {
              type: "Dinner",
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
              tags: ["Vegan", "High Protein", "Asian"],
            },
            {
              type: "Snack",
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
              tags: ["Natural", "Fiber", "Healthy Fats"],
            },
          ],
        },
      ];

      setTimeout(() => {
        setMealPlan(sampleMealPlan);
        setLoading(false);
      }, 2000);
    };

    generateMealPlan();
  }, [formData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 dark:from-green-950/20 dark:via-background dark:to-green-950/20">
        <nav className="border-b border-border/40 bg-background/80 backdrop-blur-xl">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/planner" className="flex items-center space-x-2">
              <ArrowLeft className="w-5 h-5" />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Utensils className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">NutriPlan</span>
              </div>
            </Link>
          </div>
        </nav>

        <div className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <ChefHat className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold mb-4">
              Generating Your Meal Plan
            </h2>
            <p className="text-muted-foreground mb-6">
              Our AI is creating a personalized nutrition plan based on your
              preferences...
            </p>
            <Progress value={66} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">
              This may take a few moments
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentDayPlan = mealPlan[selectedDay];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 dark:from-green-950/20 dark:via-background dark:to-green-950/20">
      {/* Navigation */}
      <nav className="border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/planner" className="flex items-center space-x-2">
            <ArrowLeft className="w-5 h-5" />
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Utensils className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">NutriPlan</span>
            </div>
          </Link>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Your Personalized Meal Plan
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Based on your profile, we've created a custom nutrition plan
            tailored to your goals and preferences.
          </p>
        </div>

        {/* User Summary */}
        {formData && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Your Profile Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {formData.age}
                  </div>
                  <div className="text-sm text-muted-foreground">Years Old</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {formData.weight}kg
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Current Weight
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {formData.activityLevel}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Activity Level
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {formData.dietType}
                  </div>
                  <div className="text-sm text-muted-foreground">Diet Type</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Daily Navigation */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">7-Day Meal Plan</h2>
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary border-primary/20"
            >
              <Calendar className="w-4 h-4 mr-1" />
              Week 1
            </Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-7 gap-2 mb-6">
            {mealPlan.map((day, index) => (
              <Button
                key={day.day}
                variant={selectedDay === index ? "default" : "outline"}
                className={`${
                  selectedDay === index
                    ? "bg-primary text-primary-foreground"
                    : ""
                }`}
                onClick={() => setSelectedDay(index)}
              >
                {day.day.slice(0, 3)}
              </Button>
            ))}
            {/* Placeholder buttons for remaining days */}
            {Array.from({ length: 7 - mealPlan.length }).map((_, index) => (
              <Button
                key={`placeholder-${index}`}
                variant="outline"
                disabled
                className="opacity-50"
              >
                Day {mealPlan.length + index + 1}
              </Button>
            ))}
          </div>
        </div>

        {currentDayPlan && (
          <>
            {/* Daily Summary */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>{currentDayPlan.day} Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {currentDayPlan.totalCalories}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Calories
                    </div>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {currentDayPlan.totalProtein}g
                    </div>
                    <div className="text-sm text-muted-foreground">Protein</div>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {currentDayPlan.totalCarbs}g
                    </div>
                    <div className="text-sm text-muted-foreground">Carbs</div>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {currentDayPlan.totalFat}g
                    </div>
                    <div className="text-sm text-muted-foreground">Fat</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Meals */}
            <div className="grid gap-6">
              {currentDayPlan.meals.map((meal, index) => (
                <Card key={index} className="overflow-hidden">
                  <div className="grid md:grid-cols-3 gap-0">
                    <div className="relative h-48 md:h-auto">
                      <img
                        src={meal.image}
                        alt={meal.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge
                          variant="secondary"
                          className="bg-background/80 backdrop-blur-sm"
                        >
                          {meal.type}
                        </Badge>
                      </div>
                    </div>

                    <div className="md:col-span-2 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold mb-2">
                            {meal.name}
                          </h3>
                          <p className="text-muted-foreground mb-4">
                            {meal.description}
                          </p>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="w-4 h-4 mr-1" />
                          {meal.prep_time} min
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-lg font-semibold">
                            {meal.calories}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Calories
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold">
                            {meal.protein}g
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Protein
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold">
                            {meal.carbs}g
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Carbs
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold">
                            {meal.fat}g
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Fat
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {meal.tags.map((tag, tagIndex) => (
                          <Badge
                            key={tagIndex}
                            variant="outline"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <Tabs defaultValue="ingredients" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="ingredients">
                            Ingredients
                          </TabsTrigger>
                          <TabsTrigger value="instructions">
                            Instructions
                          </TabsTrigger>
                        </TabsList>
                        <TabsContent value="ingredients" className="mt-4">
                          <ul className="space-y-1 text-sm">
                            {meal.ingredients.map(
                              (ingredient, ingredientIndex) => (
                                <li
                                  key={ingredientIndex}
                                  className="flex items-center"
                                >
                                  <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2" />
                                  {ingredient}
                                </li>
                              ),
                            )}
                          </ul>
                        </TabsContent>
                        <TabsContent value="instructions" className="mt-4">
                          <ol className="space-y-2 text-sm">
                            {meal.instructions.map(
                              (instruction, instructionIndex) => (
                                <li
                                  key={instructionIndex}
                                  className="flex items-start"
                                >
                                  <span className="flex items-center justify-center w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs font-medium mr-3 mt-0.5 flex-shrink-0">
                                    {instructionIndex + 1}
                                  </span>
                                  {instruction}
                                </li>
                              ),
                            )}
                          </ol>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* CTA */}
        <Card className="mt-12 text-center bg-primary/5 border-primary/20">
          <CardContent className="py-8">
            <h3 className="text-xl font-bold mb-4">Love Your Meal Plan?</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Get access to more personalized meal plans, shopping lists, and
              nutrition tracking features.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-primary hover:bg-primary/90">
                <Heart className="w-4 h-4 mr-2" />
                Save This Plan
              </Button>
              <Button variant="outline">
                <Zap className="w-4 h-4 mr-2" />
                Generate New Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
