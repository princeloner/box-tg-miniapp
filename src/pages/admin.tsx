import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface UserStats {
  bestWin: string;
  totalWins: number;
  totalSpentTON: number;
  totalEarnedTON: number;
  totalCasesOpened: number;
}

interface UserData {
  userId: string;
  username: string;
  balance: number;
  stats: UserStats;
  referrals: string[];
  createdAt: string;
}

const defaultStats: UserStats = {
  bestWin: '',
  totalWins: 0,
  totalSpentTON: 0,
  totalEarnedTON: 0,
  totalCasesOpened: 0
};

export default function AdminPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [token, setToken] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [editingBalance, setEditingBalance] = useState<{userId: string, value: string} | null>(null);
  const router = useRouter();

  useEffect(() => {
    const savedToken = localStorage.getItem('adminToken');
    if (savedToken) {
      setToken(savedToken);
      fetchUsers(savedToken);
    }
  }, []);

  const fetchUsers = async (currentToken?: string) => {
    try {
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${currentToken || token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Убедимся, что у каждого пользователя есть все необходимые поля
        const processedData = (data || []).map((user: Partial<UserData>) => ({
          userId: user.userId || '',
          username: user.username || 'Unknown',
          balance: user.balance || 0,
          stats: {
            ...defaultStats,
            ...(user.stats || {})
          },
          referrals: user.referrals || [],
          createdAt: user.createdAt || new Date().toISOString()
        }));
        setUsers(processedData);
        setIsAuthorized(true);
        if (currentToken || token) {
          localStorage.setItem('adminToken', currentToken || token);
        }
      } else {
        setIsAuthorized(false);
        localStorage.removeItem('adminToken');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setIsAuthorized(false);
      localStorage.removeItem('adminToken');
    }
  };

  const updateBalance = async (userId: string, newBalance: number) => {
    if (!userId || isNaN(newBalance)) return;
    
    try {
      const response = await fetch('/api/admin/updateBalance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId, newBalance })
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.userId === userId ? { ...user, balance: updatedUser.balance } : user
          )
        );
        setEditingBalance(null);
      }
    } catch (error) {
      console.error('Error updating balance:', error);
    }
  };

  const handleLogin = () => {
    fetchUsers();
  };

  const handleLogout = () => {
    setIsAuthorized(false);
    setToken('');
    setUsers([]);
    localStorage.removeItem('adminToken');
  };

  const renderUserCard = (user: UserData) => {
    const isEditing = editingBalance?.userId === user.userId;
    
    return (
      <div key={user.userId} className="bg-[#2c2c2c] p-4 rounded-lg">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl mb-2">{user.username || 'Unknown'}</h2>
            <p>User ID: {user.userId}</p>
            <div className="flex items-center gap-2">
              <p>Balance: </p>
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={editingBalance?.value || '0'}
                    onChange={(e) => setEditingBalance({ 
                      userId: user.userId, 
                      value: e.target.value 
                    })}
                    className="w-24 p-1 bg-[#1c1c1c] rounded"
                  />
                  <button
                    onClick={() => updateBalance(user.userId, Number(editingBalance?.value || 0))}
                    className="bg-green-500 px-2 py-1 rounded text-sm"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => setEditingBalance(null)}
                    className="bg-red-500 px-2 py-1 rounded text-sm"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>{user.balance || 0} TON</span>
                  <button
                    onClick={() => setEditingBalance({ 
                      userId: user.userId, 
                      value: (user.balance || 0).toString() 
                    })}
                    className="bg-[#8B5CF6] px-2 py-1 rounded text-sm"
                  >
                    ✎
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            <p>Cases Opened: {user.stats?.totalCasesOpened || 0}</p>
            <p>Total Wins: {user.stats?.totalWins || 0}</p>
            <p>Best Win: {user.stats?.bestWin || 'None'}</p>
          </div>
        </div>
        <div className="mt-4">
          <p>Spent: {user.stats?.totalSpentTON || 0} TON</p>
          <p>Earned: {user.stats?.totalEarnedTON || 0} TON</p>
          <p>Referrals: {user.referrals?.length || 0}</p>
          <p>Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#1c1c1c] text-white p-6">
      {!isAuthorized ? (
        <div className="max-w-md mx-auto">
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Enter admin token"
            className="w-full p-2 bg-[#2c2c2c] rounded mb-4"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-[#8B5CF6] p-2 rounded"
          >
            Login
          </button>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl">Admin Dashboard</h1>
            <button
              onClick={handleLogout}
              className="bg-red-500 px-4 py-2 rounded"
            >
              Logout
            </button>
          </div>
          <div className="grid gap-4">
            {users.map(renderUserCard)}
          </div>
        </div>
      )}
    </div>
  );
} 