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

export default function AdminPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [workouts, setWorkouts] = useState<Workout[]>([])

  const [newTeamName, setNewTeamName] = useState('')
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null)
  const [editingTeamName, setEditingTeamName] = useState('')

  const [newPlayerName, setNewPlayerName] = useState('')
  const [selectedTeamId, setSelectedTeamId] = useState('')
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null)
  const [editingPlayerName, setEditingPlayerName] = useState('')
  const [editingPlayerTeam, setEditingPlayerTeam] = useState('')

  const [selectedPlayerForPoints, setSelectedPlayerForPoints] = useState('')
  const [pointsToAdd, setPointsToAdd] = useState('1')
  const [workoutType, setWorkoutType] = useState<'summer_workout' | 'seven_7' | 'own_lift'>('summer_workout')

  const [activeTab, setActiveTab] = useState<'teams' | 'players' | 'workouts'>('teams')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [teamsData, playersData, workoutsData] = await Promise.all([
        supabase.from('teams').select('*').order('name'),
        supabase.from('players').select('*').order('name'),
        supabase.from('workouts').select('*').order('date', { ascending: false }),
      ])

      if (teamsData.data) setTeams(teamsData.data)
      if (playersData.data) setPlayers(playersData.data)
      if (workoutsData.data) setWorkouts(workoutsData.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  // Team Management
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

  const updateTeam = async (id: string) => {
    if (!editingTeamName.trim()) return
    try {
      await supabase.from('teams').update({ name: editingTeamName }).eq('id', id)
      setTeams(teams.map((t) => (t.id === id ? { ...t, name: editingTeamName } : t)))
      setEditingTeamId(null)
      setEditingTeamName('')
    } catch (error) {
      console.error('Error updating team:', error)
    }
  }

  const deleteTeam = async (id: string) => {
    if (!confirm('Delete this team? All players will be removed.')) return
    try {
      await supabase.from('teams').delete().eq('id', id)
      setTeams(teams.filter((t) => t.id !== id))
    } catch (error) {
      console.error('Error deleting team:', error)
    }
  }

  // Player Management
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

  const updatePlayer = async (id: string) => {
    if (!editingPlayerName.trim()) return
    try {
      await supabase
        .from('players')
        .update({ name: editingPlayerName, team_id: editingPlayerTeam })
        .eq('id', id)
      setPlayers(
        players.map((p) =>
          p.id === id ? { ...p, name: editingPlayerName, team_id: editingPlayerTeam } : p
        )
      )
      setEditingPlayerId(null)
      setEditingPlayerName('')
      setEditingPlayerTeam('')
    } catch (error) {
      console.error('Error updating player:', error)
    }
  }

  const deletePlayer = async (id: string) => {
    if (!confirm('Delete this player?')) return
    try {
      await supabase.from('players').delete().eq('id', id)
      setPlayers(players.filter((p) => p.id !== id))
    } catch (error) {
      console.error('Error deleting player:', error)
    }
  }

  // Points Management
  const addPoints = async () => {
    if (!selectedPlayerForPoints || !pointsToAdd) return
    try {
      const points = parseInt(pointsToAdd)
      const { data } = await supabase
        .from('workouts')
        .insert({
          player_id: selectedPlayerForPoints,
          workout_type: workoutType,
          points,
          date: new Date().toISOString().split('T')[0],
        })
        .select()
      if (data) {
        setWorkouts([data[0], ...workouts])
        setSelectedPlayerForPoints('')
        setPointsToAdd('1')
        setWorkoutType('summer_workout')
      }
    } catch (error) {
      console.error('Error adding points:', error)
    }
  }

  const deleteWorkout = async (id: string) => {
    if (!confirm('Delete this workout entry?')) return
    try {
      await supabase.from('workouts').delete().eq('id', id)
      setWorkouts(workouts.filter((w) => w.id !== id))
    } catch (error) {
      console.error('Error deleting workout:', error)
    }
  }

  const getTeamName = (teamId: string) => teams.find((t) => t.id === teamId)?.name || 'Unknown'
  const getPlayerName = (playerId: string) => players.find((p) => p.id === playerId)?.name || 'Unknown'
  const getWorkoutLabel = (type: string) => {
    const labels: Record<string, string> = {
      summer_workout: 'Summer Workout',
      seven_7: '7-7',
      own_lift: 'Own Lift',
    }
    return labels[type] || type
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">⚙️ Admin Panel</h1>
          <Link
            href="/"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            View Leaderboard
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-300">
          <button
            onClick={() => setActiveTab('teams')}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === 'teams'
                ? 'border-b-4 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Teams
          </button>
          <button
            onClick={() => setActiveTab('players')}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === 'players'
                ? 'border-b-4 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Players
          </button>
          <button
            onClick={() => setActiveTab('workouts')}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === 'workouts'
                ? 'border-b-4 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Points
          </button>
        </div>

        {/* Teams Tab */}
        {activeTab === 'teams' && (
          <div className="space-y-6">
            {/* Add Team */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Create Team</h2>
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Team name (e.g., Offense, Defense)"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={addTeam}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  Create Team
                </button>
              </div>
            </div>

            {/* Teams List */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">All Teams</h2>
              <div className="space-y-3">
                {teams.length === 0 ? (
                  <p className="text-gray-500 italic">No teams yet. Create one to get started!</p>
                ) : (
                  teams.map((team) => (
                    <div
                      key={team.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                    >
                      {editingTeamId === team.id ? (
                        <div className="flex gap-2 flex-1">
                          <input
                            type="text"
                            value={editingTeamName}
                            onChange={(e) => setEditingTeamName(e.target.value)}
                            className="flex-1 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            onClick={() => updateTeam(team.id)}
                            className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingTeamId(null)}
                            className="px-4 py-1 bg-gray-400 text-white rounded hover:bg-gray-500"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
                            <p className="text-sm text-gray-500">
                              {players.filter((p) => p.team_id === team.id).length} players
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingTeamId(team.id)
                                setEditingTeamName(team.name)
                              }}
                              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteTeam(team.id)}
                              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Players Tab */}
        {activeTab === 'players' && (
          <div className="space-y-6">
            {/* Add Player */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Add Player</h2>
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
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                >
                  Add Player
                </button>
              </div>
            </div>

            {/* Players List */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">All Players</h2>
              <div className="space-y-3">
                {players.length === 0 ? (
                  <p className="text-gray-500 italic">No players yet.</p>
                ) : (
                  players.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                    >
                      {editingPlayerId === player.id ? (
                        <div className="flex gap-2 flex-1">
                          <input
                            type="text"
                            value={editingPlayerName}
                            onChange={(e) => setEditingPlayerName(e.target.value)}
                            className="flex-1 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <select
                            value={editingPlayerTeam}
                            onChange={(e) => setEditingPlayerTeam(e.target.value)}
                            className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select team</option>
                            {teams.map((team) => (
                              <option key={team.id} value={team.id}>
                                {team.name}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => updatePlayer(player.id)}
                            className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingPlayerId(null)}
                            className="px-4 py-1 bg-gray-400 text-white rounded hover:bg-gray-500"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{player.name}</h3>
                            <p className="text-sm text-gray-500">{getTeamName(player.team_id)}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingPlayerId(player.id)
                                setEditingPlayerName(player.name)
                                setEditingPlayerTeam(player.team_id)
                              }}
                              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deletePlayer(player.id)}
                              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Points Tab */}
        {activeTab === 'workouts' && (
          <div className="space-y-6">
            {/* Add Points */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Add Points</h2>
              <div className="flex gap-4">
                <select
                  value={selectedPlayerForPoints}
                  onChange={(e) => setSelectedPlayerForPoints(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select player</option>
                  {players.map((player) => (
                    <option key={player.id} value={player.id}>
                      {player.name} ({getTeamName(player.team_id)})
                    </option>
                  ))}
                </select>
                <select
                  value={workoutType}
                  onChange={(e) => setWorkoutType(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="summer_workout">Summer Workout (5 pts)</option>
                  <option value="seven_7">7-7 (3 pts)</option>
                  <option value="own_lift">Own Lift (1 pt)</option>
                </select>
                <input
                  type="number"
                  value={pointsToAdd}
                  onChange={(e) => setPointsToAdd(e.target.value)}
                  className="w-20 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={addPoints}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
                >
                  Add Points
                </button>
              </div>
            </div>

            {/* Workouts List */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Points History</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-300">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Player</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Team</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Workout Type</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Points</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workouts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-4 px-4 text-center text-gray-500">
                          No points logged yet.
                        </td>
                      </tr>
                    ) : (
                      workouts.map((workout) => (
                        <tr key={workout.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="py-3 px-4 font-semibold text-gray-900">
                            {getPlayerName(workout.player_id)}
                          </td>
                          <td className="py-3 px-4 text-gray-700">
                            {getTeamName(
                              players.find((p) => p.id === workout.player_id)?.team_id || ''
                            )}
                          </td>
                          <td className="py-3 px-4 text-gray-700">
                            {getWorkoutLabel(workout.workout_type)}
                          </td>
                          <td className="py-3 px-4 font-bold text-blue-600">{workout.points}</td>
                          <td className="py-3 px-4 text-gray-700">{workout.date}</td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => deleteWorkout(workout.id)}
                              className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
