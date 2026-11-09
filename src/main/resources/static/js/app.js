/**
 * Banking Management System - Core Frontend Application Logic
 * Corporate Theme with Strict Deletion Safety & Confirmation Modals
 */

// Universal Modal Confirmation Dialog
function showConfirmDialog({ title, message, confirmText = 'Confirm Delete', confirmClass = 'btn-danger', onConfirm }) {
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

  // Close handlers
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
        : '<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>'}
    </svg>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'slideIn 0.25s ease reverse forwards';
    setTimeout(() => toast.remove(), 250);
  }, 3500);
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

// Synchronize Customer Details across UI
function syncCustomerUI() {
  const data = getBankData();
  const c = data.customer;

  document.querySelectorAll('.val-balance').forEach(el => el.textContent = formatUSD(c.balance));
  document.querySelectorAll('.val-income').forEach(el => el.textContent = formatUSD(c.monthlyIncome));
  document.querySelectorAll('.val-expense').forEach(el => el.textContent = formatUSD(c.monthlyExpense));
  document.querySelectorAll('.val-savings').forEach(el => el.textContent = formatUSD(c.savingsGoal));
  document.querySelectorAll('.val-accno').forEach(el => el.textContent = c.accountNumber);
  document.querySelectorAll('.val-name').forEach(el => el.textContent = c.fullName);
  document.querySelectorAll('.val-acctype').forEach(el => el.textContent = c.accountType);

  renderBeneficiaryList();
}

// Render Saved Beneficiaries (Clean list with Pay button; delete option removed from this side)
function renderBeneficiaryList() {
  const container = document.getElementById('beneficiaryList');
  if (!container) return;

  const data = getBankData();
  const list = data.beneficiaries || [];

  if (list.length === 0) {
    container.innerHTML = `<div style="color: var(--text-muted); font-size: 0.85rem; padding: 14px 0; text-align: center;">No saved payees registered.</div>`;
    return;
  }

  container.innerHTML = list.map(b => `
    <div class="beneficiary-item">
      <div style="display: flex; align-items: center; gap: 12px;">
        <div class="beneficiary-avatar">${b.name.split(' ').map(n=>n[0]).join('')}</div>
        <div>
          <div style="font-weight: 700; font-size: 0.88rem; color: var(--navy-950);">${b.name}</div>
          <div style="font-size: 0.76rem; color: var(--text-muted);">${b.bankName} • <span style="font-family: var(--font-mono); font-weight: 600;">${b.accountNumber}</span></div>
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

// Render Transactions with Delete Option on the Right
function renderTransactions(filterType = 'ALL') {
  const tableBody = document.getElementById('transactionRows');
  if (!tableBody) return;

  window.currentTxFilter = filterType;
  const data = getBankData();
  let list = data.transactions || [];

  if (filterType !== 'ALL') {
    list = list.filter(t => t.type === filterType);
  }

  const isStatementPage = window.location.pathname.includes('transactions.html');

  if (list.length === 0) {
    const colSpan = isStatementPage ? 7 : 6;
    tableBody.innerHTML = `<tr><td colspan="${colSpan}" style="text-align: center; color: var(--text-muted); padding: 30px;">No matching transactions found.</td></tr>`;
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
        <td><span style="color: var(--text-muted); font-size: 0.8rem;">${t.date}</span></td>
        <td><span class="${amountClass}">${sign}${formatUSD(t.amount)}</span></td>
        ${isStatementPage ? `<td><span style="font-family: var(--font-mono); font-weight: 600;">${formatUSD(t.balanceAfter)}</span></td>` : ''}
        <td style="text-align: right;">
          <button type="button" class="btn btn-danger-outline btn-sm" onclick="promptDeleteTransaction(${t.id}, '${t.ref}')" title="Delete transaction record">
            <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            Delete
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// Delete Transaction Record with Confirmation Dialog
function promptDeleteTransaction(id, ref) {
  showConfirmDialog({
    title: 'Delete Transaction Record',
    message: `Are you sure you want to delete transaction ${ref}? This entry will be permanently removed from your activity list.`,
    confirmText: 'Yes, Delete Record',
    confirmClass: 'btn-danger',
    onConfirm: () => {
      const data = getBankData();
      data.transactions = (data.transactions || []).filter(t => t.id !== id && t.ref !== ref);
      saveBankData(data);
      renderTransactions(window.currentTxFilter || 'ALL');
      showToast(`Transaction ${ref} was successfully deleted.`, 'success');
    }
  });
}

// Deposit Money Handler
function handleDeposit(e) {
  e.preventDefault();
  const amountInput = document.getElementById('depositAmount');
  const amount = parseFloat(amountInput.value);

  if (isNaN(amount) || amount <= 0) {
    showToast('Please enter a valid deposit amount greater than $0.', 'error');
    return;
  }

  const data = getBankData();
  data.customer.balance += amount;
  data.customer.monthlyIncome += amount;

  const newTxn = {
    id: Date.now(),
    ref: generateTxnRef(),
    type: 'DEPOSIT',
    amount: amount,
    balanceAfter: data.customer.balance,
    description: document.getElementById('depositNote')?.value || 'Online Account Deposit',
    date: getNowFormatted(),
    status: 'SUCCESS'
  };

  data.transactions.unshift(newTxn);
  saveBankData(data);

  amountInput.value = '';
  syncCustomerUI();
  showToast(`Successfully deposited ${formatUSD(amount)} into your account!`, 'success');
}

// Withdraw Money Handler
function handleWithdraw(e) {
  e.preventDefault();
  const amountInput = document.getElementById('withdrawAmount');
  const amount = parseFloat(amountInput.value);
  const data = getBankData();

  if (isNaN(amount) || amount <= 0) {
    showToast('Please enter a valid withdrawal amount.', 'error');
    return;
  }

  if (amount > data.customer.balance) {
    showToast(`Insufficient funds! Your available balance is ${formatUSD(data.customer.balance)}.`, 'error');
    return;
  }

  data.customer.balance -= amount;
  data.customer.monthlyExpense += amount;

  const newTxn = {
    id: Date.now(),
    ref: generateTxnRef(),
    type: 'WITHDRAWAL',
    amount: amount,
    balanceAfter: data.customer.balance,
    description: document.getElementById('withdrawNote')?.value || 'Cash Counter / ATM Withdrawal',
    date: getNowFormatted(),
    status: 'SUCCESS'
  };

  data.transactions.unshift(newTxn);
  saveBankData(data);

  amountInput.value = '';
  syncCustomerUI();
  showToast(`Successfully withdrawn ${formatUSD(amount)} from your account!`, 'success');
}

// Transfer Money Handler
function handleTransfer(e) {
  e.preventDefault();
  const targetAcc = document.getElementById('targetAccount').value.trim();
  const amountInput = document.getElementById('transferAmount');
  const amount = parseFloat(amountInput.value);
  const note = document.getElementById('transferNote')?.value || `Transfer to ${targetAcc}`;
  const savePayee = document.getElementById('saveBeneficiaryCheckbox')?.checked;
  const data = getBankData();

  if (!targetAcc || targetAcc.length < 8) {
    showToast('Please enter a valid recipient account number.', 'error');
    return;
  }

  if (targetAcc.toUpperCase() === data.customer.accountNumber) {
    showToast('Self-transfer is not permitted: You cannot transfer funds to your own account number.', 'error');
    return;
  }

  if (isNaN(amount) || amount <= 0) {
    showToast('Please enter a valid transfer amount.', 'error');
    return;
  }

  if (amount > data.customer.balance) {
    showToast(`Transfer failed: Insufficient funds (${formatUSD(data.customer.balance)} available).`, 'error');
    return;
  }

  data.customer.balance -= amount;
  data.customer.monthlyExpense += amount;

  const newTxn = {
    id: Date.now(),
    ref: generateTxnRef(),
    type: 'TRANSFER',
    amount: amount,
    balanceAfter: data.customer.balance,
    description: `Transfer to Account ${targetAcc} (${note})`,
    date: getNowFormatted(),
    status: 'SUCCESS'
  };

  data.transactions.unshift(newTxn);

  if (savePayee && !(data.beneficiaries || []).some(b => b.accountNumber === targetAcc)) {
    data.beneficiaries.push({
      id: 'ben-' + Date.now(),
      name: `Beneficiary (${targetAcc})`,
      accountNumber: targetAcc,
      bankName: 'Apex Banking Network',
      dateAdded: getNowFormatted().substring(0, 10)
    });
  }

  saveBankData(data);

  amountInput.value = '';
  syncCustomerUI();
  showToast(`Transferred ${formatUSD(amount)} successfully to Account ${targetAcc}!`, 'success');
}

// Preset Pills
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

document.addEventListener('DOMContentLoaded', () => {
  initMobileToggle();
  syncCustomerUI();
});
