# OpenAI Integration Setup Guide

## Overview
This application uses OpenAI's DALL-E 3 API to generate outfit images based on user prompts.

## Setup Instructions

### 1. Get Your OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to [API Keys](https://platform.openai.com/api-keys)
4. Click "Create new secret key"
5. Copy your API key (you won't be able to see it again!)

### 2. Configure Environment Variables

Create a `.env.local` file in the root of your project:

```bash
# In the project root directory
touch .env.local
```

Add your OpenAI API key to the file:

```
OPENAI_API_KEY=sk-your-actual-api-key-here
```

**Important:** 
- Never commit `.env.local` to git (it's already in `.gitignore`)
- Replace `sk-your-actual-api-key-here` with your actual API key
- Keep your API key secure and never share it publicly

### 3. Restart Your Development Server

After adding the API key, restart your Next.js development server:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### 4. Test the Integration

1. Open the app in your browser
2. Go to the "AI Outfit Generator" section (left column)
3. Enter a prompt like: "A blue polo shirt with khaki pants"
4. Click "Generate Outfit"
5. The generated image will open in a new tab

## API Usage

### Endpoint
- **Route**: `/api/generate-outfit`
- **Method**: POST
- **Body**: `{ "prompt": "your outfit description" }`

### Response
```json
{
  "imageUrl": "https://oaidalleapiprodscus..."
}
```

## Costs

- DALL-E 3 costs approximately $0.04 per image (1024x1024)
- Monitor your usage at [OpenAI Usage Dashboard](https://platform.openai.com/usage)

## Troubleshooting

### "OpenAI API key not configured" error
- Make sure `.env.local` exists in the project root
- Verify `OPENAI_API_KEY` is set correctly
- Restart your development server after adding the key

### "Failed to generate outfit" error
- Check your OpenAI account has credits/billing set up
- Verify the API key is valid and has proper permissions
- Check the browser console and server logs for detailed error messages

### Rate Limiting
- DALL-E 3 has rate limits (varies by tier)
- If you hit limits, wait a moment and try again

## Next Steps

You can enhance this integration by:
1. Processing generated images to extract clothing pieces
2. Adding the generated outfit directly to the preview canvas
3. Saving generated outfits to user accounts
4. Implementing caching for repeated prompts

