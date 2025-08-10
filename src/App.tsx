import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Alert, AlertDescription } from "./components/ui/alert";
import { Badge } from "./components/ui/badge";
import {
  Activity,
  User,
  Dumbbell,
  UtensilsCrossed,
  MessageSquare,
  TrendingUp,
  Calendar,
  Target,
  Clock,
  Heart,
  Zap,
  AlertCircle,
  CheckCircle,
  Send,
  Loader2,
  Settings,
  Star
} from "lucide-react";

// API configuration - change this to your backend URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// API utility class that matches your backend endpoints
const api = {
  // Health check endpoint
  healthCheck: async () => {
    try {
      const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
      return await response.json();
    } catch (error) {
      console.warn('API health check failed:', error);
      return { status: "offline" };
    }
  },

  // Generate meal plan
  generateMealPlan: async (data) => {
    const response = await fetch(`${API_BASE_URL}/generate_meal_plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to generate meal plan');
    }
    
    return await response.json();
  },

  // Generate workout plan
  generateWorkout: async (data) => {
    const response = await fetch(`${API_BASE_URL}/generate_workout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to generate workout plan');
    }
    
    return await response.json();
  },

  // Handle plateau strategy
  handlePlateau: async (data) => {
    const response = await fetch(`${API_BASE_URL}/handle_plateau`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to generate plateau strategy');
    }
    
    return await response.json();
  },

  // Chat with AI coach
  chat: async (data) => {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to send chat message');
    }
    
    return await response.json();
  }
};

export default function FitnessCoachApp() {
  // State management
  const [activeTab, setActiveTab] = useState("profile");
  const [userProfile, setUserProfile] = useState({
    name: "",
    age: 25,
    gender: "male",
    fitness_goal: "build muscle",
    experience_level: "beginner",
    available_days: 3,
    equipment: [],
    diet_type: "balanced",
    allergies: [],
    meal_pref: "",
    injuries: [],
    tracking_devices: []
  });

  const [dailyState, setDailyState] = useState({
    week: 1,
    day: "monday",
    last_check_in: {
      mood: "good",
      sleep_hours: 7,
      soreness: "none",
      stress: "low",
      workout_completed: "none"
    },
    streak: { days: 0 },
    recent_progress: { weight: "stable" }
  });

  const [plans, setPlans] = useState({
    meal: null,
    workout: null,
    plateau: null
  });

  const [chatMessages, setChatMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I'm your AI fitness coach. How can I help you reach your fitness goals today?",
      timestamp: Date.now()
    }
  ]);
  const [chatInput, setChatInput] = useState("");

  const [loading, setLoading] = useState({});
  const [errors, setErrors] = useState({});
  const [successes, setSuccesses] = useState({});

  // Utility functions
  const setLoadingState = (key, value) => {
    setLoading(prev => ({ ...prev, [key]: value }));
  };

  const setError = (key, message) => {
    setErrors(prev => ({ ...prev, [key]: message }));
    setTimeout(() => setErrors(prev => ({ ...prev, [key]: "" })), 5000);
  };

  const setSuccess = (key, message) => {
    setSuccesses(prev => ({ ...prev, [key]: message }));
    setTimeout(() => setSuccesses(prev => ({ ...prev, [key]: "" })), 3000);
  };

  // API handlers
  const generateMealPlan = async () => {
    if (!userProfile.name.trim()) {
      setError("meal", "Please enter your name first");
      return;
    }
    setLoadingState("meal", true);
    try {
      const data = await api.generateMealPlan({ user_profile: userProfile });
      setPlans(prev => ({ ...prev, meal: data.meal_plan }));
      setSuccess("meal", "Meal plan generated successfully!");
      setActiveTab("meal");
    } catch (error) {
      setError("meal", error.message || "Failed to generate meal plan");
    } finally {
      setLoadingState("meal", false);
    }
  };

  const generateWorkout = async () => {
    if (!userProfile.name.trim()) {
      setError("workout", "Please enter your name first");
      return;
    }
    setLoadingState("workout", true);
    try {
      const data = await api.generateWorkout({
        user_profile: userProfile,
        daily_state: dailyState
      });
      setPlans(prev => ({ ...prev, workout: data.workout_plan }));
      setSuccess("workout", "Workout plan generated successfully!");
      setActiveTab("workout");
    } catch (error) {
      setError("workout", error.message || "Failed to generate workout plan");
    } finally {
      setLoadingState("workout", false);
    }
  };

  const handlePlateauBreaker = async () => {
    if (!userProfile.name.trim()) {
      setError("plateau", "Please enter your name first");
      return;
    }
    setLoadingState("plateau", true);
    try {
      const progressData = {
        current_weight: "Same for 3 weeks",
        strength_progress: "Stalled on major lifts",
        energy_levels: "Declining",
        motivation: "Lower than usual"
      };
      const data = await api.handlePlateau({
        user_profile: userProfile,
        progress_data: progressData
      });
      setPlans(prev => ({ ...prev, plateau: data.plateau_strategy }));
      setSuccess("plateau", "Plateau strategy generated!");
      setActiveTab("plateau");
    } catch (error) {
      setError("plateau", error.message || "Failed to generate plateau strategy");
    } finally {
      setLoadingState("plateau", false);
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || !userProfile.name.trim()) {
      setError("chat", "Please enter a message and your name");
      return;
    }
    setLoadingState("chat", true);
    const userMessage = chatInput.trim();
    setChatInput("");
    setChatMessages(prev => [...prev, { role: "user", content: userMessage, timestamp: Date.now() }]);
    
    try {
      const data = await api.chat({ user_id: userProfile.name, message: userMessage });
      setChatMessages(prev => [...prev, { role: "assistant", content: data.reply, timestamp: Date.now() }]);
    } catch (error) {
      setError("chat", error.message || "Failed to send message");
    } finally {
      setLoadingState("chat", false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  };

  useEffect(() => {
    api.healthCheck()
      .then(data => console.log("API Health:", data))
      .catch(err => console.warn("API not available:", err));
  }, []);



  // Tab navigation component
  const TabButton = ({ id, icon: Icon, label, active, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 ${
        active
          ? "bg-blue-600 text-white shadow-lg transform scale-105"
          : "bg-white/80 text-gray-700 hover:bg-white hover:shadow-md"
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  // Profile form component
  const ProfileForm = () => (
    <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-white">
          <User size={24} />
          User Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <Input
              placeholder="Enter your name"
              value={userProfile.name}
              onChange={e => setUserProfile({ ...userProfile, name: e.target.value })}
              className="border-2 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
            <Input
              type="number"
              placeholder="25"
              value={userProfile.age}
              onChange={e => setUserProfile({ ...userProfile, age: Number(e.target.value) })}
              className="border-2 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
            <select
              value={userProfile.gender}
              onChange={e => setUserProfile({ ...userProfile, gender: e.target.value })}
              className="w-full p-2 border-2 rounded-md focus:border-blue-500 focus:outline-none"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
            <select
              value={userProfile.experience_level}
              onChange={e => setUserProfile({ ...userProfile, experience_level: e.target.value })}
              className="w-full p-2 border-2 rounded-md focus:border-blue-500 focus:outline-none"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fitness Goal</label>
            <Input
              placeholder="e.g., build muscle, lose weight"
              value={userProfile.fitness_goal}
              onChange={e => setUserProfile({ ...userProfile, fitness_goal: e.target.value })}
              className="border-2 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Diet Type</label>
            <select
              value={userProfile.diet_type}
              onChange={e => setUserProfile({ ...userProfile, diet_type: e.target.value })}
              className="w-full p-2 border-2 rounded-md focus:border-blue-500 focus:outline-none"
            >
              <option value="balanced">Balanced</option>
              <option value="high protein">High Protein</option>
              <option value="low carb">Low Carb</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="keto">Keto</option>
            </select>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button onClick={generateMealPlan} disabled={loading.meal} className="flex-1 bg-green-600 hover:bg-green-700">
            {loading.meal ? <Loader2 className="animate-spin mr-2" size={16} /> : <UtensilsCrossed className="mr-2" size={16} />}
            Generate Meal Plan
          </Button>
          <Button onClick={generateWorkout} disabled={loading.workout} className="flex-1">
            {loading.workout ? <Loader2 className="animate-spin mr-2" size={16} /> : <Dumbbell className="mr-2" size={16} />}
            Generate Workout
          </Button>
          <Button onClick={handlePlateauBreaker} disabled={loading.plateau} className="flex-1 bg-purple-600 hover:bg-purple-700">
            {loading.plateau ? <Loader2 className="animate-spin mr-2" size={16} /> : <TrendingUp className="mr-2" size={16} />}
            Plateau Breaker
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // Meal plan component
  const MealPlan = () => (
    <div className="space-y-4">
      {plans.meal?.daily_plans?.map((day, idx) => (
        <Card key={idx} className="backdrop-blur-sm bg-white/90 border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-white">
              <Calendar size={20} />
              {day.date}
              <Badge className="ml-auto bg-white/20 text-white border-0">
                {day.total_calories} kcal
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {day.meals?.map((meal, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{meal.name}</h4>
                    <p className="text-sm text-gray-600">{meal.protein} protein</p>
                  </div>
                  <Badge variant="secondary">{meal.calories} kcal</Badge>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Daily Totals:</span>
                <div className="flex gap-4">
                  <span>{day.total_calories} calories</span>
                  <span>{day.total_protein} protein</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // Workout plan component
  const WorkoutPlan = () => (
    <div className="space-y-4">
      {plans.workout?.daily_plans?.map((day, idx) => (
        <Card key={idx} className="backdrop-blur-sm bg-white/90 border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-white">
              <Dumbbell size={20} />
              {day.date}
              <Badge className="ml-auto bg-white/20 text-white border-0">
                <Clock size={14} className="mr-1" />
                {day.workout?.duration}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900">{day.workout?.type}</h4>
            </div>
            <div className="space-y-3">
              {day.workout?.exercises?.map((exercise, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{exercise.name}</h4>
                    <p className="text-sm text-gray-600">Rest: {exercise.rest}</p>
                  </div>
                  <div className="text-right">
                    <Badge>{exercise.sets} × {exercise.reps}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // Plateau strategy component
  const PlateauStrategy = () => (
    <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-white">
          <TrendingUp size={20} />
          Plateau Breaking Strategy
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <AlertCircle size={16} />
            Diagnosis
          </h3>
          <p className="text-gray-700 bg-yellow-50 p-3 rounded-lg">{plans.plateau?.diagnosis}</p>
        </div>
        
        <div>
          <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <Dumbbell size={16} />
            Workout Modifications
          </h3>
          <ul className="space-y-2">
            {plans.plateau?.modifications?.map((mod, i) => (
              <li key={i} className="flex items-center gap-2 bg-blue-50 p-2 rounded">
                <CheckCircle size={16} className="text-blue-600 flex-shrink-0" />
                <span className="text-gray-700">{mod}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <UtensilsCrossed size={16} />
            Nutrition Adjustments
          </h3>
          <ul className="space-y-2">
            {plans.plateau?.nutrition?.map((tip, i) => (
              <li key={i} className="flex items-center gap-2 bg-green-50 p-2 rounded">
                <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                <span className="text-gray-700">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );

  // Chat component
  const ChatInterface = () => (
    <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-xl h-[600px] flex flex-col">
      <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-white">
          <MessageSquare size={20} />
          AI Fitness Coach
          <Badge className="ml-auto bg-white/20 text-white border-0">
            <Zap size={14} className="mr-1" />
            Online
          </Badge>
        </CardTitle>
      </CardHeader>
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatMessages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                msg.role === "user" 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-100 text-gray-900"
              }`}>
                <p className="text-sm">{msg.content}</p>
              </div>
            </div>
          ))}
          {loading.chat && (
            <div className="flex justify-start">
              <div className="bg-gray-100 px-4 py-2 rounded-lg flex items-center gap-2">
                <Loader2 className="animate-spin" size={16} />
                <span className="text-sm text-gray-600">Coach is typing...</span>
              </div>
            </div>
          )}
        </div>
        <div className="p-4 border-t bg-gray-50 rounded-b-lg">
          <div className="flex gap-2">
            <Input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask your fitness coach anything..."
              className="flex-1 border-2 focus:border-indigo-500"
              disabled={loading.chat}
            />
            <Button 
              onClick={sendChatMessage} 
              disabled={loading.chat || !chatInput.trim()}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {loading.chat ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
      <div className="container mx-auto p-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            AI Fitness Coach
          </h1>
          <p className="text-gray-600">Your personal AI-powered fitness and nutrition companion</p>
        </div>

        {/* Notifications */}
        <div className="mb-4 space-y-2">
          {Object.entries(errors).map(([key, message]) => message && (
            <Alert key={key} className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{message}</AlertDescription>
            </Alert>
          ))}
          {Object.entries(successes).map(([key, message]) => message && (
            <Alert key={key} className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{message}</AlertDescription>
            </Alert>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap gap-2 mb-6 p-4 bg-white/50 backdrop-blur-sm rounded-xl border-0 shadow-lg">
          <TabButton id="profile" icon={User} label="Profile" active={activeTab === "profile"} onClick={setActiveTab} />
          <TabButton id="meal" icon={UtensilsCrossed} label="Meal Plan" active={activeTab === "meal"} onClick={setActiveTab} />
          <TabButton id="workout" icon={Dumbbell} label="Workout" active={activeTab === "workout"} onClick={setActiveTab} />
          <TabButton id="plateau" icon={TrendingUp} label="Plateau" active={activeTab === "plateau"} onClick={setActiveTab} />
          <TabButton id="chat" icon={MessageSquare} label="Chat" active={activeTab === "chat"} onClick={setActiveTab} />
        </div>

        {/* Content */}
        <div className="transition-all duration-300">
          {activeTab === "profile" && <ProfileForm />}
          {activeTab === "meal" && (plans.meal ? <MealPlan /> : 
            <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-xl">
              <CardContent className="p-8 text-center">
                <UtensilsCrossed size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Generate a meal plan from your profile to see it here</p>
              </CardContent>
            </Card>
          )}
          {activeTab === "workout" && (plans.workout ? <WorkoutPlan /> :
            <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-xl">
              <CardContent className="p-8 text-center">
                <Dumbbell size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Generate a workout plan from your profile to see it here</p>
              </CardContent>
            </Card>
          )}
          {activeTab === "plateau" && (plans.plateau ? <PlateauStrategy /> :
            <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-xl">
              <CardContent className="p-8 text-center">
                <TrendingUp size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Generate a plateau strategy from your profile to see it here</p>
              </CardContent>
            </Card>
          )}
          {activeTab === "chat" && <ChatInterface />}
        </div>
      </div>
    </div>
  );
}