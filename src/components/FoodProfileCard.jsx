import { useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Target, Flame, Droplets, Clock, TrendingUp } from 'lucide-react'
import { HABIT_CATEGORY_MAP } from '@/data/seedData'

const nutritionTargets = {
  calories: 2200,
  protein: 150,
  carbs: 200,
  fat: 80,
  water: 3000, // ml
  fiber: 35
}

const mealTiming = [
  { name: 'Breakfast', time: '7:30', calories: 400, protein: 30, status: 'completed' },
  { name: 'Lunch', time: '13:00', calories: 600, protein: 45, status: 'completed' },
  { name: 'Pre-workout', time: '16:30', calories: 150, protein: 10, status: 'pending' },
  { name: 'Post-workout', time: '18:00', calories: 350, protein: 40, status: 'pending' },
  { name: 'Dinner', time: '20:00', calories: 700, protein: 25, status: 'pending' }
]

export default function FoodProfileCard({ syncData }) {
  const completedFoodHabits = useMemo(() => {
    if (!syncData?.journal) return []
    
    const foodHabits = [
      'Protein Target (150g)',
      'Track Calories', 
      'Hydration (3L)',
      'Meal Prep',
      'Fast 16hrs',
      'Pre-workout Nutrition',
      'Post-workout Protein',
      'Omega-3 Supplement',
      'No Late Snacking'
    ]
    
    return syncData.journal.filter(entry => 
      entry?.status === 'completed' && 
      foodHabits.some(habit => 
        entry?.habit_name?.toLowerCase().includes(habit.toLowerCase()) ||
        entry?.name?.toLowerCase().includes(habit.toLowerCase())
      )
    )
  }, [syncData])

  // Calculate current progress (mock data based on completed habits)
  const currentNutrition = useMemo(() => {
    const baseIntake = {
      calories: 1800,
      protein: 120,
      carbs: 180,
      fat: 70,
      water: 2500,
      fiber: 28
    }

    // Boost values based on completed habits
    const proteinBoost = completedFoodHabits.find(h => h.habit_name?.includes('Protein')) ? 30 : 0
    const hydrationBoost = completedFoodHabits.find(h => h.habit_name?.includes('Hydration')) ? 500 : 0
    
    return {
      calories: baseIntake.calories + (completedFoodHabits.length * 50),
      protein: baseIntake.protein + proteinBoost,
      carbs: baseIntake.carbs + (completedFoodHabits.length * 5),
      fat: baseIntake.fat + (completedFoodHabits.length * 3),
      water: baseIntake.water + hydrationBoost,
      fiber: baseIntake.fiber + (completedFoodHabits.length * 2)
    }
  }, [completedFoodHabits])

  const progressPercentage = (current, target) => Math.min((current / target) * 100, 100)

  return (
    <div className="grid gap-6">
      {/* Daily Nutrition Overview */}
      <Card className="p-6 bg-gray-900/50 border-gray-800">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-5 w-5 text-green-400" />
          <h3 className="text-lg font-semibold text-gray-100">Daily Nutrition Profile</h3>
          <div className="ml-auto text-sm text-gray-400">
            Speed Focus: {completedFoodHabits.length}/9 habits
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-400">Calories</span>
              <span className="text-sm font-medium text-gray-200">
                {currentNutrition.calories}/{nutritionTargets.calories}
              </span>
            </div>
            <Progress 
              value={progressPercentage(currentNutrition.calories, nutritionTargets.calories)} 
              className="h-2 bg-gray-800"
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-400">Protein (g)</span>
              <span className="text-sm font-medium text-gray-200">
                {currentNutrition.protein}/{nutritionTargets.protein}
              </span>
            </div>
            <Progress 
              value={progressPercentage(currentNutrition.protein, nutritionTargets.protein)} 
              className="h-2 bg-gray-800"
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-400">Water (L)</span>
              <span className="text-sm font-medium text-gray-200">
                {(currentNutrition.water/1000).toFixed(1)}/{nutritionTargets.water/1000}
              </span>
            </div>
            <Progress 
              value={progressPercentage(currentNutrition.water, nutritionTargets.water)} 
              className="h-2 bg-gray-800"
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-400">Carbs (g)</span>
              <span className="text-sm font-medium text-gray-200">
                {currentNutrition.carbs}/{nutritionTargets.carbs}
              </span>
            </div>
            <Progress 
              value={progressPercentage(currentNutrition.carbs, nutritionTargets.carbs)} 
              className="h-2 bg-gray-800"
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-400">Fat (g)</span>
              <span className="text-sm font-medium text-gray-200">
                {currentNutrition.fat}/{nutritionTargets.fat}
              </span>
            </div>
            <Progress 
              value={progressPercentage(currentNutrition.fat, nutritionTargets.fat)} 
              className="h-2 bg-gray-800"
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-400">Fiber (g)</span>
              <span className="text-sm font-medium text-gray-200">
                {currentNutrition.fiber}/{nutritionTargets.fiber}
              </span>
            </div>
            <Progress 
              value={progressPercentage(currentNutrition.fiber, nutritionTargets.fiber)} 
              className="h-2 bg-gray-800"
            />
          </div>
        </div>
      </Card>

      {/* Meal Timing & Speed Optimization */}
      <Card className="p-6 bg-gray-900/50 border-gray-800">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-100">Meal Timing (Speed Focus)</h3>
          <div className="ml-auto text-sm text-gray-400">
            <TrendingUp className="h-4 w-4 inline mr-1" />
            Optimized for Performance
          </div>
        </div>
        
        <div className="space-y-3">
          {mealTiming.map((meal, index) => (
            <div 
              key={index}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                meal.status === 'completed' 
                  ? 'bg-green-500/10 border-green-500/30 text-green-200' 
                  : 'bg-gray-800/50 border-gray-700 text-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  meal.status === 'completed' ? 'bg-green-400' : 'bg-gray-500'
                }`} />
                <div>
                  <div className="font-medium">{meal.name}</div>
                  <div className="text-sm text-gray-400">{meal.time}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">{meal.calories} cal</div>
                <div className="text-xs text-gray-400">{meal.protein}g protein</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Connected Goals */}
      <Card className="p-6 bg-gray-900/50 border-gray-800">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-5 w-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-gray-100">Food → Goals Connection</h3>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
            <div>
              <div className="font-medium text-purple-200">Body Fat <2% 89kgs</div>
              <div className="text-sm text-gray-400">Primary fitness goal</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-purple-400">
                {Math.round(progressPercentage(currentNutrition.protein, nutritionTargets.protein))}%
              </div>
              <div className="text-xs text-gray-400">nutrition progress</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div>
              <div className="font-medium text-green-200">Daily Nutrition Profile: 150g Protein</div>
              <div className="text-sm text-gray-400">Protein target goal</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-green-400">{currentNutrition.protein}g</div>
              <div className="text-xs text-gray-400">current intake</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div>
              <div className="font-medium text-blue-200">Meal Timing Optimization</div>
              <div className="text-sm text-gray-400">Speed & performance focus</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-blue-400">
                {mealTiming.filter(m => m.status === 'completed').length}/5
              </div>
              <div className="text-xs text-gray-400">meals on track</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}