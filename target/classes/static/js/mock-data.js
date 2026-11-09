/**
 * Banking Management System - Simulated Mock Data Store
 * Corporate Banking Standard Store with Soft-Deletion and Audit Protection
 */

const DEFAULT_BANK_DATA = {
  customer: {
    fullName: "Alex Morgan",
    email: "alex.morgan@college.edu",
    phone: "+1 (555) 382-9012",
    accountNumber: "ACT88204910",
    accountType: "SAVINGS",
    balance: 24850.75,
    monthlyIncome: 6500.00,
    monthlyExpense: 2140.25,
    savingsGoal: 30000.00,
    status: "ACTIVE"
  },
  beneficiaries: [
    {
      id: "ben-1",
      name: "Sophia Reynolds",
      accountNumber: "ACT77391022",
      bankName: "Apex Retail Banking",
      dateAdded: "2026-10-12"
    },
    {
      id: "ben-2",
      name: "David Kim",
      accountNumber: "ACT66289104",
      bankName: "Metropolitan Financial",
      dateAdded: "2026-10-20"
    },
    {
      id: "ben-3",
      name: "Landlord Asset Mgmt",
      accountNumber: "ACT49012891",
      bankName: "Apex Corporate Branch",
      dateAdded: "2026-09-01"
    }
  ],
  notificationPreferences: [
    { id: "pref-1", title: "Instant SMS Transfer Alerts", enabled: true, removable: false },
    { id: "pref-2", title: "Monthly Electronic PDF Statements", enabled: true, removable: true },
    { id: "pref-3", title: "Promotional Loan Rate Notifications", enabled: false, removable: true }
  ],
  transactions: [
    {
      id: 1,
      ref: "TXN-904128",
      type: "DEPOSIT",
      amount: 4500.00,
      balanceAfter: 24850.75,
      description: "Direct Payroll Deposit - Tech Corp",
      date: "2026-11-05 10:30:15",
      status: "SUCCESS"
    },
    {
      id: 2,
      ref: "TXN-883921",
      type: "TRANSFER",
      amount: 1200.00,
      balanceAfter: 20350.75,
      description: "Rent Transfer to Landlord Asset Mgmt (ACT49012891)",
      date: "2026-11-03 14:12:00",
      status: "SUCCESS"
    },
    {
      id: 3,
      ref: "TXN-773829",
      type: "WITHDRAWAL",
      amount: 350.00,
      balanceAfter: 21550.75,
      description: "ATM Cash Withdrawal - Main Branch ATM",
      date: "2026-11-01 18:45:22",
      status: "SUCCESS"
    },
    {
      id: 4,
      ref: "TXN-662910",
      type: "DEPOSIT",
      amount: 250.00,
      balanceAfter: 21900.75,
      description: "Cash Deposit at Branch Counter",
      date: "2026-10-28 11:20:00",
      status: "SUCCESS"
    },
    {
      id: 5,
      ref: "TXN-551982",
      type: "TRANSFER",
      amount: 150.00,
      balanceAfter: 21650.75,
      description: "Utility Bill - City Power & Water",
      date: "2026-10-25 09:15:40",
      status: "SUCCESS"
    },
    {
      id: 6,
      ref: "TXN-442871",
      type: "WITHDRAWAL",
      amount: 80.00,
      balanceAfter: 21800.75,
      description: "Point of Sale - University Bookstore",
      date: "2026-10-20 16:05:10",
      status: "SUCCESS"
    }
  ],
  adminCustomers: [
    { id: 101, name: "Alex Morgan", accNo: "ACT88204910", type: "SAVINGS", balance: 24850.75, status: "ACTIVE", email: "alex.morgan@college.edu", isDemo: false },
    { id: 102, name: "Sophia Reynolds", accNo: "ACT77391022", type: "CURRENT", balance: 14200.00, status: "ACTIVE", email: "sophia.r@techmail.com", isDemo: false },
    { id: 103, name: "David Kim", accNo: "ACT66289104", type: "SAVINGS", balance: 8350.50, status: "PENDING", email: "david.kim@designhub.io", isDemo: false },
    { id: 104, name: "Emma Watson", accNo: "ACT55198230", type: "SAVINGS", balance: 0.00, status: "INACTIVE", email: "emma.w@global.org", isDemo: true },
    { id: 105, name: "Test Demo User", accNo: "ACT10099881", type: "SAVINGS", balance: 0.00, status: "INACTIVE", email: "demo.inactive@test.com", isDemo: true },
    { id: 106, name: "Michael Vance", accNo: "ACT44087192", type: "CURRENT", balance: 39400.00, status: "ACTIVE", email: "vance.m@enterprise.net", isDemo: false }
  ]
};

function getBankData() {
  const stored = localStorage.getItem("bms_corporate_store");
  if (!stored) {
    localStorage.setItem("bms_corporate_store", JSON.stringify(DEFAULT_BANK_DATA));
    return DEFAULT_BANK_DATA;
  }
  return JSON.parse(stored);
}

function saveBankData(data) {
  localStorage.setItem("bms_corporate_store", JSON.stringify(data));
}

function formatUSD(num) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
}
