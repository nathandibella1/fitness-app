import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Dumbbell } from "lucide-react";

interface WorkoutPlanProps {
  plans: any;
}

export default function WorkoutPlan({ plans }: WorkoutPlanProps) {
  if (!plans) {
    return (
      <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-xl">
        <CardContent className="p-8 text-center">
          <Dumbbell size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Generate a workout plan from your profile to see it here</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {plans.daily_plans?.map((day: any, idx: number) => (
        <Card key={idx} className="backdrop-blur-sm bg-white/90 border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-white">
              <Dumbbell size={20} />
              {day.day}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {day.workout?.exercises?.map((exercise: any, i: number) => (
                <div key={i} className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-gray-800 mb-2">{exercise.name}</h4>
                  <p className="text-gray-600 text-sm mb-2">{exercise.description}</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-xs">
                      Sets: {exercise.sets}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Reps: {exercise.reps}
                    </Badge>
                    {exercise.rest && (
                      <Badge variant="secondary" className="text-xs">
                        Rest: {exercise.rest}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}