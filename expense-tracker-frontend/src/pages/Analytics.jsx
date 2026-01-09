import { useState, useEffect } from 'react';
import api from '../utils/api';
import { BarChart3, PieChart, TrendingUp, Calendar } from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const Analytics = () => {
  const [expenseByCategory, setExpenseByCategory] = useState([]);
  const [accountAnalysis, setAccountAnalysis] = useState([]);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const COLORS = [
    '#0ea5e9',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#ec4899',
    '#06b6d4',
    '#84cc16',
    '#f97316',
    '#6366f1',
  ];

  useEffect(() => {
    fetchAnalytics();
  }, [selectedMonth, selectedYear]);

  const fetchAnalytics = async () => {
    try {
      const [expenseRes, accountRes, categoriesRes, accountsRes] = await Promise.all([
        api.get(`/analytics/expense-by-category?month=${selectedMonth}&year=${selectedYear}`),
        api.get(`/analytics/account-analysis?month=${selectedMonth}&year=${selectedYear}`),
        api.get('/categories'),
        api.get('/accounts'),
      ]);

      setExpenseByCategory(expenseRes.data);
      setAccountAnalysis(accountRes.data);
      setCategories(categoriesRes.data);
      setAccounts(accountsRes.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMonthName = (month) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    return months[month - 1];
  };

  // Prepare expense by category data
  const expenseChartData = expenseByCategory.map((item) => {
    const category = categories.find((c) => c.id === item.categoryId);
    return {
      name: category?.name || 'Unknown',
      amount: item._sum.amount || 0,
      icon: category?.icon || '📁',
    };
  });

  // Prepare account analysis data
  const accountChartData = accounts.map((account) => {
    const accountData = accountAnalysis.filter((a) => a.accountId === account.id);
    const income = accountData.find((a) => a.type === 'income')?._sum.amount || 0;
    const expense = accountData.find((a) => a.type === 'expense')?._sum.amount || 0;

    return {
      name: account.name,
      income,
      expense,
      net: income - expense,
    };
  });

  // Calculate totals
  const totalIncome = accountChartData.reduce((sum, item) => sum + item.income, 0);
  const totalExpense = accountChartData.reduce((sum, item) => sum + item.expense, 0);
  const netAmount = totalIncome - totalExpense;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">Visualize your financial data and trends</p>
        </div>
      </div>

      {/* Month/Year Selector */}
      <div className="card">
        <div className="flex items-center gap-4">
          <Calendar className="text-gray-600" size={20} />
          <div className="flex items-center gap-3">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="input-field w-auto"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                <option key={month} value={month}>
                  {getMonthName(month)}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="input-field w-auto"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(
                (year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                )
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Income</p>
              <p className="text-2xl font-bold text-green-600">${totalIncome.toFixed(2)}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Expense</p>
              <p className="text-2xl font-bold text-red-600">${totalExpense.toFixed(2)}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <BarChart3 className="text-red-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Net Amount</p>
              <p
                className={`text-2xl font-bold ${
                  netAmount >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                ${netAmount.toFixed(2)}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${netAmount >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              <PieChart className={netAmount >= 0 ? 'text-green-600' : 'text-red-600'} size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Expense by Category Chart */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Expenses by Category</h2>
        {expenseChartData.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <PieChart className="mx-auto mb-4 text-gray-400" size={48} />
            <p>No expense data for {getMonthName(selectedMonth)} {selectedYear}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={expenseChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {expenseChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {expenseChartData.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{item.icon}</div>
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        {((item.amount / totalExpense) * 100).toFixed(1)}% of total
                      </p>
                    </div>
                  </div>
                  <p className="font-bold text-gray-900">${item.amount.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Account Analysis Chart */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Account Analysis</h2>
        {accountChartData.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <BarChart3 className="mx-auto mb-4 text-gray-400" size={48} />
            <p>No account data for {getMonthName(selectedMonth)} {selectedYear}</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={accountChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
              <Legend />
              <Bar dataKey="income" fill="#10b981" name="Income" />
              <Bar dataKey="expense" fill="#ef4444" name="Expense" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Account Details Table */}
      {accountChartData.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Account Breakdown</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Account</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Income</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Expense</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Net</th>
                </tr>
              </thead>
              <tbody>
                {accountChartData.map((account, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{account.name}</td>
                    <td className="py-3 px-4 text-right text-green-600">
                      ${account.income.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right text-red-600">
                      ${account.expense.toFixed(2)}
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-bold ${
                        account.net >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      ${account.net.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
