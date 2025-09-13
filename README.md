# M-32 Chat Application

A modern Next.js chat application with external API integration and PDF upload functionality.

## Features

- 🔐 External authentication integration (Login/Signup)
- 💬 Real-time chat interface
- 📄 PDF file upload support
- 🎨 Modern, responsive UI
- 🔌 Simple API forwarding to external server

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```


### 2. Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## API Endpoints

### Authentication Endpoints

- `POST /api/login` - User login (forwards to external server)
- `POST /api/signup` - User registration (forwards to external server)

### Chat Endpoints

- `POST /api/send-chat` - Send chat message with optional PDF upload

#### Send Chat Request Format

```typescript
// FormData with the following fields:
{
  message: string,           // User's text message
  file_0?: File,            // First PDF file (optional)
  file_1?: File,            // Second PDF file (optional)
  // ... additional files
}
```

#### Send Chat Response Format

```typescript
{
  success: boolean,
  response: string,         // Bot's response message
  data?: any               // Additional data from external API
}
```

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── login/route.ts               # Login API endpoint
│   │   ├── signup/route.ts              # Signup API endpoint
│   │   └── send-chat/route.ts           # Chat API endpoint
│   ├── login/page.tsx                   # Login page
│   ├── signup/page.tsx                  # Signup page
│   ├── layout.tsx                       # Root layout
│   └── page.tsx                         # Main chat page
├── components/
│   └── ChatInterface.tsx                # Main chat component
└── config/
    └── api.ts                          # API configuration
```

## Development Notes

- All authentication is handled by your external server
- Frontend stores auth tokens in localStorage
- PDF files are forwarded to the external API for processing
- The chat interface supports multiple file uploads
- API routes simply forward requests to your external endpoints

## Technologies Used

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Lucide React (Icons)