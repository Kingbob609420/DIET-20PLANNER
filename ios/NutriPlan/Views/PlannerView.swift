import SwiftUI

struct PlannerView: View {
    @EnvironmentObject var profileStore: UserProfileStore
    @EnvironmentObject var mealPlanStore: MealPlanStore
    @Environment(\.presentationMode) var presentationMode
    @State private var navigateToResults = false
    
    var body: some View {
        VStack(spacing: 0) {
            // Navigation Header
            HStack {
                Button(action: {
                    if profileStore.currentStep > 1 {
                        profileStore.previousStep()
                    } else {
                        presentationMode.wrappedValue.dismiss()
                    }
                }) {
                    HStack(spacing: 8) {
                        Image(systemName: "arrow.left")
                        HStack(spacing: 12) {
                            RoundedRectangle(cornerRadius: 8)
                                .fill(Color.green)
                                .frame(width: 32, height: 32)
                                .overlay(
                                    Image(systemName: "fork.knife")
                                        .foregroundColor(.white)
                                        .font(.system(size: 16, weight: .medium))
                                )
                            
                            Text("NutriPlan")
                                .font(.title2)
                                .fontWeight(.bold)
                        }
                    }
                    .foregroundColor(.primary)
                }
                
                Spacer()
                
                Text("Step \(profileStore.currentStep) of 4")
                    .font(.caption)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .background(Color.green.opacity(0.1))
                    .foregroundColor(.green)
                    .cornerRadius(12)
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 16)
            .background(Color(.systemBackground))
            .overlay(
                Rectangle()
                    .fill(Color(.systemGray4))
                    .frame(height: 0.5),
                alignment: .bottom
            )
            
            ScrollView {
                VStack(spacing: 24) {
                    // Progress Bar
                    VStack(spacing: 8) {
                        HStack {
                            Text("Progress")
                                .font(.caption)
                                .foregroundColor(.secondary)
                            
                            Spacer()
                            
                            Text("\(Int(profileStore.progress * 100))%")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        
                        ProgressView(value: profileStore.progress)
                            .progressViewStyle(LinearProgressViewStyle(tint: .green))
                            .frame(height: 8)
                            .cornerRadius(4)
                    }
                    .padding(.horizontal, 20)
                    .padding(.top, 20)
                    
                    // Step Content
                    Group {
                        switch profileStore.currentStep {
                        case 1:
                            Step1PersonalInfoView()
                        case 2:
                            Step2ActivityGoalsView()
                        case 3:
                            Step3DietaryPreferencesView()
                        case 4:
                            Step4MealPreferencesView()
                        default:
                            EmptyView()
                        }
                    }
                    .environmentObject(profileStore)
                    
                    Spacer().frame(height: 40)
                }
            }
            
            // Navigation Buttons
            HStack(spacing: 16) {
                Button(action: {
                    profileStore.previousStep()
                }) {
                    HStack {
                        Image(systemName: "arrow.left")
                        Text("Previous")
                    }
                    .font(.headline)
                    .foregroundColor(.green)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.clear)
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(Color.green, lineWidth: 1)
                    )
                }
                .disabled(profileStore.currentStep == 1)
                .opacity(profileStore.currentStep == 1 ? 0.5 : 1.0)
                
                Button(action: {
                    if profileStore.currentStep == 4 {
                        // Generate meal plan
                        mealPlanStore.generateMealPlan(for: profileStore.profile)
                        navigateToResults = true
                    } else {
                        profileStore.nextStep()
                    }
                }) {
                    HStack {
                        Text(profileStore.currentStep == 4 ? "Generate Plan" : "Next")
                        Image(systemName: "arrow.right")
                    }
                    .font(.headline)
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(profileStore.validateCurrentStep() ? Color.green : Color.gray)
                    .cornerRadius(12)
                }
                .disabled(!profileStore.validateCurrentStep())
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 16)
            .background(Color(.systemBackground))
            .overlay(
                Rectangle()
                    .fill(Color(.systemGray4))
                    .frame(height: 0.5),
                alignment: .top
            )
        }
        .navigationBarHidden(true)
        .fullScreenCover(isPresented: $navigateToResults) {
            ResultsView()
                .environmentObject(profileStore)
                .environmentObject(mealPlanStore)
        }
    }
}

// MARK: - Step 1: Personal Information
struct Step1PersonalInfoView: View {
    @EnvironmentObject var profileStore: UserProfileStore
    
    var body: some View {
        VStack(spacing: 0) {
            StepHeaderView(
                icon: "person.circle",
                title: "Personal Information",
                description: "Help us understand your basic profile to create the perfect meal plan"
            )
            
            VStack(spacing: 24) {
                HStack(spacing: 16) {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Age")
                            .font(.headline)
                        
                        TextField("25", value: $profileStore.profile.age, format: .number)
                            .textFieldStyle(CustomTextFieldStyle())
                            .keyboardType(.numberPad)
                    }
                    
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Gender")
                            .font(.headline)
                        
                        Menu {
                            ForEach(Gender.allCases, id: \.self) { gender in
                                Button(gender.displayName) {
                                    profileStore.profile.gender = gender
                                }
                            }
                        } label: {
                            HStack {
                                Text(profileStore.profile.gender.displayName)
                                    .foregroundColor(profileStore.profile.gender == .male ? .secondary : .primary)
                                Spacer()
                                Image(systemName: "chevron.down")
                                    .foregroundColor(.secondary)
                                    .font(.caption)
                            }
                            .padding()
                            .background(Color(.systemGray6))
                            .cornerRadius(8)
                        }
                    }
                }
                
                HStack(spacing: 16) {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Height (cm)")
                            .font(.headline)
                        
                        TextField("170", value: $profileStore.profile.height, format: .number)
                            .textFieldStyle(CustomTextFieldStyle())
                            .keyboardType(.numberPad)
                    }
                    
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Weight (kg)")
                            .font(.headline)
                        
                        TextField("70", value: $profileStore.profile.weight, format: .number)
                            .textFieldStyle(CustomTextFieldStyle())
                            .keyboardType(.numberPad)
                    }
                }
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 32)
        }
        .background(Color(.systemBackground))
        .cornerRadius(16)
        .padding(.horizontal, 20)
    }
}

// MARK: - Step 2: Activity & Goals
struct Step2ActivityGoalsView: View {
    @EnvironmentObject var profileStore: UserProfileStore
    
    var body: some View {
        VStack(spacing: 0) {
            StepHeaderView(
                icon: "figure.run",
                title: "Activity & Goals",
                description: "Tell us about your lifestyle and what you want to achieve"
            )
            
            VStack(spacing: 24) {
                VStack(alignment: .leading, spacing: 16) {
                    Text("Activity Level")
                        .font(.headline)
                    
                    VStack(spacing: 12) {
                        ForEach(ActivityLevel.allCases, id: \.self) { level in
                            RadioButtonView(
                                isSelected: profileStore.profile.activityLevel == level,
                                title: level.displayName,
                                description: level.description
                            ) {
                                profileStore.profile.activityLevel = level
                            }
                        }
                    }
                }
                
                VStack(alignment: .leading, spacing: 16) {
                    Text("Primary Goal")
                        .font(.headline)
                    
                    VStack(spacing: 12) {
                        ForEach(Goal.allCases, id: \.self) { goal in
                            RadioButtonView(
                                isSelected: profileStore.profile.goal == goal,
                                title: goal.displayName,
                                description: goal.description
                            ) {
                                profileStore.profile.goal = goal
                            }
                        }
                    }
                }
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 32)
        }
        .background(Color(.systemBackground))
        .cornerRadius(16)
        .padding(.horizontal, 20)
    }
}

// MARK: - Step 3: Dietary Preferences
struct Step3DietaryPreferencesView: View {
    @EnvironmentObject var profileStore: UserProfileStore
    private let allergies = ["Nuts", "Dairy", "Eggs", "Soy", "Gluten", "Shellfish"]
    private let restrictions = ["Low Sodium", "Low Carb", "Keto", "Paleo", "Mediterranean", "Low Fat"]
    
    var body: some View {
        VStack(spacing: 0) {
            StepHeaderView(
                icon: "leaf.circle",
                title: "Dietary Preferences",
                description: "Choose your dietary style and any restrictions we should know about"
            )
            
            VStack(spacing: 24) {
                VStack(alignment: .leading, spacing: 16) {
                    Text("Diet Type")
                        .font(.headline)
                    
                    VStack(spacing: 12) {
                        ForEach(DietType.allCases, id: \.self) { dietType in
                            RadioButtonView(
                                isSelected: profileStore.profile.dietType == dietType,
                                title: dietType.displayName,
                                description: dietType.description
                            ) {
                                profileStore.profile.dietType = dietType
                            }
                        }
                    }
                }
                
                VStack(alignment: .leading, spacing: 16) {
                    Text("Allergies (Select all that apply)")
                        .font(.headline)
                    
                    LazyVGrid(columns: [
                        GridItem(.flexible()),
                        GridItem(.flexible())
                    ], spacing: 12) {
                        ForEach(allergies, id: \.self) { allergy in
                            CheckboxView(
                                isSelected: profileStore.profile.allergies.contains(allergy),
                                title: allergy
                            ) {
                                if profileStore.profile.allergies.contains(allergy) {
                                    profileStore.profile.allergies.removeAll { $0 == allergy }
                                } else {
                                    profileStore.profile.allergies.append(allergy)
                                }
                            }
                        }
                    }
                }
                
                VStack(alignment: .leading, spacing: 16) {
                    Text("Dietary Restrictions (Optional)")
                        .font(.headline)
                    
                    LazyVGrid(columns: [
                        GridItem(.flexible()),
                        GridItem(.flexible())
                    ], spacing: 12) {
                        ForEach(restrictions, id: \.self) { restriction in
                            CheckboxView(
                                isSelected: profileStore.profile.restrictions.contains(restriction),
                                title: restriction
                            ) {
                                if profileStore.profile.restrictions.contains(restriction) {
                                    profileStore.profile.restrictions.removeAll { $0 == restriction }
                                } else {
                                    profileStore.profile.restrictions.append(restriction)
                                }
                            }
                        }
                    }
                }
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 32)
        }
        .background(Color(.systemBackground))
        .cornerRadius(16)
        .padding(.horizontal, 20)
    }
}

// MARK: - Step 4: Meal Preferences
struct Step4MealPreferencesView: View {
    @EnvironmentObject var profileStore: UserProfileStore
    
    var body: some View {
        VStack(spacing: 0) {
            StepHeaderView(
                icon: "clock.circle",
                title: "Meal Preferences",
                description: "Final details to customize your perfect meal plan"
            )
            
            VStack(spacing: 24) {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Meals per Day")
                        .font(.headline)
                    
                    Menu {
                        Button("3 meals (Breakfast, Lunch, Dinner)") {
                            profileStore.profile.mealsPerDay = 3
                        }
                        Button("4 meals (+ 1 Snack)") {
                            profileStore.profile.mealsPerDay = 4
                        }
                        Button("5 meals (+ 2 Snacks)") {
                            profileStore.profile.mealsPerDay = 5
                        }
                        Button("6 meals (+ 3 Snacks)") {
                            profileStore.profile.mealsPerDay = 6
                        }
                    } label: {
                        HStack {
                            Text("\(profileStore.profile.mealsPerDay) meals per day")
                                .foregroundColor(.primary)
                            Spacer()
                            Image(systemName: "chevron.down")
                                .foregroundColor(.secondary)
                                .font(.caption)
                        }
                        .padding()
                        .background(Color(.systemGray6))
                        .cornerRadius(8)
                    }
                }
                
                VStack(alignment: .leading, spacing: 8) {
                    Text("Cooking Time Preference")
                        .font(.headline)
                    
                    Menu {
                        ForEach(CookingTime.allCases, id: \.self) { time in
                            Button(time.displayName) {
                                profileStore.profile.cookingTime = time
                            }
                        }
                    } label: {
                        HStack {
                            Text(profileStore.profile.cookingTime.displayName)
                                .foregroundColor(.primary)
                            Spacer()
                            Image(systemName: "chevron.down")
                                .foregroundColor(.secondary)
                                .font(.caption)
                        }
                        .padding()
                        .background(Color(.systemGray6))
                        .cornerRadius(8)
                    }
                }
                
                VStack(alignment: .leading, spacing: 8) {
                    Text("Budget Range (Optional)")
                        .font(.headline)
                    
                    Menu {
                        ForEach(Budget.allCases, id: \.self) { budget in
                            Button(budget.displayName) {
                                profileStore.profile.budget = budget
                            }
                        }
                        Button("No preference") {
                            profileStore.profile.budget = nil
                        }
                    } label: {
                        HStack {
                            Text(profileStore.profile.budget?.displayName ?? "Select budget range")
                                .foregroundColor(profileStore.profile.budget == nil ? .secondary : .primary)
                            Spacer()
                            Image(systemName: "chevron.down")
                                .foregroundColor(.secondary)
                                .font(.caption)
                        }
                        .padding()
                        .background(Color(.systemGray6))
                        .cornerRadius(8)
                    }
                }
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 32)
        }
        .background(Color(.systemBackground))
        .cornerRadius(16)
        .padding(.horizontal, 20)
    }
}

// MARK: - Reusable Components
struct StepHeaderView: View {
    let icon: String
    let title: String
    let description: String
    
    var body: some View {
        VStack(spacing: 16) {
            Circle()
                .fill(Color.green.opacity(0.1))
                .frame(width: 64, height: 64)
                .overlay(
                    Image(systemName: icon)
                        .foregroundColor(.green)
                        .font(.title2)
                )
            
            VStack(spacing: 8) {
                Text(title)
                    .font(.title2)
                    .fontWeight(.bold)
                
                Text(description)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 20)
            }
        }
        .padding(.vertical, 32)
    }
}

struct RadioButtonView: View {
    let isSelected: Bool
    let title: String
    let description: String
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: 16) {
                Circle()
                    .fill(isSelected ? Color.green : Color.clear)
                    .frame(width: 20, height: 20)
                    .overlay(
                        Circle()
                            .stroke(isSelected ? Color.green : Color(.systemGray3), lineWidth: 2)
                    )
                    .overlay(
                        Circle()
                            .fill(Color.white)
                            .frame(width: 8, height: 8)
                            .opacity(isSelected ? 1 : 0)
                    )
                
                VStack(alignment: .leading, spacing: 4) {
                    Text(title)
                        .font(.headline)
                        .fontWeight(.medium)
                        .foregroundColor(.primary)
                    
                    Text(description)
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.leading)
                }
                
                Spacer()
            }
            .padding(16)
            .background(isSelected ? Color.green.opacity(0.05) : Color(.systemGray6))
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(isSelected ? Color.green : Color.clear, lineWidth: 1)
            )
            .cornerRadius(12)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

struct CheckboxView: View {
    let isSelected: Bool
    let title: String
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: 8) {
                RoundedRectangle(cornerRadius: 4)
                    .fill(isSelected ? Color.green : Color.clear)
                    .frame(width: 20, height: 20)
                    .overlay(
                        RoundedRectangle(cornerRadius: 4)
                            .stroke(isSelected ? Color.green : Color(.systemGray3), lineWidth: 2)
                    )
                    .overlay(
                        Image(systemName: "checkmark")
                            .foregroundColor(.white)
                            .font(.caption)
                            .opacity(isSelected ? 1 : 0)
                    )
                
                Text(title)
                    .font(.subheadline)
                    .foregroundColor(.primary)
                
                Spacer()
            }
        }
        .buttonStyle(PlainButtonStyle())
    }
}

struct CustomTextFieldStyle: TextFieldStyle {
    func _body(configuration: TextField<Self._Label>) -> some View {
        configuration
            .padding()
            .background(Color(.systemGray6))
            .cornerRadius(8)
    }
}

struct PlannerView_Previews: PreviewProvider {
    static var previews: some View {
        PlannerView()
            .environmentObject(UserProfileStore())
            .environmentObject(MealPlanStore())
    }
}
