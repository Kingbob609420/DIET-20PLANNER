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
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import type { WeeklyMealPlan } from "@shared/diet-api";

export default function Results() {
  const location = useLocation();
  const { formData } = location.state || {};
  const [mealPlan, setMealPlan] = useState<WeeklyMealPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState(0);

  const generateMealPlan = async () => {
    if (!formData) {
      setError(
        "No user profile data available. Please go back and fill out the form.",
      );
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Generating AI meal plan for:", formData);

      const response = await fetch("/api/generate-meal-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userProfile: {
            age: parseInt(formData.age),
            gender: formData.gender,
            height: parseInt(formData.height),
            weight: parseInt(formData.weight),
            activityLevel: formData.activityLevel,
            goal: formData.goal,
            dietType: formData.dietType,
            allergies: formData.allergies || [],
            restrictions: formData.restrictions || [],
            mealsPerDay: parseInt(formData.mealsPerDay),
            cookingTime: formData.cookingTime,
            budget: formData.budget,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.mealPlan) {
        setMealPlan(data.mealPlan);
        console.log("AI meal plan generated successfully:", data.mealPlan);
      } else {
        throw new Error(data.error || "Failed to generate meal plan");
      }
    } catch (err) {
      console.error("Error generating meal plan:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate meal plan. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateMealPlan();
  }, []);

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
              AI is Creating Your Personalized Meal Plan
            </h2>
            <p className="text-muted-foreground mb-6">
              Our AI nutritionist is analyzing your profile and generating meals
              perfectly suited to your dietary preferences, goals, and
              lifestyle...
            </p>
            <Progress value={66} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">
              This may take up to 30 seconds
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
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
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold mb-4">
              Oops! Something went wrong
            </h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={generateMealPlan}
                className="bg-primary hover:bg-primary/90"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Link to="/planner">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Form
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!mealPlan) {
    return null;
  }

  const currentDayPlan = mealPlan.days[selectedDay];

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
            <Button onClick={generateMealPlan} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Regenerate
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
            Your AI-Generated Meal Plan
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Personalized for your unique profile, dietary preferences, and
            nutrition goals
          </p>
          <Badge
            variant="secondary"
            className="mt-4 bg-primary/10 text-primary border-primary/20"
          >
            <Zap className="w-4 h-4 mr-1" />
            AI-Powered • Generated{" "}
            {new Date(mealPlan.generatedAt).toLocaleDateString()}
          </Badge>
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
                  <div className="text-2xl font-bold text-primary capitalize">
                    {formData.activityLevel}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Activity Level
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary capitalize">
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
              Average: {mealPlan.averageDailyCalories} cal/day
            </Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-7 gap-2 mb-6">
            {mealPlan.days.map((day, index) => (
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
                          className="bg-background/80 backdrop-blur-sm capitalize"
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
                            className="text-xs capitalize"
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
            <h3 className="text-xl font-bold mb-4">Love Your AI Meal Plan?</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              This plan was generated specifically for your unique profile and
              goals. Need adjustments? Generate a new plan anytime!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-primary hover:bg-primary/90">
                <Heart className="w-4 h-4 mr-2" />
                Save This Plan
              </Button>
              <Button onClick={generateMealPlan} variant="outline">
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
