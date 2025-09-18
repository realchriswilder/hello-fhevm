import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, RotateCcw, Trophy, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: 'basics' | 'implementation' | 'security' | 'advanced';
}

const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "What is the primary advantage of using FHEVM over traditional smart contracts?",
    options: [
      "Faster transaction processing",
      "Lower gas costs",
      "Computation on encrypted data without decryption",
      "Better user interface design"
    ],
    correctAnswer: 2,
    explanation: "FHEVM enables computation on encrypted data without ever decrypting it, maintaining privacy throughout the entire process. This is the core value proposition - you can perform calculations on sensitive data while keeping it confidential.",
    category: 'basics'
  },
  {
    id: 2,
    question: "In our SimpleVoting contract, why do we use euint8 instead of euint64 for vote counts?",
    options: [
      "euint8 is faster to process",
      "euint8 uses less gas",
      "We only need to count 0s and 1s, so 8 bits is sufficient",
      "euint8 is more secure"
    ],
    correctAnswer: 2,
    explanation: "Since we're only counting YES (1) and NO (0) votes, we don't need the full range of a 64-bit integer. Using euint8 is more gas-efficient and sufficient for our voting use case where we're just incrementing counters.",
    category: 'implementation'
  },
  {
    id: 3,
    question: "What happens when you call FHE.allowThis() on an encrypted value?",
    options: [
      "It immediately decrypts the value",
      "It grants permission for the contract to request decryption later",
      "It makes the value publicly readable",
      "It encrypts the value with a new key"
    ],
    correctAnswer: 1,
    explanation: "FHE.allowThis() signals that the contract has permission to request decryption of this encrypted value later. It doesn't decrypt immediately - it just marks the value as 'decryptable' when the contract calls requestDecryption().",
    category: 'security'
  },
  {
    id: 4,
    question: "In the voting flow, when does the actual decryption happen?",
    options: [
      "When the vote is cast",
      "When requestTallyReveal() is called",
      "When resolveTallyCallback() is executed by the oracle",
      "When getSession() is called"
    ],
    correctAnswer: 2,
    explanation: "The actual decryption happens in resolveTallyCallback(), which is called by the Zama oracle network after they process the decryption request. The contract only requests decryption, but the oracle performs the actual cryptographic decryption.",
    category: 'implementation'
  },
  {
    id: 5,
    question: "Which sequence best describes the relayer/oracle flow for revealing tallies?",
    options: [
      "requestTallyReveal → contract decrypts → callback",
      "requestTallyReveal → oracle decrypts + checks signatures → resolveTallyCallback",
      "getSession → oracle decrypts → requestTallyReveal",
      "vote → callback → requestTallyReveal"
    ],
    correctAnswer: 1,
    explanation: "The contract calls requestTallyReveal, the oracle network decrypts and verifies signatures, then invokes resolveTallyCallback with cleartexts.",
    category: 'implementation'
  },
  {
    id: 6,
    question: "Why does vote() accept externalEuint8 and a proof?",
    options: [
      "To reduce calldata size only",
      "To let the contract reconstruct the encrypted value via FHE.fromExternal with validity proof",
      "Because Solidity cannot take bytes",
      "So the oracle can decrypt immediately"
    ],
    correctAnswer: 1,
    explanation: "externalEuint8 carries a ciphertext handle and the proof proves the input's validity. The contract rebuilds an euint8 with FHE.fromExternal(encrypted, proof).",
    category: 'implementation'
  },
  {
    id: 7,
    question: "When is requestTallyReveal() allowed to be called?",
    options: [
      "Anytime by anyone",
      "Only before voting ends",
      "Only by the session creator and only after endTime, if not resolved",
      "Only by the oracle"
    ],
    correctAnswer: 2,
    explanation: "The contract requires block.timestamp >= endTime, !resolved, and msg.sender == creator before requesting decryption.",
    category: 'implementation'
  },
  {
    id: 8,
    question: "What does sessionIdByRequestId map help with?",
    options: [
      "Gas refunds",
      "Mapping an oracle request back to the session during the callback",
      "Preventing re-entrancy",
      "Counting votes"
    ],
    correctAnswer: 1,
    explanation: "It links the off-chain decryption requestId to the on-chain session so resolveTallyCallback can update the correct session.",
    category: 'implementation'
  },
  {
    id: 9,
    question: "What does getSession(sessionId) return before the session is resolved?",
    options: [
      "Actual yes/no tallies",
      "Encrypted tallies",
      "Zeros for yes/no and metadata (creator, endTime, resolved)",
      "Only the creator"
    ],
    correctAnswer: 2,
    explanation: "Until resolved, the function returns 0 for yes/no tallies. After resolution it returns the revealed uint8 values.",
    category: 'basics'
  },
  {
    id: 10,
    question: "In the frontend SDK, which method should you use to encrypt a 0/1 vote for euint8?",
    options: [
      "add64",
      "add8",
      "add256",
      "asEuint8"
    ],
    correctAnswer: 1,
    explanation: "For euint8 votes, createEncryptedInput(...).add8(0 or 1) is the appropriate method before encrypt().",
    category: 'implementation'
  }
];

const categoryColors = {
  basics: 'bg-blue-100 text-blue-800',
  implementation: 'bg-green-100 text-green-800',
  security: 'bg-red-100 text-red-800',
  advanced: 'bg-purple-100 text-purple-800'
};

const categoryIcons = {
  basics: Brain,
  implementation: CheckCircle,
  security: XCircle,
  advanced: Trophy
};

export const FhevmQuiz: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [completedQuestions, setCompletedQuestions] = useState<Set<number>>(new Set());
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
    setCompletedQuestions(prev => new Set([...prev, currentQuestion]));
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
    setCompletedQuestions(new Set());
    setQuizCompleted(false);
  };

  if (quizCompleted) {
    const percentage = Math.round((score / quizQuestions.length) * 100);
    const isExcellent = percentage >= 80;
    const isGood = percentage >= 60;

    return (
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Quiz Complete!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <div className="text-4xl font-bold text-primary">
            {score}/{quizQuestions.length}
          </div>
          <div className="text-2xl font-semibold">
            {percentage}%
          </div>
          <div className={`text-lg font-medium ${
            isExcellent ? 'text-green-600' : 
            isGood ? 'text-yellow-600' : 
            'text-red-600'
          }`}>
            {isExcellent ? 'Excellent! 🎉' : 
             isGood ? 'Good job! 👍' : 
             'Keep studying! 📚'}
          </div>
          <p className="text-muted-foreground">
            {isExcellent ? 
              "You've mastered FHEVM concepts! Ready to build amazing confidential applications." :
              isGood ? 
              "You understand the basics well. Consider reviewing the explanations to strengthen your knowledge." :
              "Don't worry! FHEVM is complex. Review the tutorial sections and try again."
            }
          </p>
          <Button onClick={handleRestartQuiz} className="w-full">
            <RotateCcw className="h-4 w-4 mr-2" />
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
            <CategoryIcon className="h-4 w-4" />
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
