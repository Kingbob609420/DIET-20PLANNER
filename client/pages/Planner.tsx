import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
  Utensils,
  ArrowLeft,
  ArrowRight,
  User,
  Activity,
  Target,
  Leaf,
  Heart,
  Calendar,
  Clock,
} from "lucide-react";

interface FormData {
  // Personal Info
  age: string;
  gender: string;
  height: string;
  weight: string;

  // Activity & Goals
  activityLevel: string;
  goal: string;

  // Dietary Preferences
  dietType: string;
  allergies: string[];
  restrictions: string[];

  // Meal Preferences
  mealsPerDay: string;
  cookingTime: string;
  budget: string;
}

export default function Planner() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    age: "",
    gender: "",
    height: "",
    weight: "",
    activityLevel: "",
    goal: "",
    dietType: "",
    allergies: [],
    restrictions: [],
    mealsPerDay: "",
    cookingTime: "",
    budget: "",
  });

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Generate meal plan
      navigate("/results", { state: { formData } });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleArrayField = (
    field: "allergies" | "restrictions",
    value: string,
    checked: boolean,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: checked
        ? [...prev[field], value]
        : prev[field].filter((item) => item !== value),
    }));
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return (
          formData.age && formData.gender && formData.height && formData.weight
        );
      case 2:
        return formData.activityLevel && formData.goal;
      case 3:
        return formData.dietType;
      case 4:
        return formData.mealsPerDay && formData.cookingTime;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 dark:from-green-950/20 dark:via-background dark:to-green-950/20">
      {/* Navigation */}
      <nav className="border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <ArrowLeft className="w-5 h-5" />
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Utensils className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">NutriPlan</span>
            </div>
          </Link>
          <Badge
            variant="secondary"
            className="bg-primary/10 text-primary border-primary/20"
          >
            Step {currentStep} of {totalSteps}
          </Badge>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step 1: Personal Information */}
        {currentStep === 1 && (
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Personal Information</CardTitle>
              <CardDescription>
                Help us understand your basic profile to create the perfect meal
                plan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="25"
                    value={formData.age}
                    onChange={(e) => updateFormData("age", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => updateFormData("gender", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="170"
                    value={formData.height}
                    onChange={(e) => updateFormData("height", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="70"
                    value={formData.weight}
                    onChange={(e) => updateFormData("weight", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Activity & Goals */}
        {currentStep === 2 && (
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Activity & Goals</CardTitle>
              <CardDescription>
                Tell us about your lifestyle and what you want to achieve
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Activity Level</Label>
                <RadioGroup
                  value={formData.activityLevel}
                  onValueChange={(value) =>
                    updateFormData("activityLevel", value)
                  }
                >
                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50">
                    <RadioGroupItem value="sedentary" id="sedentary" />
                    <Label
                      htmlFor="sedentary"
                      className="flex-1 cursor-pointer"
                    >
                      <div className="font-medium">Sedentary</div>
                      <div className="text-sm text-muted-foreground">
                        Little to no exercise, desk job
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50">
                    <RadioGroupItem value="light" id="light" />
                    <Label htmlFor="light" className="flex-1 cursor-pointer">
                      <div className="font-medium">Lightly Active</div>
                      <div className="text-sm text-muted-foreground">
                        Light exercise 1-3 days per week
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50">
                    <RadioGroupItem value="moderate" id="moderate" />
                    <Label htmlFor="moderate" className="flex-1 cursor-pointer">
                      <div className="font-medium">Moderately Active</div>
                      <div className="text-sm text-muted-foreground">
                        Moderate exercise 3-5 days per week
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50">
                    <RadioGroupItem value="very" id="very" />
                    <Label htmlFor="very" className="flex-1 cursor-pointer">
                      <div className="font-medium">Very Active</div>
                      <div className="text-sm text-muted-foreground">
                        Hard exercise 6-7 days per week
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-4">
                <Label>Primary Goal</Label>
                <RadioGroup
                  value={formData.goal}
                  onValueChange={(value) => updateFormData("goal", value)}
                >
                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50">
                    <RadioGroupItem value="lose" id="lose" />
                    <Label htmlFor="lose" className="flex-1 cursor-pointer">
                      <div className="font-medium">Lose Weight</div>
                      <div className="text-sm text-muted-foreground">
                        Create a caloric deficit for weight loss
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50">
                    <RadioGroupItem value="maintain" id="maintain" />
                    <Label htmlFor="maintain" className="flex-1 cursor-pointer">
                      <div className="font-medium">Maintain Weight</div>
                      <div className="text-sm text-muted-foreground">
                        Maintain current weight with balanced nutrition
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50">
                    <RadioGroupItem value="gain" id="gain" />
                    <Label htmlFor="gain" className="flex-1 cursor-pointer">
                      <div className="font-medium">Gain Weight</div>
                      <div className="text-sm text-muted-foreground">
                        Build muscle and increase healthy weight
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Dietary Preferences */}
        {currentStep === 3 && (
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Dietary Preferences</CardTitle>
              <CardDescription>
                Choose your dietary style and any restrictions we should know
                about
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Diet Type</Label>
                <RadioGroup
                  value={formData.dietType}
                  onValueChange={(value) => updateFormData("dietType", value)}
                >
                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50">
                    <RadioGroupItem value="omnivore" id="omnivore" />
                    <Label htmlFor="omnivore" className="flex-1 cursor-pointer">
                      <div className="font-medium">Non-Vegetarian</div>
                      <div className="text-sm text-muted-foreground">
                        Includes meat, fish, dairy, and plant foods
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50">
                    <RadioGroupItem value="vegetarian" id="vegetarian" />
                    <Label
                      htmlFor="vegetarian"
                      className="flex-1 cursor-pointer"
                    >
                      <div className="font-medium">Vegetarian</div>
                      <div className="text-sm text-muted-foreground">
                        Plant foods, dairy, and eggs (no meat or fish)
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50">
                    <RadioGroupItem value="vegan" id="vegan" />
                    <Label htmlFor="vegan" className="flex-1 cursor-pointer">
                      <div className="font-medium">Vegan</div>
                      <div className="text-sm text-muted-foreground">
                        Plant foods only (no animal products)
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-4">
                <Label>Allergies (Select all that apply)</Label>
                <div className="grid grid-cols-2 gap-3">
                  {["Nuts", "Dairy", "Eggs", "Soy", "Gluten", "Shellfish"].map(
                    (allergy) => (
                      <div
                        key={allergy}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={allergy}
                          checked={formData.allergies.includes(allergy)}
                          onCheckedChange={(checked) =>
                            handleArrayField(
                              "allergies",
                              allergy,
                              checked as boolean,
                            )
                          }
                        />
                        <Label htmlFor={allergy} className="text-sm">
                          {allergy}
                        </Label>
                      </div>
                    ),
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <Label>Dietary Restrictions (Optional)</Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    "Low Sodium",
                    "Low Carb",
                    "Keto",
                    "Paleo",
                    "Mediterranean",
                    "Low Fat",
                  ].map((restriction) => (
                    <div
                      key={restriction}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={restriction}
                        checked={formData.restrictions.includes(restriction)}
                        onCheckedChange={(checked) =>
                          handleArrayField(
                            "restrictions",
                            restriction,
                            checked as boolean,
                          )
                        }
                      />
                      <Label htmlFor={restriction} className="text-sm">
                        {restriction}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Meal Preferences */}
        {currentStep === 4 && (
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Meal Preferences</CardTitle>
              <CardDescription>
                Final details to customize your perfect meal plan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Meals per Day</Label>
                <Select
                  value={formData.mealsPerDay}
                  onValueChange={(value) =>
                    updateFormData("mealsPerDay", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select meals per day" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">
                      3 meals (Breakfast, Lunch, Dinner)
                    </SelectItem>
                    <SelectItem value="4">4 meals (+ 1 Snack)</SelectItem>
                    <SelectItem value="5">5 meals (+ 2 Snacks)</SelectItem>
                    <SelectItem value="6">6 meals (+ 3 Snacks)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Cooking Time Preference</Label>
                <Select
                  value={formData.cookingTime}
                  onValueChange={(value) =>
                    updateFormData("cookingTime", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select cooking time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quick">Quick (15-30 minutes)</SelectItem>
                    <SelectItem value="moderate">
                      Moderate (30-60 minutes)
                    </SelectItem>
                    <SelectItem value="elaborate">
                      Elaborate (60+ minutes)
                    </SelectItem>
                    <SelectItem value="mixed">
                      Mixed (variety of times)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Budget Range (Optional)</Label>
                <Select
                  value={formData.budget}
                  onValueChange={(value) => updateFormData("budget", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select budget range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Budget-friendly</SelectItem>
                    <SelectItem value="medium">Moderate</SelectItem>
                    <SelectItem value="high">Premium ingredients</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="px-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={!isStepValid()}
            className="px-8 bg-primary hover:bg-primary/90"
          >
            {currentStep === totalSteps ? "Generate Plan" : "Next"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
