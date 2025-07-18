import Foundation

// MARK: - User Profile Models
struct UserProfile: Codable {
    var age: Int
    var gender: Gender
    var height: Int // cm
    var weight: Int // kg
    var activityLevel: ActivityLevel
    var goal: Goal
    var dietType: DietType
    var allergies: [String]
    var restrictions: [String]
    var mealsPerDay: Int
    var cookingTime: CookingTime
    var budget: Budget?
}

enum Gender: String, CaseIterable, Codable {
    case male, female, other
    
    var displayName: String {
        switch self {
        case .male: return "Male"
        case .female: return "Female"
        case .other: return "Other"
        }
    }
}

enum ActivityLevel: String, CaseIterable, Codable {
    case sedentary, light, moderate, very
    
    var displayName: String {
        switch self {
        case .sedentary: return "Sedentary"
        case .light: return "Lightly Active"
        case .moderate: return "Moderately Active"
        case .very: return "Very Active"
        }
    }
    
    var description: String {
        switch self {
        case .sedentary: return "Little to no exercise, desk job"
        case .light: return "Light exercise 1-3 days per week"
        case .moderate: return "Moderate exercise 3-5 days per week"
        case .very: return "Hard exercise 6-7 days per week"
        }
    }
}

enum Goal: String, CaseIterable, Codable {
    case lose, maintain, gain
    
    var displayName: String {
        switch self {
        case .lose: return "Lose Weight"
        case .maintain: return "Maintain Weight"
        case .gain: return "Gain Weight"
        }
    }
    
    var description: String {
        switch self {
        case .lose: return "Create a caloric deficit for weight loss"
        case .maintain: return "Maintain current weight with balanced nutrition"
        case .gain: return "Build muscle and increase healthy weight"
        }
    }
}

enum DietType: String, CaseIterable, Codable {
    case omnivore, vegetarian, vegan
    
    var displayName: String {
        switch self {
        case .omnivore: return "Non-Vegetarian"
        case .vegetarian: return "Vegetarian"
        case .vegan: return "Vegan"
        }
    }
    
    var description: String {
        switch self {
        case .omnivore: return "Includes meat, fish, dairy, and plant foods"
        case .vegetarian: return "Plant foods, dairy, and eggs (no meat or fish)"
        case .vegan: return "Plant foods only (no animal products)"
        }
    }
}

enum CookingTime: String, CaseIterable, Codable {
    case quick, moderate, elaborate, mixed
    
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
    case low, medium, high, flexible
    
    var displayName: String {
        switch self {
        case .low: return "Budget-friendly"
        case .medium: return "Moderate"
        case .high: return "Premium ingredients"
        case .flexible: return "Flexible"
        }
    }
}

// MARK: - Meal Plan Models
struct WeeklyMealPlan: Codable, Identifiable {
    let id = UUID()
    let days: [DayMealPlan]
    let userProfile: UserProfile
    let generatedAt: String
    let totalWeeklyCalories: Int
    let averageDailyCalories: Int
    
    private enum CodingKeys: String, CodingKey {
        case days, userProfile, generatedAt, totalWeeklyCalories, averageDailyCalories
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
    
    private enum CodingKeys: String, CodingKey {
        case day, meals, totalCalories, totalProtein, totalCarbs, totalFat
    }
}

struct Meal: Codable, Identifiable {
    let id = UUID()
    let type: MealType
    let name: String
    let calories: Int
    let protein: Int
    let carbs: Int
    let fat: Int
    let prepTime: Int
    let image: String
    let description: String
    let ingredients: [String]
    let instructions: [String]
    let tags: [String]
    
    private enum CodingKeys: String, CodingKey {
        case type, name, calories, protein, carbs, fat
        case prepTime = "prep_time"
        case image, description, ingredients, instructions, tags
    }
}

enum MealType: String, CaseIterable, Codable {
    case breakfast, lunch, dinner, snack
    
    var displayName: String {
        switch self {
        case .breakfast: return "Breakfast"
        case .lunch: return "Lunch"
        case .dinner: return "Dinner"
        case .snack: return "Snack"
        }
    }
}

// MARK: - API Models
struct GenerateMealPlanRequest: Codable {
    let userProfile: UserProfile
}

struct GenerateMealPlanResponse: Codable {
    let success: Bool
    let mealPlan: WeeklyMealPlan?
    let error: String?
}

struct NutritionGoals: Codable {
    let dailyCalories: Int
    let dailyProtein: Int
    let dailyCarbs: Int
    let dailyFat: Int
    let tdee: Int
}
