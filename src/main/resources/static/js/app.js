/**
 * Apex Banking Management System - Core Frontend Application Engine
 * Premium Fintech Experience with Real-Time Spring Boot REST Sync
 */

// Global User Context
function getCurrentUserEmail() {
  return sessionStorage.getItem('currentUserEmail') || 'alex.morgan@college.edu';
}

function setCurrentUserEmail(email) {
  sessionStorage.setItem('currentUserEmail', email);
}

// Currency Formatter
function formatUSD(num) {
  if (num === null || num === undefined || isNaN(num)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
}

// Universal Modal Confirmation Dialog
function showConfirmDialog({ title, message, confirmText = 'Confirm', confirmClass = 'btn-danger', onConfirm }) {
  let backdrop = document.getElementById('globalConfirmModal');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.id = 'globalConfirmModal';
    backdrop.className = 'modal-backdrop';
    backdrop.innerHTML = `
      <div class="modal-box">
        <div class="modal-icon-warning">
          <svg width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
        </div>
        <h3 class="modal-title" id="modalTitle">Confirm Action</h3>
        <p class="modal-desc" id="modalDesc">Are you sure you want to proceed?</p>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" id="modalCancelBtn">Cancel</button>
          <button type="button" class="btn ${confirmClass}" id="modalActionBtn">Confirm</button>
        </div>
      </div>
    `;
    document.body.appendChild(backdrop);
  }

  const modalTitle = document.getElementById('modalTitle');
  const modalDesc = document.getElementById('modalDesc');
  const actionBtn = document.getElementById('modalActionBtn');
  const cancelBtn = document.getElementById('modalCancelBtn');

  modalTitle.textContent = title;
  modalDesc.textContent = message;
  actionBtn.textContent = confirmText;
  actionBtn.className = `btn ${confirmClass}`;

  const closeModal = () => {
    backdrop.classList.remove('active');
  };

  cancelBtn.onclick = closeModal;
  backdrop.onclick = (e) => {
    if (e.target === backdrop) closeModal();
  };

  actionBtn.onclick = () => {
    closeModal();
    if (typeof onConfirm === 'function') onConfirm();
  };

  backdrop.classList.add('active');
}

// Toast Notifications
function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
      ${type === 'success'
        ? '<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>'
        : (type === 'info'
            ? '<path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>'
            : '<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>')}
    </svg>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'slideIn 0.25s ease reverse forwards';
    setTimeout(() => toast.remove(), 250);
  }, 4000);
}

// Helpers
function getNowFormatted() {
  const d = new Date();
  return d.toISOString().replace('T', ' ').substring(0, 19);
}

function generateTxnRef() {
  return 'TXN-' + Math.floor(100000 + Math.random() * 900000);
}

function initMobileToggle() {
  const toggleBtn = document.querySelector('.mobile-toggle');
  const sidebar = document.querySelector('.sidebar');
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }
}

// Synchronize Customer Details across UI from Spring Boot REST API
async function syncCustomerUI() {
  const email = getCurrentUserEmail();

  // Try fetching live data from backend API
  try {
    const liveAccount = await BankAPI.getAccountDetails(email);
    if (liveAccount) {
      applyCustomerDataToDOM({
        fullName: liveAccount.fullName,
        email: liveAccount.email,
        phone: liveAccount.phone,
        accountNumber: liveAccount.accountNumber,
        accountType: liveAccount.accountType,
        balance: liveAccount.balance,
        status: liveAccount.status
      });

      // Update local storage cache
      if (typeof getBankData === 'function' && typeof saveBankData === 'function') {
        const local = getBankData();
        local.customer.fullName = liveAccount.fullName;
        local.customer.email = liveAccount.email;
        local.customer.phone = liveAccount.phone;
        local.customer.accountNumber = liveAccount.accountNumber;
        local.customer.accountType = liveAccount.accountType;
        local.customer.balance = liveAccount.balance;
        local.customer.status = liveAccount.status;
        saveBankData(local);
      }
    } else {
      loadFallbackLocalData();
    }
  } catch (e) {
    console.warn('API sync fallback to local cache:', e);
    loadFallbackLocalData();
  }

  // Load Beneficiaries & Transactions
  await renderBeneficiaryList();
  if (document.getElementById('transactionRows')) {
    await renderTransactions(window.currentTxFilter || 'ALL');
  }
}

function loadFallbackLocalData() {
  if (typeof getBankData === 'function') {
    const data = getBankData();
    applyCustomerDataToDOM(data.customer);
  }
}

function applyCustomerDataToDOM(c) {
  if (!c) return;
  document.querySelectorAll('.val-balance').forEach(el => el.textContent = formatUSD(c.balance));
  document.querySelectorAll('.val-income').forEach(el => el.textContent = formatUSD(c.monthlyIncome || (c.balance * 0.25)));
  document.querySelectorAll('.val-expense').forEach(el => el.textContent = formatUSD(c.monthlyExpense || (c.balance * 0.12)));
  document.querySelectorAll('.val-savings').forEach(el => el.textContent = formatUSD(c.savingsGoal || 30000));
  document.querySelectorAll('.val-accno').forEach(el => el.textContent = c.accountNumber);
  document.querySelectorAll('.val-name').forEach(el => el.textContent = c.fullName);
  document.querySelectorAll('.val-email').forEach(el => el.textContent = c.email);
  document.querySelectorAll('.val-phone').forEach(el => el.textContent = c.phone || '+1 (555) 000-0000');
  document.querySelectorAll('.val-acctype').forEach(el => el.textContent = (c.accountType || 'SAVINGS') + ' ACCOUNT');
  document.querySelectorAll('.val-source-acc').forEach(el => {
    el.value = `${c.accountNumber} (${c.fullName} - ${c.accountType || 'SAVINGS'})`;
  });
  
  // Avatar initials
  const initials = (c.fullName || 'User').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  document.querySelectorAll('.user-avatar.val-name, .val-initials').forEach(el => el.textContent = initials);
}

// Render Saved Beneficiaries
async function renderBeneficiaryList() {
  const container = document.getElementById('beneficiaryList');
  if (!container) return;

  const email = getCurrentUserEmail();
  let list = [];

  try {
    const liveBeneficiaries = await BankAPI.getBeneficiaries(email);
    if (liveBeneficiaries && liveBeneficiaries.length > 0) {
      list = liveBeneficiaries.map(b => ({
        id: b.id,
        name: b.name,
        accountNumber: b.accountNumber,
        bankName: b.bankName || 'Apex Banking Network'
      }));
    }
  } catch (err) {
    console.warn('Could not load live beneficiaries, using local list:', err);
  }

  if (list.length === 0 && typeof getBankData === 'function') {
    list = getBankData().beneficiaries || [];
  }

  if (list.length === 0) {
    container.innerHTML = `<div style="color: var(--text-muted); font-size: 0.85rem; padding: 18px 0; text-align: center;">No saved payees registered.</div>`;
    return;
  }

  container.innerHTML = list.map(b => `
    <div class="beneficiary-item">
      <div style="display: flex; align-items: center; gap: 12px;">
        <div class="beneficiary-avatar">${(b.name || 'P').split(' ').map(n=>n[0]).join('').substring(0,2)}</div>
        <div>
          <div style="font-weight: 700; font-size: 0.9rem; color: var(--navy-950);">${b.name}</div>
          <div style="font-size: 0.78rem; color: var(--text-muted);">${b.bankName || 'Apex Network'} • <span style="font-family: var(--font-mono); font-weight: 600;">${b.accountNumber}</span></div>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 8px;">
        <button type="button" class="btn btn-secondary btn-sm" onclick="selectBeneficiary('${b.accountNumber}')" title="Transfer to this account">Pay</button>
      </div>
    </div>
  `).join('');
}

// Select Beneficiary for Transfer
function selectBeneficiary(accNo) {
  const input = document.getElementById('targetAccount');
  if (input) {
    input.value = accNo;
    showToast(`Recipient account ${accNo} selected!`, 'success');
  }
}

// Render Transactions from Spring Boot / JPA Database
async function renderTransactions(filterType = 'ALL') {
  const tableBody = document.getElementById('transactionRows');
  if (!tableBody) return;

  window.currentTxFilter = filterType;
  const email = getCurrentUserEmail();
  let list = [];

  try {
    const liveTxns = await BankAPI.getTransactionHistory(email);
    if (liveTxns && liveTxns.length > 0) {
      list = liveTxns.map(t => ({
        id: t.id,
        ref: t.transactionRef || t.ref,
        type: t.transactionType || t.type,
        amount: t.amount,
        balanceAfter: t.balanceAfter,
        description: t.description,
        date: (t.transactionDate || t.date || '').replace('T', ' ').substring(0, 19),
        status: t.status || 'SUCCESS'
      }));
    }
  } catch (e) {
    console.warn('Failed to fetch live transactions, using fallback:', e);
  }

  if (list.length === 0 && typeof getBankData === 'function') {
    list = getBankData().transactions || [];
  }

  if (filterType !== 'ALL') {
    list = list.filter(t => t.type === filterType);
  }

  const isStatementPage = window.location.pathname.includes('transactions.html');

  if (list.length === 0) {
    const colSpan = isStatementPage ? 7 : 6;
    tableBody.innerHTML = `<tr><td colspan="${colSpan}" style="text-align: center; color: var(--text-muted); padding: 32px; font-size: 0.9rem;">No matching transactions recorded.</td></tr>`;
    return;
  }

  tableBody.innerHTML = list.map(t => {
    const isCredit = t.type === 'DEPOSIT';
    const sign = isCredit ? '+' : '-';
    const amountClass = isCredit ? 'amount-positive' : 'amount-negative';
    const badgeType = isCredit ? 'badge-success' : (t.type === 'TRANSFER' ? 'badge-info' : 'badge-danger');

    return `
      <tr>
        <td><span class="tx-ref">${t.ref}</span></td>
        <td><span class="badge ${badgeType}">${t.type}</span></td>
        <td><span style="font-weight: 500;">${t.description}</span></td>
        <td><span style="color: var(--text-muted); font-size: 0.82rem; font-family: var(--font-mono);">${t.date}</span></td>
        <td><span class="${amountClass}">${sign}${formatUSD(t.amount)}</span></td>
        ${isStatementPage ? `<td><span style="font-family: var(--font-mono); font-weight: 600;">${formatUSD(t.balanceAfter)}</span></td>` : ''}
        <td style="text-align: right;">
          <span class="badge badge-success" style="font-size: 0.72rem;">Verified</span>
        </td>
      </tr>
    `;
  }).join('');
}

// Deposit Money Handler (Calls Spring Boot Backend /api/transactions/deposit)
async function handleDeposit(e) {
  e.preventDefault();
  const amountInput = document.getElementById('depositAmount');
  const amount = parseFloat(amountInput.value);
  const note = document.getElementById('depositNote')?.value || 'Online Account Deposit';

  if (isNaN(amount) || amount <= 0) {
    showToast('Please enter a valid deposit amount greater than $0.', 'error');
    return;
  }

  const submitBtn = e.target.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing Deposit...';
  }

  const email = getCurrentUserEmail();

  try {
    const res = await BankAPI.deposit(email, amount, note);
    showToast(`Successfully deposited ${formatUSD(amount)} into your account!`, 'success');
    amountInput.value = '';
    if (document.getElementById('depositNote')) document.getElementById('depositNote').value = '';
    await syncCustomerUI();
  } catch (err) {
    showToast(`Deposit failed: ${err.message}`, 'error');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `Complete Deposit <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>`;
    }
  }
}

// Withdraw Money Handler (Calls Spring Boot Backend /api/transactions/withdraw)
async function handleWithdraw(e) {
  e.preventDefault();
  const amountInput = document.getElementById('withdrawAmount');
  const amount = parseFloat(amountInput.value);
  const note = document.getElementById('withdrawNote')?.value || 'Cash Counter / ATM Withdrawal';

  if (isNaN(amount) || amount <= 0) {
    showToast('Please enter a valid withdrawal amount.', 'error');
    return;
  }

  const submitBtn = e.target.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing Withdrawal...';
  }

  const email = getCurrentUserEmail();

  try {
    const res = await BankAPI.withdraw(email, amount, note);
    showToast(`Successfully withdrew ${formatUSD(amount)} from your account!`, 'success');
    amountInput.value = '';
    if (document.getElementById('withdrawNote')) document.getElementById('withdrawNote').value = '';
    await syncCustomerUI();
  } catch (err) {
    showToast(`Withdrawal rejected: ${err.message}`, 'error');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `Confirm Cash Withdrawal <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>`;
    }
  }
}

// Transfer Money Handler (Calls Spring Boot Backend /api/transactions/transfer)
async function handleTransfer(e) {
  e.preventDefault();
  const targetAcc = document.getElementById('targetAccount').value.trim();
  const amountInput = document.getElementById('transferAmount');
  const amount = parseFloat(amountInput.value);
  const note = document.getElementById('transferNote')?.value || `Transfer to ${targetAcc}`;
  const savePayee = document.getElementById('saveBeneficiaryCheckbox')?.checked;

  if (!targetAcc || targetAcc.length < 8) {
    showToast('Please enter a valid recipient account number.', 'error');
    return;
  }

  if (isNaN(amount) || amount <= 0) {
    showToast('Please enter a valid transfer amount.', 'error');
    return;
  }

  const submitBtn = e.target.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Transmitting Transfer...';
  }

  const email = getCurrentUserEmail();

  try {
    const res = await BankAPI.transfer(email, targetAcc, amount, note, savePayee);
    showToast(`Successfully transferred ${formatUSD(amount)} to ${targetAcc}!`, 'success');
    amountInput.value = '';
    document.getElementById('targetAccount').value = '';
    if (document.getElementById('transferNote')) document.getElementById('transferNote').value = '';
    await syncCustomerUI();
  } catch (err) {
    showToast(`Transfer failed: ${err.message}`, 'error');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `Send Transfer Now <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>`;
    }
  }
}

// Preset Pills Selector
function initPresetPills(inputId) {
  document.querySelectorAll('.preset-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.preset-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const val = pill.getAttribute('data-amount');
      const input = document.getElementById(inputId);
      if (input) input.value = val;
    });
  });
}

// Initialize Application on Page Load
document.addEventListener('DOMContentLoaded', () => {
  initMobileToggle();
  syncCustomerUI();
});
