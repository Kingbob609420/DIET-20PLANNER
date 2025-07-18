import SwiftUI

@main
struct NutriPlanApp: App {
    @StateObject private var userProfileStore = UserProfileStore()
    @StateObject private var mealPlanStore = MealPlanStore()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(userProfileStore)
                .environmentObject(mealPlanStore)
        }
    }
}

struct ContentView: View {
    @State private var selectedTab = 0
    
    var body: some View {
        TabView(selection: $selectedTab) {
            LandingView()
                .tabItem {
                    Image(systemName: "house.fill")
                    Text("Home")
                }
                .tag(0)
            
            PlannerView()
                .tabItem {
                    Image(systemName: "fork.knife")
                    Text("Planner")
                }
                .tag(1)
            
            ResultsView()
                .tabItem {
                    Image(systemName: "chart.bar.fill")
                    Text("Results")
                }
                .tag(2)
        }
        .accentColor(Color.green)
    }
}
