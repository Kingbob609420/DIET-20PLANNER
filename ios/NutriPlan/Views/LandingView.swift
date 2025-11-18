import SwiftUI

struct LandingView: View {
    @State private var showPlanner = false
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 0) {
                    // Hero Section
                    VStack(spacing: 24) {
                        // Header
                        HStack {
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
                            
                            Spacer()
                            
                            NavigationLink("Start Planning", destination: PlannerView())
                                .buttonStyle(PrimaryButtonStyle())
                        }
                        .padding(.horizontal, 20)
                        .padding(.top, 10)
                        
                        Spacer().frame(height: 40)
                        
                        // Hero Content
                        VStack(spacing: 24) {
                            HStack {
                                Image(systemName: "bolt.fill")
                                    .foregroundColor(.green)
                                    .font(.caption)
                                Text("AI-Powered Nutrition")
                                    .font(.caption)
                                    .fontWeight(.medium)
                                    .foregroundColor(.green)
                            }
                            .padding(.horizontal, 12)
                            .padding(.vertical, 6)
                            .background(Color.green.opacity(0.1))
                            .cornerRadius(12)
                            
                            VStack(spacing: 16) {
                                Text("Your Personal AI Diet Planner")
                                    .font(.system(size: 36, weight: .bold, design: .default))
                                    .multilineTextAlignment(.center)
                                    .foregroundStyle(
                                        LinearGradient(
                                            colors: [.green, Color.green.opacity(0.8)],
                                            startPoint: .leading,
                                            endPoint: .trailing
                                        )
                                    )
                                
                                Text("Get personalized meal plans with beautiful food photography, tailored to your age, gender, activity level, and dietary preferences. Vegetarian, non-vegetarian, and vegan options available.")
                                    .font(.title3)
                                    .foregroundColor(.secondary)
                                    .multilineTextAlignment(.center)
                                    .padding(.horizontal, 20)
                            }
                            
                            VStack(spacing: 12) {
                                NavigationLink(destination: PlannerView()) {
                                    HStack {
                                        Text("Create My Diet Plan")
                                        Image(systemName: "arrow.right")
                                    }
                                    .font(.headline)
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
                            }
                            .padding(.horizontal, 20)
                            
                            // Stats
                            HStack(spacing: 0) {
                                StatView(number: "10,000+", label: "Happy Users")
                                StatView(number: "5,000+", label: "Meal Recipes")
                                StatView(number: "98%", label: "Success Rate")
                            }
                            .padding(.top, 40)
                        }
                        .padding(.horizontal, 20)
                    }
                    .padding(.bottom, 60)
                    .background(
                        LinearGradient(
                            colors: [Color.green.opacity(0.05), Color.clear],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    
                    // Features Section
                    FeaturesSectionView()
                    
                    // How It Works Section
                    HowItWorksSectionView()
                    
                    // Testimonials Section
                    TestimonialsSectionView()
                    
                    // CTA Section
                    CTASectionView()
                }
            }
            .navigationBarHidden(true)
        }
    }
}

struct StatView: View {
    let number: String
    let label: String
    
    var body: some View {
        VStack(spacing: 8) {
            Text(number)
                .font(.title)
                .fontWeight(.bold)
                .foregroundColor(.green)
            
            Text(label)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
    }
}

struct FeaturesSectionView: View {
    var body: some View {
        VStack(spacing: 40) {
            VStack(spacing: 16) {
                Text("Why Choose NutriPlan?")
                    .font(.title)
                    .fontWeight(.bold)
                
                Text("Our AI-powered platform creates personalized nutrition plans that fit your lifestyle and preferences")
                    .font(.title3)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 20)
            }
            
            LazyVGrid(columns: [
                GridItem(.flexible()),
                GridItem(.flexible())
            ], spacing: 20) {
                FeatureCardView(
                    icon: "target",
                    title: "Personalized Plans",
                    description: "Tailored meal plans based on your age, gender, activity level, and weight goals"
                )
                
                FeatureCardView(
                    icon: "leaf",
                    title: "Dietary Preferences",
                    description: "Vegetarian, non-vegetarian, and vegan options with beautiful food photography"
                )
                
                FeatureCardView(
                    icon: "calendar",
                    title: "Weekly Planning",
                    description: "Complete 7-day meal plans with breakfast, lunch, dinner, and snack suggestions"
                )
                
                FeatureCardView(
                    icon: "heart",
                    title: "Health Focused",
                    description: "Nutritionally balanced meals designed to support your health and fitness goals"
                )
                
                FeatureCardView(
                    icon: "chef.hat",
                    title: "Recipe Variety",
                    description: "Thousands of recipes with detailed instructions and nutritional information"
                )
                
                FeatureCardView(
                    icon: "person.3",
                    title: "Community Support",
                    description: "Join thousands of users on their nutrition journey with tips and motivation"
                )
            }
            .padding(.horizontal, 20)
        }
        .padding(.vertical, 60)
        .background(Color(.systemGray6).opacity(0.3))
    }
}

struct FeatureCardView: View {
    let icon: String
    let title: String
    let description: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            RoundedRectangle(cornerRadius: 12)
                .fill(Color.green.opacity(0.1))
                .frame(width: 48, height: 48)
                .overlay(
                    Image(systemName: icon)
                        .foregroundColor(.green)
                        .font(.title2)
                )
            
            VStack(alignment: .leading, spacing: 8) {
                Text(title)
                    .font(.headline)
                    .fontWeight(.semibold)
                
                Text(description)
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.05), radius: 8, x: 0, y: 2)
    }
}

struct HowItWorksSectionView: View {
    var body: some View {
        VStack(spacing: 40) {
            VStack(spacing: 16) {
                Text("How It Works")
                    .font(.title)
                    .fontWeight(.bold)
                
                Text("Get your personalized diet plan in just 3 simple steps")
                    .font(.title3)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 20)
            }
            
            VStack(spacing: 30) {
                StepView(
                    number: "1",
                    title: "Share Your Details",
                    description: "Tell us about your age, gender, activity level, weight, and dietary preferences"
                )
                
                StepView(
                    number: "2",
                    title: "AI Creates Your Plan",
                    description: "Our AI analyzes your data and generates a personalized meal plan with beautiful food images"
                )
                
                StepView(
                    number: "3",
                    title: "Start Your Journey",
                    description: "Follow your custom meal plan and track your progress towards your health goals"
                )
            }
            .padding(.horizontal, 20)
        }
        .padding(.vertical, 60)
    }
}

struct StepView: View {
    let number: String
    let title: String
    let description: String
    
    var body: some View {
        HStack(spacing: 20) {
            Circle()
                .fill(Color.green.opacity(0.1))
                .frame(width: 64, height: 64)
                .overlay(
                    Text(number)
                        .font(.title)
                        .fontWeight(.bold)
                        .foregroundColor(.green)
                )
            
            VStack(alignment: .leading, spacing: 8) {
                Text(title)
                    .font(.headline)
                    .fontWeight(.semibold)
                
                Text(description)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .fixedSize(horizontal: false, vertical: true)
            }
            
            Spacer()
        }
    }
}

struct TestimonialsSectionView: View {
    var body: some View {
        VStack(spacing: 40) {
            Text("What Our Users Say")
                .font(.title)
                .fontWeight(.bold)
            
            VStack(spacing: 20) {
                TestimonialCardView(
                    rating: 5,
                    text: "NutriPlan completely transformed my eating habits. The personalized meal plans are perfect for my vegan lifestyle!",
                    author: "Sarah Johnson",
                    role: "Fitness Enthusiast"
                )
                
                TestimonialCardView(
                    rating: 5,
                    text: "The AI recommendations are spot-on. I've lost 15 pounds following the meal plans, and the food photography makes everything look delicious!",
                    author: "Mike Chen",
                    role: "Software Engineer"
                )
                
                TestimonialCardView(
                    rating: 5,
                    text: "As a busy mom, having meal plans tailored to my family's needs has been a game-changer. Highly recommend!",
                    author: "Emily Rodriguez",
                    role: "Working Mom"
                )
            }
            .padding(.horizontal, 20)
        }
        .padding(.vertical, 60)
        .background(Color(.systemGray6).opacity(0.3))
    }
}

struct TestimonialCardView: View {
    let rating: Int
    let text: String
    let author: String
    let role: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                ForEach(0..<rating, id: \.self) { _ in
                    Image(systemName: "star.fill")
                        .foregroundColor(.green)
                        .font(.caption)
                }
            }
            
            Text(text)
                .font(.subheadline)
                .foregroundColor(.secondary)
            
            VStack(alignment: .leading, spacing: 4) {
                Text(author)
                    .font(.headline)
                    .fontWeight(.semibold)
                
                Text(role)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .padding(20)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.05), radius: 8, x: 0, y: 2)
    }
}

struct CTASectionView: View {
    var body: some View {
        VStack(spacing: 24) {
            Text("Ready to Transform Your Nutrition?")
                .font(.title)
                .fontWeight(.bold)
                .multilineTextAlignment(.center)
            
            Text("Join thousands of users who have already improved their health with AI-powered meal planning")
                .font(.title3)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 20)
            
            NavigationLink(destination: PlannerView()) {
                HStack {
                    Text("Get Started Now")
                    Image(systemName: "arrow.right")
                }
                .font(.headline)
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color.green)
                .cornerRadius(12)
            }
            .padding(.horizontal, 20)
            
            HStack(spacing: 24) {
                HStack(spacing: 8) {
                    Image(systemName: "checkmark.circle")
                        .foregroundColor(.green)
                        .font(.caption)
                    Text("No credit card required")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                HStack(spacing: 8) {
                    Image(systemName: "checkmark.circle")
                        .foregroundColor(.green)
                        .font(.caption)
                    Text("Instant meal plans")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                HStack(spacing: 8) {
                    Image(systemName: "checkmark.circle")
                        .foregroundColor(.green)
                        .font(.caption)
                    Text("Cancel anytime")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            .padding(.top, 8)
        }
        .padding(.vertical, 60)
    }
}

struct PrimaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.headline)
            .foregroundColor(.white)
            .padding(.horizontal, 16)
            .padding(.vertical, 8)
            .background(Color.green)
            .cornerRadius(8)
            .scaleEffect(configuration.isPressed ? 0.95 : 1.0)
    }
}

struct LandingView_Previews: PreviewProvider {
    static var previews: some View {
        LandingView()
    }
}
