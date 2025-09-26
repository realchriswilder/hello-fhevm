import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Brain, Code } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: 'contract_structure' | 'fhe_types' | 'operations' | 'permissions';
}

const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "What is the key difference between FHEVM and regular Solidity contracts?",
    options: [
      "FHEVM contracts are faster",
      "FHEVM contracts use encrypted data types (euint8, ebool) instead of plaintext types",
      "FHEVM contracts cost less gas",
      "FHEVM contracts have better error handling"
    ],
    correctAnswer: 1,
    explanation: "The main difference is that FHEVM contracts use encrypted data types like euint8, ebool instead of plaintext types like uint8, bool. This allows computation on encrypted data while maintaining privacy.",
    category: 'fhe_types'
  },
  {
    id: 2,
    question: "Why do FHEVM functions require both encrypted input and a proof?",
    options: [
      "To reduce gas costs",
      "To validate that the encrypted input is well-formed and matches the claimed plaintext",
      "To make the function faster",
      "To store the input permanently"
    ],
    correctAnswer: 1,
    explanation: "The proof validates that the encrypted input is well-formed and matches the claimed plaintext value. This prevents malicious users from submitting invalid ciphertexts that could corrupt the contract state.",
    category: 'operations'
  },
  {
    id: 3,
    question: "What does FHE.fromExternal() do?",
    options: [
      "Encrypts a plaintext value",
      "Converts external encrypted input to internal euint8 for use in the contract",
      "Decrypts an encrypted value",
      "Generates a new encryption key"
    ],
    correctAnswer: 1,
    explanation: "FHE.fromExternal() converts the external encrypted input (from the user) into an internal euint8 that the contract can use for homomorphic operations.",
    category: 'operations'
  },
  {
    id: 4,
    question: "In the FHECounter contract, why do we use FHE.select() instead of if/else statements?",
    options: [
      "It's more readable",
      "It's faster",
      "It avoids branching on encrypted data, which could leak information",
      "It uses less gas"
    ],
    correctAnswer: 2,
    explanation: "Using FHE.select() instead of if/else avoids branching on encrypted data, which could leak information about the encrypted values through side channels. All operations must be homomorphic.",
    category: 'contract_structure'
  },
  {
    id: 5,
    question: "What is the purpose of FHE.allow() in the contract?",
    options: [
      "To encrypt a value",
      "To grant the caller permission to decrypt the encrypted value later",
      "To validate input proofs",
      "To store encrypted data"
    ],
    correctAnswer: 1,
    explanation: "FHE.allow() grants the caller (msg.sender) permission to decrypt the encrypted value later. This is part of the access control system for encrypted data in FHEVM.",
    category: 'permissions'
  }
];

const categoryColors = {
  contract_structure: 'bg-blue-100 text-blue-800',
  fhe_types: 'bg-green-100 text-green-800',
  operations: 'bg-purple-100 text-purple-800',
  permissions: 'bg-red-100 text-red-800',
};

const categoryIcons = {
  contract_structure: Code,
  fhe_types: Brain,
  operations: CheckCircle,
  permissions: CheckCircle,
};

export const WriteContractQuiz: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const question = quizQuestions[currentQuestion];
  const isCorrect = selectedAnswer === question.correctAnswer;
  const CategoryIcon = categoryIcons[question.category];

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
            Test Your IQ - Write Contract
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
              "You've mastered contract writing concepts!" :
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
            <Code className="h-4 w-4" />
            Question {currentQuestion + 1} of {quizQuestions.length}
          </CardTitle>
          <Badge className={`${categoryColors[question.category]} text-xs px-2.5 py-1`}>
            {question.category.toUpperCase()}
          </Badge>
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
