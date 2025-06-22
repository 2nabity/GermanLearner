import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { WordPair } from "@shared/schema";
import { ArrowLeft, Search, Edit, Trash2, Grid3X3, List } from "lucide-react";
import { Link } from "wouter";

export default function ManageWords() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const { data: wordPairs = [], isLoading } = useQuery<WordPair[]>({
    queryKey: ["/api/word-pairs"],
  });

  const deleteWordPairMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/word-pairs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/word-pairs"] });
      toast({
        title: "Success",
        description: "Word pair deleted successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete word pair",
        variant: "destructive",
      });
    },
  });

  const filteredWords = wordPairs.filter(word => {
    const matchesSearch = !searchQuery || 
      word.germanWord.toLowerCase().includes(searchQuery.toLowerCase()) ||
      word.englishTranslation.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !selectedCategory || word.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(wordPairs.map(word => word.category).filter(Boolean))];

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-8">
          <div className="bg-gray-200 rounded-xl h-32"></div>
          <div className="bg-gray-200 rounded-xl h-64"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Manage Words</h2>
          <p className="text-gray-500 mt-1">Edit, delete, or organize your vocabulary</p>
        </div>
        <Link href="/">
          <Button variant="ghost" className="text-gray-600 hover:text-primary">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search words..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button className="w-full md:w-auto">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Words List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your Vocabulary ({filteredWords.length} words)</CardTitle>
            </div>
            <div className="flex space-x-2">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredWords.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {searchQuery || selectedCategory ? "No words match your search criteria" : "No words added yet"}
              </p>
              {(!searchQuery && !selectedCategory) && (
                <Link href="/add-words">
                  <Button className="mt-4">Add Your First Word</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
              {filteredWords.map((word) => (
                <div key={word.id} className="py-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <p className="text-xl font-serif font-medium text-gray-900">
                          {word.germanWord}
                        </p>
                        {word.category && (
                          <Badge variant="secondary" className="text-xs">
                            {word.category}
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-600">{word.englishTranslation}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Added {new Date(word.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-primary hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete "${word.germanWord}"?`)) {
                            deleteWordPairMutation.mutate(word.id);
                          }
                        }}
                        disabled={deleteWordPairMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
