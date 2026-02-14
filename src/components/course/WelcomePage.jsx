
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Users, 
  Target, 
  ArrowRight,
  Clock,
  Award,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";

export default function WelcomePage({ course, userProgress, onNext }) {
  const getLearningStats = () => {
    return {
      modules: course.modules?.length || 5,
      quizzes: course.quiz_questions?.length || 10,
      exercises: course.exercises?.length || 5
    };
  };

  const stats = getLearningStats();

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <BookOpen className="w-8 h-8 text-blue-400" />
          <h1 className="text-2xl font-bold text-white">Welcome to Your Learning Journey</h1>
        </div>
      </motion.div>

      {/* Main Course Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-slate-700 shadow-xl overflow-hidden bg-slate-800">
          <div className="bg-gradient-to-r from-blue-900/30 via-purple-900/30 to-indigo-900/30 p-8 text-white">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-2">{course.title}</h2>
              <p className="text-xl text-blue-200 mb-4">by {course.author}</p>
              <p className="text-lg text-slate-100 max-w-2xl mx-auto leading-relaxed">
                {course.description?.substring(0, 200)}...
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Learning Features Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="text-center p-6 border-slate-700 bg-slate-800 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{stats.modules} Learning Modules</h3>
            <p className="text-slate-300">Core concepts broken down</p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="text-center p-6 border-slate-700 bg-slate-800 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Interactive Quizzes</h3>
            <p className="text-slate-300">Test your understanding</p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="text-center p-6 border-slate-700 bg-slate-800 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-purple-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Real Exercises</h3>
            <p className="text-slate-300">Apply what you learn</p>
          </Card>
        </motion.div>
      </div>

      {/* Learning Objectives */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="border-slate-700 bg-slate-800 shadow-lg">
          <CardContent className="p-8">
            <div className="bg-slate-800/50 border-l-4 border-yellow-500 p-6 rounded-r-lg">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Target className="w-6 h-6 text-yellow-400" />
                Learning Objectives
              </h3>
              <div className="space-y-3">
                {course.learning_objectives?.map((objective, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">{index + 1}</span>
                    </div>
                    <p className="text-slate-100 font-medium">{objective}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Current Stats Display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="border-slate-700 bg-slate-800 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <span className="text-sm text-slate-300">XP to Earn:</span>
                  <Badge className="bg-yellow-900 text-yellow-300">+150 XP</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                  <span className="text-sm text-slate-300">Est. Time:</span>
                  <Badge className="bg-blue-900 text-blue-300">30-45 min</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-400" />
                  <span className="text-sm text-slate-300">Certificate:</span>
                  <Badge className="bg-purple-900 text-purple-300">Available</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="flex justify-center pt-4"
      >
        <Button 
          onClick={onNext}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-8 py-3 text-lg"
        >
          Begin Learning Journey
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </motion.div>

      {/* Progress Indicator */}
      <div className="text-center text-sm text-slate-400 pt-4">
        <span className="bg-slate-800 px-3 py-1 rounded-full">1 of 8</span>
      </div>
    </div>
  );
}
