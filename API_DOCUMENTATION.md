# BelliCapelliAI API Documentation

## ElevenLabs Integration

### Get Signed URL
Retrieves a signed URL for ElevenLabs conversation.

- **URL**: `/api/signed-url`
- **Method**: `GET`
- **Auth Required**: No

#### Success Response
- **Code**: 200
- **Content**:
```json
{
  "signedUrl": "https://example.com/signed-url"
}
```

#### Error Response
- **Code**: 500
- **Content**:
```json
{
  "error": "Failed to get signed URL",
  "details": "Error message"
}
```

### Get Agent ID
Retrieves the configured ElevenLabs Agent ID.

- **URL**: `/api/getAgentId`
- **Method**: `GET`
- **Auth Required**: No

#### Success Response
- **Code**: 200
- **Content**:
```json
{
  "agentId": "agent-id-value"
}
```

#### Error Response
- **Code**: 500
- **Content**:
```json
{
  "error": "Agent ID not configured"
}
```

## Google Calendar Integration

### Get Calendar Events
Retrieves events for a specific day from Google Calendar.

- **URL**: `/api/calendar/events`
- **Method**: `GET`
- **Auth Required**: No
- **URL Params**:
  - **Required**: `day=[YYYY-MM-DD]`

#### Success Response
- **Code**: 200
- **Content**:
```json
{
  "events": [
    {
      "id": "event-id",
      "summary": "Event title",
      "start": { "dateTime": "2025-05-31T10:00:00+02:00" },
      "end": { "dateTime": "2025-05-31T11:00:00+02:00" },
      "attendees": [...]
    }
  ]
}
```

#### Error Responses
- **Code**: 400
  - **Content**: `{ "error": "Day parameter is required in format YYYY-MM-DD" }`
  - **Content**: `{ "error": "Invalid date format. Please use YYYY-MM-DD" }`
- **Code**: 500
  - **Content**: `{ "error": "Failed to fetch calendar events" }`
  - **Content**: `{ "error": "Missing Google Calendar configuration..." }`

### Create Calendar Event
Creates a new event in Google Calendar.

- **URL**: `/api/calendar/events`
- **Method**: `POST`
- **Auth Required**: No
- **Data Params**:
```json
{
  "summary": "Event title",
  "startTime": "2025-06-01T10:00:00",
  "endTime": "2025-06-01T11:00:00",
  "attendees": ["user@example.com"] // Optional
}
```

#### Success Response
- **Code**: 201
- **Content**:
```json
{
  "message": "Event created successfully",
  "event": { /* Google Calendar Event Object */ }
}
```

#### Error Responses
- **Code**: 400
  - **Content**: `{ "error": "Missing required fields", "details": "summary, startTime, and endTime are required" }`
  - **Content**: `{ "error": "Invalid date format", "details": "startTime and endTime must be valid ISO date strings" }`
- **Code**: 500
  - **Content**: `{ "error": "Failed to create calendar event" }`
  - **Content**: `{ "error": "Google Calendar API error", "details": "Error message" }`
