import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { BookOpen, CheckCircle, Trophy, Flame, Play, Plus, Eye } from "lucide-react";
import type { WordPair, TestResult } from "@shared/schema";

export default function Dashboard() {
  const { data: wordPairs = [], isLoading: wordPairsLoading } = useQuery<WordPair[]>({
    queryKey: ["/api/word-pairs"],
  });

  const { data: testResults = [], isLoading: testResultsLoading } = useQuery<TestResult[]>({
    queryKey: ["/api/test-results"],
    queryFn: () => fetch("/api/test-results?limit=5").then(res => res.json()),
  });

  const totalWords = wordPairs.length;
  const testsCompleted = testResults.length;
  const passedTests = testResults.filter(result => result.passed === 1).length;
  const successRate = testsCompleted > 0 ? Math.round((passedTests / testsCompleted) * 100) : 0;

  if (wordPairsLoading || testResultsLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-8">
          <div className="bg-gray-200 rounded-2xl h-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-xl h-32"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary to-blue-600 rounded-2xl p-8 text-white shadow-lg">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-semibold mb-3">Welcome back to your German studies!</h2>
          <p className="text-blue-100 text-lg mb-6">Ready to expand your vocabulary and test your knowledge?</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/test">
              <Button variant="secondary" size="lg" className="bg-white text-primary hover:bg-blue-50">
                <Play className="mr-2 h-4 w-4" />
                Start New Test
              </Button>
            </Link>
            <Link href="/add-words">
              <Button variant="outline" size="lg" className="bg-blue-700 border-blue-600 text-white hover:bg-blue-800">
                <Plus className="mr-2 h-4 w-4" />
                Add New Words
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Words</p>
                <p className="text-3xl font-bold text-gray-900">{totalWords}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="text-primary h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Tests Taken</p>
                <p className="text-3xl font-bold text-gray-900">{testsCompleted}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-green-600 h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Success Rate</p>
                <p className="text-3xl font-bold text-gray-900">{successRate}%</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Trophy className="text-yellow-600 h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Streak</p>
                <p className="text-3xl font-bold text-gray-900">5 days</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Flame className="text-red-600 h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Tests */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Test Results</CardTitle>
            <p className="text-sm text-gray-500">Your latest performance</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {testResults.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No tests taken yet</p>
            ) : (
              testResults.slice(0, 3).map((result) => (
                <div key={result.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900">
                      {new Date(result.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      {result.totalQuestions} questions • {Math.floor(result.duration / 60)}:{(result.duration % 60).toString().padStart(2, '0')}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <span className={`text-lg font-bold ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
                        {result.correctAnswers}/{result.totalQuestions}
                      </span>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        result.passed ? 'bg-green-600' : 'bg-yellow-600'
                      }`}>
                        {result.passed ? (
                          <CheckCircle className="text-white h-3 w-3" />
                        ) : (
                          <div className="text-white text-xs">↻</div>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-400">
                      {result.passed ? `${Math.round((result.correctAnswers / result.totalQuestions) * 100)}% accuracy` : 'Retake required'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <p className="text-sm text-gray-500">Common study tasks</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/test">
              <Button variant="outline" className="w-full h-auto p-4 bg-blue-50 hover:bg-blue-100 border-blue-200">
                <div className="flex items-center text-left w-full">
                  <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mr-4">
                    <Play className="text-white h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Start 20-Word Test</p>
                    <p className="text-sm text-gray-500">Random selection from your vocabulary</p>
                  </div>
                </div>
              </Button>
            </Link>

            <Link href="/add-words">
              <Button variant="outline" className="w-full h-auto p-4 bg-green-50 hover:bg-green-100 border-green-200">
                <div className="flex items-center text-left w-full">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mr-4">
                    <Plus className="text-white h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Add New Words</p>
                    <p className="text-sm text-gray-500">Expand your German vocabulary</p>
                  </div>
                </div>
              </Button>
            </Link>

            <Link href="/manage">
              <Button variant="outline" className="w-full h-auto p-4 bg-yellow-50 hover:bg-yellow-100 border-yellow-200">
                <div className="flex items-center text-left w-full">
                  <div className="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center mr-4">
                    <Eye className="text-white h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Manage Words</p>
                    <p className="text-sm text-gray-500">Edit and organize your vocabulary</p>
                  </div>
                </div>
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
