# Hackathon Web App

A modern web application built with Next.js, TypeScript, Tailwind CSS, shadcn/ui, and Supabase, deployed on Netlify.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase
- **AI Integration**: OpenAI DALL-E 3
- **Deployment**: Netlify
- **Version Control**: GitHub

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- A Supabase account and project (optional)
- An OpenAI API key for AI outfit generation (see [OPENAI_SETUP.md](./OPENAI_SETUP.md))

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd hackathon
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Update `.env.local` with your credentials:
```
# OpenAI API Key (required for AI outfit generation)
OPENAI_API_KEY=your_openai_api_key_here

# Supabase (optional)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**For OpenAI Setup:** See [OPENAI_SETUP.md](./OPENAI_SETUP.md) for detailed instructions.

**For Supabase Setup:** You can find these values in your Supabase project settings under API.

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
hackathon/
├── app/                 # Next.js app router pages
│   ├── globals.css      # Global styles with Tailwind
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Home page
├── components/
│   └── ui/              # shadcn/ui components
├── lib/
│   ├── utils.ts         # Utility functions (cn helper)
│   └── supabase/        # Supabase client utilities
│       ├── client.ts    # Client-side Supabase client
│       └── server.ts    # Server-side Supabase client
├── public/              # Static assets
├── netlify.toml         # Netlify deployment config
├── tailwind.config.ts   # Tailwind + shadcn/ui config
├── components.json      # shadcn/ui configuration
└── tsconfig.json        # TypeScript config
```

## Using Supabase

### Client-Side Usage

```typescript
import { supabase } from '@/lib/supabase/client';

// Example: Fetch data
const { data, error } = await supabase.from('table_name').select('*');
```

### Server-Side Usage

```typescript
import { createSupabaseServerClient } from '@/lib/supabase/server';

// In a server component or route handler
const supabase = await createSupabaseServerClient();
const { data, error } = await supabase.from('table_name').select('*');
```

## Using shadcn/ui

shadcn/ui is configured and ready to use. Components are installed in the `components/ui` directory and can be imported directly:

```tsx
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function Page() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Title</CardTitle>
      </CardHeader>
      <CardContent>
        <Button>Click me</Button>
      </CardContent>
    </Card>
  );
}
```

### Adding New Components

To add more shadcn/ui components, use the CLI:

```bash
npx shadcn@latest add [component-name]
```

For example:
```bash
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
```

Visit the [shadcn/ui documentation](https://ui.shadcn.com/) for all available components.

## Deployment to Netlify

### Automatic Deployment (Recommended)

1. Push your code to GitHub
2. Connect your GitHub repository to Netlify
3. Netlify will automatically detect the Next.js app and use the `netlify.toml` configuration
4. Add your environment variables in Netlify's site settings

### Manual Deployment

1. Build the project:
```bash
npm run build
```

2. Use the Netlify CLI:
```bash
npm install -g netlify-cli
netlify deploy --prod
```

### Environment Variables on Netlify

Make sure to add the following environment variables in your Netlify site settings:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [Netlify Documentation](https://docs.netlify.com/)

## License

This project is open source and available under the MIT License.