import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Brain, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "What happens when you deploy an FHEVM contract to the blockchain?",
    options: [
      "The contract code is stored encrypted on the blockchain",
      "The contract code is stored in plaintext, but data remains encrypted",
      "The contract is stored in a private database",
      "The contract is only stored locally on your computer"
    ],
    correctAnswer: 1,
    explanation: "FHEVM contracts are stored in plaintext on the blockchain (so anyone can see the code), but the encrypted data inside the contract (like our counter) remains encrypted and private."
  },
  {
    id: 2,
    question: "Why do we need to encrypt the number '1' before calling increment()?",
    options: [
      "To make the transaction faster",
      "To reduce gas costs",
      "Because FHEVM functions only work with encrypted inputs",
      "To hide the contract code"
    ],
    correctAnswer: 2,
    explanation: "FHEVM functions are designed to work with encrypted data. Since our counter is encrypted, we must also encrypt the value we want to add to it (like '1') to perform homomorphic operations."
  },
  {
    id: 3,
    question: "What does 'homomorphic operation' mean in simple terms?",
    options: [
      "Operations that are very fast",
      "Operations that work on encrypted data without decrypting it",
      "Operations that use less gas",
      "Operations that are more secure"
    ],
    correctAnswer: 1,
    explanation: "Homomorphic operations allow you to do math (like adding 1) directly on encrypted data without ever seeing the actual numbers. It's like doing math on locked boxes without opening them."
  },
  {
    id: 4,
    question: "Why do we see '0x0000...0000' when checking the initial count?",
    options: [
      "It means the counter is broken",
      "It's the encrypted representation of zero",
      "It's a random value",
      "It means the contract failed to deploy"
    ],
    correctAnswer: 1,
    explanation: "The '0x0000...0000' is how zero looks when it's encrypted. It's not plaintext zero, but the encrypted version of zero that only the FHEVM system can understand and work with."
  },
  {
    id: 5,
    question: "What is the main advantage of using FHEVM for a counter?",
    options: [
      "It's faster than regular counters",
      "It uses less gas than regular counters",
      "The counter value remains private even during operations",
      "It's easier to program than regular counters"
    ],
    correctAnswer: 2,
    explanation: "The main advantage is privacy - no one can see the actual counter value, not even the contract itself. All operations happen on encrypted data, keeping the count completely private."
  }
];

export const DeployTestCounterQuiz: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const question = quizQuestions[currentQuestion];
  const isCorrect = selectedAnswer === question.correctAnswer;

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;
    
    setShowResult(true);
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setQuizCompleted(false);
  };

  if (quizCompleted) {
    const percentage = Math.round((score / quizQuestions.length) * 100);
    const isExcellent = percentage >= 80;

    return (
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Brain className="h-5 w-5 text-blue-500" />
            Test Your IQ - Deploy & Test Counter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <div className="text-3xl font-bold text-primary">
            {score}/{quizQuestions.length}
          </div>
          <div className="text-xl font-semibold">
            {percentage}%
          </div>
          <div className={`text-lg font-medium ${
            isExcellent ? 'text-green-600' : 'text-yellow-600'
          }`}>
            {isExcellent ? 'Excellent! 🎉' : 'Good job! 👍'}
          </div>
          <p className="text-muted-foreground text-sm">
            {isExcellent ? 
              "You've mastered counter testing concepts!" :
              "You understand the basics well. Consider reviewing the explanations."
            }
          </p>
          <Button onClick={handleRestartQuiz} size="sm" variant="outline">
            Retake Quiz
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="pb-3 px-5 pt-5">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Play className="h-4 w-4" />
            Question {currentQuestion + 1} of {quizQuestions.length}
          </CardTitle>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
          <div 
            className="bg-primary h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-3 px-5 pb-5">
        <div className="text-base font-medium leading-snug">
          {question.question}
        </div>
        
        <div className="space-y-1.5">
          {question.options.map((option, index) => (
            <motion.button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              disabled={showResult}
              className={`w-full p-3 text-left rounded-lg border transition-all duration-200 ${
                selectedAnswer === index
                  ? showResult
                    ? isCorrect
                      ? 'border-green-500 bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                      : 'border-red-500 bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                    : 'border-primary bg-primary/5 text-primary dark:bg-primary/10'
                  : showResult && index === question.correctAnswer
                  ? 'border-green-500 bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-800/50 dark:text-gray-200'
              }`}
              whileHover={!showResult ? { scale: 1.02 } : {}}
              whileTap={!showResult ? { scale: 0.98 } : {}}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedAnswer === index
                    ? showResult
                      ? isCorrect
                        ? 'border-green-500 bg-green-500'
                        : 'border-red-500 bg-red-500'
                      : 'border-primary bg-primary'
                    : showResult && index === question.correctAnswer
                    ? 'border-green-500 bg-green-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {selectedAnswer === index && (
                    <CheckCircle className="h-3 w-3 text-white" />
                  )}
                  {showResult && index === question.correctAnswer && selectedAnswer !== index && (
                    <CheckCircle className="h-3 w-3 text-white" />
                  )}
                </div>
                <span className="font-medium text-sm">{option}</span>
              </div>
            </motion.button>
          ))}
        </div>

        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`p-3 rounded-lg ${
                isCorrect 
                  ? 'bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800' 
                  : 'bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {isCorrect ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <span className={`font-semibold text-sm ${
                  isCorrect ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'
                }`}>
                  {isCorrect ? 'Correct!' : 'Incorrect'}
                </span>
              </div>
              <p className={`text-sm leading-relaxed ${
                isCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
              }`}>
                {question.explanation}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-2 pt-1">
          {!showResult ? (
            <Button 
              onClick={handleSubmitAnswer} 
              disabled={selectedAnswer === null}
              className="flex-1 h-9 text-sm"
            >
              Submit Answer
            </Button>
          ) : (
            <Button onClick={handleNextQuestion} className="flex-1 h-9 text-sm">
              {currentQuestion < quizQuestions.length - 1 ? 'Next Question' : 'Finish Quiz'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
