import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Zap, UtensilsCrossed, TrendingUp } from "lucide-react";

interface PlateauStrategyProps {
  plans: any;
}

export default function PlateauStrategy({ plans }: PlateauStrategyProps) {
  if (!plans) {
    return (
      <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-xl">
        <CardContent className="p-8 text-center">
          <TrendingUp size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Generate a plateau strategy from your profile to see it here</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-white">
          <TrendingUp size={24} />
          Plateau Breaking Strategy
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Diagnosis</h3>
          <p className="text-gray-700 bg-yellow-50 p-3 rounded-lg">{plans.diagnosis}</p>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Workout Modifications</h3>
          <div className="space-y-3">
            {plans.modifications?.map((mod: any, i: number) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <Zap className="text-blue-600 mt-1 flex-shrink-0" size={20} />
                <div>
                  <h4 className="font-medium text-gray-800">{mod.title}</h4>
                  <p className="text-gray-600 text-sm">{mod.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Nutrition Tips</h3>
          <div className="space-y-3">
            {plans.nutrition?.map((tip: any, i: number) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <UtensilsCrossed className="text-green-600 mt-1 flex-shrink-0" size={20} />
                <div>
                  <h4 className="font-medium text-gray-800">{tip.title}</h4>
                  <p className="text-gray-600 text-sm">{tip.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}