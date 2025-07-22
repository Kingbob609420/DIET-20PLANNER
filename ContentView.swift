import SwiftUI

struct ContentView: View {
    @State private var currentView: AppView = .landing
    @State private var userProfile = UserProfile()
    @State private var currentStep = 1
    @State private var mealPlan: WeeklyMealPlan?
    @State private var isGeneratingPlan = false
    
    enum AppView {
        case landing
        case planner
        case results
    }
    
    var body: some View {
        NavigationView {
            ZStack {
                // Background gradient
                LinearGradient(
                    gradient: Gradient(colors: [
                        Color(red: 0.95, green: 0.98, blue: 0.95),
                        Color.white,
                        Color(red: 0.95, green: 0.98, blue: 0.95)
                    ]),
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .ignoresSafeArea()
                
                switch currentView {
                case .landing:
                    LandingView(onStartPlanning: {
                        currentView = .planner
                    })
                case .planner:
                    PlannerView(
                        userProfile: $userProfile,
                        currentStep: $currentStep,
                        onBack: {
                            if currentStep > 1 {
                                currentStep -= 1
                            } else {
                                currentView = .landing
                            }
                        },
                        onNext: {
                            if currentStep < 4 {
                                currentStep += 1
                            } else {
                                generateMealPlan()
                            }
                        },
                        isGenerating: $isGeneratingPlan
                    )
                case .results:
                    if let plan = mealPlan {
                        ResultsView(
                            mealPlan: plan,
                            onBackToPlanner: {
                                currentView = .planner
                                currentStep = 1
                            },
                            onStartOver: {
                                currentView = .landing
                                currentStep = 1
                                userProfile = UserProfile()
                                mealPlan = nil
                            }
                        )
                    }
                }
            }
        }
        .navigationViewStyle(StackNavigationViewStyle())
    }
    
    private func generateMealPlan() {
        isGeneratingPlan = true
        
        // Simulate API call delay
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
            mealPlan = MealPlanGenerator.generateSampleMealPlan(for: userProfile)
            isGeneratingPlan = false
            currentView = .results
        }
    }
}

// MARK: - Landing View
struct LandingView: View {
    let onStartPlanning: () -> Void
    
    var body: some View {
        ScrollView {
            VStack(spacing: 30) {
                // Header
                VStack(spacing: 20) {
                    HStack {
                        Image(systemName: "fork.knife.circle.fill")
                            .foregroundColor(.green)
                            .font(.system(size: 32))
                        Text("NutriPlan")
                            .font(.largeTitle)
                            .fontWeight(.bold)
                        
                        Spacer()
                    }
                    .padding(.horizontal)
                    
                    // Hero Section
                    VStack(spacing: 16) {
                        HStack {
                            Image(systemName: "bolt.fill")
                                .foregroundColor(.green)
                            Text("AI-Powered Nutrition")
                                .font(.caption)
                                .foregroundColor(.green)
                        }
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(Color.green.opacity(0.1))
                        .cornerRadius(20)
                        
                        Text("Your Personal AI Diet Planner")
                            .font(.system(size: 28, weight: .bold))
                            .multilineTextAlignment(.center)
                            .foregroundStyle(
                                LinearGradient(
                                    colors: [.green, Color(red: 0.2, green: 0.7, blue: 0.2)],
                                    startPoint: .leading,
                                    endPoint: .trailing
                                )
                            )
                        
                        Text("Get personalized meal plans tailored to your age, gender, activity level, and dietary preferences. Vegetarian, non-vegetarian, and vegan options available.")
                            .font(.body)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal)
                    }
                }
                
                // CTA Buttons
                VStack(spacing: 12) {
                    Button(action: onStartPlanning) {
                        HStack {
                            Text("Create My Diet Plan")
                                .fontWeight(.medium)
                            Image(systemName: "arrow.right")
                        }
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.green)
                        .cornerRadius(12)
                    }
                    
                    Button(action: {}) {
                        HStack {
                            Image(systemName: "chef.hat")
                            Text("View Sample Plans")
                        }
                        .foregroundColor(.green)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.clear)
                        .overlay(
                            RoundedRectangle(cornerRadius: 12)
                                .stroke(Color.green, lineWidth: 1)
                        )
                    }
                }
                .padding(.horizontal)
                
                // Stats
                HStack(spacing: 30) {
                    VStack {
                        Text("10,000+")
                            .font(.title2)
                            .fontWeight(.bold)
                            .foregroundColor(.green)
                        Text("Happy Users")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    
                    VStack {
                        Text("5,000+")
                            .font(.title2)
                            .fontWeight(.bold)
                            .foregroundColor(.green)
                        Text("Meal Recipes")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    
                    VStack {
                        Text("98%")
                            .font(.title2)
                            .fontWeight(.bold)
                            .foregroundColor(.green)
                        Text("Success Rate")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                
                // Features
                VStack(spacing: 20) {
                    Text("Why Choose NutriPlan?")
                        .font(.title2)
                        .fontWeight(.bold)
                    
                    LazyVGrid(columns: [
                        GridItem(.flexible()),
                        GridItem(.flexible())
                    ], spacing: 16) {
                        FeatureCard(
                            icon: "target",
                            title: "Personalized Plans",
                            description: "Tailored to your goals and preferences"
                        )
                        
                        FeatureCard(
                            icon: "leaf.fill",
                            title: "Dietary Options",
                            description: "Vegan, vegetarian, and omnivore plans"
                        )
                        
                        FeatureCard(
                            icon: "calendar",
                            title: "Weekly Planning",
                            description: "Complete 7-day meal schedules"
                        )
                        
                        FeatureCard(
                            icon: "heart.fill",
                            title: "Health Focused",
                            description: "Nutritionally balanced meals"
                        )
                    }
                }
                .padding(.horizontal)
                
                Spacer(minLength: 20)
            }
            .padding(.vertical)
        }
    }
}

struct FeatureCard: View {
    let icon: String
    let title: String
    let description: String
    
    var body: some View {
        VStack(spacing: 12) {
            Image(systemName: icon)
                .foregroundColor(.green)
                .font(.title2)
                .frame(width: 40, height: 40)
                .background(Color.green.opacity(0.1))
                .cornerRadius(8)
            
            VStack(spacing: 4) {
                Text(title)
                    .font(.headline)
                    .fontWeight(.medium)
                
                Text(description)
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
            }
        }
        .padding()
        .background(Color.white)
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.05), radius: 5, x: 0, y: 2)
    }
}

// MARK: - Planner View
struct PlannerView: View {
    @Binding var userProfile: UserProfile
    @Binding var currentStep: Int
    let onBack: () -> Void
    let onNext: () -> Void
    @Binding var isGenerating: Bool
    
    private let totalSteps = 4
    private var progress: Double {
        Double(currentStep) / Double(totalSteps)
    }
    
    var body: some View {
        VStack(spacing: 0) {
            // Header
            HStack {
                Button(action: onBack) {
                    Image(systemName: "arrow.left")
                        .foregroundColor(.primary)
                }
                
                HStack {
                    Image(systemName: "fork.knife.circle.fill")
                        .foregroundColor(.green)
                    Text("NutriPlan")
                        .fontWeight(.bold)
                }
                
                Spacer()
                
                Text("Step \(currentStep) of \(totalSteps)")
                    .font(.caption)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .background(Color.green.opacity(0.1))
                    .foregroundColor(.green)
                    .cornerRadius(20)
            }
            .padding()
            .background(Color.white.opacity(0.8))
            
            // Progress Bar
            VStack(spacing: 8) {
                HStack {
                    Text("Progress")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Spacer()
                    Text("\(Int(progress * 100))%")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                ProgressView(value: progress)
                    .progressViewStyle(LinearProgressViewStyle(tint: .green))
            }
            .padding(.horizontal)
            .padding(.bottom)
            
            ScrollView {
                VStack(spacing: 20) {
                    // Step Content
                    switch currentStep {
                    case 1:
                        PersonalInfoStep(userProfile: $userProfile)
                    case 2:
                        ActivityGoalsStep(userProfile: $userProfile)
                    case 3:
                        DietaryPreferencesStep(userProfile: $userProfile)
                    case 4:
                        MealPreferencesStep(userProfile: $userProfile)
                    default:
                        EmptyView()
                    }
                }
                .padding()
            }
            
            // Navigation Buttons
            HStack(spacing: 16) {
                Button(action: onBack) {
                    HStack {
                        Image(systemName: "arrow.left")
                        Text("Previous")
                    }
                    .foregroundColor(.primary)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.clear)
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(Color.gray.opacity(0.3), lineWidth: 1)
                    )
                }
                .disabled(currentStep == 1 && !isGenerating)
                
                Button(action: onNext) {
                    HStack {
                        if isGenerating {
                            ProgressView()
                                .scaleEffect(0.8)
                            Text("Generating...")
                        } else {
                            Text(currentStep == totalSteps ? "Generate Plan" : "Next")
                            Image(systemName: "arrow.right")
                        }
                    }
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(isStepValid() ? Color.green : Color.gray)
                    .cornerRadius(12)
                }
                .disabled(!isStepValid() || isGenerating)
            }
            .padding()
            .background(Color.white.opacity(0.8))
        }
    }
    
    private func isStepValid() -> Bool {
        switch currentStep {
        case 1:
            return userProfile.age > 0 && userProfile.gender != .notSelected && 
                   userProfile.height > 0 && userProfile.weight > 0
        case 2:
            return userProfile.activityLevel != .notSelected && userProfile.goal != .notSelected
        case 3:
            return userProfile.dietType != .notSelected
        case 4:
            return userProfile.mealsPerDay > 0
        default:
            return false
        }
    }
}

// MARK: - Step Views
struct PersonalInfoStep: View {
    @Binding var userProfile: UserProfile
    
    var body: some View {
        VStack(spacing: 24) {
            VStack(spacing: 16) {
                Image(systemName: "person.circle.fill")
                    .foregroundColor(.green)
                    .font(.system(size: 48))
                
                Text("Personal Information")
                    .font(.title2)
                    .fontWeight(.bold)
                
                Text("Help us understand your basic profile to create the perfect meal plan")
                    .font(.body)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
            }
            
            VStack(spacing: 16) {
                HStack(spacing: 12) {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Age")
                            .font(.subheadline)
                            .fontWeight(.medium)
                        TextField("25", value: $userProfile.age, format: .number)
                            .textFieldStyle(RoundedBorderTextFieldStyle())
                            .keyboardType(.numberPad)
                    }
                    
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Gender")
                            .font(.subheadline)
                            .fontWeight(.medium)
                        Picker("Gender", selection: $userProfile.gender) {
                            ForEach(UserProfile.Gender.allCases, id: \.self) { gender in
                                Text(gender.displayName).tag(gender)
                            }
                        }
                        .pickerStyle(MenuPickerStyle())
                        .frame(height: 36)
                        .background(Color.gray.opacity(0.1))
                        .cornerRadius(8)
                    }
                }
                
                HStack(spacing: 12) {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Height (cm)")
                            .font(.subheadline)
                            .fontWeight(.medium)
                        TextField("170", value: $userProfile.height, format: .number)
                            .textFieldStyle(RoundedBorderTextFieldStyle())
                            .keyboardType(.numberPad)
                    }
                    
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Weight (kg)")
                            .font(.subheadline)
                            .fontWeight(.medium)
                        TextField("70", value: $userProfile.weight, format: .number)
                            .textFieldStyle(RoundedBorderTextFieldStyle())
                            .keyboardType(.numberPad)
                    }
                }
            }
        }
        .padding()
        .background(Color.white)
        .cornerRadius(16)
    }
}

struct ActivityGoalsStep: View {
    @Binding var userProfile: UserProfile
    
    var body: some View {
        VStack(spacing: 24) {
            VStack(spacing: 16) {
                Image(systemName: "figure.run.circle.fill")
                    .foregroundColor(.green)
                    .font(.system(size: 48))
                
                Text("Activity & Goals")
                    .font(.title2)
                    .fontWeight(.bold)
                
                Text("Tell us about your lifestyle and what you want to achieve")
                    .font(.body)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
            }
            
            VStack(spacing: 20) {
                VStack(alignment: .leading, spacing: 12) {
                    Text("Activity Level")
                        .font(.subheadline)
                        .fontWeight(.medium)
                    
                    ForEach(UserProfile.ActivityLevel.allCases.dropFirst(), id: \.self) { level in
                        Button(action: {
                            userProfile.activityLevel = level
                        }) {
                            HStack {
                                VStack(alignment: .leading, spacing: 4) {
                                    Text(level.displayName)
                                        .fontWeight(.medium)
                                    Text(level.description)
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                }
                                Spacer()
                                if userProfile.activityLevel == level {
                                    Image(systemName: "checkmark.circle.fill")
                                        .foregroundColor(.green)
                                }
                            }
                            .padding()
                            .background(userProfile.activityLevel == level ? Color.green.opacity(0.1) : Color.gray.opacity(0.05))
                            .overlay(
                                RoundedRectangle(cornerRadius: 12)
                                    .stroke(userProfile.activityLevel == level ? Color.green : Color.gray.opacity(0.2), lineWidth: 1)
                            )
                            .cornerRadius(12)
                        }
                        .buttonStyle(PlainButtonStyle())
                    }
                }
                
                VStack(alignment: .leading, spacing: 12) {
                    Text("Primary Goal")
                        .font(.subheadline)
                        .fontWeight(.medium)
                    
                    ForEach(UserProfile.Goal.allCases.dropFirst(), id: \.self) { goal in
                        Button(action: {
                            userProfile.goal = goal
                        }) {
                            HStack {
                                VStack(alignment: .leading, spacing: 4) {
                                    Text(goal.displayName)
                                        .fontWeight(.medium)
                                    Text(goal.description)
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                }
                                Spacer()
                                if userProfile.goal == goal {
                                    Image(systemName: "checkmark.circle.fill")
                                        .foregroundColor(.green)
                                }
                            }
                            .padding()
                            .background(userProfile.goal == goal ? Color.green.opacity(0.1) : Color.gray.opacity(0.05))
                            .overlay(
                                RoundedRectangle(cornerRadius: 12)
                                    .stroke(userProfile.goal == goal ? Color.green : Color.gray.opacity(0.2), lineWidth: 1)
                            )
                            .cornerRadius(12)
                        }
                        .buttonStyle(PlainButtonStyle())
                    }
                }
            }
        }
        .padding()
        .background(Color.white)
        .cornerRadius(16)
    }
}

struct DietaryPreferencesStep: View {
    @Binding var userProfile: UserProfile
    
    var body: some View {
        VStack(spacing: 24) {
            VStack(spacing: 16) {
                Image(systemName: "leaf.circle.fill")
                    .foregroundColor(.green)
                    .font(.system(size: 48))
                
                Text("Dietary Preferences")
                    .font(.title2)
                    .fontWeight(.bold)
                
                Text("Choose your dietary style and any restrictions we should know about")
                    .font(.body)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
            }
            
            VStack(spacing: 20) {
                VStack(alignment: .leading, spacing: 12) {
                    Text("Diet Type")
                        .font(.subheadline)
                        .fontWeight(.medium)
                    
                    ForEach(UserProfile.DietType.allCases.dropFirst(), id: \.self) { diet in
                        Button(action: {
                            userProfile.dietType = diet
                        }) {
                            HStack {
                                VStack(alignment: .leading, spacing: 4) {
                                    Text(diet.displayName)
                                        .fontWeight(.medium)
                                    Text(diet.description)
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                }
                                Spacer()
                                if userProfile.dietType == diet {
                                    Image(systemName: "checkmark.circle.fill")
                                        .foregroundColor(.green)
                                }
                            }
                            .padding()
                            .background(userProfile.dietType == diet ? Color.green.opacity(0.1) : Color.gray.opacity(0.05))
                            .overlay(
                                RoundedRectangle(cornerRadius: 12)
                                    .stroke(userProfile.dietType == diet ? Color.green : Color.gray.opacity(0.2), lineWidth: 1)
                            )
                            .cornerRadius(12)
                        }
                        .buttonStyle(PlainButtonStyle())
                    }
                }
                
                VStack(alignment: .leading, spacing: 12) {
                    Text("Allergies (Optional)")
                        .font(.subheadline)
                        .fontWeight(.medium)
                    
                    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 8) {
                        ForEach(["Nuts", "Dairy", "Eggs", "Soy", "Gluten", "Shellfish"], id: \.self) { allergy in
                            Button(action: {
                                if userProfile.allergies.contains(allergy) {
                                    userProfile.allergies.removeAll { $0 == allergy }
                                } else {
                                    userProfile.allergies.append(allergy)
                                }
                            }) {
                                HStack {
                                    Text(allergy)
                                        .font(.caption)
                                    if userProfile.allergies.contains(allergy) {
                                        Image(systemName: "checkmark")
                                            .font(.caption)
                                    }
                                }
                                .foregroundColor(userProfile.allergies.contains(allergy) ? .white : .primary)
                                .padding(.horizontal, 12)
                                .padding(.vertical, 8)
                                .background(userProfile.allergies.contains(allergy) ? Color.green : Color.gray.opacity(0.1))
                                .cornerRadius(20)
                            }
                        }
                    }
                }
            }
        }
        .padding()
        .background(Color.white)
        .cornerRadius(16)
    }
}

struct MealPreferencesStep: View {
    @Binding var userProfile: UserProfile
    
    var body: some View {
        VStack(spacing: 24) {
            VStack(spacing: 16) {
                Image(systemName: "clock.circle.fill")
                    .foregroundColor(.green)
                    .font(.system(size: 48))
                
                Text("Meal Preferences")
                    .font(.title2)
                    .fontWeight(.bold)
                
                Text("Final details to customize your perfect meal plan")
                    .font(.body)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
            }
            
            VStack(spacing: 16) {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Meals per Day")
                        .font(.subheadline)
                        .fontWeight(.medium)
                    Picker("Meals per Day", selection: $userProfile.mealsPerDay) {
                        Text("3 meals (Breakfast, Lunch, Dinner)").tag(3)
                        Text("4 meals (+ 1 Snack)").tag(4)
                        Text("5 meals (+ 2 Snacks)").tag(5)
                        Text("6 meals (+ 3 Snacks)").tag(6)
                    }
                    .pickerStyle(MenuPickerStyle())
                    .frame(height: 36)
                    .background(Color.gray.opacity(0.1))
                    .cornerRadius(8)
                }
                
                VStack(alignment: .leading, spacing: 8) {
                    Text("Cooking Time Preference")
                        .font(.subheadline)
                        .fontWeight(.medium)
                    Picker("Cooking Time", selection: $userProfile.cookingTime) {
                        ForEach(UserProfile.CookingTime.allCases, id: \.self) { time in
                            Text(time.displayName).tag(time)
                        }
                    }
                    .pickerStyle(MenuPickerStyle())
                    .frame(height: 36)
                    .background(Color.gray.opacity(0.1))
                    .cornerRadius(8)
                }
                
                VStack(alignment: .leading, spacing: 8) {
                    Text("Budget Range")
                        .font(.subheadline)
                        .fontWeight(.medium)
                    Picker("Budget", selection: $userProfile.budget) {
                        ForEach(UserProfile.Budget.allCases, id: \.self) { budget in
                            Text(budget.displayName).tag(budget)
                        }
                    }
                    .pickerStyle(MenuPickerStyle())
                    .frame(height: 36)
                    .background(Color.gray.opacity(0.1))
                    .cornerRadius(8)
                }
            }
        }
        .padding()
        .background(Color.white)
        .cornerRadius(16)
    }
}

// MARK: - Results View
struct ResultsView: View {
    let mealPlan: WeeklyMealPlan
    let onBackToPlanner: () -> Void
    let onStartOver: () -> Void
    @State private var selectedDay = 0
    
    var body: some View {
        VStack(spacing: 0) {
            // Header
            HStack {
                Button(action: onBackToPlanner) {
                    Image(systemName: "arrow.left")
                        .foregroundColor(.primary)
                }
                
                HStack {
                    Image(systemName: "fork.knife.circle.fill")
                        .foregroundColor(.green)
                    Text("Your Meal Plan")
                        .fontWeight(.bold)
                }
                
                Spacer()
                
                Button(action: onStartOver) {
                    Text("New Plan")
                        .font(.caption)
                        .foregroundColor(.green)
                }
            }
            .padding()
            .background(Color.white.opacity(0.8))
            
            ScrollView {
                VStack(spacing: 20) {
                    // Summary Stats
                    VStack(spacing: 16) {
                        Text("Weekly Overview")
                            .font(.title2)
                            .fontWeight(.bold)
                        
                        HStack(spacing: 20) {
                            VStack {
                                Text("\(mealPlan.averageDailyCalories)")
                                    .font(.title2)
                                    .fontWeight(.bold)
                                    .foregroundColor(.green)
                                Text("Avg Daily Calories")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                            
                            VStack {
                                Text("\(mealPlan.totalWeeklyCalories)")
                                    .font(.title2)
                                    .fontWeight(.bold)
                                    .foregroundColor(.green)
                                Text("Weekly Calories")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                            
                            VStack {
                                Text("\(mealPlan.days.count)")
                                    .font(.title2)
                                    .fontWeight(.bold)
                                    .foregroundColor(.green)
                                Text("Days Planned")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                        }
                    }
                    .padding()
                    .background(Color.white)
                    .cornerRadius(16)
                    
                    // Day Selector
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 12) {
                            ForEach(0..<mealPlan.days.count, id: \.self) { index in
                                Button(action: {
                                    selectedDay = index
                                }) {
                                    VStack(spacing: 4) {
                                        Text(mealPlan.days[index].day)
                                            .font(.caption)
                                            .fontWeight(.medium)
                                        Text("\(mealPlan.days[index].totalCalories)")
                                            .font(.caption2)
                                            .foregroundColor(.secondary)
                                    }
                                    .foregroundColor(selectedDay == index ? .white : .primary)
                                    .padding(.horizontal, 16)
                                    .padding(.vertical, 8)
                                    .background(selectedDay == index ? Color.green : Color.gray.opacity(0.1))
                                    .cornerRadius(20)
                                }
                            }
                        }
                        .padding(.horizontal)
                    }
                    
                    // Selected Day Meals
                    if selectedDay < mealPlan.days.count {
                        let dayPlan = mealPlan.days[selectedDay]
                        
                        VStack(spacing: 16) {
                            Text("\(dayPlan.day) Meals")
                                .font(.title3)
                                .fontWeight(.bold)
                            
                            ForEach(dayPlan.meals) { meal in
                                MealCard(meal: meal)
                            }
                            
                            // Daily Totals
                            VStack(spacing: 8) {
                                Text("Daily Totals")
                                    .font(.headline)
                                    .fontWeight(.medium)
                                
                                HStack(spacing: 20) {
                                    NutrientInfo(title: "Calories", value: "\(dayPlan.totalCalories)", color: .green)
                                    NutrientInfo(title: "Protein", value: "\(dayPlan.totalProtein)g", color: .blue)
                                    NutrientInfo(title: "Carbs", value: "\(dayPlan.totalCarbs)g", color: .orange)
                                    NutrientInfo(title: "Fat", value: "\(dayPlan.totalFat)g", color: .purple)
                                }
                            }
                            .padding()
                            .background(Color.gray.opacity(0.05))
                            .cornerRadius(12)
                        }
                    }
                }
                .padding()
            }
        }
    }
}

struct MealCard: View {
    let meal: Meal
    @State private var isExpanded = false
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                HStack(spacing: 8) {
                    Text(meal.type.emoji)
                        .font(.title2)
                    
                    VStack(alignment: .leading, spacing: 2) {
                        Text(meal.type.displayName)
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Text(meal.name)
                            .font(.headline)
                            .fontWeight(.medium)
                    }
                }
                
                Spacer()
                
                VStack(alignment: .trailing, spacing: 2) {
                    Text("\(meal.calories)")
                        .font(.title3)
                        .fontWeight(.bold)
                        .foregroundColor(.green)
                    Text("calories")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
            }
            
            Text(meal.description)
                .font(.caption)
                .foregroundColor(.secondary)
            
            HStack(spacing: 16) {
                NutrientBadge(title: "Protein", value: "\(meal.protein)g", color: .blue)
                NutrientBadge(title: "Carbs", value: "\(meal.carbs)g", color: .orange)
                NutrientBadge(title: "Fat", value: "\(meal.fat)g", color: .purple)
                
                Spacer()
                
                Button(action: {
                    isExpanded.toggle()
                }) {
                    Text(isExpanded ? "Less" : "More")
                        .font(.caption)
                        .foregroundColor(.green)
                }
            }
            
            if isExpanded {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Ingredients:")
                        .font(.caption)
                        .fontWeight(.medium)
                    Text(meal.ingredients.joined(separator: ", "))
                        .font(.caption2)
                        .foregroundColor(.secondary)
                    
                    Text("Prep time: \(meal.prepTime) minutes")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
            }
        }
        .padding()
        .background(Color.white)
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.05), radius: 5, x: 0, y: 2)
    }
}

struct NutrientBadge: View {
    let title: String
    let value: String
    let color: Color
    
    var body: some View {
        VStack(spacing: 2) {
            Text(value)
                .font(.caption)
                .fontWeight(.medium)
                .foregroundColor(color)
            Text(title)
                .font(.caption2)
                .foregroundColor(.secondary)
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 4)
        .background(color.opacity(0.1))
        .cornerRadius(8)
    }
}

struct NutrientInfo: View {
    let title: String
    let value: String
    let color: Color
    
    var body: some View {
        VStack(spacing: 2) {
            Text(value)
                .font(.subheadline)
                .fontWeight(.bold)
                .foregroundColor(color)
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
        }
    }
}

#Preview {
    ContentView()
}
