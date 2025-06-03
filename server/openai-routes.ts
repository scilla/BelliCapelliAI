import express from 'express';
import axios from 'axios';

const router = express.Router();

// OpenAI Realtime token endpoint for WebRTC
router.post('/realtime-session', async (_req, res) => {
  try {
    // Create an ephemeral token for WebRTC following OpenAI's guide
    const response = await axios.post(
      'https://api.openai.com/v1/realtime/sessions',
      {
        model: 'gpt-4o-realtime-preview',
        // System instructions as top-level field
        instructions: 'You are a hair salon receptionist for "Belli Capelli" hair salon. Help clients schedule appointments, answer questions about services, and be friendly and professional. Communicate in Italian primarily.',
        // Add voice parameter (required for audio streaming)
        voice: 'alloy',
        // Tool definitions for function calling
        tools: [
          {
            type: 'function',
            name: 'google_calendar_create_event',
            description: 'Book an appointment in the salon calendar',
            parameters: {
              type: 'object',
              required: ['start', 'end', 'summary'],
              properties: {
                start: { 
                  type: 'string', 
                  format: 'date-time',
                  description: 'Appointment start time in ISO format'
                },
                end: { 
                  type: 'string', 
                  format: 'date-time',
                  description: 'Appointment end time in ISO format'
                },
                summary: { 
                  type: 'string',
                  description: 'Brief description of the appointment'
                }
              }
            }
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'OpenAI-Beta': 'realtime=v1'
        }
      }
    );

    // Log the full response for debugging
    console.log('OpenAI API full response:', response.data);

    // Extract the client_secret (ephemeral token) from the response
    const clientSecret = response.data.client_secret?.value;
    const sessionId = response.data.id;

    if (!clientSecret) {
      return res.status(500).json({ error: 'No client_secret returned from OpenAI' });
    }

    // Return the ephemeral token and session configuration
    return res.status(200).json({
      token: clientSecret,
      sessionId: sessionId,
      model: 'gpt-4o-realtime-preview',
      instructions: response.data.instructions,
      voice: response.data.voice
    });
  } catch (err: any) {
    console.error('OpenAI API error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Realtime session creation failed' });
  }
});

export default router;
