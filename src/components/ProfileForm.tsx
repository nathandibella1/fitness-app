import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { UtensilsCrossed, Dumbbell, TrendingUp, Loader2, User } from "lucide-react";

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

interface ProfileFormProps {
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile) => void;
  generateMealPlan: () => void;
  generateWorkout: () => void;
  handlePlateauBreaker: () => void;
  loading: { [key: string]: boolean };
}

export default function ProfileForm({
  userProfile,
  setUserProfile,
  generateMealPlan,
  generateWorkout,
  handlePlateauBreaker,
  loading
}: ProfileFormProps) {
  return (
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
}