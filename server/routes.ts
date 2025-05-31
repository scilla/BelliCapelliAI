import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

export async function registerRoutes(app: Express): Promise<Server> {
  // Enable CORS for API routes
  app.use(cors());

  // ElevenLabs API route to get signed URL for conversation
  app.get("/api/signed-url", async (req, res) => {
    try {
      const agentId = process.env.ELEVENLABS_AGENT_ID;
      const apiKey = process.env.ELEVENLABS_API_KEY;

      if (!agentId || !apiKey) {
        return res.status(500).json({ 
          error: "Missing ElevenLabs configuration. Please set ELEVENLABS_AGENT_ID and ELEVENLABS_API_KEY environment variables." 
        });
      }

      const response = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`,
        {
          method: "GET",
          headers: {
            "xi-api-key": apiKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      res.json({ signedUrl: data.signed_url });
    } catch (error) {
      console.error("Error getting signed URL:", error);
      res.status(500).json({ error: "Failed to get signed URL" });
    }
  });

  // API route for getting Agent ID (for public agents)
  app.get("/api/getAgentId", (req, res) => {
    const agentId = process.env.ELEVENLABS_AGENT_ID;
    
    if (!agentId) {
      return res.status(500).json({ 
        error: "Agent ID not configured" 
      });
    }
    
    res.json({ agentId });
  });

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  const httpServer = createServer(app);

  return httpServer;
}
