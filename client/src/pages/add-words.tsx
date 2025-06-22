import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertWordPairSchema, type WordPair, type InsertWordPair } from "@shared/schema";
import { ArrowLeft, Plus, Edit, Trash2 } from "lucide-react";
import { Link } from "wouter";

export default function AddWords() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertWordPair>({
    resolver: zodResolver(insertWordPairSchema),
    defaultValues: {
      germanWord: "",
      englishTranslation: "",
      category: "",
    },
  });

  const { data: wordPairs = [], isLoading } = useQuery<WordPair[]>({
    queryKey: ["/api/word-pairs"],
  });

  const createWordPairMutation = useMutation({
    mutationFn: async (data: InsertWordPair) => {
      const response = await apiRequest("POST", "/api/word-pairs", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/word-pairs"] });
      form.reset();
      toast({
        title: "Success",
        description: "Word pair added successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add word pair",
        variant: "destructive",
      });
    },
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

  const onSubmit = (data: InsertWordPair) => {
    createWordPairMutation.mutate(data);
  };

  const recentWords = wordPairs.slice(0, 10);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Add New Words</h2>
          <p className="text-gray-500 mt-1">Expand your German vocabulary database</p>
        </div>
        <Link href="/">
          <Button variant="ghost" className="text-gray-600 hover:text-primary">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Add Words Form */}
        <Card>
          <CardHeader>
            <CardTitle>Add Word Pair</CardTitle>
            <p className="text-sm text-gray-500">Enter German word and English translation</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="germanWord">German Word</Label>
                <Input
                  id="germanWord"
                  {...form.register("germanWord")}
                  className="text-lg font-serif"
                  placeholder="e.g., das Haus"
                />
                {form.formState.errors.germanWord && (
                  <p className="text-sm text-red-600">{form.formState.errors.germanWord.message}</p>
                )}
                <p className="text-xs text-gray-500">Include articles (der, die, das) for nouns</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="englishTranslation">English Translation</Label>
                <Input
                  id="englishTranslation"
                  {...form.register("englishTranslation")}
                  className="text-lg font-serif"
                  placeholder="e.g., the house"
                />
                {form.formState.errors.englishTranslation && (
                  <p className="text-sm text-red-600">{form.formState.errors.englishTranslation.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category (Optional)</Label>
                <Select onValueChange={(value) => form.setValue("category", value || "")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No category</SelectItem>
                    <SelectItem value="nouns">Nouns</SelectItem>
                    <SelectItem value="verbs">Verbs</SelectItem>
                    <SelectItem value="adjectives">Adjectives</SelectItem>
                    <SelectItem value="common">Common Phrases</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex space-x-3">
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={createWordPairMutation.isPending}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {createWordPairMutation.isPending ? "Adding..." : "Add Word"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => form.reset()}
                >
                  Clear
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Recently Added Words */}
        <Card>
          <CardHeader>
            <CardTitle>Recently Added</CardTitle>
            <p className="text-sm text-gray-500">Your latest vocabulary additions</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse bg-gray-100 rounded-lg h-16"></div>
                  ))}
                </div>
              ) : recentWords.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No words added yet</p>
              ) : (
                recentWords.map((word) => (
                  <div key={word.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-serif font-medium text-gray-900">{word.germanWord}</p>
                      <p className="text-sm text-gray-600">{word.englishTranslation}</p>
                      {word.category && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          {word.category}
                        </Badge>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-primary"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-red-600"
                        onClick={() => deleteWordPairMutation.mutate(word.id)}
                        disabled={deleteWordPairMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
