import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBreedSchema, updateBreedSchema, insertSubBreedSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all breeds with optional search and pagination
  app.get("/api/breeds", async (req, res) => {
    try {
      const search = req.query.search as string;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      const result = await storage.getBreeds(search, limit, offset);
      res.json(result);
    } catch (error) {
      console.error("Error fetching breeds:", error);
      res.status(500).json({ message: "Failed to fetch breeds" });
    }
  });

  // Get breed by ID
  app.get("/api/breeds/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const breed = await storage.getBreedById(id);
      
      if (!breed) {
        return res.status(404).json({ message: "Breed not found" });
      }
      
      res.json(breed);
    } catch (error) {
      console.error("Error fetching breed:", error);
      res.status(500).json({ message: "Failed to fetch breed" });
    }
  });

  // Create new breed
  app.post("/api/breeds", async (req, res) => {
    try {
      const validatedData = insertBreedSchema.parse(req.body);
      
      // Check if breed already exists
      const existingBreed = await storage.getBreedByName(validatedData.name);
      if (existingBreed) {
        return res.status(400).json({ message: "A breed with this name already exists" });
      }

      const breed = await storage.createBreed(validatedData);
      res.status(201).json(breed);
    } catch (error) {
      console.error("Error creating breed:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid input data",
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create breed" });
    }
  });

  // Update breed
  app.put("/api/breeds/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = updateBreedSchema.parse({ ...req.body, id });
      
      // Check if another breed with this name already exists
      if (validatedData.name) {
        const existingBreed = await storage.getBreedByName(validatedData.name);
        if (existingBreed && existingBreed.id !== id) {
          return res.status(400).json({ message: "A breed with this name already exists" });
        }
      }

      const breed = await storage.updateBreed(validatedData);
      
      if (!breed) {
        return res.status(404).json({ message: "Breed not found" });
      }
      
      res.json(breed);
    } catch (error) {
      console.error("Error updating breed:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid input data",
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to update breed" });
    }
  });

  // Delete breed
  app.delete("/api/breeds/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteBreed(id);
      
      if (!success) {
        return res.status(404).json({ message: "Breed not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting breed:", error);
      res.status(500).json({ message: "Failed to delete breed" });
    }
  });

  // Add sub-breed to existing breed
  app.post("/api/breeds/:breedId/sub-breeds", async (req, res) => {
    try {
      const { breedId } = req.params;
      const validatedData = insertSubBreedSchema.parse({
        ...req.body,
        breedId,
      });

      // Verify breed exists
      const breed = await storage.getBreedById(breedId);
      if (!breed) {
        return res.status(404).json({ message: "Breed not found" });
      }

      const subBreed = await storage.createSubBreed(validatedData);
      res.status(201).json(subBreed);
    } catch (error) {
      console.error("Error creating sub-breed:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid input data",
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create sub-breed" });
    }
  });

  // Delete sub-breed
  app.delete("/api/sub-breeds/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteSubBreed(id);
      
      if (!success) {
        return res.status(404).json({ message: "Sub-breed not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting sub-breed:", error);
      res.status(500).json({ message: "Failed to delete sub-breed" });
    }
  });

  // Get stats
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
