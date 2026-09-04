export default function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>PGB Performance System</h1>
      <p>App is rendering.</p>
      <p>Env URL: {import.meta.env.VITE_SUPABASE_URL ? 'SET' : 'MISSING'}</p>
      <p>Env Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'MISSING'}</p>
    </div>
  );
}
