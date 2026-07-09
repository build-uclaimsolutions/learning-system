# Learning System

An AI-powered full-stack learning platform that helps you summarize content, generate personalized learning paths, track progress, and synthesize weekly learnings.

## Features

- **Content Summarization**: Paste a URL or text to get AI-generated 20-page summaries with 5 practical exercises
- **Learning Path Generation**: Define a learning goal and receive a personalized, structured curriculum with milestones
- **Progress Tracking**: Monitor what you've learned with topic-level tracking and achievement stats
- **Weekly Synthesis**: AI-generated weekly reports synthesizing all learnings with actionable takeaways
- **Smart Recommendations**: Get personalized recommendations for what to learn next
- **Full Authentication**: Secure user accounts via Supabase

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **AI**: Claude API (Anthropic SDK)
- **Deployment**: Vercel-ready

## Project Structure

```
learning-system/
├── app/
│   ├── api/
│   │   ├── summarize/route.ts      # Content summarization endpoint
│   │   ├── learn-path/route.ts     # Learning curriculum generation
│   │   ├── progress/route.ts       # Progress tracking
│   │   ├── synthesis/route.ts      # Weekly AI synthesis
│   │   └── recommendations/route.ts # Topic recommendations
│   ├── summarize/page.tsx          # Summarize UI
│   ├── learn-path/page.tsx         # Learning path UI
│   ├── progress/page.tsx           # Progress tracker UI
│   ├── synthesis/page.tsx          # Weekly report UI
│   ├── auth/page.tsx               # Authentication
│   ├── layout.tsx                  # Root layout
│   ├── page.tsx                    # Home/dashboard
│   └── globals.css                 # Tailwind styles
├── components/
│   ├── Navigation.tsx              # Top navigation bar
│   └── Dashboard.tsx               # Main dashboard
├── lib/
│   └── supabase.ts                 # Supabase client & types
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── next.config.js
└── .env.example
```

## Database Schema

### Users
```sql
users (id, email, created_at)
```

### Learning Goals
```sql
learning_goals (id, user_id, goal, curriculum, status, created_at)
```

### Summaries
```sql
summaries (id, user_id, title, content, source_url, created_at)
```

### Exercises
```sql
exercises (id, summary_id, exercise_text, completed, completed_at)
```

### Progress
```sql
progress (id, user_id, topic, level, completed_date)
```

### Synthesis
```sql
synthesis (id, user_id, week, summary_text, takeaways, created_at)
```

## Setup

1. **Clone and install**:
   ```bash
   cd ~/Projects/learning-system
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env.local
   ```
   Add your environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
   - `ANTHROPIC_API_KEY` - Your Claude API key

3. **Set up Supabase**:
   - Create a new Supabase project
   - Run SQL migrations to create tables (see schema above)
   - Enable authentication

4. **Run locally**:
   ```bash
   npm run dev
   ```
   Open http://localhost:3000

## API Endpoints

### POST /api/summarize
Generate summary and exercises from URL or text.
```json
{
  "url": "https://example.com/article",
  "text": "optional text content",
  "userId": "user-id"
}
```

### POST /api/learn-path
Generate personalized learning curriculum.
```json
{
  "goal": "Learn Advanced Python",
  "timeframe": "3months",
  "userId": "user-id"
}
```

### GET /api/progress
Get user's learning progress.
```
?userId=user-id&timeframe=week|month|all
```

### POST /api/synthesis
Generate weekly synthesis report.
```json
{
  "userId": "user-id",
  "week": 28
}
```

### GET /api/recommendations
Get personalized topic recommendations.
```
?userId=user-id
```

## Deployment

### Vercel
```bash
npm run build
vercel deploy
```

Set environment variables in Vercel dashboard before deploying.

## Usage

1. **Sign up** or sign in with email/password
2. **Summarize** articles or paste text to get summaries + exercises
3. **Create learning paths** for structured goal-based learning
4. **Track progress** weekly with automatic logging
5. **View synthesis** reports synthesizing all weekly learnings
6. **Get recommendations** for personalized next steps

## Future Enhancements

- Spaced repetition system for exercises
- Community learning paths and shared resources
- Advanced progress analytics with charts
- Mobile app (React Native)
- Integration with popular learning platforms
- Video summarization support

## License

MIT
