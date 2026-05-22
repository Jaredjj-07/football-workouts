export type Database = {
  public: {
    Tables: {
      teams: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      players: {
        Row: {
          id: string
          name: string
          team_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          team_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          team_id?: string
          created_at?: string
        }
      }
      workouts: {
        Row: {
          id: string
          player_id: string
          workout_type: 'summer_workout' | 'seven_7' | 'own_lift'
          points: number
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          player_id: string
          workout_type: 'summer_workout' | 'seven_7' | 'own_lift'
          points: number
          date: string
          created_at?: string
        }
        Update: {
          id?: string
          player_id?: string
          workout_type?: 'summer_workout' | 'seven_7' | 'own_lift'
          points?: number
          date?: string
          created_at?: string
        }
      }
    }
  }
}
