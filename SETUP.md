# Learning System Setup Guide

## Quick Start

```bash
cd ~/Projects/learning-system

# Install dependencies
npm install  # or: bun install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your API keys:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY  
# - ANTHROPIC_API_KEY

# Run locally
npm run dev
```

Open http://localhost:3000

## Before First Push to GitHub

1. **Create Supabase project**: https://supabase.com
   - Create new project
   - Get your URL and anon key

2. **Create database tables** in Supabase SQL editor:

```sql
-- Users (auto-managed by Supabase Auth)

-- Learning Goals
create table learning_goals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid not null references auth.users(id),
  goal text not null,
  curriculum text not null,
  status text default 'in_progress',
  created_at timestamp default now()
);

-- Summaries
create table summaries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid not null references auth.users(id),
  title text not null,
  content text not null,
  source_url text,
  created_at timestamp default now()
);

-- Exercises
create table exercises (
  id uuid default uuid_generate_v4() primary key,
  summary_id uuid not null references summaries(id),
  exercise_text text not null,
  completed boolean default false,
  completed_at timestamp
);

-- Progress
create table progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid not null references auth.users(id),
  topic text not null,
  level text default 'beginner',
  completed_date timestamp default now()
);

-- Synthesis
create table synthesis (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid not null references auth.users(id),
  week integer not null,
  summary_text text not null,
  takeaways text[] default '{}',
  created_at timestamp default now()
);

-- Enable RLS
alter table learning_goals enable row level security;
alter table summaries enable row level security;
alter table exercises enable row level security;
alter table progress enable row level security;
alter table synthesis enable row level security;

-- Create policies (allow users to see only their own data)
create policy "Users can read own goals" on learning_goals
  for select using (auth.uid() = user_id);

create policy "Users can insert own goals" on learning_goals
  for insert with check (auth.uid() = user_id);

-- Repeat for other tables...
```

3. **Get API keys**:
   - Anthropic: https://console.anthropic.com (create API key)
   - Supabase: Project Settings > API

4. **Set .env.local**:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-key...
ANTHROPIC_API_KEY=sk-ant-...your-key...
```

## Deployment on Vercel

```bash
# Push to GitHub first
git remote add origin https://github.com/yourusername/learning-system.git
git push -u origin main

# Then deploy to Vercel
vercel deploy
```

Set environment variables in Vercel Project Settings:
- All 3 from .env.local

## Testing Locally

```bash
# Type check
npm run type-check

# Build
npm run build

# Start production build
npm run start
```

## Project Files Reference

| File | Purpose |
|------|---------|
| `app/page.tsx` | Home page / dashboard |
| `app/auth/page.tsx` | Authentication (login/signup) |
| `app/summarize/page.tsx` | Content summarization UI |
| `app/learn-path/page.tsx` | Learning path generator UI |
| `app/progress/page.tsx` | Progress tracker UI |
| `app/synthesis/page.tsx` | Weekly synthesis UI |
| `app/api/summarize/route.ts` | Summary generation API |
| `app/api/learn-path/route.ts` | Curriculum generation API |
| `app/api/progress/route.ts` | Progress tracking API |
| `app/api/synthesis/route.ts` | Weekly synthesis API |
| `app/api/recommendations/route.ts` | Recommendations API |
| `components/Dashboard.tsx` | Dashboard component |
| `components/Navigation.tsx` | Top navigation bar |
| `lib/supabase.ts` | Supabase client & types |

## Key Features Ready to Use

✅ User authentication (email/password via Supabase)
✅ AI-powered content summarization (Claude API)
✅ Learning path generation with structured curriculum
✅ Progress tracking by topic and skill level
✅ Weekly AI synthesis with actionable takeaways
✅ Personalized topic recommendations
✅ Full TypeScript with strict type checking
✅ Tailwind CSS responsive design
✅ Vercel deployment ready

## Next Steps

1. Set up Supabase project and get API keys
2. Create .env.local with keys
3. Test locally: `npm run dev`
4. Push to GitHub
5. Deploy to Vercel
