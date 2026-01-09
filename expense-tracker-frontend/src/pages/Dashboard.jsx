import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Wallet, TrendingUp, TrendingDown, Target, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { format } from 'date-fns';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    accountCount: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [accountsRes, transactionsRes] = await Promise.all([
        api.get('/accounts'),
        api.get('/transactions'),
      ]);

      const accounts = accountsRes.data;
      const transactions = transactionsRes.data.slice(0, 5);

      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      
      const monthTransactions = transactionsRes.data.filter((t) => {
        const date = new Date(t.createdAt);
        return date.getMonth() + 1 === currentMonth && date.getFullYear() === currentYear;
      });

      const totalIncome = monthTransactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const totalExpense = monthTransactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const balance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);

      setStats({
        totalIncome,
        totalExpense,
        balance,
        accountCount: accounts.length,
      });

      setRecentTransactions(transactions);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Balance',
      value: `$${stats.balance.toFixed(2)}`,
      icon: Wallet,
      color: 'bg-blue-500',
      change: null,
    },
    {
      title: 'This Month Income',
      value: `$${stats.totalIncome.toFixed(2)}`,
      icon: TrendingUp,
      color: 'bg-green-500',
      change: '+12%',
    },
    {
      title: 'This Month Expense',
      value: `$${stats.totalExpense.toFixed(2)}`,
      icon: TrendingDown,
      color: 'bg-red-500',
      change: '-5%',
    },
    {
      title: 'Total Accounts',
      value: stats.accountCount,
      icon: Target,
      color: 'bg-purple-500',
      change: null,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's your financial overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  {stat.change && (
                    <p className={`text-sm mt-1 ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change}
                    </p>
                  )}
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
          <a href="/transactions" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View all
          </a>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No transactions yet. Start by adding your first transaction!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-2 rounded-lg ${
                      transaction.type === 'income'
                        ? 'bg-green-100 text-green-600'
                        : transaction.type === 'expense'
                        ? 'bg-red-100 text-red-600'
                        : 'bg-blue-100 text-blue-600'
                    }`}
                  >
                    {transaction.type === 'income' ? (
                      <ArrowUpRight size={20} />
                    ) : transaction.type === 'expense' ? (
                      <ArrowDownRight size={20} />
                    ) : (
                      <ArrowUpRight size={20} />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {transaction.note || `${transaction.type} transaction`}
                    </p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(transaction.createdAt), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-bold ${
                      transaction.type === 'income'
                        ? 'text-green-600'
                        : transaction.type === 'expense'
                        ? 'text-red-600'
                        : 'text-blue-600'
                    }`}
                  >
                    {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500 capitalize">{transaction.type}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
