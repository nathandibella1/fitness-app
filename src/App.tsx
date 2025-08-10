import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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
import { api } from "@/lib/api";

type Meal = { name: string; nutrition?: { calories: number; protein: number; carbs: number; fats: number } };

export default function FitnessCoachApp() {
  const [activeTab, setActiveTab] = useState("profile");
  const [userProfile, setUserProfile] = useState({
    name: "",
    age: 25,
    gender: "male",
    fitness_goal: "build muscle",
    experience_level: "beginner",
    available_days: 3,
    equipment: [] as string[],
    diet_type: "balanced",
    allergies: [] as string[],
    meal_pref: "",
    injuries: [] as string[],
    tracking_devices: [] as string[]
  });

  const [dailyState] = useState({
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

  const [plans, setPlans] = useState<{ meal: any; workout: any; plateau: any }>({
    meal: null,
    workout: null,
    plateau: null
  });

  const [chatMessages, setChatMessages] = useState<Array<{ role: string; content: string; timestamp: number }>>([
    {
      role: "assistant",
      content: "Hello! I'm your AI fitness coach. How can I help you reach your fitness goals today?",
      timestamp: Date.now()
    }
  ]);
  const [chatInput, setChatInput] = useState("");

  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successes, setSuccesses] = useState<Record<string, string>>({});

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

  const generateMealPlan = async () => {
    if (!userProfile.name.trim()) {
      setError("meal", "Please enter your name first");
      return;
    }
    setLoadingState("meal", true);
    try {
      const data = await api.generateMealPlan({ user_profile: userProfile as any });
      setPlans(prev => ({ ...prev, meal: (data as any).meal_plan }));
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
      const data = await api.generateWorkout({
        user_profile: userProfile as any,
        daily_state: dailyState as any
      });
      setPlans(prev => ({ ...prev, workout: (data as any).workout_plan }));
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
      const progressData = {
        current_weight: "Same for 3 weeks",
        strength_progress: "Stalled on major lifts",
        energy_levels: "Declining",
        motivation: "Lower than usual"
      };
      const data = await api.handlePlateau({
        user_profile: userProfile as any,
        progress_data: progressData
      });
      setPlans(prev => ({ ...prev, plateau: (data as any).plateau_strategy }));
      setSuccess("plateau", "Plateau strategy generated!");
      setActiveTab("plateau");
    } catch (error: any) {
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
      setChatMessages(prev => [...prev, { role: "assistant", content: (data as any).reply, timestamp: Date.now() }]);
    } catch (error: any) {
      setError("chat", error.message || "Failed to send message");
    } finally {
      setLoadingState("chat", false);
    }
  };

  const handleKeyPress = (e: any) => {
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

  const TabButton = ({ id, icon: Icon, label, active, onClick }: { id: string; icon: any; label: string; active: boolean; onClick: (id: string) => void }) => (
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
              onChange={e => setUserProfile({ ...userProfile, name: (e.target as HTMLInputElement).value })}
              className="border-2 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
            <Input
              type="number"
              placeholder="25"
              value={userProfile.age}
              onChange={e => setUserProfile({ ...userProfile, age: Number((e.target as HTMLInputElement).value) })}
              className="border-2 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
            <select
              value={userProfile.gender}
              onChange={e => setUserProfile({ ...userProfile, gender: (e.target as HTMLSelectElement).value })}
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
              onChange={e => setUserProfile({ ...userProfile, experience_level: (e.target as HTMLSelectElement).value })}
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
              onChange={e => setUserProfile({ ...userProfile, fitness_goal: (e.target as HTMLInputElement).value })}
              className="border-2 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Diet Type</label>
            <select
              value={userProfile.diet_type}
              onChange={e => setUserProfile({ ...userProfile, diet_type: (e.target as HTMLSelectElement).value })}
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
          <Button onClick={generateMealPlan} disabled={!!loading.meal} className="flex-1 bg-green-600 hover:bg-green-700">
            {loading.meal ? <Loader2 className="animate-spin mr-2" size={16} /> : <UtensilsCrossed className="mr-2" size={16} />}
            Generate Meal Plan
          </Button>
          <Button onClick={generateWorkout} disabled={!!loading.workout} className="flex-1">
            {loading.workout ? <Loader2 className="animate-spin mr-2" size={16} /> : <Dumbbell className="mr-2" size={16} />}
            Generate Workout
          </Button>
          <Button onClick={handlePlateauBreaker} disabled={!!loading.plateau} className="flex-1 bg-purple-600 hover:bg-purple-700">
            {loading.plateau ? <Loader2 className="animate-spin mr-2" size={16} /> : <TrendingUp className="mr-2" size={16} />}
            Plateau Breaker
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const MealPlan = () => (
    <div className="space-y-4">
      {plans.meal?.daily_plans?.map((day: Record<string, Meal>, idx: number) => (
        <Card key={idx} className="bg-white/90 border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <Calendar size={20} /> Day {idx + 1}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(day).map(([mealType, meal], i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                    <UtensilsCrossed size={16} /> {mealType}
                  </h4>
                  <p className="text-gray-600">{(meal as Meal).name}</p>
                </div>
                <div className="flex items-center gap-2">
                  {(meal as Meal).nutrition && (
                    <>
                      <Badge>Calories: {(meal as Meal).nutrition!.calories}</Badge>
                      <Badge>Protein: {(meal as Meal).nutrition!.protein}g</Badge>
                      <Badge>Carbs: {(meal as Meal).nutrition!.carbs}g</Badge>
                      <Badge>Fats: {(meal as Meal).nutrition!.fats}g</Badge>
                    </>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const WorkoutPlan = () => (
    <div className="space-y-4">
      {plans.workout?.weekly_schedule?.map((day: any, idx: number) => (
        <Card key={idx} className="bg-white/90 border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <Dumbbell size={20} /> {day.day}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {day.exercises?.map((exercise: any, i: number) => (
              <div key={i} className="p-3 bg-white rounded-lg shadow-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-gray-800">{exercise.name}</h4>
                    <p className="text-sm text-gray-600">
                      Sets: {exercise.sets} × Reps: {exercise.reps} {exercise.rest && `· Rest: ${exercise.rest}`}
                    </p>
                  </div>
                  <Badge className="bg-blue-50 text-blue-700 border-blue-200">{exercise.muscle_group}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const PlateauStrategy = () => (
    <Card className="bg-white/90 border-0 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-800">
          <TrendingUp size={20} /> Plateau Strategy
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: (plans.plateau || "").replace(/\n/g, "<br/>") }} />
      </CardContent>
    </Card>
  );

  const ChatInterface = () => (
    <Card className="bg-white/90 border-0 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-800">
          <MessageSquare size={20} /> AI Coach Chat
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-72 overflow-y-auto p-4 bg-white rounded-md shadow-inner space-y-3">
          {chatMessages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg max-w-[80%] ${msg.role === "assistant" ? "bg-blue-50 ml-0" : "bg-green-50 ml-auto"}`}
            >
              <div className="text-sm text-gray-700 whitespace-pre-wrap">{msg.content}</div>
              <div className="text-[10px] text-gray-400 mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            className="flex-1 p-2 border rounded-md"
            placeholder="Type your message..."
            value={chatInput}
            onChange={(e) => setChatInput((e.target as HTMLInputElement).value)}
            onKeyDown={handleKeyPress}
          />
          <Button onClick={sendChatMessage} disabled={!!loading.chat}>
            {loading.chat ? <Loader2 className="animate-spin mr-2" size={16} /> : <Send className="mr-2" size={16} />}
            Send
          </Button>
        </div>
        {errors.chat && (
          <Alert className="bg-red-50 border-red-200">
            <AlertDescription className="text-red-700 flex items-center gap-2">
              <AlertCircle size={16} /> {errors.chat}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <header className="max-w-5xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Activity size={24} className="text-blue-600" /> AI Fitness Coach
          </h1>
          <button className="p-2 rounded-full hover:bg-white">
            <Settings size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <ProfileForm />

          <Card className="bg-white/90 border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <Star size={20} /> Progress Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-lg shadow-sm text-center">
                <div className="text-2xl font-bold text-blue-600">{dailyState.streak.days}</div>
                <div className="text-sm text-gray-500">Day Streak</div>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm text-center">
                <div className="text-2xl font-bold text-green-600">7h</div>
                <div className="text-sm text-gray-500">Avg Sleep</div>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm text-center">
                <div className="text-2xl font-bold text-purple-600">Low</div>
                <div className="text-sm text-gray-500">Stress</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="flex gap-2">
            <TabButton id="profile" icon={User} label="Profile" active={activeTab === "profile"} onClick={setActiveTab} />
            <TabButton id="meal" icon={UtensilsCrossed} label="Meal Plan" active={activeTab === "meal"} onClick={setActiveTab} />
            <TabButton id="workout" icon={Dumbbell} label="Workout" active={activeTab === "workout"} onClick={setActiveTab} />
            <TabButton id="plateau" icon={TrendingUp} label="Plateau" active={activeTab === "plateau"} onClick={setActiveTab} />
            <TabButton id="chat" icon={MessageSquare} label="Chat" active={activeTab === "chat"} onClick={setActiveTab} />
          </div>

          {activeTab === "profile" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <Target size={16} /> Goal
                </div>
                <div className="text-sm text-gray-500 mt-2">{userProfile.fitness_goal || "Set your goal"}</div>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <Clock size={16} /> Days/Week
                </div>
                <div className="text-sm text-gray-500 mt-2">{userProfile.available_days || 0}</div>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <Heart size={16} /> Experience
                </div>
                <div className="text-sm text-gray-500 mt-2">{userProfile.experience_level}</div>
              </div>
            </div>
          )}

          {activeTab === "meal" && <MealPlan />}
          {activeTab === "workout" && <WorkoutPlan />}
          {activeTab === "plateau" && <PlateauStrategy />}
          {activeTab === "chat" && <ChatInterface />}

          {(errors.meal || errors.workout || errors.plateau) && (
            <Alert className="bg-red-50 border-red-200">
              <AlertDescription className="text-red-700 flex items-center gap-2">
                <AlertCircle size={16} /> {errors.meal || errors.workout || errors.plateau}
              </AlertDescription>
            </Alert>
          )}
          {(successes.meal || successes.workout || successes.plateau) && (
            <Alert className="bg-green-50 border-green-200">
              <AlertDescription className="text-green-700 flex items-center gap-2">
                <CheckCircle size={16} /> {successes.meal || successes.workout || successes.plateau}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </main>

      <footer className="max-w-5xl mx-auto mt-6 text-center text-gray-400 text-sm">
        Built with <Zap className="inline" size={14} /> Vite + React
      </footer>
    </div>
  );
}