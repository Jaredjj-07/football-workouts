# Football Workouts

A web application for coaches and players to track workout points and team standings.

## Features

- 📊 **Team Management** - Create and organize teams
- 👥 **Player Tracking** - Add players to teams
- 🏋️ **Workout Logging** - Log different types of workouts:
  - Summer Workout = 5 points
  - 7-7 = 3 points
  - Own Lift = 1 point
- 🏆 **Team Leaderboard** - Real-time team rankings with total points
- 📈 **Individual Stats** - Track each player's total points

## Tech Stack

- **Next.js 15** - React framework with server and client components
- **TypeScript** - Type-safe code
- **Supabase** - Database and authentication
- **Tailwind CSS** - Responsive styling

## Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Jaredjj-07/football-workouts.git
cd football-workouts
```

### 2. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to SQL Editor and create the following tables:

```sql
-- Create teams table
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create players table
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create workouts table
CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  workout_type TEXT NOT NULL CHECK (workout_type IN ('summer_workout', 'seven_7', 'own_lift')),
  points INTEGER NOT NULL,
  date TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (for development)
CREATE POLICY "teams_all" ON teams FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "players_all" ON players FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "workouts_all" ON workouts FOR ALL USING (true) WITH CHECK (true);
```

### 3. Environment Variables

1. Copy `.env.example` to `.env.local`
2. Add your Supabase credentials:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your anonymous key

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Create Teams** - Add team names in the "Add Team" section
2. **Add Players** - Select a team and add player names
3. **Log Workouts** - Select a player and workout type to log points
4. **View Leaderboard** - See team rankings and player stats

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Add environment variables in Vercel settings
4. Deploy!

## License

MIT