import Foundation

// MARK: - User Profile Models
struct UserProfile: Codable {
    var age: Int = 0
    var gender: Gender = .notSelected
    var height: Int = 0 // cm
    var weight: Int = 0 // kg
    var activityLevel: ActivityLevel = .notSelected
    var goal: Goal = .notSelected
    var dietType: DietType = .notSelected
    var allergies: [String] = []
    var restrictions: [String] = []
    var mealsPerDay: Int = 3
    var cookingTime: CookingTime = .quick
    var budget: Budget = .flexible
    
    enum Gender: String, CaseIterable, Codable {
        case notSelected = ""
        case male = "male"
        case female = "female"
        case other = "other"
        
        var displayName: String {
            switch self {
            case .notSelected: return "Select Gender"
            case .male: return "Male"
            case .female: return "Female"
            case .other: return "Other"
            }
        }
    }
    
    enum ActivityLevel: String, CaseIterable, Codable {
        case notSelected = ""
        case sedentary = "sedentary"
        case light = "light"
        case moderate = "moderate"
        case very = "very"
        
        var displayName: String {
            switch self {
            case .notSelected: return "Select Activity Level"
            case .sedentary: return "Sedentary"
            case .light: return "Lightly Active"
            case .moderate: return "Moderately Active"
            case .very: return "Very Active"
            }
        }
        
        var description: String {
            switch self {
            case .notSelected: return ""
            case .sedentary: return "Little to no exercise, desk job"
            case .light: return "Light exercise 1-3 days per week"
            case .moderate: return "Moderate exercise 3-5 days per week"
            case .very: return "Hard exercise 6-7 days per week"
            }
        }
    }
    
    enum Goal: String, CaseIterable, Codable {
        case notSelected = ""
        case lose = "lose"
        case maintain = "maintain"
        case gain = "gain"
        
        var displayName: String {
            switch self {
            case .notSelected: return "Select Goal"
            case .lose: return "Lose Weight"
            case .maintain: return "Maintain Weight"
            case .gain: return "Gain Weight"
            }
        }
        
        var description: String {
            switch self {
            case .notSelected: return ""
            case .lose: return "Create a caloric deficit for weight loss"
            case .maintain: return "Maintain current weight with balanced nutrition"
            case .gain: return "Build muscle and increase healthy weight"
            }
        }
    }
    
    enum DietType: String, CaseIterable, Codable {
        case notSelected = ""
        case omnivore = "omnivore"
        case vegetarian = "vegetarian"
        case vegan = "vegan"
        
        var displayName: String {
            switch self {
            case .notSelected: return "Select Diet Type"
            case .omnivore: return "Non-Vegetarian"
            case .vegetarian: return "Vegetarian"
            case .vegan: return "Vegan"
            }
        }
        
        var description: String {
            switch self {
            case .notSelected: return ""
            case .omnivore: return "Includes meat, fish, dairy, and plant foods"
            case .vegetarian: return "Plant foods, dairy, and eggs (no meat or fish)"
            case .vegan: return "Plant foods only (no animal products)"
            }
        }
    }
    
    enum CookingTime: String, CaseIterable, Codable {
        case quick = "quick"
        case moderate = "moderate"
        case elaborate = "elaborate"
        case mixed = "mixed"
        
        var displayName: String {
            switch self {
            case .quick: return "Quick (15-30 minutes)"
            case .moderate: return "Moderate (30-60 minutes)"
            case .elaborate: return "Elaborate (60+ minutes)"
            case .mixed: return "Mixed (variety of times)"
            }
        }
    }
    
    enum Budget: String, CaseIterable, Codable {
        case low = "low"
        case medium = "medium"
        case high = "high"
        case flexible = "flexible"
        
        var displayName: String {
            switch self {
            case .low: return "Budget-friendly"
            case .medium: return "Moderate"
            case .high: return "Premium ingredients"
            case .flexible: return "Flexible"
            }
        }
    }
}

// MARK: - Meal Models
struct Meal: Codable, Identifiable {
    let id = UUID()
    let type: MealType
    let name: String
    let calories: Int
    let protein: Int // grams
    let carbs: Int // grams
    let fat: Int // grams
    let prepTime: Int // minutes
    let description: String
    let ingredients: [String]
    let instructions: [String]
    let tags: [String]
    
    enum MealType: String, CaseIterable, Codable {
        case breakfast = "breakfast"
        case lunch = "lunch"
        case dinner = "dinner"
        case snack = "snack"
        
        var displayName: String {
            rawValue.capitalized
        }
        
        var emoji: String {
            switch self {
            case .breakfast: return "🌅"
            case .lunch: return "🌞"
            case .dinner: return "🌙"
            case .snack: return "🍎"
            }
        }
    }
}

struct DayMealPlan: Codable, Identifiable {
    let id = UUID()
    let day: String
    let meals: [Meal]
    let totalCalories: Int
    let totalProtein: Int
    let totalCarbs: Int
    let totalFat: Int
}

struct WeeklyMealPlan: Codable {
    let days: [DayMealPlan]
    let userProfile: UserProfile
    let generatedAt: Date
    let totalWeeklyCalories: Int
    let averageDailyCalories: Int
}

// MARK: - Sample Data Generator
class MealPlanGenerator {
    static func generateSampleMealPlan(for profile: UserProfile) -> WeeklyMealPlan {
        let baseCalories = calculateBaseCalories(for: profile)
        var days: [DayMealPlan] = []
        
        let dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        
        for dayName in dayNames {
            let meals = generateMealsForDay(profile: profile, targetCalories: baseCalories)
            let dayPlan = DayMealPlan(
                day: dayName,
                meals: meals,
                totalCalories: meals.reduce(0) { $0 + $1.calories },
                totalProtein: meals.reduce(0) { $0 + $1.protein },
                totalCarbs: meals.reduce(0) { $0 + $1.carbs },
                totalFat: meals.reduce(0) { $0 + $1.fat }
            )
            days.append(dayPlan)
        }
        
        let totalWeeklyCalories = days.reduce(0) { $0 + $1.totalCalories }
        
        return WeeklyMealPlan(
            days: days,
            userProfile: profile,
            generatedAt: Date(),
            totalWeeklyCalories: totalWeeklyCalories,
            averageDailyCalories: totalWeeklyCalories / 7
        )
    }
    
    private static func calculateBaseCalories(for profile: UserProfile) -> Int {
        let bmr: Double
        
        // Harris-Benedict equation
        if profile.gender == .male {
            bmr = 88.362 + (13.397 * Double(profile.weight)) + (4.799 * Double(profile.height)) - (5.677 * Double(profile.age))
        } else {
            bmr = 447.593 + (9.247 * Double(profile.weight)) + (3.098 * Double(profile.height)) - (4.330 * Double(profile.age))
        }
        
        let activityMultiplier: Double
        switch profile.activityLevel {
        case .sedentary: activityMultiplier = 1.2
        case .light: activityMultiplier = 1.375
        case .moderate: activityMultiplier = 1.55
        case .very: activityMultiplier = 1.725
        case .notSelected: activityMultiplier = 1.375
        }
        
        let tdee = bmr * activityMultiplier
        
        switch profile.goal {
        case .lose: return Int(tdee - 500) // 500 calorie deficit
        case .maintain: return Int(tdee)
        case .gain: return Int(tdee + 500) // 500 calorie surplus
        case .notSelected: return Int(tdee)
        }
    }
    
    private static func generateMealsForDay(profile: UserProfile, targetCalories: Int) -> [Meal] {
        var meals: [Meal] = []
        
        // Sample meals based on diet type
        let breakfastCalories = Int(Double(targetCalories) * 0.25)
        let lunchCalories = Int(Double(targetCalories) * 0.35)
        let dinnerCalories = Int(Double(targetCalories) * 0.3)
        let snackCalories = Int(Double(targetCalories) * 0.1)
        
        // Generate breakfast
        meals.append(generateMeal(type: .breakfast, targetCalories: breakfastCalories, dietType: profile.dietType))
        
        // Generate lunch
        meals.append(generateMeal(type: .lunch, targetCalories: lunchCalories, dietType: profile.dietType))
        
        // Generate dinner
        meals.append(generateMeal(type: .dinner, targetCalories: dinnerCalories, dietType: profile.dietType))
        
        // Add snacks if requested
        if profile.mealsPerDay > 3 {
            meals.append(generateMeal(type: .snack, targetCalories: snackCalories, dietType: profile.dietType))
        }
        
        return meals
    }
    
    private static func generateMeal(type: Meal.MealType, targetCalories: Int, dietType: UserProfile.DietType) -> Meal {
        let sampleMeals: [Meal.MealType: [(name: String, protein: Int, carbs: Int, fat: Int, ingredients: [String], instructions: [String])]] = [
            .breakfast: [
                ("Oatmeal with Berries", 12, 45, 8, ["Rolled oats", "Mixed berries", "Almond milk", "Honey"], ["Cook oats with almond milk", "Top with berries and honey"]),
                ("Avocado Toast", 15, 35, 18, ["Whole grain bread", "Avocado", "Tomato", "Lemon"], ["Toast bread", "Mash avocado", "Add tomato and lemon"]),
                ("Greek Yogurt Parfait", 20, 30, 5, ["Greek yogurt", "Granola", "Berries", "Honey"], ["Layer yogurt with granola and berries"])
            ],
            .lunch: [
                ("Quinoa Buddha Bowl", 18, 55, 12, ["Quinoa", "Chickpeas", "Spinach", "Sweet potato"], ["Cook quinoa", "Roast vegetables", "Combine with chickpeas"]),
                ("Grilled Chicken Salad", 35, 15, 8, ["Chicken breast", "Mixed greens", "Cherry tomatoes", "Cucumber"], ["Grill chicken", "Toss with vegetables"]),
                ("Lentil Soup", 16, 40, 6, ["Red lentils", "Vegetables", "Vegetable broth", "Spices"], ["Simmer lentils with vegetables and spices"])
            ],
            .dinner: [
                ("Baked Salmon with Vegetables", 40, 25, 15, ["Salmon fillet", "Broccoli", "Sweet potato", "Olive oil"], ["Bake salmon and vegetables with herbs"]),
                ("Vegetable Stir-fry", 12, 35, 10, ["Tofu", "Mixed vegetables", "Brown rice", "Soy sauce"], ["Stir-fry vegetables and tofu", "Serve over rice"]),
                ("Pasta Primavera", 15, 60, 8, ["Whole wheat pasta", "Seasonal vegetables", "Olive oil", "Herbs"], ["Cook pasta", "Sauté vegetables", "Combine with herbs"])
            ],
            .snack: [
                ("Apple with Almond Butter", 6, 25, 8, ["Apple", "Almond butter"], ["Slice apple", "Serve with almond butter"]),
                ("Trail Mix", 8, 20, 12, ["Nuts", "Dried fruit", "Seeds"], ["Mix ingredients together"]),
                ("Hummus with Vegetables", 4, 15, 6, ["Hummus", "Carrot sticks", "Cucumber"], ["Cut vegetables", "Serve with hummus"])
            ]
        ]
        
        let mealOptions = sampleMeals[type] ?? []
        let selectedMeal = mealOptions.randomElement() ?? ("Sample Meal", 10, 20, 5, ["Ingredients"], ["Instructions"])
        
        // Adjust calories to match target
        let baseMacroCalories = (selectedMeal.protein * 4) + (selectedMeal.carbs * 4) + (selectedMeal.fat * 9)
        let scaleFactor = Double(targetCalories) / Double(baseMacroCalories)
        
        return Meal(
            type: type,
            name: selectedMeal.name,
            calories: targetCalories,
            protein: Int(Double(selectedMeal.protein) * scaleFactor),
            carbs: Int(Double(selectedMeal.carbs) * scaleFactor),
            fat: Int(Double(selectedMeal.fat) * scaleFactor),
            prepTime: type == .snack ? 5 : 30,
            description: "A delicious and nutritious \(type.rawValue) option tailored to your dietary preferences.",
            ingredients: selectedMeal.ingredients,
            instructions: selectedMeal.instructions,
            tags: [dietType.rawValue, "healthy", "balanced"]
        )
    }
}
