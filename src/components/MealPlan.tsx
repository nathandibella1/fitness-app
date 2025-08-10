import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { UtensilsCrossed } from "lucide-react";

interface MealPlanProps {
  plans: any;
}

export default function MealPlan({ plans }: MealPlanProps) {
  if (!plans) {
    return (
      <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-xl">
        <CardContent className="p-8 text-center">
          <UtensilsCrossed size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Generate a meal plan from your profile to see it here</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {plans.daily_plans?.map((day: any, idx: number) => (
        <Card key={idx} className="backdrop-blur-sm bg-white/90 border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-white">
              <UtensilsCrossed size={20} />
              {day.day}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {day.meals?.map((meal: any, i: number) => (
                <div key={i} className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-gray-800 mb-2">{meal.name}</h4>
                  <p className="text-gray-600 text-sm mb-2">{meal.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {meal.nutrition?.map((nutrient: any, j: number) => (
                      <Badge key={j} variant="secondary" className="text-xs">
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
  );
}