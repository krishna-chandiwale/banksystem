/**
 * Apex Banking Management System - API Client Integration
 * Connects frontend views with Spring Boot REST Controllers on /api/**
 */

const API_BASE = (window.location.port === '8080' || window.location.port === '')
  ? '/api'
  : 'http://localhost:8080/api';

const BankAPI = {
  // Determine if backend API is reachable
  async ping() {
    try {
      const res = await fetch(`${API_BASE}/account/details?email=alex.morgan@college.edu`, { method: 'GET' });
      return res.ok;
    } catch (e) {
      return false;
    }
  },

  // Authentication: Login
  async login(email, password) {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      return data;
    } catch (err) {
      console.warn('Backend API unavailable or error, checking local store:', err.message);
      throw err;
    }
  },

  // Authentication: Registration
  async register(registerData) {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      return data;
    } catch (err) {
      console.warn('Backend API registration error:', err.message);
      throw err;
    }
  },

  // Account: Details & Summary
  async getAccountDetails(email) {
    try {
      const res = await fetch(`${API_BASE}/account/details?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Could not load account details');
      return data.data;
    } catch (err) {
      console.warn('Backend API account details error:', err.message);
      return null;
    }
  },

  // Account: Update Profile
  async updateProfile(email, profileData) {
    try {
      const res = await fetch(`${API_BASE}/auth/profile?email=${encodeURIComponent(email)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Could not update profile');
      return data;
    } catch (err) {
      console.warn('Backend API update profile error:', err.message);
      throw err;
    }
  },

  // Transactions: Deposit
  async deposit(email, amount, description) {
    try {
      const res = await fetch(`${API_BASE}/transactions/deposit?email=${encodeURIComponent(email)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          depositMethod: 'ONLINE',
          description: description || 'Online Deposit'
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Deposit failed');
      return data;
    } catch (err) {
      console.warn('Backend API deposit error:', err.message);
      throw err;
    }
  },

  // Transactions: Withdraw
  async withdraw(email, amount, description) {
    try {
      const res = await fetch(`${API_BASE}/transactions/withdraw?email=${encodeURIComponent(email)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          withdrawalChannel: 'ATM',
          description: description || 'Cash Withdrawal'
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Withdrawal failed');
      return data;
    } catch (err) {
      console.warn('Backend API withdrawal error:', err.message);
      throw err;
    }
  },

  // Transactions: Transfer
  async transfer(email, targetAccountNumber, amount, description, saveBeneficiary) {
    try {
      const res = await fetch(`${API_BASE}/transactions/transfer?email=${encodeURIComponent(email)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetAccountNumber,
          amount: parseFloat(amount),
          description: description || 'P2P Fund Transfer',
          saveBeneficiary: !!saveBeneficiary
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Transfer failed');
      return data;
    } catch (err) {
      console.warn('Backend API transfer error:', err.message);
      throw err;
    }
  },

  // Transactions: History Statement
  async getTransactionHistory(email) {
    try {
      const res = await fetch(`${API_BASE}/transactions/history?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to retrieve transaction history');
      return data.data;
    } catch (err) {
      console.warn('Backend API history error:', err.message);
      return null;
    }
  },

  // Transactions: Delete Record
  async deleteTransaction(id) {
    try {
      const res = await fetch(`${API_BASE}/transactions/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete transaction record');
      return data;
    } catch (err) {
      console.warn('Backend API delete txn error:', err.message);
      throw err;
    }
  },

  // Beneficiaries
  async getBeneficiaries(email) {
    try {
      const res = await fetch(`${API_BASE}/beneficiaries?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to retrieve beneficiaries');
      return data.data;
    } catch (err) {
      console.warn('Backend API beneficiaries error:', err.message);
      return null;
    }
  },

  async deleteBeneficiary(id) {
    try {
      const res = await fetch(`${API_BASE}/beneficiaries/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to remove beneficiary');
      return data;
    } catch (err) {
      console.warn('Backend API delete beneficiary error:', err.message);
      throw err;
    }
  },

  // Admin: Get Customer Directory
  async getAdminUsers() {
    try {
      const res = await fetch(`${API_BASE}/admin/users`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to retrieve customers');
      return data.data;
    } catch (err) {
      console.warn('Backend API admin users error:', err.message);
      return null;
    }
  },

  // Admin: Update Status (Active/Inactive)
  async updateUserStatus(userId, status) {
    try {
      const res = await fetch(`${API_BASE}/admin/users/${userId}/status?status=${status}`, {
        method: 'PUT'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Status update failed');
      return data;
    } catch (err) {
      console.warn('Backend API admin status error:', err.message);
      throw err;
    }
  },

  // Admin: Delete Customer Account (Safety enforced in backend: balance must be 0)
  async deleteCustomer(userId) {
    try {
      const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Account deletion failed');
      return data;
    } catch (err) {
      console.warn('Backend API admin delete user error:', err.message);
      throw err;
    }
  },

  // Admin: System Statistics
  async getAdminStats() {
    try {
      const res = await fetch(`${API_BASE}/admin/stats`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to retrieve stats');
      return data.data;
    } catch (err) {
      console.warn('Backend API stats error:', err.message);
      return null;
    }
  }
};

window.BankAPI = BankAPI;
