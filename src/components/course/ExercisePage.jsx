
import { useState } from "react";
import { User } from "@/entities/User";
import { UserProgress } from "@/entities/UserProgress"; // Added import for UserProgress
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Target,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Lightbulb,
  PenTool
} from "lucide-react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";

export default function ExercisePage({ course, userProgress, onNext, onPrevious, updateProgress }) {
  const [responses, setResponses] = useState({});
  const [isComplete, setIsComplete] = useState(false);

  const exercises = course.exercises || [];

  const handleResponseChange = (exerciseIndex, promptIndex, value) => {
    setResponses((prev) => ({
      ...prev,
      [`${exerciseIndex}-${promptIndex}`]: value
    }));
  };

  const submitExercises = async () => {
    const exerciseResponses = exercises.map((exercise, exerciseIndex) => ({
      exercise_index: exerciseIndex,
      responses: exercise.prompts?.map((_, promptIndex) =>
      responses[`${exerciseIndex}-${promptIndex}`] || ''
      ) || []
    }));

    const xpEarned = 40; // Increased XP for completing exercises
    const hasPassed = (userProgress?.final_score || 0) >= 80;

    await updateProgress({
      exercise_responses: exerciseResponses,
      xp_earned: (userProgress?.xp_earned || 0) + xpEarned,
      completed: true,
      completion_date: new Date().toISOString().split('T')[0],
      certificate_id: hasPassed ? `CERT-${Date.now()}` : null
    });

    // Mint wallet credits (shekels) for completing the course - once
    const rewardShekels = Number(course?.reward_value ?? 25);
    const existing = await base44.entities.EarnedCredit.filter({
      reference_type: "course",
      reference_id: course.id
    });
    if (!existing || existing.length === 0) {
      await base44.entities.EarnedCredit.create({
        title: `Completed course: ${course.title}`,
        source: "learning",
        amount: rewardShekels,
        date: new Date().toISOString().slice(0, 10),
        reference_type: "course",
        reference_id: course.id,
        notes: "Course completion reward"
      });
    }

    // Update user stats when course is completed
    await updateUserStatsOnCompletion();

    setIsComplete(true);

    // Continue to completion page after short delay
    setTimeout(() => {
      onNext();
    }, 1500);
  };

  const updateUserStatsOnCompletion = async () => {
    try {
      const determineBeltLevel = (xp) => {
        if (xp < 100) return 'white';
        if (xp < 300) return 'blue';
        if (xp < 750) return 'purple';
        if (xp < 1500) return 'brown';
        return 'black';
      };

      const user = await User.me();
      // Recalculate all stats from scratch from all progress records to ensure consistency
      const allProgress = await UserProgress.filter({ created_by: user.email });

      const newTotalXp = allProgress.reduce((sum, p) => sum + (p.xp_earned || 0), 0);
      const newCoursesCompleted = allProgress.filter((p) => p.completed).length;
      const newTotalTimeSpent = allProgress.reduce((sum, p) => sum + (p.time_spent || 0), 0);
      const newBeltLevel = determineBeltLevel(newTotalXp);

      // Calculate streak
      const today = new Date().toISOString().split('T')[0];
      const lastActivity = user.last_activity_date;
      let newStreak = 1;
      if (lastActivity) {
        const lastDate = new Date(lastActivity);
        const todayDate = new Date(today);
        lastDate.setUTCHours(0, 0, 0, 0);
        todayDate.setUTCHours(0, 0, 0, 0);
        const diffTime = todayDate.getTime() - lastDate.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          newStreak = (user.current_streak || 0) + 1;
        } else if (diffDays === 0) {
          newStreak = user.current_streak || 1;
        }
      }

      const updatedStats = {
        total_xp: newTotalXp,
        courses_completed: newCoursesCompleted,
        total_time_spent: newTotalTimeSpent,
        belt_level: newBeltLevel,
        current_streak: newStreak,
        longest_streak: Math.max(user.longest_streak || 0, newStreak),
        last_activity_date: today,
      };

      await User.updateMyUserData(updatedStats);
    } catch (error) {
      console.error("Error updating user stats:", error);
    }
  };

  const getAllResponsesCount = () => {
    return Object.keys(responses).filter((key) => responses[key]?.trim()).length;
  };

  const getTotalPromptsCount = () => {
    return exercises.reduce((sum, exercise) => sum + (exercise.prompts?.length || 0), 0);
  };

  if (isComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12">

        <Card className="border-slate-700 bg-slate-800 shadow-xl">
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-8 text-white">
            <CheckCircle className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-2">Exercises Complete!</h2>
            <p className="text-xl text-purple-100">
              Great work applying your knowledge!
            </p>
          </div>
          <CardContent className="p-8">
            <div className="space-y-4">
              <Badge className="bg-purple-900 text-purple-300 px-4 py-2">
                +40 XP Earned
              </Badge>
              <p className="text-slate-400">
                Moving to completion page...
              </p>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto"></div>
            </div>
          </CardContent>
        </Card>
      </motion.div>);

  }

  return (
    <div className="space-y-8">
      {/* Exercise Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center">

        <Badge className="bg-purple-900 text-purple-300 mb-4 px-4 py-2">
          Real-Life Application
        </Badge>
        <h1 className="text-3xl font-bold text-white mb-4">Practice Exercises</h1>
        <p className="text-xl text-slate-300">Apply what you've learned immediately</p>
      </motion.div>

      {/* Exercises */}
      <div className="space-y-8">
        {exercises.map((exercise, exerciseIndex) =>
        <motion.div
          key={exerciseIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: exerciseIndex * 0.1 }}>

            <Card className="border-slate-700 bg-slate-800 shadow-lg">
              <CardHeader className="border-b border-slate-700">
                <CardTitle className="flex items-center gap-3 text-xl text-white">
                  <Target className="w-6 h-6 text-purple-400" />
                  Exercise {exerciseIndex + 1}: {exercise.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="bg-slate-700/50 border-l-4 border-purple-500 p-6 rounded-r-lg">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="w-5 h-5 text-purple-400 mt-0.5" />
                      <p className="text-slate-100 font-medium leading-relaxed">
                        {exercise.description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {exercise.prompts?.map((prompt, promptIndex) =>
                  <div key={promptIndex} className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-200">
                          <PenTool className="w-4 h-4 text-purple-400" />
                          {prompt}
                        </label>
                        <Textarea
                      value={responses[`${exerciseIndex}-${promptIndex}`] || ''}
                      onChange={(e) => handleResponseChange(exerciseIndex, promptIndex, e.target.value)}
                      placeholder="Share your thoughts and reflection here..."
                      rows={4}
                      className="border-slate-600 bg-slate-700 text-slate-100 placeholder-slate-400 focus:border-purple-500 resize-none" />

                      </div>
                  )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Progress Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}>

        <Alert className="border-indigo-500/50 bg-indigo-900/30">
          <CheckCircle className="h-4 w-4 text-indigo-400" />
          <AlertDescription className="text-slate-200">
            <strong>Progress:</strong> {getAllResponsesCount()} of {getTotalPromptsCount()} responses completed
          </AlertDescription>
        </Alert>
      </motion.div>

      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex justify-between items-center pt-6">

        <Button
          onClick={onPrevious}
          variant="outline" className="bg-green-400 text-slate-950 px-4 py-2 text-sm font-medium justify-center whitespace-nowrap rounded-md ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border h-10 flex items-center gap-2 border-slate-600 hover:bg-slate-700 hover:text-white">


          <ArrowLeft className="w-4 h-4" />
          Back to Quiz
        </Button>

        <div className="text-center">
          <span className="bg-slate-800 px-4 py-2 rounded-full text-sm text-slate-400">
            8 of 8
          </span>
        </div>

        <Button
          onClick={submitExercises}
          disabled={getAllResponsesCount() < Math.floor(getTotalPromptsCount() * 0.7)} // At least 70% completion
          className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white flex items-center gap-2">

          Complete Course
          <ArrowRight className="w-4 h-4" />
        </Button>
      </motion.div>
    </div>);

}
