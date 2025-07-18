import Foundation
import Combine

class UserProfileStore: ObservableObject {
    @Published var profile = UserProfile(
        age: 0,
        gender: .male,
        height: 0,
        weight: 0,
        activityLevel: .sedentary,
        goal: .maintain,
        dietType: .omnivore,
        allergies: [],
        restrictions: [],
        mealsPerDay: 3,
        cookingTime: .moderate,
        budget: nil
    )
    
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
            return profile.age > 0 && profile.height > 0 && profile.weight > 0
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
