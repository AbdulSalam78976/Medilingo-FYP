import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getAdminStats, getAdminQueries, getAdminUsers } from '../services/apiClient';
import { useAuthStore } from '../hooks/useAuthStore';
import { ThemeToggle } from '../components/ThemeToggle';

interface Stats {
  users: number;
  sessions: number;
  messages: number;
  assistant_messages: number;
  recent_sessions_7d: number;
  indexed_documents: number;
  timestamp: string;
}

interface Query {
  id: string;
  session_id: string;
  content: string;
  created_at: string;
}

interface AdminUser {
  id: string;
  email: string;
  created_at: string;
}

type Tab = 'overview' | 'queries' | 'users';

function StatCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="card p-5">
      <div className="text-[28px] font-bold text-ink tabular-nums">{value}</div>
      <div className="text-[13px] font-medium text-ink mt-0.5">{label}</div>
      {sub && <div className="text-[11px] text-ink-4 mt-0.5">{sub}</div>}
    </div>
  );
}

export function AdminPage() {
  const user = useAuthStore(s => s.user);
  const isRestoring = useAuthStore(s => s.isRestoring);
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [queries, setQueries] = useState<Query[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const s = await getAdminStats() as Stats;
      setStats(s);
    } catch (err: unknown) {
      const raw = (err as { message?: string; statusCode?: number });
      const code = raw.statusCode ?? 0;
      if (code === 403 || raw.message?.toLowerCase().includes('admin')) {
        setError('403');
      } else {
        setError(raw.message ?? 'Failed to load stats.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isRestoring) return;
    if (!user) {
      navigate('/admin/login', { replace: true });
      return;
    }
    loadStats();
  }, [isRestoring, user, navigate, loadStats]);

  const loadQueries = useCallback(async () => {
    if (queries.length > 0) return;
    try {
      const res = await getAdminQueries(50) as { queries: Query[] };
      setQueries(res.queries);
    } catch {
      toast.error('Failed to load queries.');
    }
  }, [queries.length]);

  const loadUsers = useCallback(async () => {
    if (users.length > 0) return;
    try {
      const res = await getAdminUsers() as { users: AdminUser[] };
      setUsers(res.users);
    } catch {
      toast.error('Failed to load users.');
    }
  }, [users.length]);

  function handleTabChange(t: Tab) {
    setTab(t);
    if (t === 'queries') loadQueries();
    if (t === 'users') loadUsers();
  }

  const tabClass = (t: Tab) =>
    `px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors ${
      tab === t ? 'border-blue text-blue' : 'border-transparent text-ink-3 hover:text-ink'
    }`;

  // ── Still restoring session ───────────────────────────────────────────────
  if (isRestoring) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="flex items-center gap-3 text-ink-4 text-[14px]">
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z"/>
          </svg>
          Checking session…
        </div>
      </div>
    );
  }

  // ── No access (403) ────────────────────────────────────────────────────────
  if (error === '403') {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-8">
        <div className="max-w-md w-full card p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-4">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C2483B" strokeWidth="1.8" strokeLinecap="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <h2 className="font-display text-[20px] font-semibold text-ink mb-2">Admin access required</h2>
          <p className="text-[13px] text-ink-3 mb-5 leading-relaxed">
            Your account (<span className="font-mono text-ink-2">{user?.email}</span>) is not in the admin list.
          </p>
          <div className="text-left bg-paper-2 border border-line rounded-md p-4 mb-6 text-[12px] font-mono text-ink-3">
            <div className="text-ink-4 mb-1"># backend/.env</div>
            <div>ADMIN_EMAILS={user?.email}</div>
          </div>
          <p className="text-[12px] text-ink-4 mb-6">Add your email to <code className="text-blue">ADMIN_EMAILS</code> in <code className="text-blue">backend/.env</code> and restart the backend.</p>
          <Link to="/chat" className="btn btn-primary text-[13px]">Back to chat</Link>
        </div>
      </div>
    );
  }

  // ── General error ──────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-8">
        <div className="max-w-md w-full card p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-4">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C2483B" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
            </svg>
          </div>
          <h2 className="font-display text-[20px] font-semibold text-ink mb-2">Could not load dashboard</h2>
          <p className="text-[13px] text-ink-3 mb-6">{error}</p>
          <div className="flex gap-2 justify-center">
            <button type="button" className="btn btn-primary text-[13px]" onClick={loadStats}>Retry</button>
            <Link to="/chat" className="btn btn-ghost text-[13px]">Back to chat</Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Dashboard ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-bg text-ink">
      <header className="border-b border-line bg-bg sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center gap-3">
          <Link to="/chat" className="p-1.5 rounded-sm text-ink-4 hover:text-ink hover:bg-paper-2 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-sm bg-teal-50 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1A5F7A" strokeWidth="1.8" strokeLinecap="round"><rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/></svg>
            </div>
            <h1 className="text-[15px] font-semibold text-ink">Admin Dashboard</h1>
          </div>
          {stats && (
            <span className="ml-2 text-[11px] text-ink-4 hidden sm:block">
              Updated {new Date(stats.timestamp).toLocaleTimeString()}
            </span>
          )}
          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
            <button
              type="button"
              onClick={loadStats}
              disabled={loading}
              className="p-1.5 rounded-sm text-ink-4 hover:text-ink hover:bg-paper-2 transition-colors disabled:opacity-40"
              title="Refresh"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className={loading ? 'animate-spin' : ''}>
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                <path d="M21 3v5h-5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                <path d="M8 16H3v5"/>
              </svg>
            </button>
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-4 flex border-t border-line/50">
          <button type="button" className={tabClass('overview')} onClick={() => handleTabChange('overview')}>Overview</button>
          <button type="button" className={tabClass('queries')} onClick={() => handleTabChange('queries')}>Recent Queries</button>
          <button type="button" className={tabClass('users')} onClick={() => handleTabChange('users')}>Users</button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Loading overlay while stats reload */}
        {loading && !stats && (
          <div className="flex items-center justify-center py-20">
            <svg className="w-6 h-6 animate-spin text-blue" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z"/>
            </svg>
          </div>
        )}

        {/* Overview */}
        {tab === 'overview' && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              <StatCard label="Registered Users" value={stats.users} />
              <StatCard label="Sessions" value={stats.sessions} sub={`${stats.recent_sessions_7d} in last 7 days`} />
              <StatCard label="Total Messages" value={stats.messages} />
              <StatCard label="AI Responses" value={stats.assistant_messages} />
              <StatCard label="User Messages" value={stats.messages - stats.assistant_messages} />
              <StatCard label="Indexed Documents" value={stats.indexed_documents} sub="Vector store chunks" />
            </div>

            <div className="card p-5">
              <h3 className="text-[13px] font-semibold text-ink mb-3">System Info</h3>
              <div className="space-y-2.5 text-[13px]">
                {[
                  ['Backend', 'FastAPI + Motor (MongoDB)'],
                  ['Vector Store', 'ChromaDB'],
                  ['Embedding Model', 'BAAI/bge-small-en-v1.5'],
                  ['LLM', 'Groq LLaMA 3.3-70b / Gemini 2.0 Flash'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-line/40 pb-2.5 last:border-0 last:pb-0">
                    <span className="text-ink-3">{k}</span>
                    <span className="text-ink font-mono">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Queries */}
        {tab === 'queries' && (
          <div className="space-y-3">
            {queries.length === 0 ? (
              <p className="text-[13px] text-ink-4 py-10 text-center">No queries found.</p>
            ) : (
              <>
                <p className="text-[12px] text-ink-4">{queries.length} most recent user messages</p>
                <div className="space-y-2">
                  {queries.map((q) => (
                    <div key={q.id} className="card p-3.5 hover:border-line-strong transition-colors">
                      <p className="text-[13px] text-ink leading-snug line-clamp-2">{q.content}</p>
                      <p className="text-[11px] text-ink-4 mt-1.5 font-mono">
                        {new Date(q.created_at).toLocaleString()} · {q.session_id.slice(0, 8)}…
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Users */}
        {tab === 'users' && (
          <div className="space-y-3">
            {users.length === 0 ? (
              <p className="text-[13px] text-ink-4 py-10 text-center">No users found.</p>
            ) : (
              <>
                <p className="text-[12px] text-ink-4">{users.length} registered users</p>
                <div className="card overflow-hidden">
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr className="border-b border-line bg-paper-2">
                        <th className="px-4 py-2.5 text-left font-medium text-ink-3">Email</th>
                        <th className="px-4 py-2.5 text-left font-medium text-ink-3">Joined</th>
                        <th className="px-4 py-2.5 text-left font-medium text-ink-3 font-mono">ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u, i) => (
                        <tr key={u.id} className={`border-b border-line/50 hover:bg-paper-2 transition-colors ${i % 2 ? 'bg-paper/50' : ''}`}>
                          <td className="px-4 py-2.5 text-ink">{u.email}</td>
                          <td className="px-4 py-2.5 text-ink-3">{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</td>
                          <td className="px-4 py-2.5 text-ink-4 font-mono text-[11px]">{u.id.slice(0, 12)}…</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPage;
