'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type Team = {
  id: string
  name: string
}

type Player = {
  id: string
  name: string
  team_id: string
}

type Workout = {
  id: string
  player_id: string
  workout_type: 'summer_workout' | 'seven_7' | 'own_lift'
  points: number
  date: string
}

const WORKOUT_POINTS = {
  summer_workout: 5,
  seven_7: 3,
  own_lift: 1,
}

export default function PlayerPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [workouts, setWorkouts] = useState<Workout[]>([])

  const [selectedPlayerId, setSelectedPlayerId] = useState('')
  const [selectedTeamId, setSelectedTeamId] = useState('')
  const [selectedWorkoutType, setSelectedWorkoutType] = useState<'summer_workout' | 'seven_7' | 'own_lift'>('summer_workout')

  const [playerStats, setPlayerStats] = useState<{ totalPoints: number; workoutCount: number }>({
    totalPoints: 0,
    workoutCount: 0,
  })

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (selectedPlayerId) {
      updatePlayerStats()
    }
  }, [selectedPlayerId, workouts])

  const fetchData = async () => {
    try {
      const [teamsData, playersData, workoutsData] = await Promise.all([
        supabase.from('teams').select('*').order('name'),
        supabase.from('players').select('*').order('name'),
        supabase.from('workouts').select('*'),
      ])

      if (teamsData.data) setTeams(teamsData.data)
      if (playersData.data) setPlayers(playersData.data)
      if (workoutsData.data) setWorkouts(workoutsData.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const updatePlayerStats = () => {
    const playerWorkouts = workouts.filter((w) => w.player_id === selectedPlayerId)
    const totalPoints = playerWorkouts.reduce((sum, w) => sum + w.points, 0)
    setPlayerStats({
      totalPoints,
      workoutCount: playerWorkouts.length,
    })
  }

  const logWorkout = async () => {
    if (!selectedPlayerId || !selectedWorkoutType) return

    try {
      const points = WORKOUT_POINTS[selectedWorkoutType]
      const { data } = await supabase
        .from('workouts')
        .insert({
          player_id: selectedPlayerId,
          workout_type: selectedWorkoutType,
          points,
          date: new Date().toISOString().split('T')[0],
        })
        .select()

      if (data) {
        setWorkouts([...workouts, data[0]])
        // Show success message
        alert('✅ Workout logged successfully!')
      }
    } catch (error) {
      console.error('Error logging workout:', error)
      alert('❌ Error logging workout')
    }
  }

  const getPlayerWorkouts = () => {
    return workouts.filter((w) => w.player_id === selectedPlayerId)
  }

  const getTeamName = (teamId: string) => teams.find((t) => t.id === teamId)?.name || 'Unknown'

  const getWorkoutLabel = (type: string) => {
    const labels: Record<string, string> = {
      summer_workout: 'Summer Workout',
      seven_7: '7-7',
      own_lift: 'Own Lift',
    }
    return labels[type] || type
  }

  const filteredPlayers = selectedTeamId
    ? players.filter((p) => p.team_id === selectedTeamId)
    : players

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">📱 Player Workout Logger</h1>
          <div className="flex gap-4">
            <Link
              href="/"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              View Leaderboard
            </Link>
            <Link
              href="/admin"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Admin Panel
            </Link>
          </div>
        </div>

        {/* Select Player */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Select Your Team & Name</h2>
          <div className="flex gap-4 mb-4">
            <select
              value={selectedTeamId}
              onChange={(e) => {
                setSelectedTeamId(e.target.value)
                setSelectedPlayerId('')
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-lg"
            >
              <option value="">All Teams</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {filteredPlayers.length === 0 ? (
              <p className="col-span-full text-gray-500 italic text-center py-4">
                No players in this team yet.
              </p>
            ) : (
              filteredPlayers.map((player) => (
                <button
                  key={player.id}
                  onClick={() => setSelectedPlayerId(player.id)}
                  className={`p-4 rounded-lg font-semibold transition text-lg ${
                    selectedPlayerId === player.id
                      ? 'bg-green-600 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {player.name}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Selected Player Info */}
        {selectedPlayerId && (
          <>
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-md p-6 mb-8 text-white">
              <h2 className="text-3xl font-bold mb-2">
                {players.find((p) => p.id === selectedPlayerId)?.name}
              </h2>
              <p className="text-lg opacity-90">
                Team: {getTeamName(players.find((p) => p.id === selectedPlayerId)?.team_id || '')}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="bg-white bg-opacity-20 rounded p-3">
                  <p className="text-sm opacity-75">Total Points</p>
                  <p className="text-4xl font-bold">{playerStats.totalPoints}</p>
                </div>
                <div className="bg-white bg-opacity-20 rounded p-3">
                  <p className="text-sm opacity-75">Workouts Logged</p>
                  <p className="text-4xl font-bold">{playerStats.workoutCount}</p>
                </div>
              </div>
            </div>

            {/* Log Workout */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Log a Workout</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-lg font-semibold text-gray-700 mb-2">
                      Workout Type
                    </label>
                    <select
                      value={selectedWorkoutType}
                      onChange={(e) => setSelectedWorkoutType(e.target.value as any)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-lg"
                    >
                      <option value="summer_workout">☀️ Summer Workout (5 pts)</option>
                      <option value="seven_7">⚡ 7-7 (3 pts)</option>
                      <option value="own_lift">💪 Own Lift (1 pt)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-lg font-semibold text-gray-700 mb-2">
                      Points: {WORKOUT_POINTS[selectedWorkoutType]} pts
                    </label>
                    <div className="text-5xl font-bold text-green-600">
                      +{WORKOUT_POINTS[selectedWorkoutType]}
                    </div>
                  </div>
                </div>
                <button
                  onClick={logWorkout}
                  className="w-full px-6 py-4 bg-green-600 text-white text-xl font-bold rounded-lg hover:bg-green-700 transition transform hover:scale-105"
                >
                  ✅ Log Workout
                </button>
              </div>
            </div>

            {/* Recent Workouts */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">My Recent Workouts</h2>
              <div className="space-y-3">
                {getPlayerWorkouts().length === 0 ? (
                  <p className="text-gray-500 italic text-center py-8">
                    No workouts logged yet. Start logging to see them here!
                  </p>
                ) : (
                  getPlayerWorkouts()
                    .slice()
                    .reverse()
                    .map((workout) => (
                      <div
                        key={workout.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-l-4 border-green-500"
                      >
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {getWorkoutLabel(workout.workout_type)}
                          </h3>
                          <p className="text-sm text-gray-500">{workout.date}</p>
                        </div>
                        <div className="text-2xl font-bold text-green-600">+{workout.points}</div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </>
        )}

        {!selectedPlayerId && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-xl">
              👆 Select your team and name above to start logging workouts!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
