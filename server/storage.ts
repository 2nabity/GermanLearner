import { wordPairs, testResults, type WordPair, type InsertWordPair, type TestResult, type InsertTestResult } from "@shared/schema";

export interface IStorage {
  // Word pair operations
  createWordPair(wordPair: InsertWordPair): Promise<WordPair>;
  getAllWordPairs(): Promise<WordPair[]>;
  getWordPairById(id: number): Promise<WordPair | undefined>;
  updateWordPair(id: number, wordPair: Partial<InsertWordPair>): Promise<WordPair | undefined>;
  deleteWordPair(id: number): Promise<boolean>;
  searchWordPairs(query: string, category?: string): Promise<WordPair[]>;
  getRandomWordPairs(count: number): Promise<WordPair[]>;
  
  // Test result operations
  createTestResult(testResult: InsertTestResult): Promise<TestResult>;
  getAllTestResults(): Promise<TestResult[]>;
  getRecentTestResults(limit: number): Promise<TestResult[]>;
}

export class MemStorage implements IStorage {
  private wordPairs: Map<number, WordPair>;
  private testResults: Map<number, TestResult>;
  private currentWordPairId: number;
  private currentTestResultId: number;

  constructor() {
    this.wordPairs = new Map();
    this.testResults = new Map();
    this.currentWordPairId = 1;
    this.currentTestResultId = 1;
  }

  async createWordPair(insertWordPair: InsertWordPair): Promise<WordPair> {
    const id = this.currentWordPairId++;
    const wordPair: WordPair = { 
      ...insertWordPair, 
      id, 
      createdAt: new Date()
    };
    this.wordPairs.set(id, wordPair);
    return wordPair;
  }

  async getAllWordPairs(): Promise<WordPair[]> {
    return Array.from(this.wordPairs.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getWordPairById(id: number): Promise<WordPair | undefined> {
    return this.wordPairs.get(id);
  }

  async updateWordPair(id: number, updates: Partial<InsertWordPair>): Promise<WordPair | undefined> {
    const existing = this.wordPairs.get(id);
    if (!existing) return undefined;
    
    const updated: WordPair = { ...existing, ...updates };
    this.wordPairs.set(id, updated);
    return updated;
  }

  async deleteWordPair(id: number): Promise<boolean> {
    return this.wordPairs.delete(id);
  }

  async searchWordPairs(query: string, category?: string): Promise<WordPair[]> {
    const allPairs = await this.getAllWordPairs();
    const lowerQuery = query.toLowerCase();
    
    return allPairs.filter(pair => {
      const matchesQuery = pair.germanWord.toLowerCase().includes(lowerQuery) ||
                          pair.englishTranslation.toLowerCase().includes(lowerQuery);
      const matchesCategory = !category || pair.category === category;
      return matchesQuery && matchesCategory;
    });
  }

  async getRandomWordPairs(count: number): Promise<WordPair[]> {
    const allPairs = await this.getAllWordPairs();
    if (allPairs.length <= count) return allPairs;
    
    const shuffled = [...allPairs].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  async createTestResult(insertTestResult: InsertTestResult): Promise<TestResult> {
    const id = this.currentTestResultId++;
    const testResult: TestResult = {
      ...insertTestResult,
      id,
      createdAt: new Date()
    };
    this.testResults.set(id, testResult);
    return testResult;
  }

  async getAllTestResults(): Promise<TestResult[]> {
    return Array.from(this.testResults.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getRecentTestResults(limit: number): Promise<TestResult[]> {
    const allResults = await this.getAllTestResults();
    return allResults.slice(0, limit);
  }
}

export const storage = new MemStorage();
