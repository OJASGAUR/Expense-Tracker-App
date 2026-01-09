import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Plus, Trash2, Wallet } from 'lucide-react';

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', icon: '💰', initialBalance: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await api.get('/accounts');
      setAccounts(response.data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Create the account
      const accountResponse = await api.post('/accounts', {
        name: formData.name,
        icon: formData.icon,
      });
      
      const accountId = accountResponse.data.id;
      
      // If initial balance is provided, create an initial transaction
      if (formData.initialBalance && parseFloat(formData.initialBalance) > 0) {
        const initialAmount = parseFloat(formData.initialBalance);
        
        // Get categories to find an income category (or create a default one)
        const categoriesResponse = await api.get('/categories');
        const incomeCategories = categoriesResponse.data.filter((c) => c.type === 'income');
        
        let categoryId = null;
        if (incomeCategories.length > 0) {
          // Use the first income category
          categoryId = incomeCategories[0].id;
        } else {
          // Create a default "Initial Balance" income category if none exists
          try {
            const defaultCategory = await api.post('/categories', {
              name: 'Initial Balance',
              icon: '💰',
              type: 'income',
            });
            categoryId = defaultCategory.data.id;
          } catch (error) {
            console.error('Error creating default category:', error);
          }
        }
        
        // Create initial balance transaction
        if (categoryId) {
          await api.post('/transactions', {
            amount: initialAmount,
            type: 'income',
            note: 'Initial balance',
            accountId: accountId,
            categoryId: categoryId,
          });
        }
      }
      
      setShowModal(false);
      setFormData({ name: '', icon: '💰', initialBalance: '' });
      fetchAccounts();
    } catch (error) {
      console.error('Error creating account:', error);
      alert(error.response?.data?.error || 'Failed to create account');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this account?')) return;

    try {
      await api.delete(`/accounts/${id}`);
      fetchAccounts();
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account');
    }
  };

  const commonIcons = ['💰', '💳', '🏦', '💵', '💸', '💴', '💶', '💷', '💎', '📊'];

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
          <h1 className="text-3xl font-bold text-gray-900">Accounts</h1>
          <p className="text-gray-600 mt-1">Manage your financial accounts</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add Account
        </button>
      </div>

      {accounts.length === 0 ? (
        <div className="card text-center py-12">
          <Wallet className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600 mb-4">No accounts yet. Create your first account to get started!</p>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            Create Account
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account) => (
            <div key={account.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{account.icon || '💰'}</div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{account.name}</h3>
                    <p className="text-sm text-gray-500">Account</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(account.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Balance</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${account.balance?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Account Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Account</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="input-field"
                  placeholder="e.g., Cash, Bank Account"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icon
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {commonIcons.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon })}
                      className={`text-2xl p-2 rounded-lg border-2 transition-colors ${
                        formData.icon === icon
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="input-field"
                  placeholder="Or enter custom emoji"
                  maxLength={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Initial Balance (Optional)
                </label>
                <p className="text-xs text-gray-500 mb-2 italic">
                  Set the starting balance for this account. Leave empty to start at $0.00
                </p>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.initialBalance}
                  onChange={(e) => setFormData({ ...formData, initialBalance: e.target.value })}
                  className="input-field"
                  placeholder="0.00"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({ name: '', icon: '💰', initialBalance: '' });
                  }}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 btn-primary disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounts;
