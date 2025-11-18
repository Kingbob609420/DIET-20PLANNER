import Foundation

class APIService {
    private let baseURL = "http://localhost:8080" // Change to your production URL
    private let session = URLSession.shared
    
    func generateMealPlan(userProfile: UserProfile, completion: @escaping (Result<WeeklyMealPlan, Error>) -> Void) {
        guard let url = URL(string: "\(baseURL)/api/generate-meal-plan") else {
            completion(.failure(APIError.invalidURL))
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let requestBody = GenerateMealPlanRequest(userProfile: userProfile)
        
        do {
            let jsonData = try JSONEncoder().encode(requestBody)
            request.httpBody = jsonData
        } catch {
            completion(.failure(error))
            return
        }
        
        session.dataTask(with: request) { data, response, error in
            if let error = error {
                completion(.failure(error))
                return
            }
            
            guard let data = data else {
                completion(.failure(APIError.noData))
                return
            }
            
            do {
                let response = try JSONDecoder().decode(GenerateMealPlanResponse.self, from: data)
                
                if response.success, let mealPlan = response.mealPlan {
                    completion(.success(mealPlan))
                } else {
                    completion(.failure(APIError.serverError(response.error ?? "Unknown error")))
                }
            } catch {
                completion(.failure(error))
            }
        }.resume()
    }
    
    func getNutritionGoals(userProfile: UserProfile, completion: @escaping (Result<NutritionGoals, Error>) -> Void) {
        guard let url = URL(string: "\(baseURL)/api/nutrition-goals") else {
            completion(.failure(APIError.invalidURL))
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        do {
            let jsonData = try JSONEncoder().encode(userProfile)
            request.httpBody = jsonData
        } catch {
            completion(.failure(error))
            return
        }
        
        session.dataTask(with: request) { data, response, error in
            if let error = error {
                completion(.failure(error))
                return
            }
            
            guard let data = data else {
                completion(.failure(APIError.noData))
                return
            }
            
            do {
                let response = try JSONDecoder().decode(NutritionGoalsResponse.self, from: data)
                
                if response.success {
                    completion(.success(response.goals))
                } else {
                    completion(.failure(APIError.serverError("Failed to get nutrition goals")))
                }
            } catch {
                completion(.failure(error))
            }
        }.resume()
    }
}

struct NutritionGoalsResponse: Codable {
    let success: Bool
    let goals: NutritionGoals
}

enum APIError: LocalizedError {
    case invalidURL
    case noData
    case serverError(String)
    
    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .noData:
            return "No data received"
        case .serverError(let message):
            return message
        }
    }
}
