import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import type { WordPair, TestQuestion, TestAnswer, InsertTestResult } from "@shared/schema";
import { X, ArrowRight, CheckCircle, XCircle } from "lucide-react";

export default function Test() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [testQuestions, setTestQuestions] = useState<TestQuestion[]>([]);
  const [testAnswers, setTestAnswers] = useState<TestAnswer[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<{ isCorrect: boolean; correctAnswer: string } | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);

  const { data: wordPairs = [], isLoading } = useQuery<WordPair[]>({
    queryKey: ["/api/word-pairs/random/20"],
  });

  const saveTestResultMutation = useMutation({
    mutationFn: async (data: InsertTestResult) => {
      const response = await apiRequest("POST", "/api/test-results", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/test-results"] });
    },
  });

  useEffect(() => {
    if (wordPairs.length > 0) {
      const questions: TestQuestion[] = wordPairs.map(word => ({
        id: word.id,
        germanWord: word.germanWord,
        correctAnswer: word.englishTranslation,
      }));
      setTestQuestions(questions);
      setStartTime(new Date());
    }
  }, [wordPairs]);

  const submitAnswer = () => {
    if (!userAnswer.trim()) {
      toast({
        title: "Please enter an answer",
        variant: "destructive",
      });
      return;
    }

    const currentQuestion = testQuestions[currentQuestionIndex];
    const isCorrect = userAnswer.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim();
    
    const answer: TestAnswer = {
      questionId: currentQuestion.id,
      userAnswer: userAnswer.trim(),
      isCorrect,
      correctAnswer: currentQuestion.correctAnswer,
    };

    setTestAnswers(prev => [...prev, answer]);
    setCurrentFeedback({ isCorrect, correctAnswer: currentQuestion.correctAnswer });
    setShowFeedback(true);

    // Auto-advance after showing feedback
    setTimeout(() => {
      nextQuestion();
    }, 2000);
  };

  const nextQuestion = () => {
    setShowFeedback(false);
    setCurrentFeedback(null);
    setUserAnswer("");

    if (currentQuestionIndex + 1 >= testQuestions.length) {
      finishTest();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const skipQuestion = () => {
    const currentQuestion = testQuestions[currentQuestionIndex];
    const answer: TestAnswer = {
      questionId: currentQuestion.id,
      userAnswer: "",
      isCorrect: false,
      correctAnswer: currentQuestion.correctAnswer,
    };

    setTestAnswers(prev => [...prev, answer]);
    nextQuestion();
  };

  const finishTest = () => {
    if (!startTime) return;

    const correctAnswers = testAnswers.filter(answer => answer.isCorrect).length;
    const totalQuestions = testAnswers.length;
    const duration = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
    const passed = (totalQuestions - correctAnswers) <= 3 ? 1 : 0; // Pass if 3 or fewer wrong answers

    const testResult: InsertTestResult = {
      correctAnswers,
      totalQuestions,
      duration,
      passed,
    };

    saveTestResultMutation.mutate(testResult);
    
    // Navigate to results page with test data
    setLocation("/test-results", { 
      state: { 
        testResult: { ...testResult, answers: testAnswers },
        questions: testQuestions 
      }
    });
  };

  const exitTest = () => {
    if (confirm("Are you sure you want to exit the test? Your progress will be lost.")) {
      setLocation("/");
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-8">
          <div className="bg-gray-200 rounded-xl h-32"></div>
          <div className="bg-gray-200 rounded-xl h-64"></div>
        </div>
      </div>
    );
  }

  if (wordPairs.length < 20) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Not Enough Words</h2>
            <p className="text-gray-600 mb-6">
              You need at least 20 words in your vocabulary to take a test. 
              Currently you have {wordPairs.length} word{wordPairs.length !== 1 ? 's' : ''}.
            </p>
            <Button onClick={() => setLocation("/add-words")}>
              Add More Words
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (testQuestions.length === 0) {
    return <div>Loading test...</div>;
  }

  const currentQuestion = testQuestions[currentQuestionIndex];
  const correctAnswers = testAnswers.filter(answer => answer.isCorrect).length;
  const incorrectAnswers = testAnswers.filter(answer => !answer.isCorrect).length;
  const progress = ((currentQuestionIndex + 1) / testQuestions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Test Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">German Vocabulary Test</h2>
          <p className="text-gray-500 mt-1">Translate the German word to English</p>
        </div>
        <Button variant="ghost" onClick={exitTest} className="text-gray-600 hover:text-primary">
          <X className="mr-2 h-4 w-4" />
          Exit Test
        </Button>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-900">
              Question {currentQuestionIndex + 1} of {testQuestions.length}
            </span>
            <span className="text-sm text-gray-500">
              Correct: <span className="text-green-600 font-semibold">{correctAnswers}</span> | 
              Incorrect: <span className="text-red-600 font-semibold">{incorrectAnswers}</span>
            </span>
          </div>
          <Progress value={progress} className="h-3" />
        </CardContent>
      </Card>

      {/* Question Card */}
      <Card className="shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="mb-8">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
              Translate to English
            </p>
            <h3 className="text-4xl font-serif font-semibold text-gray-900 mb-2">
              {currentQuestion.germanWord}
            </h3>
            <p className="text-gray-400">German</p>
          </div>

          <div className="max-w-md mx-auto space-y-6">
            <div>
              <Input
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                className="text-xl text-center font-serif"
                placeholder="Enter English translation"
                autoComplete="off"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !showFeedback) {
                    submitAnswer();
                  }
                }}
                disabled={showFeedback}
                autoFocus
              />
            </div>

            <div className="flex space-x-4">
              <Button 
                onClick={submitAnswer}
                className="flex-1"
                disabled={showFeedback || !userAnswer.trim()}
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                Submit Answer
              </Button>
              <Button 
                variant="outline"
                onClick={skipQuestion}
                disabled={showFeedback}
              >
                Skip
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Answer Feedback */}
      {showFeedback && currentFeedback && (
        <Card>
          <CardContent className={`p-6 ${currentFeedback.isCorrect ? 'bg-green-50 border-l-4 border-green-500' : 'bg-red-50 border-l-4 border-red-500'}`}>
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${
                currentFeedback.isCorrect ? 'bg-green-500' : 'bg-red-500'
              }`}>
                {currentFeedback.isCorrect ? (
                  <CheckCircle className="text-white h-5 w-5" />
                ) : (
                  <XCircle className="text-white h-5 w-5" />
                )}
              </div>
              <div>
                <h4 className={`text-lg font-semibold ${currentFeedback.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                  {currentFeedback.isCorrect ? "Correct!" : "Incorrect"}
                </h4>
                <p className="text-gray-600">
                  {currentFeedback.isCorrect ? (
                    `Great job! "${currentFeedback.correctAnswer}" is the right translation.`
                  ) : (
                    `The correct answer is "${currentFeedback.correctAnswer}". You answered "${userAnswer}".`
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
