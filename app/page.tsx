export default function HomePage() {
  return (
    <main
      style={{
        padding: 40,
      }}
    >
      <h1
        style={{
          fontSize: 48,
          marginBottom: 20,
        }}
      >
        Football Workout Tracker
      </h1>

      <div
        style={{
          display: 'flex',
          gap: 20,
          flexWrap: 'wrap',
        }}
      >
        <a href="/submit">
          <button
            style={{
              padding: '20px 30px',
              fontSize: 20,
              borderRadius: 12,
              border: 'none',
              background: '#2563eb',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            Submit Workout
          </button>
        </a>

        <a href="/players">
          <button
            style={{
              padding: '20px 30px',
              fontSize: 20,
              borderRadius: 12,
              border: 'none',
              background: '#16a34a',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            Player Leaderboard
          </button>
        </a>

        <a href="/admin">
          <button
            style={{
              padding: '20px 30px',
              fontSize: 20,
              borderRadius: 12,
              border: 'none',
              background: '#9333ea',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            Admin
          </button>
        </a>
      </div>
    </main>
  );
}
