import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertWordPairSchema, insertTestResultSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Word pair routes
  app.get("/api/word-pairs", async (req, res) => {
    try {
      const wordPairs = await storage.getAllWordPairs();
      res.json(wordPairs);
    } catch (error) {
      console.error("Error fetching word pairs:", error);
      res.status(500).json({ message: "Failed to fetch word pairs" });
    }
  });

  app.post("/api/word-pairs", async (req, res) => {
    try {
      const validatedData = insertWordPairSchema.parse(req.body);
      const wordPair = await storage.createWordPair(validatedData);
      res.status(201).json(wordPair);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        console.error("Error creating word pair:", error);
        res.status(500).json({ message: "Failed to create word pair" });
      }
    }
  });

  app.put("/api/word-pairs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertWordPairSchema.partial().parse(req.body);
      const wordPair = await storage.updateWordPair(id, validatedData);
      
      if (!wordPair) {
        return res.status(404).json({ message: "Word pair not found" });
      }
      
      res.json(wordPair);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        console.error("Error updating word pair:", error);
        res.status(500).json({ message: "Failed to update word pair" });
      }
    }
  });

  app.delete("/api/word-pairs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteWordPair(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Word pair not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting word pair:", error);
      res.status(500).json({ message: "Failed to delete word pair" });
    }
  });

  app.get("/api/word-pairs/search", async (req, res) => {
    try {
      const query = req.query.q as string || "";
      const category = req.query.category as string;
      const wordPairs = await storage.searchWordPairs(query, category);
      res.json(wordPairs);
    } catch (error) {
      console.error("Error searching word pairs:", error);
      res.status(500).json({ message: "Failed to search word pairs" });
    }
  });

  app.get("/api/word-pairs/random/:count", async (req, res) => {
    try {
      const count = parseInt(req.params.count);
      if (isNaN(count) || count <= 0) {
        return res.status(400).json({ message: "Invalid count parameter" });
      }
      
      const wordPairs = await storage.getRandomWordPairs(count);
      res.json(wordPairs);
    } catch (error) {
      console.error("Error fetching random word pairs:", error);
      res.status(500).json({ message: "Failed to fetch random word pairs" });
    }
  });

  // Test result routes
  app.post("/api/test-results", async (req, res) => {
    try {
      const validatedData = insertTestResultSchema.parse(req.body);
      const testResult = await storage.createTestResult(validatedData);
      res.status(201).json(testResult);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        console.error("Error creating test result:", error);
        res.status(500).json({ message: "Failed to create test result" });
      }
    }
  });

  app.get("/api/test-results", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const testResults = limit 
        ? await storage.getRecentTestResults(limit)
        : await storage.getAllTestResults();
      res.json(testResults);
    } catch (error) {
      console.error("Error fetching test results:", error);
      res.status(500).json({ message: "Failed to fetch test results" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
