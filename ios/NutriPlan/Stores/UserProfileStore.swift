import Foundation
import Combine

class UserProfileStore: ObservableObject {
    @Published var profile = UserProfile(
        age: 0,
        gender: .male,
        height: 0,
        weight: 0,
        unitSystem: .metric,
        activityLevel: .sedentary,
        goal: .maintain,
        dietType: .omnivore,
        allergies: [],
        restrictions: [],
        mealsPerDay: 3,
        cookingTime: .moderate,
        budget: nil
    )

    // Temporary storage for imperial units (display only)
    @Published var heightFeet: Int = 0
    @Published var heightInches: Int = 0
    @Published var weightPounds: Int = 0
    
    @Published var currentStep = 1
    @Published var isFormValid = false
    
    private let totalSteps = 4
    
    var progress: Double {
        return Double(currentStep) / Double(totalSteps)
    }
    
    func nextStep() {
        if currentStep < totalSteps {
            currentStep += 1
        }
    }
    
    func previousStep() {
        if currentStep > 1 {
            currentStep -= 1
        }
    }
    
    func validateCurrentStep() -> Bool {
        switch currentStep {
        case 1:
            if profile.unitSystem == .imperial {
                return profile.age > 0 && heightFeet > 0 && heightInches >= 0 && weightPounds > 0
            } else {
                return profile.age > 0 && profile.height > 0 && profile.weight > 0
            }
        case 2:
            return true // Activity level and goal are always valid (enum)
        case 3:
            return true // Diet type is always valid (enum)
        case 4:
            return profile.mealsPerDay > 0
        default:
            return false
        }
    }
    
    func resetProfile() {
        profile = UserProfile(
            age: 0,
            gender: .male,
            height: 0,
            weight: 0,
            unitSystem: .metric,
            activityLevel: .sedentary,
            goal: .maintain,
            dietType: .omnivore,
            allergies: [],
            restrictions: [],
            mealsPerDay: 3,
            cookingTime: .moderate,
            budget: nil
        )
        currentStep = 1
        heightFeet = 0
        heightInches = 0
        weightPounds = 0
    }

    // Unit conversion utilities
    func convertHeightToMetric() {
        let totalInches = Double(heightFeet * 12 + heightInches)
        profile.height = Int(totalInches * 2.54) // Convert to cm
    }

    func convertWeightToMetric() {
        profile.weight = Int(Double(weightPounds) * 0.453592) // Convert to kg
    }

    func convertHeightToImperial() {
        let totalInches = Double(profile.height) / 2.54
        heightFeet = Int(totalInches / 12)
        heightInches = Int(totalInches.truncatingRemainder(dividingBy: 12))
    }

    func convertWeightToImperial() {
        weightPounds = Int(Double(profile.weight) * 2.20462) // Convert to lbs
    }

    func updateUnitSystem(_ newSystem: UnitSystem) {
        if profile.unitSystem != newSystem {
            if newSystem == .imperial {
                // Convert current metric values to imperial for display
                convertHeightToImperial()
                convertWeightToImperial()
            } else {
                // Convert current imperial values to metric
                convertHeightToMetric()
                convertWeightToMetric()
            }
            profile.unitSystem = newSystem
        }
    }
}

class MealPlanStore: ObservableObject {
    @Published var currentMealPlan: WeeklyMealPlan?
    @Published var isLoading = false
    @Published var error: String?
    @Published var selectedDay = 0
    
    private let apiService = APIService()
    
    func generateMealPlan(for profile: UserProfile) {
        isLoading = true
        error = nil
        
        apiService.generateMealPlan(userProfile: profile) { [weak self] result in
            DispatchQueue.main.async {
                self?.isLoading = false
                
                switch result {
                case .success(let mealPlan):
                    self?.currentMealPlan = mealPlan
                case .failure(let error):
                    self?.error = error.localizedDescription
                }
            }
        }
    }
    
    func regenerateMealPlan(for profile: UserProfile) {
        generateMealPlan(for: profile)
    }
    
    func clearMealPlan() {
        currentMealPlan = nil
        error = nil
        selectedDay = 0
    }
}
