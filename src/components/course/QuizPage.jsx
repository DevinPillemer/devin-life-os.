
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  CheckCircle,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Trophy,
  RotateCcw } from
"lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function QuizPage({ course, userProgress, onNext, onPrevious, updateProgress }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [feedback, setFeedback] = useState(null); // { type: 'correct' | 'incorrect', questionIndex: number }
  const [isAnswering, setIsAnswering] = useState(false);

  const correctFeedbackPhrases = ["Nailed it!", "You're a rockstar!", "Bingo!", "Genius!", "Superb!", "Couldn't have said it better!"];
  const incorrectFeedbackPhrases = ["Not quite!", "So close!", "Give it another thought!", "Almost!", "Good try, but not this time!"];

  const questions = course.quiz_questions || [];

  const getCorrectAnswerText = (question) => {
    if (!question || !question.correct_answer) return "";

    // Check for new format first (full text match)
    if (question.options?.includes(question.correct_answer)) {
      return question.correct_answer;
    }

    // Check for legacy format (e.g., "A", "B.", "C")
    if (question.correct_answer.length <= 2 && /^[A-D]\.?$/.test(question.correct_answer.trim().toUpperCase())) {
      const letter = question.correct_answer.trim().toUpperCase().charAt(0);
      const correctIndex = letter.charCodeAt(0) - 'A'.charCodeAt(0);
      if (question.options && question.options[correctIndex]) {
        return question.options[correctIndex];
      }
    }

    // Fallback to the raw value if no match is found
    return question.correct_answer;
  };

  // Create audio context for sound effects
  const playSound = (isCorrect) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      if (isCorrect) {
        // Success sound - ascending notes
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.4);
      } else {
        // Error sound - descending buzz
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(150, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(100, audioContext.currentTime + 0.2);
        oscillator.type = 'sawtooth';
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
      }
    } catch (error) {
      console.log('Audio not supported or error playing sound:', error);
    }
  };

  const handleAnswer = (questionIndex, answer) => {
    if (isAnswering) return; // Prevent multiple clicks during animation

    setIsAnswering(true);
    const question = questions[questionIndex];
    const correctAnswerText = getCorrectAnswerText(question);
    const isCorrect = answer === correctAnswerText;

    const newAnswers = {
      ...answers,
      [questionIndex]: answer,
    };

    // Set the answer
    setAnswers(newAnswers);

    // Show immediate feedback
    setFeedback({ type: isCorrect ? 'correct' : 'incorrect', questionIndex });
    playSound(isCorrect);

    // Auto-advance after feedback animation
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        nextQuestion();
      } else {
        // This is the last question, submit the quiz
        submitQuiz(newAnswers);
      }
      setIsAnswering(false);
      setFeedback(null);
    }, isCorrect ? 1500 : 2500); // Longer delay for incorrect answers
  };

  const submitQuiz = (currentAnswers) => {
    let correctCount = 0;
    questions.forEach((question, index) => {
      const correctAnswerText = getCorrectAnswerText(question);
      if (currentAnswers[index] === correctAnswerText) {
        correctCount++;
      }
    });

    const finalScore = Math.round((correctCount / questions.length) * 100);
    setScore(finalScore);
    setCorrectAnswers(correctCount);
    setShowResults(true);
    setIsComplete(true);

    // Update progress with XP based on performance
    const baseXP = 30;
    const bonusXP = finalScore >= 90 ? 20 : finalScore >= 80 ? 10 : 0;
    const totalXP = baseXP + bonusXP;

    updateProgress({
      quiz_scores: [...(userProgress?.quiz_scores || []), finalScore],
      xp_earned: (userProgress?.xp_earned || 0) + totalXP,
      final_score: finalScore,
    });
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setScore(0);
    setCorrectAnswers(0);
    setIsComplete(false);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const renderQuestion = (question, index) => {
    const userAnswer = answers[index];
    const isAnswered = userAnswer !== undefined;
    const correctAnswerText = getCorrectAnswerText(question);
    const isCorrect = userAnswer === correctAnswerText; // This is for styling of the options
    const showingFeedback = feedback?.questionIndex === index;

    return (
      <motion.div
        initial={{ scale: 1 }}
        animate={{
          scale: showingFeedback ? feedback.type === 'correct' ? 1.02 : 0.98 : 1
        }}
        transition={{ duration: 0.3 }}>

        <Card className={`border-slate-700 shadow-lg transition-all duration-500 ${
        showingFeedback ?
        feedback.type === 'correct' ?
        'bg-green-900/30 border-green-500' :
        'bg-red-900/30 border-red-500' :
        'bg-slate-800'}`
        }>
          <CardHeader className="border-b border-slate-700">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-green-400" />
                <span className="text-white">Question {index + 1} of {questions.length}</span>
              </div>
              <Badge className="bg-green-900 text-green-300">
                MULTIPLE CHOICE
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 relative overflow-hidden">
            <h3 className="text-xl font-semibold text-slate-100 mb-6 leading-relaxed">
              {question.question}
            </h3>

            {/* Real-time feedback overlay */}
            <AnimatePresence>
              {showingFeedback &&
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className={`absolute inset-0 flex flex-col items-center justify-center z-20 rounded-lg p-4 ${
                feedback.type === 'correct' ?
                'bg-green-500/90' :
                'bg-red-500/90'}`
                }>

                  <div className="text-center text-white">
                    <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}>

                      {feedback.type === 'correct' ?
                    <CheckCircle className="w-20 h-20 mx-auto mb-4" /> :

                    <XCircle className="w-20 h-20 mx-auto mb-4" />
                    }
                    </motion.div>
                    <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-3xl font-bold mb-2">

                      {feedback.type === 'correct' ? correctFeedbackPhrases[Math.floor(Math.random() * correctFeedbackPhrases.length)] : incorrectFeedbackPhrases[Math.floor(Math.random() * incorrectFeedbackPhrases.length)]}
                    </motion.h2>
                    <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-lg font-medium">

                      {feedback.type === 'incorrect' && `The magic word was: ${correctAnswerText}`}
                    </motion.p>
                  </div>
                </motion.div>
              }
            </AnimatePresence>

            <div className="space-y-3 relative">
              {question.options?.map((option, optionIndex) => {
                const isSelectedOption = userAnswer === option;
                const isCorrectOption = option === correctAnswerText;

                return (
                  <motion.button
                    key={optionIndex}
                    whileHover={{ scale: isAnswering ? 1 : 1.02 }}
                    whileTap={{ scale: isAnswering ? 1 : 0.98 }}
                    onClick={() => !isAnswering && handleAnswer(index, option)}
                    disabled={isAnswering || isAnswered} // Disable after answered to prevent re-answering
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-300 ${
                    showingFeedback && isSelectedOption ?
                    feedback.type === 'correct' ?
                    'border-green-400 bg-green-900/50 text-white animate-pulse' :
                    'border-red-400 bg-red-900/50 text-white animate-pulse' :
                    showingFeedback && isCorrectOption && feedback.type === 'incorrect' ?
                    'border-green-400 bg-green-900/50 text-white' :
                    isAnswered && isSelectedOption ?
                    'border-blue-500 bg-blue-900/50 text-slate-100' // Your previously selected answer
                    : isAnswered && isCorrectOption // Show correct answer even if not selected
                    ? 'border-green-500 bg-green-900/50 text-white' :
                    'border-slate-600 hover:border-slate-500 bg-slate-700/50 text-slate-200'}`
                    }>

                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                      showingFeedback && isSelectedOption ?
                      feedback.type === 'correct' ?
                      'border-green-400 bg-green-400' :
                      'border-red-400 bg-red-400' :
                      showingFeedback && isCorrectOption && feedback.type === 'incorrect' ?
                      'border-green-400 bg-green-400' :
                      isAnswered && isSelectedOption ?
                      'border-blue-500 bg-blue-500' :
                      isAnswered && isCorrectOption ?
                      'border-green-400 bg-green-400' :
                      'border-slate-400'}`
                      }>
                        {(showingFeedback && isSelectedOption ||
                        showingFeedback && isCorrectOption && feedback.type === 'incorrect' ||
                        isAnswered && isSelectedOption ||
                        isAnswered && isCorrectOption) &&

                        <div className="w-full h-full rounded-full bg-white scale-50"></div>
                        }
                      </div>
                      <span className="font-medium">{option}</span>
                    </div>
                  </motion.button>);

              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>);

  };

  if (showResults) {
    const passed = score >= 80;

    return (
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center">

          <Card className="border-slate-700 shadow-xl overflow-hidden bg-slate-800">
            <div className={`p-8 text-white ${
            passed ?
            'bg-gradient-to-r from-green-500 to-emerald-600' :
            'bg-gradient-to-r from-red-500 to-rose-600'}`
            }>
              <div className="flex items-center justify-center mb-4">
                {passed ?
                <Trophy className="w-16 h-16 text-yellow-300" /> :

                <RotateCcw className="w-16 h-16" />
                }
              </div>
              <h2 className="text-3xl font-bold mb-2">
                {passed ? "You're a Quiz Whiz! 🧙‍♂️" : 'A Noble Attempt!'}
              </h2>
              <p className="text-xl">
                You scored {score}% on the quiz
              </p>
              <p className="text-lg opacity-90">
                {passed ?
                "Fantastic job! You've unlocked the exercises." :
                'You need 80% to pass. Feel free to review the modules and try again!'}
              </p>
            </div>
            <CardContent className="p-8">
              <div className="text-center space-y-4">
                <div className="text-4xl font-bold text-white mb-4">
                  {score}%
                </div>
                <Progress value={score} className="h-4 bg-slate-700" />
                <p className="text-slate-400">
                  {correctAnswers} out of {questions.length} correct answers
                </p>
                <div className="grid grid-cols-5 gap-2 mt-6">
                  {questions.map((question, index) =>
                  <div
                    key={index}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    answers[index] === getCorrectAnswerText(question) ?
                    'bg-green-500 text-white' :
                    'bg-red-500 text-white'}`
                    }>

                      {index + 1}
                    </div>
                  )}
                </div>

                <div className="flex justify-center gap-4 pt-6">
                  {!passed &&
                  <Button
                    onClick={resetQuiz}
                    variant="outline" className="bg-green-300 text-slate-700 px-4 py-2 text-sm font-medium justify-center whitespace-nowrap rounded-md ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border h-10 flex items-center gap-2 border-slate-400 hover:bg-slate-600 hover:text-white hover:border-slate-300">


                      <RotateCcw className="w-4 h-4" />
                      Retake Quiz
                    </Button>
                  }

                  <Button
                    onClick={passed ? onNext : onPrevious}
                    className={passed ?
                    "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white" :
                    "text-slate-100 border-slate-400 hover:bg-slate-600 hover:text-white hover:border-slate-300"
                    }
                    variant={passed ? 'default' : 'outline'}>

                    {passed ?
                    <>
                        Continue to Exercises
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </> :

                    <>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Modules
                      </>
                    }
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>);

  }

  // Progress based on answered questions
  const answeredCount = Object.keys(answers).length;
  const progress = answeredCount / questions.length * 100;

  return (
    <div className="space-y-8">
      {/* Quiz Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center">

        <Badge className="bg-green-900 text-green-300 mb-4 px-4 py-2">
          Interactive Quiz
        </Badge>
        <h1 className="text-3xl font-bold text-white mb-4">Test Your Knowledge</h1>
        <div className="space-y-2">
          <Progress value={progress} className="h-3 bg-slate-700" />
          <p className="text-slate-300">
            Question {currentQuestion + 1} of {questions.length} • {answeredCount}/{questions.length} answered
          </p>
        </div>
      </motion.div>

      {/* Current Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}>

          {renderQuestion(questions[currentQuestion], currentQuestion)}
        </motion.div>
      </AnimatePresence>

      {/* Quiz Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex justify-between items-center pt-6">

        <Button
          onClick={currentQuestion > 0 ? previousQuestion : onPrevious}
          variant="outline"
          className="flex items-center gap-2 text-slate-100 border-slate-400 hover:bg-slate-600 hover:text-white hover:border-slate-300"
          disabled={isAnswering}>

          <ArrowLeft className="w-4 h-4" />
          {currentQuestion > 0 ? 'Previous' : 'Back to Modules'}
        </Button>

        <div className="text-center">
          <span className="bg-slate-800 px-4 py-2 rounded-full text-sm text-slate-400">
            Question {currentQuestion + 1} of {questions.length}
          </span>
        </div>
        
        {/* This space is intentionally left empty. The next/submit button has been removed for the auto-advancing flow. */}
        <div className="w-[150px]"></div>
        
      </motion.div>
    </div>);

}
