import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StatusBar,
  SafeAreaView,
  Dimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialIcons";
import {
  UserProfile,
  WeeklyMealPlan,
  MealPlanGenerator,
  ACTIVITY_LEVELS,
  GOALS,
  DIET_TYPES,
  ALLERGIES,
  COOKING_TIMES,
  BUDGETS,
  Meal,
} from "./types";

const { width, height } = Dimensions.get("window");

type AppView = "landing" | "planner" | "results";

const App = () => {
  const [currentView, setCurrentView] = useState<AppView>("landing");
  const [userProfile, setUserProfile] = useState<UserProfile>({
    age: 0,
    gender: "",
    height: 0,
    weight: 0,
    activityLevel: "",
    goal: "",
    dietType: "",
    allergies: [],
    restrictions: [],
    mealsPerDay: 3,
    cookingTime: "quick",
    budget: "flexible",
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [mealPlan, setMealPlan] = useState<WeeklyMealPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0);

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  useEffect(() => {
    StatusBar.setBarStyle("dark-content");
    StatusBar.setBackgroundColor("#f0f9f0", true);
  }, []);

  const generateMealPlan = async () => {
    setIsGenerating(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const plan = MealPlanGenerator.generateSampleMealPlan(userProfile);
      setMealPlan(plan);

      // Save to storage
      await AsyncStorage.setItem("mealPlan", JSON.stringify(plan));
      await AsyncStorage.setItem("userProfile", JSON.stringify(userProfile));

      setCurrentView("results");
    } catch (error) {
      Alert.alert("Error", "Failed to generate meal plan. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      generateMealPlan();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      setCurrentView("landing");
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return (
          userProfile.age > 0 &&
          userProfile.gender &&
          userProfile.height > 0 &&
          userProfile.weight > 0
        );
      case 2:
        return userProfile.activityLevel && userProfile.goal;
      case 3:
        return userProfile.dietType;
      case 4:
        return userProfile.mealsPerDay > 0;
      default:
        return false;
    }
  };

  const startOver = () => {
    setCurrentView("landing");
    setCurrentStep(1);
    setUserProfile({
      age: 0,
      gender: "",
      height: 0,
      weight: 0,
      activityLevel: "",
      goal: "",
      dietType: "",
      allergies: [],
      restrictions: [],
      mealsPerDay: 3,
      cookingTime: "quick",
      budget: "flexible",
    });
    setMealPlan(null);
  };

  if (currentView === "landing") {
    return <LandingScreen onStartPlanning={() => setCurrentView("planner")} />;
  }

  if (currentView === "planner") {
    return (
      <PlannerScreen
        userProfile={userProfile}
        setUserProfile={setUserProfile}
        currentStep={currentStep}
        totalSteps={totalSteps}
        progress={progress}
        isStepValid={isStepValid()}
        isGenerating={isGenerating}
        onNext={handleNext}
        onPrevious={handlePrevious}
      />
    );
  }

  if (currentView === "results" && mealPlan) {
    return (
      <ResultsScreen
        mealPlan={mealPlan}
        selectedDay={selectedDay}
        setSelectedDay={setSelectedDay}
        onStartOver={startOver}
      />
    );
  }

  return null;
};

// Landing Screen Component
const LandingScreen = ({
  onStartPlanning,
}: {
  onStartPlanning: () => void;
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#f0f9f0", "#ffffff", "#f0f9f0"]}
        style={styles.gradient}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Icon name="restaurant" size={28} color="#22c55e" />
              <Text style={styles.logoText}>NutriPlan</Text>
            </View>
          </View>

          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.badge}>
              <Icon name="flash-on" size={14} color="#22c55e" />
              <Text style={styles.badgeText}>AI-Powered Nutrition</Text>
            </View>

            <Text style={styles.heroTitle}>Your Personal AI Diet Planner</Text>

            <Text style={styles.heroDescription}>
              Get personalized meal plans tailored to your age, gender, activity
              level, and dietary preferences. Vegetarian, non-vegetarian, and
              vegan options available.
            </Text>

            {/* CTA Buttons */}
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={onStartPlanning}
            >
              <Text style={styles.primaryButtonText}>Create My Diet Plan</Text>
              <Icon name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton}>
              <Icon name="chef-hat" size={18} color="#22c55e" />
              <Text style={styles.secondaryButtonText}>View Sample Plans</Text>
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>10,000+</Text>
              <Text style={styles.statLabel}>Happy Users</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>5,000+</Text>
              <Text style={styles.statLabel}>Meal Recipes</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>98%</Text>
              <Text style={styles.statLabel}>Success Rate</Text>
            </View>
          </View>

          {/* Features */}
          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>Why Choose NutriPlan?</Text>

            <View style={styles.featuresGrid}>
              <FeatureCard
                icon="target"
                title="Personalized Plans"
                description="Tailored to your goals and preferences"
              />
              <FeatureCard
                icon="eco"
                title="Dietary Options"
                description="Vegan, vegetarian, and omnivore plans"
              />
              <FeatureCard
                icon="calendar-today"
                title="Weekly Planning"
                description="Complete 7-day meal schedules"
              />
              <FeatureCard
                icon="favorite"
                title="Health Focused"
                description="Nutritionally balanced meals"
              />
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

// Feature Card Component
const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) => (
  <View style={styles.featureCard}>
    <View style={styles.featureIconContainer}>
      <Icon name={icon} size={24} color="#22c55e" />
    </View>
    <Text style={styles.featureTitle}>{title}</Text>
    <Text style={styles.featureDescription}>{description}</Text>
  </View>
);

// Planner Screen Component
const PlannerScreen = ({
  userProfile,
  setUserProfile,
  currentStep,
  totalSteps,
  progress,
  isStepValid,
  isGenerating,
  onNext,
  onPrevious,
}: {
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  currentStep: number;
  totalSteps: number;
  progress: number;
  isStepValid: boolean;
  isGenerating: boolean;
  onNext: () => void;
  onPrevious: () => void;
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#f0f9f0", "#ffffff", "#f0f9f0"]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.plannerHeader}>
          <TouchableOpacity onPress={onPrevious}>
            <Icon name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>

          <View style={styles.logoContainer}>
            <Icon name="restaurant" size={20} color="#22c55e" />
            <Text style={styles.logoTextSmall}>NutriPlan</Text>
          </View>

          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>
              Step {currentStep} of {totalSteps}
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={styles.progressPercentage}>
              {Math.round(progress)}%
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>

        {/* Step Content */}
        <ScrollView
          style={styles.stepContent}
          showsVerticalScrollIndicator={false}
        >
          {currentStep === 1 && (
            <PersonalInfoStep
              userProfile={userProfile}
              setUserProfile={setUserProfile}
            />
          )}
          {currentStep === 2 && (
            <ActivityGoalsStep
              userProfile={userProfile}
              setUserProfile={setUserProfile}
            />
          )}
          {currentStep === 3 && (
            <DietaryPreferencesStep
              userProfile={userProfile}
              setUserProfile={setUserProfile}
            />
          )}
          {currentStep === 4 && (
            <MealPreferencesStep
              userProfile={userProfile}
              setUserProfile={setUserProfile}
            />
          )}
        </ScrollView>

        {/* Navigation Buttons */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity
            style={[styles.navButton, styles.previousButton]}
            onPress={onPrevious}
            disabled={isGenerating}
          >
            <Icon name="arrow-back" size={16} color="#666" />
            <Text style={styles.previousButtonText}>Previous</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navButton,
              styles.nextButton,
              (!isStepValid || isGenerating) && styles.disabledButton,
            ]}
            onPress={onNext}
            disabled={!isStepValid || isGenerating}
          >
            {isGenerating ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Text style={styles.nextButtonText}>
                  {currentStep === totalSteps ? "Generate Plan" : "Next"}
                </Text>
                <Icon name="arrow-forward" size={16} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

// Step Components
const PersonalInfoStep = ({
  userProfile,
  setUserProfile,
}: {
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
}) => (
  <View style={styles.stepCard}>
    <View style={styles.stepHeader}>
      <Icon name="person" size={48} color="#22c55e" />
      <Text style={styles.stepTitle}>Personal Information</Text>
      <Text style={styles.stepDescription}>
        Help us understand your basic profile to create the perfect meal plan
      </Text>
    </View>

    <View style={styles.formContainer}>
      <View style={styles.formRow}>
        <View style={styles.formField}>
          <Text style={styles.fieldLabel}>Age</Text>
          <TextInput
            style={styles.textInput}
            value={userProfile.age ? userProfile.age.toString() : ""}
            onChangeText={(text) =>
              setUserProfile((prev) => ({ ...prev, age: parseInt(text) || 0 }))
            }
            placeholder="25"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.formField}>
          <Text style={styles.fieldLabel}>Gender</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={userProfile.gender}
              onValueChange={(value) =>
                setUserProfile((prev) => ({ ...prev, gender: value }))
              }
            >
              <Picker.Item label="Select Gender" value="" />
              <Picker.Item label="Male" value="male" />
              <Picker.Item label="Female" value="female" />
              <Picker.Item label="Other" value="other" />
            </Picker>
          </View>
        </View>
      </View>

      <View style={styles.formRow}>
        <View style={styles.formField}>
          <Text style={styles.fieldLabel}>Height (cm)</Text>
          <TextInput
            style={styles.textInput}
            value={userProfile.height ? userProfile.height.toString() : ""}
            onChangeText={(text) =>
              setUserProfile((prev) => ({
                ...prev,
                height: parseInt(text) || 0,
              }))
            }
            placeholder="170"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.formField}>
          <Text style={styles.fieldLabel}>Weight (kg)</Text>
          <TextInput
            style={styles.textInput}
            value={userProfile.weight ? userProfile.weight.toString() : ""}
            onChangeText={(text) =>
              setUserProfile((prev) => ({
                ...prev,
                weight: parseInt(text) || 0,
              }))
            }
            placeholder="70"
            keyboardType="numeric"
          />
        </View>
      </View>
    </View>
  </View>
);

const ActivityGoalsStep = ({
  userProfile,
  setUserProfile,
}: {
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
}) => (
  <View style={styles.stepCard}>
    <View style={styles.stepHeader}>
      <Icon name="directions-run" size={48} color="#22c55e" />
      <Text style={styles.stepTitle}>Activity & Goals</Text>
      <Text style={styles.stepDescription}>
        Tell us about your lifestyle and what you want to achieve
      </Text>
    </View>

    <View style={styles.formContainer}>
      <Text style={styles.sectionLabel}>Activity Level</Text>
      {ACTIVITY_LEVELS.map((level) => (
        <TouchableOpacity
          key={level.value}
          style={[
            styles.optionCard,
            userProfile.activityLevel === level.value && styles.selectedOption,
          ]}
          onPress={() =>
            setUserProfile((prev) => ({
              ...prev,
              activityLevel: level.value as any,
            }))
          }
        >
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>{level.label}</Text>
            <Text style={styles.optionDescription}>{level.description}</Text>
          </View>
          {userProfile.activityLevel === level.value && (
            <Icon name="check-circle" size={20} color="#22c55e" />
          )}
        </TouchableOpacity>
      ))}

      <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Primary Goal</Text>
      {GOALS.map((goal) => (
        <TouchableOpacity
          key={goal.value}
          style={[
            styles.optionCard,
            userProfile.goal === goal.value && styles.selectedOption,
          ]}
          onPress={() =>
            setUserProfile((prev) => ({ ...prev, goal: goal.value as any }))
          }
        >
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>{goal.label}</Text>
            <Text style={styles.optionDescription}>{goal.description}</Text>
          </View>
          {userProfile.goal === goal.value && (
            <Icon name="check-circle" size={20} color="#22c55e" />
          )}
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

const DietaryPreferencesStep = ({
  userProfile,
  setUserProfile,
}: {
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
}) => (
  <View style={styles.stepCard}>
    <View style={styles.stepHeader}>
      <Icon name="eco" size={48} color="#22c55e" />
      <Text style={styles.stepTitle}>Dietary Preferences</Text>
      <Text style={styles.stepDescription}>
        Choose your dietary style and any restrictions we should know about
      </Text>
    </View>

    <View style={styles.formContainer}>
      <Text style={styles.sectionLabel}>Diet Type</Text>
      {DIET_TYPES.map((diet) => (
        <TouchableOpacity
          key={diet.value}
          style={[
            styles.optionCard,
            userProfile.dietType === diet.value && styles.selectedOption,
          ]}
          onPress={() =>
            setUserProfile((prev) => ({ ...prev, dietType: diet.value as any }))
          }
        >
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>{diet.label}</Text>
            <Text style={styles.optionDescription}>{diet.description}</Text>
          </View>
          {userProfile.dietType === diet.value && (
            <Icon name="check-circle" size={20} color="#22c55e" />
          )}
        </TouchableOpacity>
      ))}

      <Text style={[styles.sectionLabel, { marginTop: 20 }]}>
        Allergies (Optional)
      </Text>
      <View style={styles.allergiesGrid}>
        {ALLERGIES.map((allergy) => (
          <TouchableOpacity
            key={allergy}
            style={[
              styles.allergyTag,
              userProfile.allergies.includes(allergy) &&
                styles.selectedAllergyTag,
            ]}
            onPress={() => {
              const allergies = userProfile.allergies.includes(allergy)
                ? userProfile.allergies.filter((a) => a !== allergy)
                : [...userProfile.allergies, allergy];
              setUserProfile((prev) => ({ ...prev, allergies }));
            }}
          >
            <Text
              style={[
                styles.allergyTagText,
                userProfile.allergies.includes(allergy) &&
                  styles.selectedAllergyTagText,
              ]}
            >
              {allergy}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  </View>
);

const MealPreferencesStep = ({
  userProfile,
  setUserProfile,
}: {
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
}) => (
  <View style={styles.stepCard}>
    <View style={styles.stepHeader}>
      <Icon name="access-time" size={48} color="#22c55e" />
      <Text style={styles.stepTitle}>Meal Preferences</Text>
      <Text style={styles.stepDescription}>
        Final details to customize your perfect meal plan
      </Text>
    </View>

    <View style={styles.formContainer}>
      <View style={styles.formField}>
        <Text style={styles.fieldLabel}>Meals per Day</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={userProfile.mealsPerDay}
            onValueChange={(value) =>
              setUserProfile((prev) => ({ ...prev, mealsPerDay: value }))
            }
          >
            <Picker.Item label="3 meals (Breakfast, Lunch, Dinner)" value={3} />
            <Picker.Item label="4 meals (+ 1 Snack)" value={4} />
            <Picker.Item label="5 meals (+ 2 Snacks)" value={5} />
            <Picker.Item label="6 meals (+ 3 Snacks)" value={6} />
          </Picker>
        </View>
      </View>

      <View style={styles.formField}>
        <Text style={styles.fieldLabel}>Cooking Time Preference</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={userProfile.cookingTime}
            onValueChange={(value) =>
              setUserProfile((prev) => ({ ...prev, cookingTime: value }))
            }
          >
            {COOKING_TIMES.map((time) => (
              <Picker.Item
                key={time.value}
                label={time.label}
                value={time.value}
              />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.formField}>
        <Text style={styles.fieldLabel}>Budget Range</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={userProfile.budget}
            onValueChange={(value) =>
              setUserProfile((prev) => ({ ...prev, budget: value }))
            }
          >
            {BUDGETS.map((budget) => (
              <Picker.Item
                key={budget.value}
                label={budget.label}
                value={budget.value}
              />
            ))}
          </Picker>
        </View>
      </View>
    </View>
  </View>
);

// Results Screen Component
const ResultsScreen = ({
  mealPlan,
  selectedDay,
  setSelectedDay,
  onStartOver,
}: {
  mealPlan: WeeklyMealPlan;
  selectedDay: number;
  setSelectedDay: React.Dispatch<React.SetStateAction<number>>;
  onStartOver: () => void;
}) => (
  <SafeAreaView style={styles.container}>
    <LinearGradient
      colors={["#f0f9f0", "#ffffff", "#f0f9f0"]}
      style={styles.gradient}
    >
      {/* Header */}
      <View style={styles.resultsHeader}>
        <View style={styles.logoContainer}>
          <Icon name="restaurant" size={20} color="#22c55e" />
          <Text style={styles.logoTextSmall}>Your Meal Plan</Text>
        </View>

        <TouchableOpacity onPress={onStartOver}>
          <Text style={styles.newPlanButton}>New Plan</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Stats */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Weekly Overview</Text>
          <View style={styles.summaryStats}>
            <View style={styles.summaryStatItem}>
              <Text style={styles.summaryStatNumber}>
                {mealPlan.averageDailyCalories}
              </Text>
              <Text style={styles.summaryStatLabel}>Avg Daily Calories</Text>
            </View>
            <View style={styles.summaryStatItem}>
              <Text style={styles.summaryStatNumber}>
                {mealPlan.totalWeeklyCalories}
              </Text>
              <Text style={styles.summaryStatLabel}>Weekly Calories</Text>
            </View>
            <View style={styles.summaryStatItem}>
              <Text style={styles.summaryStatNumber}>
                {mealPlan.days.length}
              </Text>
              <Text style={styles.summaryStatLabel}>Days Planned</Text>
            </View>
          </View>
        </View>

        {/* Day Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.daySelector}
        >
          {mealPlan.days.map((day, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayButton,
                selectedDay === index && styles.selectedDayButton,
              ]}
              onPress={() => setSelectedDay(index)}
            >
              <Text
                style={[
                  styles.dayButtonText,
                  selectedDay === index && styles.selectedDayButtonText,
                ]}
              >
                {day.day}
              </Text>
              <Text
                style={[
                  styles.dayCalories,
                  selectedDay === index && styles.selectedDayCalories,
                ]}
              >
                {day.totalCalories}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Selected Day Meals */}
        {selectedDay < mealPlan.days.length && (
          <View style={styles.dayMealsContainer}>
            <Text style={styles.dayMealsTitle}>
              {mealPlan.days[selectedDay].day} Meals
            </Text>

            {mealPlan.days[selectedDay].meals.map((meal) => (
              <MealCard key={meal.id} meal={meal} />
            ))}

            {/* Daily Totals */}
            <View style={styles.dailyTotalsCard}>
              <Text style={styles.dailyTotalsTitle}>Daily Totals</Text>
              <View style={styles.dailyTotalsGrid}>
                <NutrientInfo
                  title="Calories"
                  value={mealPlan.days[selectedDay].totalCalories.toString()}
                  color="#22c55e"
                />
                <NutrientInfo
                  title="Protein"
                  value={`${mealPlan.days[selectedDay].totalProtein}g`}
                  color="#3b82f6"
                />
                <NutrientInfo
                  title="Carbs"
                  value={`${mealPlan.days[selectedDay].totalCarbs}g`}
                  color="#f59e0b"
                />
                <NutrientInfo
                  title="Fat"
                  value={`${mealPlan.days[selectedDay].totalFat}g`}
                  color="#8b5cf6"
                />
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  </SafeAreaView>
);

// Meal Card Component
const MealCard = ({ meal }: { meal: Meal }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getMealEmoji = (type: string) => {
    switch (type) {
      case "breakfast":
        return "🌅";
      case "lunch":
        return "🌞";
      case "dinner":
        return "🌙";
      case "snack":
        return "🍎";
      default:
        return "🍽️";
    }
  };

  return (
    <View style={styles.mealCard}>
      <View style={styles.mealHeader}>
        <View style={styles.mealInfo}>
          <Text style={styles.mealEmoji}>{getMealEmoji(meal.type)}</Text>
          <View style={styles.mealTitleContainer}>
            <Text style={styles.mealType}>{meal.type.toUpperCase()}</Text>
            <Text style={styles.mealName}>{meal.name}</Text>
          </View>
        </View>
        <View style={styles.mealCalories}>
          <Text style={styles.mealCaloriesNumber}>{meal.calories}</Text>
          <Text style={styles.mealCaloriesLabel}>calories</Text>
        </View>
      </View>

      <Text style={styles.mealDescription}>{meal.description}</Text>

      <View style={styles.mealNutrients}>
        <NutrientBadge
          title="Protein"
          value={`${meal.protein}g`}
          color="#3b82f6"
        />
        <NutrientBadge title="Carbs" value={`${meal.carbs}g`} color="#f59e0b" />
        <NutrientBadge title="Fat" value={`${meal.fat}g`} color="#8b5cf6" />

        <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
          <Text style={styles.expandButton}>
            {isExpanded ? "Less" : "More"}
          </Text>
        </TouchableOpacity>
      </View>

      {isExpanded && (
        <View style={styles.expandedContent}>
          <Text style={styles.ingredientsLabel}>Ingredients:</Text>
          <Text style={styles.ingredientsText}>
            {meal.ingredients.join(", ")}
          </Text>
          <Text style={styles.prepTimeText}>
            Prep time: {meal.prepTime} minutes
          </Text>
        </View>
      )}
    </View>
  );
};

// Nutrient Badge Component
const NutrientBadge = ({
  title,
  value,
  color,
}: {
  title: string;
  value: string;
  color: string;
}) => (
  <View style={[styles.nutrientBadge, { backgroundColor: `${color}15` }]}>
    <Text style={[styles.nutrientValue, { color }]}>{value}</Text>
    <Text style={styles.nutrientTitle}>{title}</Text>
  </View>
);

// Nutrient Info Component
const NutrientInfo = ({
  title,
  value,
  color,
}: {
  title: string;
  value: string;
  color: string;
}) => (
  <View style={styles.nutrientInfo}>
    <Text style={[styles.nutrientInfoValue, { color }]}>{value}</Text>
    <Text style={styles.nutrientInfoTitle}>{title}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },

  // Landing Screen Styles
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoText: {
    fontSize: 24,
    fontWeight: "bold",
    marginLeft: 8,
    color: "#333",
  },
  logoTextSmall: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
    color: "#333",
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: "center",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#22c55e15",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  badgeText: {
    fontSize: 12,
    color: "#22c55e",
    marginLeft: 4,
    fontWeight: "600",
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
    color: "#22c55e",
  },
  heroDescription: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    lineHeight: 24,
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: "#22c55e",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 12,
    width: width - 40,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#22c55e",
    width: width - 40,
  },
  secondaryButtonText: {
    color: "#22c55e",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#22c55e",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
  },
  featuresSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
    color: "#333",
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  featureCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    width: (width - 60) / 2,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: "#22c55e15",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
    textAlign: "center",
    color: "#333",
  },
  featureDescription: {
    fontSize: 11,
    color: "#666",
    textAlign: "center",
    lineHeight: 16,
  },

  // Planner Screen Styles
  plannerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  stepBadge: {
    backgroundColor: "#22c55e15",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  stepBadgeText: {
    fontSize: 12,
    color: "#22c55e",
    fontWeight: "600",
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: "#666",
  },
  progressPercentage: {
    fontSize: 12,
    color: "#666",
  },
  progressBar: {
    height: 4,
    backgroundColor: "#e5e7eb",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#22c55e",
  },
  stepContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  stepHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 12,
    color: "#333",
  },
  stepDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  formContainer: {
    gap: 16,
  },
  formRow: {
    flexDirection: "row",
    gap: 12,
  },
  formField: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
    color: "#333",
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: "#fafafa",
  },
  selectedOption: {
    borderColor: "#22c55e",
    backgroundColor: "#22c55e15",
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    color: "#333",
  },
  optionDescription: {
    fontSize: 12,
    color: "#666",
    lineHeight: 16,
  },
  allergiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  allergyTag: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  selectedAllergyTag: {
    backgroundColor: "#22c55e",
    borderColor: "#22c55e",
  },
  allergyTagText: {
    fontSize: 12,
    color: "#333",
  },
  selectedAllergyTagText: {
    color: "#fff",
  },
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    gap: 16,
  },
  navButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  previousButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  previousButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  nextButton: {
    backgroundColor: "#22c55e",
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    backgroundColor: "#9ca3af",
  },

  // Results Screen Styles
  resultsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  newPlanButton: {
    fontSize: 14,
    color: "#22c55e",
    fontWeight: "600",
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    margin: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
    color: "#333",
  },
  summaryStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  summaryStatItem: {
    alignItems: "center",
  },
  summaryStatNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#22c55e",
    marginBottom: 4,
  },
  summaryStatLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  daySelector: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  dayButton: {
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    marginRight: 12,
  },
  selectedDayButton: {
    backgroundColor: "#22c55e",
  },
  dayButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  selectedDayButtonText: {
    color: "#fff",
  },
  dayCalories: {
    fontSize: 10,
    color: "#666",
  },
  selectedDayCalories: {
    color: "#fff",
  },
  dayMealsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  dayMealsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  mealCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  mealHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  mealInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  mealEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  mealTitleContainer: {
    flex: 1,
  },
  mealType: {
    fontSize: 10,
    color: "#666",
    fontWeight: "600",
    marginBottom: 2,
  },
  mealName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  mealCalories: {
    alignItems: "flex-end",
  },
  mealCaloriesNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#22c55e",
  },
  mealCaloriesLabel: {
    fontSize: 10,
    color: "#666",
  },
  mealDescription: {
    fontSize: 12,
    color: "#666",
    marginBottom: 12,
    lineHeight: 16,
  },
  mealNutrients: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  nutrientBadge: {
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  nutrientValue: {
    fontSize: 12,
    fontWeight: "600",
  },
  nutrientTitle: {
    fontSize: 10,
    color: "#666",
  },
  expandButton: {
    fontSize: 12,
    color: "#22c55e",
    fontWeight: "600",
    marginLeft: "auto",
  },
  expandedContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  ingredientsLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
    color: "#333",
  },
  ingredientsText: {
    fontSize: 11,
    color: "#666",
    marginBottom: 8,
    lineHeight: 16,
  },
  prepTimeText: {
    fontSize: 11,
    color: "#666",
  },
  dailyTotalsCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  dailyTotalsTitle: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 12,
    color: "#333",
  },
  dailyTotalsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  nutrientInfo: {
    alignItems: "center",
  },
  nutrientInfoValue: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 2,
  },
  nutrientInfoTitle: {
    fontSize: 12,
    color: "#666",
  },
});

export default App;
