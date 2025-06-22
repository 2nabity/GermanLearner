import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import type { TestQuestion, TestAnswer, InsertTestResult } from "@shared/schema";
import { Trophy, RotateCcw, Home, Eye, CheckCircle, XCircle } from "lucide-react";

interface TestResultsState {
  testResult: InsertTestResult & { answers: TestAnswer[] };
  questions: TestQuestion[];
}

export default function TestResults() {
  const [, setLocation] = useLocation();
  const [testData, setTestData] = useState<TestResultsState | null>(null);

  useEffect(() => {
    // In a real app, you might get this from route state or query params
    // For now, we'll check if data was passed via navigation state
    const state = history.state?.state as TestResultsState;
    if (state) {
      setTestData(state);
    } else {
      // If no test data, redirect to dashboard
      setLocation("/");
    }
  }, [setLocation]);

  if (!testData) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">No test results found</p>
            <Button onClick={() => setLocation("/")} className="mt-4">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { testResult, questions } = testData;
  const accuracyPercentage = Math.round((testResult.correctAnswers / testResult.totalQuestions) * 100);
  const durationMinutes = Math.floor(testResult.duration / 60);
  const durationSeconds = testResult.duration % 60;
  const needsRetake = !testResult.passed;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-semibold text-gray-900 mb-2">Test Complete!</h2>
        <p className="text-gray-500">Here's how you performed</p>
      </div>

      {/* Results Summary */}
      <Card className="shadow-lg">
        <CardContent className="p-8 text-center">
          {/* Success/Retake Icon and Message */}
          <div className="mb-6">
            {testResult.passed ? (
              <>
                <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trophy className="text-white text-2xl h-8 w-8" />
                </div>
                <h3 className="text-2xl font-semibold text-green-600 mb-2">Excellent Work!</h3>
                <p className="text-gray-600 mb-8">You passed the test with flying colors</p>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <RotateCcw className="text-white text-2xl h-8 w-8" />
                </div>
                <h3 className="text-2xl font-semibold text-yellow-600 mb-2">Practice Makes Perfect</h3>
                <p className="text-gray-600 mb-8">You need to retake this test (more than 3 incorrect answers)</p>
              </>
            )}
          </div>

          {/* Score Display */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">
                {testResult.correctAnswers}/{testResult.totalQuestions}
              </p>
              <p className="text-sm text-gray-500">Correct Answers</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{accuracyPercentage}%</p>
              <p className="text-sm text-gray-500">Accuracy</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-700">
                {durationMinutes}:{durationSeconds.toString().padStart(2, '0')}
              </p>
              <p className="text-sm text-gray-500">Duration</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Button onClick={() => setLocation("/")} className="bg-primary hover:bg-blue-700">
              <Home className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            {needsRetake && (
              <Button onClick={() => setLocation("/test")} className="bg-yellow-600 hover:bg-yellow-700">
                <RotateCcw className="mr-2 h-4 w-4" />
                Retake Test
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Results */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Results</CardTitle>
          <p className="text-sm text-gray-500">Review your answers</p>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-gray-100">
            {testResult.answers.map((answer, index) => {
              const question = questions.find(q => q.id === answer.questionId);
              if (!question) return null;

              return (
                <div key={answer.questionId} className="py-6 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      answer.isCorrect ? 'bg-green-600' : 'bg-red-600'
                    }`}>
                      {answer.isCorrect ? (
                        <CheckCircle className="text-white h-4 w-4" />
                      ) : (
                        <XCircle className="text-white h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-serif font-medium text-gray-900">{question.germanWord}</p>
                      <p className="text-sm text-gray-500">German word</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      Your answer: {" "}
                      <span className={answer.isCorrect ? 'text-green-600' : 'text-red-600'}>
                        {answer.userAnswer || "(skipped)"}
                      </span>
                    </p>
                    <p className="text-sm text-gray-500">
                      Correct answer: {answer.correctAnswer}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
