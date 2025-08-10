import { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Alert, AlertDescription } from "./components/ui/alert";
import { Badge } from "./components/ui/badge";
import {
  User,
  Dumbbell,
  UtensilsCrossed,
  MessageSquare,
  TrendingUp,
  Calendar,
  Zap,
  AlertCircle,
  CheckCircle,
  Send,
  Loader2
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// Types
interface UserProfile {
  name: string;
  age: number;
  gender: string;
  fitness_goal: string;
  experience_level: string;
  available_days: number;
  equipment: string[];
  diet_type: string;
  allergies: string[];
  meal_pref: string;
  injuries: string[];
  tracking_devices: string[];
}

interface Plans {
  meal: any;
  workout: any;
  plateau: any;
}

interface ChatMessage {
  role: string;
  content: string;
  timestamp: number;
}

interface LoadingState {
  [key: string]: boolean;
}

interface ErrorState {
  [key: string]: string;
}

interface SuccessState {
  [key: string]: string;
}

// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

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
  generateMealPlan: async (data: { user_profile: UserProfile }) => {
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
  generateWorkout: async (data: { user_profile: UserProfile }) => {
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
  handlePlateau: async (data: { user_profile: UserProfile }) => {
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
  chat: async (data: { message: string; user_profile: UserProfile }) => {
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
  const [userProfile, setUserProfile] = useState<UserProfile>({
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

  const [plans, setPlans] = useState<Plans>({
    meal: null,
    workout: null,
    plateau: null
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hello! I'm your AI fitness coach. How can I help you reach your fitness goals today?",
      timestamp: Date.now()
    }
  ]);
  const [chatInput, setChatInput] = useState("");

  const [loading, setLoading] = useState<LoadingState>({});
  const [errors, setErrors] = useState<ErrorState>({});
  const [successes, setSuccesses] = useState<SuccessState>({});

  // Utility functions - memoized for performance
  const setLoadingState = useCallback((key: string, value: boolean) => {
    setLoading(prev => ({ ...prev, [key]: value }));
  }, []);

  const setError = useCallback((key: string, message: string) => {
    setErrors(prev => ({ ...prev, [key]: message }));
    setTimeout(() => setErrors(prev => ({ ...prev, [key]: "" })), 5000);
  }, []);

  const setSuccess = useCallback((key: string, message: string) => {
    setSuccesses(prev => ({ ...prev, [key]: message }));
    setTimeout(() => setSuccesses(prev => ({ ...prev, [key]: "" })), 3000);
  }, []);

  // API handlers - memoized for performance
  const generateMealPlan = useCallback(async () => {
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
      const errorMessage = error instanceof Error ? error.message : "Failed to generate meal plan";
      setError("meal", errorMessage);
    } finally {
      setLoadingState("meal", false);
    }
  }, [userProfile, setLoadingState, setError, setSuccess]);

  const generateWorkout = useCallback(async () => {
    if (!userProfile.name.trim()) {
      setError("workout", "Please enter your name first");
      return;
    }
    setLoadingState("workout", true);
    try {
      const data = await api.generateWorkout({ user_profile: userProfile });
      setPlans(prev => ({ ...prev, workout: data.workout_plan }));
      setSuccess("workout", "Workout plan generated successfully!");
      setActiveTab("workout");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to generate workout plan";
      setError("workout", errorMessage);
    } finally {
      setLoadingState("workout", false);
    }
  }, [userProfile, setLoadingState, setError, setSuccess]);

  const handlePlateauBreaker = useCallback(async () => {
    if (!userProfile.name.trim()) {
      setError("plateau", "Please enter your name first");
      return;
    }
    setLoadingState("plateau", true);
    try {
      const data = await api.handlePlateau({ user_profile: userProfile });
      setPlans(prev => ({ ...prev, plateau: data.plateau_strategy }));
      setSuccess("plateau", "Plateau strategy generated successfully!");
      setActiveTab("plateau");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to generate plateau strategy";
      setError("plateau", errorMessage);
    } finally {
      setLoadingState("plateau", false);
    }
  }, [userProfile, setLoadingState, setError, setSuccess]);

  const sendChatMessage = useCallback(async () => {
    if (!chatInput.trim()) return;
    
    const userMessage: ChatMessage = {
      role: "user",
      content: chatInput,
      timestamp: Date.now()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput("");
    setLoadingState("chat", true);
    
    try {
      const data = await api.chat({ 
        message: chatInput, 
        user_profile: userProfile 
      });
      
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.response,
        timestamp: Date.now()
      };
      
      setChatMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to send message";
      setError("chat", errorMessage);
    } finally {
      setLoadingState("chat", false);
    }
  }, [chatInput, userProfile, setLoadingState, setError]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  }, [sendChatMessage]);

  // Memoized components for better performance
  const TabButton = useMemo(() => {
    return ({ id, icon: Icon, label, active, onClick }: {
      id: string;
      icon: LucideIcon;
      label: string;
      active: boolean;
      onClick: (id: string) => void;
    }) => (
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
  }, []);

  // Profile form component
  const ProfileForm = useMemo(() => (
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserProfile({ ...userProfile, name: e.target.value })}
              className="border-2 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
            <Input
              type="number"
              placeholder="25"
              value={userProfile.age}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserProfile({ ...userProfile, age: Number(e.target.value) })}
              className="border-2 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
            <select
              value={userProfile.gender}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setUserProfile({ ...userProfile, gender: e.target.value })}
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
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setUserProfile({ ...userProfile, experience_level: e.target.value })}
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserProfile({ ...userProfile, fitness_goal: e.target.value })}
              className="border-2 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Diet Type</label>
            <select
              value={userProfile.diet_type}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setUserProfile({ ...userProfile, diet_type: e.target.value })}
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
  ), [userProfile, loading, generateMealPlan, generateWorkout, handlePlateauBreaker]);

  // Meal plan component
  const MealPlan = useMemo(() => (
    <div className="space-y-4">
      {plans.meal?.daily_plans?.map((day: any, idx: number) => (
        <Card key={idx} className="backdrop-blur-sm bg-white/90 border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-white">
              <Calendar size={20} />
              {day.day}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {day.meals?.map((meal: any, i: number) => (
                <div key={i} className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-gray-800 mb-2">{meal.meal_type}</h4>
                  <p className="text-gray-600 mb-2">{meal.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {meal.nutrition?.map((nutrient: any, j: number) => (
                      <Badge key={j} variant="secondary" className="bg-green-100 text-green-800">
                        {nutrient.name}: {nutrient.value}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  ), [plans.meal]);

  // Workout plan component
  const WorkoutPlan = useMemo(() => (
    <div className="space-y-4">
      {plans.workout?.daily_plans?.map((day: any, idx: number) => (
        <Card key={idx} className="backdrop-blur-sm bg-white/90 border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-white">
              <Dumbbell size={20} />
              {day.day} - {day.focus}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {day.workout?.exercises?.map((exercise: any, i: number) => (
                <div key={i} className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-gray-800 mb-2">{exercise.name}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <Badge variant="outline">Sets: {exercise.sets}</Badge>
                    <Badge variant="outline">Reps: {exercise.reps}</Badge>
                    <Badge variant="outline">Rest: {exercise.rest}</Badge>
                    <Badge variant="outline">Weight: {exercise.weight}</Badge>
                  </div>
                  <p className="text-gray-600 mt-2">{exercise.instructions}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  ), [plans.workout]);

  // Plateau strategy component
  const PlateauStrategy = useMemo(() => (
    <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-white">
          <TrendingUp size={24} />
          Plateau Breaking Strategy
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Diagnosis</h3>
          <p className="text-gray-700 bg-yellow-50 p-3 rounded-lg">{plans.plateau?.diagnosis}</p>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Workout Modifications</h3>
          <div className="space-y-2">
            {plans.plateau?.modifications?.map((mod: any, i: number) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <Zap className="text-blue-600 mt-1 flex-shrink-0" size={16} />
                <p className="text-gray-700">{mod}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Nutrition Tips</h3>
          <div className="space-y-2">
            {plans.plateau?.nutrition?.map((tip: any, i: number) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <UtensilsCrossed className="text-green-600 mt-1 flex-shrink-0" size={16} />
                <p className="text-gray-700">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  ), [plans.plateau]);

  // Chat interface component
  const ChatInterface = useMemo(() => (
    <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-white">
          <MessageSquare size={24} />
          Chat with AI Coach
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-96 overflow-y-auto p-4 space-y-4">
          {chatMessages.map((message, idx) => (
            <div key={idx} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.role === 'user' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                <p className="text-sm">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setChatInput(e.target.value)}
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
      </CardContent>
    </Card>
  ), [chatMessages, loading.chat, chatInput, handleKeyPress, sendChatMessage]);

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
          {activeTab === "profile" && ProfileForm}
          {activeTab === "meal" && (plans.meal ? MealPlan : 
            <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-xl">
              <CardContent className="p-8 text-center">
                <UtensilsCrossed size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Generate a meal plan from your profile to see it here</p>
              </CardContent>
            </Card>
          )}
          {activeTab === "workout" && (plans.workout ? WorkoutPlan :
            <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-xl">
              <CardContent className="p-8 text-center">
                <Dumbbell size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Generate a workout plan from your profile to see it here</p>
              </CardContent>
            </Card>
          )}
          {activeTab === "plateau" && (plans.plateau ? PlateauStrategy :
            <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-xl">
              <CardContent className="p-8 text-center">
                <TrendingUp size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Generate a plateau strategy from your profile to see it here</p>
              </CardContent>
            </Card>
          )}
          {activeTab === "chat" && ChatInterface}
        </div>
      </div>
    </div>
  );
}