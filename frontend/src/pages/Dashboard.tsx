import { useState, useEffect } from 'react';

type Stat = {
  label: string;
  value: string;
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function Dashboard(): JSX.Element {
  const [stats, setStats] = useState<Stat[]>([
    { label: 'Certificates issued', value: '0' },
    { label: 'Active certificates', value: '0' },
    { label: 'Total verifications', value: '0' }
  ]);
  const [recentActivity, setRecentActivity] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [statsRes, certsRes] = await Promise.all([
          fetch(`${API_URL}/certificates/stats`),
          fetch(`${API_URL}/certificates`)
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          // The backend returns a nested data object due to the GlobalResponseInterceptor (if enabled)
          // or direct data if not. Based on my previous curl, it's wrapped in { data: ... }
          const s = statsData.data || statsData;
          setStats([
            { label: 'Certificates issued', value: s.totalCertificates?.toString() || '0' },
            { label: 'Active certificates', value: s.activeCertificates?.toString() || '0' },
            { label: 'Total verifications', value: s.verificationStats?.totalVerifications?.toString() || '0' }
          ]);
        }

        if (certsRes.ok) {
          const certsData = await certsRes.json();
          const certs = certsData.data || certsData;
          if (Array.isArray(certs)) {
            const activity = certs.slice(0, 3).map(c => `Issued ${c.certificateId} to ${c.recipientEmail}`);
            setRecentActivity(activity);
          }
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-white">Issuer Dashboard</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-300">
          Track issuance activity, verification performance, and recent exports in one place.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{stat.label}</p>
            <p className="mt-3 text-3xl font-semibold text-white">
              {loading ? '...' : stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-lg font-semibold text-white">Recent activity</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            {recentActivity.length > 0 ? (
              recentActivity.map((item) => (
                <div key={item} className="rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3">
                  {item}
                </div>
              ))
            ) : (
              <p className="text-slate-400 italic">No recent activity found.</p>
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-6">
          <h3 className="text-lg font-semibold text-white">Quick actions</h3>
          <div className="mt-4 space-y-3">
            {['Create new certificate', 'Invite issuer', 'Export PDF batch'].map((item) => (
              <button
                key={item}
                type="button"
                className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-left text-sm text-white transition hover:border-primary"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
