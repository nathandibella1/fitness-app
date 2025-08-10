import { useState, useEffect, lazy, Suspense } from "react";
import { Alert, AlertDescription } from "./components/ui/alert";
import {
  User,
  Dumbbell,
  UtensilsCrossed,
  MessageSquare,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Loader2
} from "lucide-react";

// Lazy load components for better performance
const ProfileForm = lazy(() => import('./components/ProfileForm'));
const MealPlan = lazy(() => import('./components/MealPlan'));
const WorkoutPlan = lazy(() => import('./components/WorkoutPlan'));
const PlateauStrategy = lazy(() => import('./components/PlateauStrategy'));
const ChatInterface = lazy(() => import('./components/ChatInterface'));

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
  </div>
);

// API configuration - change this to your backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Types for better type safety
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

  // Utility functions
  const setLoadingState = (key: string, value: boolean) => {
    setLoading(prev => ({ ...prev, [key]: value }));
  };

  const setError = (key: string, message: string) => {
    setErrors(prev => ({ ...prev, [key]: message }));
    setTimeout(() => setErrors(prev => ({ ...prev, [key]: "" })), 5000);
  };

  const setSuccess = (key: string, message: string) => {
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
    } catch (error: any) {
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
      const data = await api.generateWorkout({ user_profile: userProfile });
      setPlans(prev => ({ ...prev, workout: data.workout_plan }));
      setSuccess("workout", "Workout plan generated successfully!");
      setActiveTab("workout");
    } catch (error: any) {
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
      const data = await api.handlePlateau({ user_profile: userProfile });
      setPlans(prev => ({ ...prev, plateau: data.plateau_strategy }));
      setSuccess("plateau", "Plateau strategy generated successfully!");
      setActiveTab("plateau");
    } catch (error: any) {
      setError("plateau", error.message || "Failed to generate plateau strategy");
    } finally {
      setLoadingState("plateau", false);
    }
  };

  const sendChatMessage = async () => {
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
    } catch (error: any) {
      setError("chat", error.message || "Failed to send message");
    } finally {
      setLoadingState("chat", false);
    }
  };



  useEffect(() => {
    api.healthCheck()
      .then(data => console.log("API Health:", data))
      .catch(err => console.warn("API not available:", err));
  }, []);

  // Tab navigation component
  const TabButton = ({ id, icon: Icon, label, active, onClick }: {
    id: string;
    icon: any;
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
                     {activeTab === "profile" && (
             <Suspense fallback={<LoadingSpinner />}>
               <ProfileForm 
                 userProfile={userProfile} 
                 setUserProfile={setUserProfile} 
                 generateMealPlan={generateMealPlan} 
                 generateWorkout={generateWorkout} 
                 handlePlateauBreaker={handlePlateauBreaker} 
                 loading={loading} 
               />
             </Suspense>
           )}
          {activeTab === "meal" && (
            <Suspense fallback={<LoadingSpinner />}>
              <MealPlan plans={plans.meal} />
            </Suspense>
          )}
          {activeTab === "workout" && (
            <Suspense fallback={<LoadingSpinner />}>
              <WorkoutPlan plans={plans.workout} />
            </Suspense>
          )}
          {activeTab === "plateau" && (
            <Suspense fallback={<LoadingSpinner />}>
              <PlateauStrategy plans={plans.plateau} />
            </Suspense>
          )}
                     {activeTab === "chat" && (
             <Suspense fallback={<LoadingSpinner />}>
               <ChatInterface 
                 chatMessages={chatMessages} 
                 chatInput={chatInput} 
                 setChatInput={setChatInput} 
                 sendChatMessage={sendChatMessage} 
                 loading={loading} 
               />
             </Suspense>
           )}
        </div>
      </div>
    </div>
  );
}