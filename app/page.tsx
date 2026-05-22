'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

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

type TeamStats = Team & {
  players: (Player & { totalPoints: number })[]
  totalPoints: number
}

const WORKOUT_POINTS = {
  summer_workout: 5,
  seven_7: 3,
  own_lift: 1,
}

export default function Home() {
  const [teams, setTeams] = useState<Team[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [teamStats, setTeamStats] = useState<TeamStats[]>([])

  const [newTeamName, setNewTeamName] = useState('')
  const [newPlayerName, setNewPlayerName] = useState('')
  const [selectedTeamId, setSelectedTeamId] = useState('')
  const [selectedPlayerId, setSelectedPlayerId] = useState('')
  const [selectedWorkoutType, setSelectedWorkoutType] = useState<'summer_workout' | 'seven_7' | 'own_lift'>('summer_workout')

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    calculateTeamStats()
  }, [teams, players, workouts])

  const fetchData = async () => {
    try {
      const [teamsData, playersData, workoutsData] = await Promise.all([
        supabase.from('teams').select('*'),
        supabase.from('players').select('*'),
        supabase.from('workouts').select('*'),
      ])

      if (teamsData.data) setTeams(teamsData.data)
      if (playersData.data) setPlayers(playersData.data)
      if (workoutsData.data) setWorkouts(workoutsData.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const calculateTeamStats = () => {
    const stats: TeamStats[] = teams.map((team) => {
      const teamPlayers = players.filter((p) => p.team_id === team.id)
      const playersWithPoints = teamPlayers.map((player) => {
        const playerWorkouts = workouts.filter((w) => w.player_id === player.id)
        const totalPoints = playerWorkouts.reduce((sum, w) => sum + w.points, 0)
        return { ...player, totalPoints }
      })
      const totalPoints = playersWithPoints.reduce((sum, p) => sum + p.totalPoints, 0)
      return { ...team, players: playersWithPoints, totalPoints }
    })
    stats.sort((a, b) => b.totalPoints - a.totalPoints)
    setTeamStats(stats)
  }

  const addTeam = async () => {
    if (!newTeamName.trim()) return
    try {
      const { data } = await supabase
        .from('teams')
        .insert({ name: newTeamName })
        .select()
      if (data) {
        setTeams([...teams, data[0]])
        setNewTeamName('')
      }
    } catch (error) {
      console.error('Error adding team:', error)
    }
  }

  const addPlayer = async () => {
    if (!newPlayerName.trim() || !selectedTeamId) return
    try {
      const { data } = await supabase
        .from('players')
        .insert({ name: newPlayerName, team_id: selectedTeamId })
        .select()
      if (data) {
        setPlayers([...players, data[0]])
        setNewPlayerName('')
      }
    } catch (error) {
      console.error('Error adding player:', error)
    }
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
        setSelectedPlayerId('')
        setSelectedWorkoutType('summer_workout')
      }
    } catch (error) {
      console.error('Error logging workout:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">🏈 Football Workouts</h1>

        {/* Add Team Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Add Team</h2>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Team name"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addTeam}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Add Team
            </button>
          </div>
        </div>

        {/* Add Player Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Add Player</h2>
          <div className="flex gap-4">
            <select
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select team</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Player name"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addPlayer}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Add Player
            </button>
          </div>
        </div>

        {/* Log Workout Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Log Workout</h2>
          <div className="flex gap-4">
            <select
              value={selectedPlayerId}
              onChange={(e) => setSelectedPlayerId(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select player</option>
              {players.map((player) => {
                const team = teams.find((t) => t.id === player.team_id)
                return (
                  <option key={player.id} value={player.id}>
                    {player.name} ({team?.name})
                  </option>
                )
              })}
            </select>
            <select
              value={selectedWorkoutType}
              onChange={(e) => setSelectedWorkoutType(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="summer_workout">Summer Workout (5 pts)</option>
              <option value="seven_7">7-7 (3 pts)</option>
              <option value="own_lift">Own Lift (1 pt)</option>
            </select>
            <button
              onClick={logWorkout}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Log Workout
            </button>
          </div>
        </div>

        {/* Team Leaderboard */}
        <div className="grid gap-6">
          <h2 className="text-2xl font-bold text-gray-900">Team Leaderboard</h2>
          {teamStats.map((team, index) => (
            <div key={team.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  #{index + 1} {team.name}
                </h3>
                <div className="text-3xl font-bold text-blue-600">{team.totalPoints} pts</div>
              </div>
              <div className="space-y-2">
                {team.players.length === 0 ? (
                  <p className="text-gray-500 italic">No players yet</p>
                ) : (
                  team.players.map((player) => (
                    <div
                      key={player.id}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="text-gray-700">{player.name}</span>
                      <span className="font-semibold text-gray-900">{player.totalPoints} pts</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
          {teamStats.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-500 text-lg">No teams yet. Create a team to get started!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}