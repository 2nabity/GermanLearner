import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const wordPairs = pgTable("word_pairs", {
  id: serial("id").primaryKey(),
  germanWord: text("german_word").notNull(),
  englishTranslation: text("english_translation").notNull(),
  category: text("category"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const testResults = pgTable("test_results", {
  id: serial("id").primaryKey(),
  correctAnswers: integer("correct_answers").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  duration: integer("duration").notNull(), // in seconds
  passed: integer("passed").notNull(), // 1 for passed, 0 for failed (needs retake)
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertWordPairSchema = createInsertSchema(wordPairs).omit({
  id: true,
  createdAt: true,
});

export const insertTestResultSchema = createInsertSchema(testResults).omit({
  id: true,
  createdAt: true,
});

export type InsertWordPair = z.infer<typeof insertWordPairSchema>;
export type WordPair = typeof wordPairs.$inferSelect;
export type InsertTestResult = z.infer<typeof insertTestResultSchema>;
export type TestResult = typeof testResults.$inferSelect;

// Additional types for test management
export type TestQuestion = {
  id: number;
  germanWord: string;
  correctAnswer: string;
};

export type TestAnswer = {
  questionId: number;
  userAnswer: string;
  isCorrect: boolean;
  correctAnswer: string;
};
