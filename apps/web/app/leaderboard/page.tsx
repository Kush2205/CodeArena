'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, isAdmin } from '../hooks/useAuth';
import Loader from '../ui/Loader';

interface LeaderboardEntry {
  rank: number;
  userId: number;
  name: string;
  email: string;
  role: string;
  totalPoints: number;
  completedSubmissions: number;
  totalSubmissions: number;
}

export default function LeaderboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/signin');
        return;
      }

      if (!isAdmin(user)) {
        router.push('/contests');
        return;
      }

      fetchLeaderboard();
    }
  }, [authLoading, isAuthenticated, user, router]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/leaderboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }

      const data = await response.json();
      setLeaderboard(data.leaderboard);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-red-600 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-black mb-4">Admin Leaderboard</h1>
          <button
            onClick={() => router.push('/contests')}
            className="px-6 py-2 border-2 border-black bg-white hover:bg-black hover:text-white transition-colors font-bold"
          >
            Back to Contests
          </button>
        </div>

        <div className="border-2 border-black bg-neutral-50 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-black bg-white">
                  <th className="px-6 py-4 text-left font-bold text-black">Rank</th>
                  <th className="px-6 py-4 text-left font-bold text-black">Name</th>
                  <th className="px-6 py-4 text-left font-bold text-black">Email</th>
                  <th className="px-6 py-4 text-left font-bold text-black">Role</th>
                  <th className="px-6 py-4 text-left font-bold text-black">Total Points</th>
                  <th className="px-6 py-4 text-left font-bold text-black">Completed</th>
                  <th className="px-6 py-4 text-left font-bold text-black">Total Submissions</th>
                  <th className="px-6 py-4 text-left font-bold text-black">Success Rate</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-600">
                      No submissions yet
                    </td>
                  </tr>
                ) : (
                  leaderboard.map((entry) => {
                    const successRate = entry.totalSubmissions > 0
                      ? ((entry.completedSubmissions / entry.totalSubmissions) * 100).toFixed(1)
                      : '0.0';
                    
                    return (
                      <tr
                        key={entry.userId}
                        className="border-b-2 border-black hover:bg-yellow-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span className={`font-bold ${
                            entry.rank === 1 ? 'text-yellow-600 text-2xl' :
                            entry.rank === 2 ? 'text-gray-500 text-xl' :
                            entry.rank === 3 ? 'text-amber-700 text-lg' :
                            'text-black'
                          }`}>
                            {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : entry.rank}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-black">{entry.name}</td>
                        <td className="px-6 py-4 text-gray-700">{entry.email}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 border border-black text-xs font-bold ${
                            entry.role === 'admin' ? 'bg-red-200' : 'bg-blue-200'
                          }`}>
                            {entry.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-green-700 text-lg">
                          {entry.totalPoints}
                        </td>
                        <td className="px-6 py-4 text-black">{entry.completedSubmissions}</td>
                        <td className="px-6 py-4 text-black">{entry.totalSubmissions}</td>
                        <td className="px-6 py-4 text-black">{successRate}%</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {leaderboard.length > 0 && (
          <div className="mt-8 p-6 border-2 border-black bg-neutral-50 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-2xl font-bold text-black mb-4">Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border-2 border-black bg-white">
                <div className="text-sm text-gray-600">Total Users</div>
                <div className="text-3xl font-bold text-black">{leaderboard.length}</div>
              </div>
              <div className="p-4 border-2 border-black bg-white">
                <div className="text-sm text-gray-600">Total Points Awarded</div>
                <div className="text-3xl font-bold text-green-700">
                  {leaderboard.reduce((sum, entry) => sum + entry.totalPoints, 0)}
                </div>
              </div>
              <div className="p-4 border-2 border-black bg-white">
                <div className="text-sm text-gray-600">Total Submissions</div>
                <div className="text-3xl font-bold text-black">
                  {leaderboard.reduce((sum, entry) => sum + entry.totalSubmissions, 0)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
