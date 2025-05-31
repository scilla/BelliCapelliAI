import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import cors from "cors";
import dotenv from "dotenv";
import { google } from "googleapis";
import { parseISO } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

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

      console.log(`Requesting signed URL with agent ID: ${agentId}`);

      if (!agentId || !apiKey) {
        return res.status(500).json({ 
          error: "Missing ElevenLabs configuration. Please set ELEVENLABS_AGENT_ID and ELEVENLABS_API_KEY environment variables." 
        });
      }

      const url = `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`;
      console.log(`Making request to: ${url}`);
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "xi-api-key": apiKey,
        },
      });

      console.log(`ElevenLabs API response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`ElevenLabs API error response: ${errorText}`);
        throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`Received signed URL successfully`);
      res.json({ signedUrl: data.signed_url });
    } catch (error: any) {
      console.error("Error getting signed URL:", error);
      res.status(500).json({ error: "Failed to get signed URL", details: error?.message || 'Unknown error' });
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

  // Google Calendar API route to get events for a specific day
  app.get("/api/calendar/events", async (req, res) => {
    try {
      console.log("Received request for calendar events");
      const day = req.query.day as string;
      console.log(`Requested day: ${day}`);
      
      if (!day) {
        console.log("Missing day parameter");
        return res.status(400).json({ error: "Day parameter is required in format YYYY-MM-DD" });
      }

      // Check if the date format is valid
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(day)) {
        console.log("Invalid date format");
        return res.status(400).json({ error: "Invalid date format. Please use YYYY-MM-DD" });
      }

      // Configure Google Calendar API
      const calendarId = process.env.GOOGLE_CALENDAR_ID;
      const credentials = {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      };
      
      console.log(`Calendar ID: ${calendarId}`);
      console.log(`Client Email: ${credentials.client_email}`);
      console.log(`Private Key available: ${!!credentials.private_key}`);

      if (!calendarId || !credentials.client_email || !credentials.private_key) {
        console.log("Missing Google Calendar configuration");
        return res.status(500).json({ 
          error: "Missing Google Calendar configuration. Please set GOOGLE_CALENDAR_ID, GOOGLE_CLIENT_EMAIL, and GOOGLE_PRIVATE_KEY environment variables." 
        });
      }

      console.log("Setting up auth with JWT");
      // Set up auth
      const auth = new google.auth.JWT({
        email: credentials.client_email,
        key: credentials.private_key,
        scopes: ['https://www.googleapis.com/auth/calendar.readonly']
      });

      // Create Calendar client
      console.log("Creating Calendar client");
      const calendar = google.calendar({ version: 'v3', auth });

      // Calculate time range for the day (midnight to midnight)
      const startDateTime = new Date(`${day}T00:00:00`);
      const endDateTime = new Date(`${day}T23:59:59`);

      // Format dates for Google Calendar API
      const timeMin = startDateTime.toISOString();
      const timeMax = endDateTime.toISOString();
      console.log(`Time range: ${timeMin} to ${timeMax}`);

      // Fetch events
      console.log("Fetching events from Google Calendar API");
      try {
        const response = await calendar.events.list({
          calendarId,
          timeMin,
          timeMax,
          singleEvents: true,
          orderBy: 'startTime'
        });
        console.log(`Found ${response.data.items?.length || 0} events`);
        const events = response.data.items || [];
        
        res.json({ events });
      } catch (apiError: any) {
        console.error("Google Calendar API error:", apiError);
        return res.status(500).json({ error: "Google Calendar API error", details: apiError?.message || 'Unknown error' });
      }
    } catch (error) {
      console.error("Error fetching calendar events:", error);
      res.status(500).json({ error: "Failed to fetch calendar events" });
    }
  });

  // Google Calendar API route to create a new event
  app.post("/api/calendar/events", async (req, res) => {
    try {
      console.log("Received request to create calendar event");
      const { summary, startTime, endTime, attendees } = req.body;
      
      // Validate required fields
      if (!summary || !startTime || !endTime) {
        console.log("Missing required fields");
        return res.status(400).json({ 
          error: "Missing required fields", 
          details: "summary, startTime, and endTime are required" 
        });
      }

      // Parse dates
      let startDate: Date, endDate: Date;
      
      try {
        // Parse ISO strings to Date objects
        startDate = typeof startTime === 'string' ? parseISO(startTime) : new Date(startTime);
        endDate = typeof endTime === 'string' ? parseISO(endTime) : new Date(endTime);
        
        // Validate dates
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          throw new Error("Invalid date format");
        }
      } catch (error) {
        console.log("Invalid date format", error);
        return res.status(400).json({ 
          error: "Invalid date format", 
          details: "startTime and endTime must be valid ISO date strings (e.g. 2025-06-01T10:00:00)" 
        });
      }

      // Configure Google Calendar API
      const calendarId = process.env.GOOGLE_CALENDAR_ID;
      const credentials = {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      };
      
      console.log(`Calendar ID: ${calendarId}`);
      console.log(`Client Email: ${credentials.client_email}`);
      console.log(`Private Key available: ${!!credentials.private_key}`);

      if (!calendarId || !credentials.client_email || !credentials.private_key) {
        console.log("Missing Google Calendar configuration");
        return res.status(500).json({ 
          error: "Missing Google Calendar configuration. Please set GOOGLE_CALENDAR_ID, GOOGLE_CLIENT_EMAIL, and GOOGLE_PRIVATE_KEY environment variables." 
        });
      }

      console.log("Setting up auth with JWT");
      // Set up auth
      const auth = new google.auth.JWT({
        email: credentials.client_email,
        key: credentials.private_key,
        scopes: ['https://www.googleapis.com/auth/calendar']
      });

      // Create Calendar client
      console.log("Creating Calendar client");
      const calendar = google.calendar({ version: 'v3', auth });

      const timezone = 'Europe/Rome';
      
      // Format dates in the correct format for Google Calendar API with timezone awareness
      const formatGoogleCalendarDateTime = (date: Date, tz: string) => {
        return formatInTimeZone(date, tz, "yyyy-MM-dd'T'HH:mm:ss.SSS");
      };
      
      // Create basic event object without attendees
      const event: any = {
        summary,
        start: {
          dateTime: formatGoogleCalendarDateTime(startDate, timezone),
          timeZone: timezone,
        },
        end: {
          dateTime: formatGoogleCalendarDateTime(endDate, timezone),
          timeZone: timezone,
        },
      };
      
      console.log('Event start time:', startDate, '→', event.start.dateTime, '(' + timezone + ')');
      
      // Only add attendees if provided
      if (attendees && Array.isArray(attendees) && attendees.length > 0) {
        console.log("Note: Adding attendees may require Domain-Wide Delegation for service accounts");
        event.attendees = attendees.map(email => ({ email }));
      }

      console.log("Creating event in Google Calendar");
      console.log("Event details:", event);

      try {
        const response = await calendar.events.insert({
          calendarId,
          requestBody: event,
          sendUpdates: 'all', // Send updates to attendees
        });

        console.log(`Event created with ID: ${response.data.id}`);
        res.status(201).json({ 
          message: "Event created successfully", 
          event: response.data 
        });
      } catch (apiError: any) {
        console.error("Google Calendar API error:", apiError);
        return res.status(500).json({ 
          error: "Google Calendar API error", 
          details: apiError?.message || 'Unknown error' 
        });
      }
    } catch (error) {
      console.error("Error creating calendar event:", error);
      res.status(500).json({ error: "Failed to create calendar event" });
    }
  });

  // API route for getting current date and day of week
  app.get("/api/datetime", (req, res) => {
    try {
      // Get timezone from query parameter or use Rome as default
      const timezone = req.query.timezone as string || "Europe/Rome";
      
      // Get current date
      const now = new Date();
      
      // Format the date in the specified timezone using date-fns-tz
      const formattedDate = formatInTimeZone(now, timezone, "EEEE, MMMM d, yyyy h:mm:ss a zzz");
      const dayOfWeek = formatInTimeZone(now, timezone, "EEEE");
      const time = formatInTimeZone(now, timezone, "h:mm:ss a");
      const dateOnly = formatInTimeZone(now, timezone, "yyyy-MM-dd");
      
      res.json({
        iso: now.toISOString(),
        formatted: formattedDate,
        dayOfWeek,
        time,
        date: dateOnly,
        timezone
      });
    } catch (error) {
      console.error("Error getting date/time:", error);
      res.status(500).json({ error: "Failed to get date/time information" });
    }
  });

  // // 404 handler for undefined routes
  // app.use((req, res) => {
  //   console.log(`Route not found: ${req.method} ${req.path}`);
  //   res.status(404).json({ error: "Route not found", path: req.path });
  // });

  const httpServer = createServer(app);

  return httpServer;
}
