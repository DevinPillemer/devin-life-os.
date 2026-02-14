
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const steps = [
  { name: "Welcome", key: 0 },
  { name: "Module 1", key: 1 },
  { name: "Module 2", key: 2 }, 
  { name: "Module 3", key: 3 },
  { name: "Module 4", key: 4 },
  { name: "Module 5", key: 5 },
  { name: "Quiz", key: "quiz" },
  { name: "Exercises", key: "exercises" }
];

export default function ProgressBar({ current, total, course, onNavigate, currentStep, isStepAccessible: isStepGloballyAccessible }) {
  const progressPercent = (current / total) * 100;

  const handleStepClick = (stepKey) => {
    if (isStepGloballyAccessible(stepKey) && onNavigate) {
      onNavigate(stepKey);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-slate-800 truncate" title={course.title}>
              {course.title}
            </h2>
            <p className="text-sm text-slate-500">by {course.author}</p>
          </div>
          <Link to={createPageUrl("Dashboard")} className="ml-4 flex-shrink-0">
            <Button variant="outline" size="sm" className="border-slate-300 hover:bg-slate-100 flex items-center gap-1.5 text-slate-600 font-medium">
                <ArrowLeft className="w-4 h-4"/>
                Dashboard
            </Button>
          </Link>
        </div>

        <div className="space-y-2">
          <Progress value={progressPercent} className="h-2 bg-slate-200" />
          
          <div className="hidden md:flex justify-between text-xs">
            {steps.map((step, index) => {
              const isAccessible = isStepGloballyAccessible(step.key);
              const isCurrent = step.key === currentStep;
              
              let isCompleted = false;
              if (typeof currentStep === 'number' && typeof step.key === 'number') {
                isCompleted = step.key < currentStep;
              } else if (typeof step.key === 'number') {
                isCompleted = true; // All modules completed if we are on quiz/exercises
              } else if (step.key === 'quiz' && (currentStep === 'exercises' || currentStep === 'completion')) {
                isCompleted = true;
              }

              return (
                <motion.button
                  key={index}
                  className={`flex items-center gap-1.5 transition-colors duration-200 rounded-full px-2 py-0.5 ${
                    isCurrent 
                      ? 'text-blue-600 font-semibold bg-blue-50' 
                      : isCompleted 
                        ? 'text-green-600 hover:bg-green-50' 
                        : isAccessible 
                          ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer'
                          : 'text-slate-400 cursor-not-allowed opacity-60'
                  }`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleStepClick(step.key)}
                  disabled={!isAccessible}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-3.5 h-3.5" />
                  ) : (
                    <Circle className={`w-3.5 h-3.5 ${isCurrent ? 'text-blue-500' : 'text-current'}`} />
                  )}
                  <span className="font-medium">{step.name}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
