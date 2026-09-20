import { useEffect, useMemo, useState } from 'react';
import { supabase } from './supabase';

const details = [
  { label: 'Account No.', value: 'AC-2026-0418' },
  { label: 'Date', value: '18-09-2026' },
  { label: 'Customer Name', value: 'Muhammad Ali' },
  { label: 'Address', value: 'Main Market, Lahore' },
  { label: 'Mobile No. 1', value: '0300-1234567' },
  { label: 'Mobile No. 2', value: '0312-7654321' },
  { label: 'CNIC / Adhar', value: '35202-1234567-9' },
  { label: 'Nationality', value: 'Pakistani' },
  { label: 'Profession', value: 'Businessman' },
  { label: 'Product / Full Product', value: 'Samsung 55" Smart LED TV + Washing Machine + Mobile Phone' },
  { label: 'Total Amount', value: 'Rs. 70,000' },
  { label: 'Advance / Down Payment', value: 'Rs. 20,000' },
  { label: 'Installment Duration', value: '12 Months' },
  { label: 'Installment Type', value: 'Monthly' },
  { label: 'Monthly Installment', value: 'Rs. 4,200' },
  { label: 'Remaining Balance', value: 'Rs. 42,000' },
  { label: 'Guarantor Name', value: 'Mr. Javed' },
  { label: 'Guarantor Father Name', value: 'Mr. Noor Muhammad' },
  { label: 'Guarantor Nationality', value: 'Pakistani' },
  { label: 'Guarantor Address', value: 'Garden Town, Lahore' },
  { label: 'Guarantor Mobile Number', value: '0312-9876543' },
];

const history = [
  { date: '03-03-2026', month: 'March', pay: '10,000', submitted: '10,000', remaining: '42,000', signature: 'Customer' },
  { date: '14-04-2026', month: 'April', pay: '4,200', submitted: '4,200', remaining: '37,800', signature: 'Manager' },
  { date: '13-05-2026', month: 'May', pay: '4,200', submitted: '4,200', remaining: '33,600', signature: 'Customer' },
  { date: '12-06-2026', month: 'June', pay: '4,200', submitted: '4,200', remaining: '29,400', signature: 'Customer' },
  { date: '18-07-2026', month: 'July', pay: '4,200', submitted: '4,200', remaining: '25,200', signature: 'Manager' },
  { date: '22-08-2026', month: 'August', pay: '4,200', submitted: '4,200', remaining: '21,000', signature: 'Customer' },
  { date: '10-09-2026', month: 'September', pay: '4,200', submitted: '4,200', remaining: '16,800', signature: 'Manager' },
];

const monthNames = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

const reportRows = [
  { account: 'AC-2026-0418', name: 'Muhammad Ali', product: 'Samsung 55" Smart TV', date: '2026-03-03', recovery: '10,000', remarks: 'Advance', clear: true },
  { account: 'AC-2026-0418', name: 'Muhammad Ali', product: 'Samsung 55" Smart TV', date: '2026-04-14', recovery: '4,200', remarks: 'Monthly Recovery', clear: true },
  { account: 'AC-2026-0418', name: 'Muhammad Ali', product: 'Samsung 55" Smart TV', date: '2026-05-13', recovery: '4,200', remarks: 'Monthly Recovery', clear: true },
  { account: 'AC-2026-0418', name: 'Muhammad Ali', product: 'Samsung 55" Smart TV', date: '2026-06-12', recovery: '4,200', remarks: 'Monthly Recovery', clear: false },
  { account: 'AC-2026-0418', name: 'Muhammad Ali', product: 'Samsung 55" Smart TV', date: '2026-07-18', recovery: '4,200', remarks: 'Monthly Recovery', clear: false },
  { account: 'AC-2026-0418', name: 'Muhammad Ali', product: 'Samsung 55" Smart TV', date: '2026-08-22', recovery: '4,200', remarks: 'Monthly Recovery', clear: false },
  { account: 'AC-2026-0418', name: 'Muhammad Ali', product: 'Samsung 55" Smart TV', date: '2026-09-10', recovery: '4,200', remarks: 'Monthly Recovery', clear: false },
];

const accountFields = [
  ['customer_name', 'Customer Name'], ['address', 'Address'], ['mobile_no_1', 'Mobile No. 1'],
  ['mobile_no_2', 'Mobile No. 2'], ['cnic_adhar', 'CNIC / Adhar'], ['nationality', 'Nationality'],
  ['profession', 'Profession'], ['product_details', 'Product / Full Product'], ['total_amount', 'Total Amount'],
  ['advance_amount', 'Advance / Down Payment'], ['installment_duration', 'Installment Duration (Months)'],
  ['installment_type', 'Installment Type'], ['monthly_installment', 'Monthly Installment Amount'],
  ['guarantor_name', 'Guarantor Name'], ['guarantor_father_name', 'Guarantor Father Name'],
  ['guarantor_nationality', 'Guarantor Nationality'], ['guarantor_address', 'Guarantor Address'],
  ['guarantor_mobile', 'Guarantor Mobile Number'],
];

const newAccount = () => ({
  account_no: `AC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
  record_date: new Date().toISOString().slice(0, 10), customer_name: '', address: '', mobile_no_1: '',
  mobile_no_2: '', cnic_adhar: '', nationality: '', profession: '', product_details: '', total_amount: '',
  advance_amount: '', installment_duration: '', installment_type: 'Monthly', monthly_installment: '',
  guarantor_name: '', guarantor_father_name: '', guarantor_nationality: '', guarantor_address: '', guarantor_mobile: '',
});

const newPayment = (monthlyInstallment = '', paymentDate = new Date().toISOString().slice(0, 10)) => ({
  payment_date: paymentDate, pay_amount: monthlyInstallment, submitted_amount: '', signature: '',
});

const money = (value) => `Rs. ${Number(value || 0).toLocaleString()}`;

const getInstallmentSchedule = (account) => {
  if (!account?.record_date) return [];
  const startDate = new Date(`${account.record_date}T00:00:00`);
  return Array.from({ length: Number(account.installment_duration || 0) }, (_, index) => {
    const date = new Date(startDate);
    date.setMonth(startDate.getMonth() + index);
    return {
      date: date.toISOString().slice(0, 10),
      monthName: monthNames[date.getMonth()],
    };
  });
};

function RecordPage({ accountId, createNew = false, onSaved }) {
  const [account, setAccount] = useState(null);
  const [form, setForm] = useState(newAccount);
  const [payments, setPayments] = useState([]);
  const [signatureUrls, setSignatureUrls] = useState({});
  const [paymentForm, setPaymentForm] = useState(newPayment);
  const [editingPaymentId, setEditingPaymentId] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadAccount = async () => {
    if (createNew) {
      setAccount(null);
      setForm(newAccount());
      setPayments([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    let accountQuery = supabase.from('installment_accounts').select('*').order('created_at').limit(1).maybeSingle();
    if (accountId) accountQuery = supabase.from('installment_accounts').select('*').eq('id', accountId).maybeSingle();
    const { data, error: accountError } = await accountQuery;
    if (accountError) setError(accountError.message);
    if (data) {
      setAccount(data);
      setForm(data);
      const { data: paymentData, error: paymentError } = await supabase.from('installment_payments').select('*').eq('account_id', data.id).order('payment_date');
      if (paymentError) setError(paymentError.message);
      setPayments(paymentData || []);
      setEditingPaymentId(null);
      const schedule = getInstallmentSchedule(data);
      const firstUnpaid = schedule.find((scheduled) => {
        const payment = (paymentData || []).find((item) => item.payment_date.slice(0, 7) === scheduled.date.slice(0, 7));
        return !payment || Number(payment.submitted_amount || 0) < Number(data.monthly_installment || 0);
      });
      setPaymentForm(newPayment(data.monthly_installment, firstUnpaid?.date || schedule[0]?.date));
      const signatureEntries = await Promise.all((paymentData || []).filter((payment) => payment.signature).map(async (payment) => {
        const { data: signedData } = await supabase.storage.from('signatures').createSignedUrl(payment.signature, 3600);
        return [payment.id, signedData?.signedUrl || ''];
      }));
      setSignatureUrls(Object.fromEntries(signatureEntries));
    }
    setLoading(false);
  };

  useEffect(() => { loadAccount(); }, [accountId, createNew]);

  const updateForm = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const totalReceived = payments.reduce((sum, payment) => sum + Number(payment.submitted_amount || 0), 0);
  const totalRemaining = Math.max(0, Number(form.total_amount || 0) - Number(form.advance_amount || 0) - totalReceived);
  const installmentSchedule = getInstallmentSchedule(account || form);
  const pendingSchedule = installmentSchedule.filter((scheduled) => {
    const payment = payments.find((item) => item.payment_date.slice(0, 7) === scheduled.date.slice(0, 7));
    return !payment || Number(payment.submitted_amount || 0) < Number(form.monthly_installment || 0);
  });
  const nextPaymentDate = pendingSchedule[0]?.date || installmentSchedule[0]?.date || form.record_date;
  const saveAccount = async (event) => {
    event.preventDefault(); setSaving(true); setError(''); setMessage('');
    const { data: userData } = await supabase.auth.getUser();
    const query = account
      ? supabase.from('installment_accounts').update(form).eq('id', account.id).select().single()
      : supabase.from('installment_accounts').insert({ ...form, user_id: userData.user.id }).select().single();
    const { data, error: saveError } = await query;
    if (saveError) setError(saveError.message);
    else { setAccount(data); setForm(data); setMessage(account ? 'Installment details updated.' : 'Installment account saved. Add the first history record below.'); onSaved?.(data.id); }
    setSaving(false);
  };

  const savePayment = async (event) => {
    event.preventDefault(); setSaving(true); setError('');
    const submitted = Number(paymentForm.submitted_amount || 0);
    const existingPayment = payments.find((payment) => payment.payment_date.slice(0, 7) === paymentForm.payment_date.slice(0, 7));
    const previousSubmitted = Number(existingPayment?.submitted_amount || 0);
    const receivedWithoutCurrent = totalReceived - previousSubmitted;
    const accountRemaining = Math.max(0, Number(form.total_amount || 0) - Number(form.advance_amount || 0) - receivedWithoutCurrent);
    const maxAllowed = Math.min(Number(form.monthly_installment || 0), accountRemaining || Number(form.monthly_installment || 0));
    if (submitted > maxAllowed) {
      setError(`This month's payment cannot be more than ${money(maxAllowed)}.`);
      setSaving(false);
      return;
    }
    const cumulativeSubmitted = editingPaymentId ? submitted : previousSubmitted + submitted;
    const remaining = Math.max(0, Number(form.monthly_installment || 0) - cumulativeSubmitted);
    const date = new Date(`${paymentForm.payment_date}T00:00:00`);
    const { data: userData } = await supabase.auth.getUser();
    const signaturePath = userData.user?.user_metadata?.signature_path || null;
    const paymentPayload = { account_id: account.id, ...paymentForm, submitted_amount: cumulativeSubmitted, pay_amount: form.monthly_installment, month_name: monthNames[date.getMonth()], remaining_amount: remaining, signature: signaturePath };
    const paymentQuery = existingPayment
      ? supabase.from('installment_payments').update(paymentPayload).eq('id', existingPayment.id).select().single()
      : supabase.from('installment_payments').insert(paymentPayload).select().single();
    const { data, error: saveError } = await paymentQuery;
    if (saveError) setError(saveError.message);
    else {
      setPayments((current) => existingPayment ? current.map((payment) => payment.id === data.id ? data : payment) : [...current, data]);
      const nextUnpaid = installmentSchedule.find((scheduled) => {
        const payment = scheduled.date.slice(0, 7) === data.payment_date.slice(0, 7) ? data : payments.find((item) => item.payment_date.slice(0, 7) === scheduled.date.slice(0, 7));
        return !payment || Number(payment.submitted_amount || 0) < Number(form.monthly_installment || 0);
      });
      setPaymentForm(newPayment(form.monthly_installment, nextUnpaid?.date || data.payment_date));
      setEditingPaymentId(null); setShowPaymentForm(false); setMessage(editingPaymentId ? 'Installment history updated.' : 'Installment history saved.');
    }
    setSaving(false);
  };

  const editPayment = (payment) => {
    setEditingPaymentId(payment.id);
    setPaymentForm({ payment_date: payment.payment_date, pay_amount: form.monthly_installment, submitted_amount: String(payment.submitted_amount || 0), signature: '' });
    setShowPaymentForm(true);
    setError('');
  };

  const deletePayment = async (payment) => {
    if (!window.confirm(`Delete the ${payment.month_name} installment record?`)) return;
    setSaving(true); setError('');
    const { error: deleteError } = await supabase.from('installment_payments').delete().eq('id', payment.id);
    if (deleteError) {
      setError(deleteError.message);
    } else {
      setPayments((current) => current.filter((item) => item.id !== payment.id));
      setMessage('Installment history deleted.');
    }
    setSaving(false);
  };

  if (loading) return <main className="page"><p className="auth-loading">Loading installment record...</p></main>;

  return (
    <div className="page">
      <header className="top-header">
        <div className="brand-wrap"><div className="brand-logo">A</div><div className="brand-text"><div className="brand-name">ASAD</div><div className="brand-sub">ELECTRONICS</div></div></div>
        <div className="header-right"><div className="header-line">Customer Copy</div><div className="header-title">INSTALLMENT RECORD</div></div>
      </header>

      <form onSubmit={saveAccount}>
        <section className="details-section area-block">
          <div className="section-title">Customer & Product Details</div>
          <div className="detail-grid">
            <label className="detail-row"><span className="detail-label">Account No.</span><input className="detail-input" value={form.account_no} onChange={(e) => updateForm('account_no', e.target.value)} required /></label>
            <div className="detail-row"><span className="detail-label">Date</span><input className="detail-input" type="date" value={form.record_date} onChange={(e) => updateForm('record_date', e.target.value)} /></div>
            {accountFields.map(([field, label]) => <label className="detail-row" key={field}><span className="detail-label">{label}</span><input className="detail-input" type={['total_amount', 'advance_amount', 'installment_duration', 'monthly_installment'].includes(field) ? 'number' : 'text'} value={form[field] ?? ''} onChange={(e) => updateForm(field, e.target.value)} required={!['address', 'mobile_no_2', 'guarantor_name', 'guarantor_father_name', 'guarantor_nationality', 'guarantor_address', 'guarantor_mobile'].includes(field)} /></label>)}
          </div>
          <button className="save-record-btn" type="submit" disabled={saving}>{saving ? 'Saving...' : account ? 'Save Changes' : 'Save Installment'}</button>
        </section>
      </form>

      {account && <>
        <section className="history-section">
          <div className="history-header">Installment History</div>
          <div className="table-wrapper"><table><thead><tr><th>Date</th><th>Month</th><th>Received Amount</th><th>Remaining Amount</th><th>Signature</th><th>Actions</th></tr></thead><tbody>{payments.map((entry) => <tr key={entry.id}><td>{entry.payment_date}</td><td>{entry.month_name}</td><td>{money(entry.submitted_amount)}</td><td>{Number(entry.remaining_amount || 0) === 0 ? <span className="installment-complete" title="Installment complete" aria-label="Installment complete">&#10003;</span> : money(entry.remaining_amount)}</td><td>{signatureUrls[entry.id] ? <img className="payment-signature" src={signatureUrls[entry.id]} alt="Uploaded signature" /> : '-'}</td><td><div className="payment-actions"><button type="button" className="payment-action edit" onClick={() => editPayment(entry)} title="Edit installment" aria-label="Edit installment">&#9998;</button><button type="button" className="payment-action delete" onClick={() => deletePayment(entry)} title="Delete installment" aria-label="Delete installment">&#128465;</button></div></td></tr>)}</tbody>{payments.length > 0 && pendingSchedule.length > 0 && <tfoot><tr><td colSpan="6"><button type="button" className="add-record-btn" onClick={() => { setEditingPaymentId(null); setPaymentForm(newPayment(form.monthly_installment, nextPaymentDate)); setShowPaymentForm(true); }}>+ Add Installment</button></td></tr></tfoot>}</table></div>
        </section>
        {pendingSchedule.length > 0 && payments.length === 0 && <button type="button" className="add-record-btn" onClick={() => { setPaymentForm(newPayment(form.monthly_installment, nextPaymentDate)); setShowPaymentForm(true); }}>+ Add First Installment</button>}
        {showPaymentForm && <form className="payment-form area-block" onSubmit={savePayment}><div className="section-title">{editingPaymentId ? 'Edit Installment History' : 'Add Installment History'}</div><div className="payment-grid"><label>Date<input type="date" value={paymentForm.payment_date} readOnly required /></label>{editingPaymentId ? <label>Month<input type="text" value={monthNames[new Date(`${paymentForm.payment_date}T00:00:00`).getMonth()]} readOnly /></label> : <label>Month<select value={paymentForm.payment_date} onChange={(e) => setPaymentForm({ ...paymentForm, payment_date: e.target.value })}>{pendingSchedule.map((scheduled) => <option key={scheduled.date} value={scheduled.date}>{scheduled.monthName}</option>)}</select></label>}<label>Received Amount<input type="number" min="0" max={form.monthly_installment} value={paymentForm.submitted_amount} onChange={(e) => setPaymentForm({ ...paymentForm, submitted_amount: e.target.value })} required /></label></div><button className="save-record-btn" type="submit" disabled={saving}>{saving ? 'Saving...' : editingPaymentId ? 'Update History' : 'Save History'}</button></form>}
        <div className="record-totals">
          <div><span>Total Amount:</span><strong>{money(form.total_amount)}</strong></div>
          <div><span>Advance Amount:</span><strong>{money(form.advance_amount)}</strong></div>
          <div><span>Total Received:</span><strong>{money(totalReceived)}</strong></div>
          <div><span>Total Remaining:</span><strong>{money(totalRemaining)}</strong></div>
        </div>
      </>}
      {message && <p className="auth-message success">{message}</p>}{error && <p className="auth-message error">{error}</p>}
    </div>
  );
}

function ReportPage({ onOpenRecord }) {
  const [year, setYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(8);
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const monthLabel = monthNames[selectedMonth];

  useEffect(() => {
    const loadReport = async () => {
      setLoading(true);
      const { data: accounts, error: accountError } = await supabase.from('installment_accounts').select('id, account_no, customer_name, product_details, record_date, installment_duration, monthly_installment');
      if (accountError) {
        setError(accountError.message);
        setLoading(false);
        return;
      }
      const accountMap = new Map((accounts || []).map((account) => [account.id, account]));
      const accountIds = (accounts || []).map((account) => account.id);
      if (accountIds.length === 0) {
        setRows([]);
        setLoading(false);
        return;
      }
      const { data: payments, error: paymentError } = await supabase.from('installment_payments').select('*').in('account_id', accountIds).order('payment_date');
      if (paymentError) setError(paymentError.message);
      const paymentMap = new Map((payments || []).map((payment) => [`${payment.account_id}-${payment.payment_date.slice(0, 7)}`, payment]));
      const scheduledRows = [];

      (accounts || []).forEach((account) => {
        const startDate = new Date(`${account.record_date}T00:00:00`);
        const duration = Number(account.installment_duration || 0);
        for (let monthIndex = 0; monthIndex < duration; monthIndex += 1) {
          const dueDate = new Date(startDate);
          dueDate.setMonth(startDate.getMonth() + monthIndex);
          const date = dueDate.toISOString().slice(0, 10);
          const payment = paymentMap.get(`${account.id}-${date.slice(0, 7)}`);
          const dueAmount = Number(account.monthly_installment || 0);
          const receivedAmount = Number(payment?.submitted_amount || 0);
          scheduledRows.push({
            accountId: account.id,
            account: account.account_no,
            name: account.customer_name,
            product: account.product_details || '-',
            monthlyInstallment: dueAmount,
            date,
            recovery: String(receivedAmount),
            remaining: String(Math.max(0, dueAmount - receivedAmount)),
            remarks: payment ? 'Received' : 'Pending',
            status: receivedAmount >= dueAmount && dueAmount > 0 ? 'Clear' : 'Pending',
          });
        }
      });

      setRows(scheduledRows);
      setLoading(false);
    };
    loadReport();
  }, []);

  const filteredRows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return rows.filter((row) => {
      const rowDate = new Date(row.date);
      const inMonth = rowDate.getMonth() === selectedMonth && rowDate.getFullYear() === year;
      if (!inMonth) return false;

      if (!term) return true;

      return (
        row.account.toLowerCase().includes(term) ||
        row.name.toLowerCase().includes(term) ||
        row.product.toLowerCase().includes(term)
      );
    });
  }, [selectedMonth, year, searchTerm, rows]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const paginatedRows = filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedMonth, year, searchTerm, pageSize]);

  const totalReceived = filteredRows.reduce((sum, row) => {
    const numeric = Number(String(row.recovery).replace(/[^\d]/g, '')) || 0;
    return sum + numeric;
  }, 0);

  const totalRemaining = filteredRows.reduce((sum, row) => sum + (Number(row.remaining) || 0), 0);
  const totalAmount = [...new Map(filteredRows.map((row) => [row.accountId, row.monthlyInstallment])).values()]
    .reduce((sum, amount) => sum + amount, 0);

  const changeMonth = (direction) => {
    const nextMonth = selectedMonth + direction;
    if (nextMonth < 0) {
      setSelectedMonth(11);
      setYear((prev) => prev - 1);
      return;
    }
    if (nextMonth > 11) {
      setSelectedMonth(0);
      setYear((prev) => prev + 1);
      return;
    }
    setSelectedMonth(nextMonth);
  };

  if (loading) return <main className="page report-page"><p className="auth-loading">Loading recovery report...</p></main>;

  return (
    <div className="page report-page">
      <header className="report-header">
        <div className="report-brand">
          <div className="report-logo">A</div>
          <div>
            <div className="report-brand-name">ASAD ELECTRONICS</div>
          </div>
        </div>

        <div className="report-title-block">
          <div className="report-title">Recovery Report</div>
        </div>
      </header>

      <div className="calendar-panel">
        <div className="calendar-toolbar">
          <div className="month-navigation">
            <button type="button" className="nav-btn" onClick={() => changeMonth(-1)} aria-label="Previous month">←</button>
            <div className="calendar-month">{monthLabel} {year}</div>
            <button type="button" className="nav-btn" onClick={() => changeMonth(1)} aria-label="Next month">→</button>
          </div>

          <div className="report-search-wrap">
            <input
              type="text"
              className="report-search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search account, name or product..."
              aria-label="Search report"
            />
          </div>
        </div>
      </div>

      <div className="report-table-wrapper">
        <table className="report-table">
          <thead>
            <tr>
              <th>Account No.</th>
              <th>Name</th>
              <th>Product Item</th>
              <th>Recovery Date</th>
              <th>Received Amount</th>
              <th>Status</th>
              <th>Remarks</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length > 0 ? (
              paginatedRows.map((row, index) => (
                <tr key={`${row.date}-${index}`}>
                  <td>{row.account}</td>
                  <td>{row.name}</td>
                  <td>{row.product}</td>
                  <td>{row.date}</td>
                  <td>{row.recovery}</td>
                  <td>
                    <span className={`status-btn ${row.status === 'Clear' ? 'ok' : 'pending'}`}>
                      {row.status}
                    </span>
                  </td>
                  <td>{row.remarks}</td>
                  <td>
                    <div className="action-buttons">
                      <button type="button" className="action-btn view-btn" title="View record" aria-label="View record" onClick={() => onOpenRecord(row.accountId)}>
                        &#128065;
                      </button>
                      <button type="button" className="action-btn edit-btn" title="Edit record" aria-label="Edit record" onClick={() => onOpenRecord(row.accountId)}>
                        &#9998;
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="empty-state">No recovery record found for this selected month.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination-bar">
        <label className="page-size-control">
          <span>Rows per page</span>
          <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
            {[5, 10, 20, 50].map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </label>

        <div className="pagination-controls" aria-label="Report pagination">
          <button
            type="button"
            className="page-btn"
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
            <button
              type="button"
              key={page}
              className={`page-btn ${currentPage === page ? 'active' : ''}`}
              onClick={() => setCurrentPage(page)}
              aria-label={`Go to page ${page}`}
            >
              {page}
            </button>
          ))}
          <button
            type="button"
            className="page-btn"
            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>

      <div className="report-summary">
        <div className="report-summary-row">
          <span>Total Amount in this Month</span>
          <strong>{`Rs. ${totalAmount.toLocaleString()}`}</strong>
        </div>
        <div className="report-summary-row">
          <span>Total Received in this Month</span>
          <strong>{`Rs. ${totalReceived.toLocaleString()}`}</strong>
        </div>
        <div className="report-summary-row">
          <span>Total Remaining in this Month</span>
          <strong>{`Rs. ${totalRemaining.toLocaleString()}`}</strong>
        </div>
      </div>
      {error && <p className="auth-message error">{error}</p>}
    </div>
  );
}

function AuthPage() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const isSignup = mode === 'signup';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    const result = isSignup
      ? await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          },
        })
      : await supabase.auth.signInWithPassword({ email, password });

    if (result.error) {
      setError(result.error.message);
    } else if (isSignup && !result.data.session) {
      setMessage('Signup successful. Check your email to confirm your account, then log in.');
    }

    setLoading(false);
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand">ASAD ELECTRONICS</div>
        <h1>{isSignup ? 'Create your account' : 'Welcome back'}</h1>
        <p className="auth-subtitle">
          {isSignup ? 'Sign up to access your installment records and reports.' : 'Log in to access your installment records and reports.'}
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={6} autoComplete={isSignup ? 'new-password' : 'current-password'} />
          </label>
          {error && <p className="auth-message error">{error}</p>}
          {message && <p className="auth-message success">{message}</p>}
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Please wait...' : isSignup ? 'Sign up' : 'Log in'}
          </button>
        </form>

        <button type="button" className="auth-switch" onClick={() => { setMode(isSignup ? 'login' : 'signup'); setError(''); setMessage(''); }}>
          {isSignup ? 'Already have an account? Log in' : 'New here? Create an account'}
        </button>
      </section>
    </main>
  );
}

function SettingsPage() {
  const [signatureUrl, setSignatureUrl] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSignature = async () => {
      const { data } = await supabase.auth.getUser();
      const path = data.user?.user_metadata?.signature_path;
      if (path) {
        const { data: signedData } = await supabase.storage.from('signatures').createSignedUrl(path, 3600);
        setSignatureUrl(signedData?.signedUrl || '');
      }
      setLoading(false);
    };
    loadSignature();
  }, []);

  const uploadSignature = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSaving(true); setError(''); setMessage('');
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.'); setSaving(false); return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Signature image must be smaller than 2 MB.'); setSaving(false); return;
    }

    const { data: userData } = await supabase.auth.getUser();
    const extension = file.name.split('.').pop()?.toLowerCase() || 'png';
    const path = `${userData.user.id}/signature.${extension}`;
    const { error: uploadError } = await supabase.storage.from('signatures').upload(path, file, { upsert: true, contentType: file.type });
    if (uploadError) {
      setError(uploadError.message);
    } else {
      await supabase.auth.updateUser({ data: { signature_path: path } });
      const { data: signedData } = await supabase.storage.from('signatures').createSignedUrl(path, 3600);
      setSignatureUrl(signedData?.signedUrl || '');
      setMessage('Signature image uploaded successfully.');
    }
    setSaving(false);
  };

  const updatePassword = async (event) => {
    event.preventDefault(); setError(''); setMessage('');
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    setSaving(true);
    const { error: passwordError } = await supabase.auth.updateUser({ password });
    if (passwordError) setError(passwordError.message);
    else { setPassword(''); setConfirmPassword(''); setMessage('Password updated successfully.'); }
    setSaving(false);
  };

  if (loading) return <main className="page"><p className="auth-loading">Loading settings...</p></main>;

  return (
    <main className="page settings-page">
      <header className="settings-header"><div className="section-title">Account Settings</div><p>Manage your signature and password.</p></header>
      <section className="settings-card">
        <h2>Signature Image</h2>
        <p className="settings-help">Upload a clear PNG or JPG signature image, maximum 2 MB.</p>
        {signatureUrl && <img className="signature-preview" src={signatureUrl} alt="Uploaded signature" />}
        <label className="upload-btn">{saving ? 'Uploading...' : 'Choose Signature Image'}<input type="file" accept="image/png,image/jpeg,image/webp" onChange={uploadSignature} disabled={saving} /></label>
      </section>
      <section className="settings-card">
        <h2>Update Password</h2>
        <form className="password-form" onSubmit={updatePassword}>
          <label>New Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={6} required autoComplete="new-password" /></label>
          <label>Confirm New Password<input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={6} required autoComplete="new-password" /></label>
          <button className="save-record-btn" type="submit" disabled={saving}>{saving ? 'Updating...' : 'Update Password'}</button>
        </form>
      </section>
      {message && <p className="auth-message success">{message}</p>}
      {error && <p className="auth-message error">{error}</p>}
    </main>
  );
}

export default function App() {
  const [activePage, setActivePage] = useState('record');
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [createNewRecord, setCreateNewRecord] = useState(false);
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setSession(data.session);
        setAuthLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthLoading(false);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  if (authLoading) {
    return <main className="auth-page"><p className="auth-loading">Loading secure access...</p></main>;
  }

  if (!session) {
    return <AuthPage />;
  }

  const openRecord = (accountId) => {
    setSelectedAccountId(accountId);
    setCreateNewRecord(false);
    setActivePage('record');
  };

  const startNewRecord = () => {
    setSelectedAccountId(null);
    setCreateNewRecord(true);
    setActivePage('record');
  };

  return (
    <div className="app-shell">
      <div className="app-toolbar">
        <div className="page-switcher">
        <button
          type="button"
          className={`switch-btn ${activePage === 'record' ? 'active' : ''}`}
          onClick={() => { setCreateNewRecord(false); setActivePage('record'); }}
        >
          Installment Record
        </button>
        <button
          type="button"
          className={`switch-btn ${activePage === 'report' ? 'active' : ''}`}
          onClick={() => setActivePage('report')}
        >
          Recovery Report
        </button>
        <button type="button" className="switch-btn" onClick={startNewRecord}>
          + New Record
        </button>
        <button
          type="button"
          className={`switch-btn ${activePage === 'settings' ? 'active' : ''}`}
          onClick={() => setActivePage('settings')}
        >
          Settings
        </button>
        </div>
        <button type="button" className="logout-btn" onClick={() => supabase.auth.signOut()}>
          Log out
        </button>
      </div>

      {activePage === 'record' ? <RecordPage accountId={selectedAccountId} createNew={createNewRecord} onSaved={(accountId) => { setSelectedAccountId(accountId); setCreateNewRecord(false); }} /> : activePage === 'report' ? <ReportPage onOpenRecord={openRecord} /> : <SettingsPage />}
    </div>
  );
}
