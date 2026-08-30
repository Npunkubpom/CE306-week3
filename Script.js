(function(){
  const CATEGORY_META = {
    food:     { label: 'อาหาร',     icon: '🍜' },
    travel:   { label: 'เดินทาง',   icon: '🚗' },
    shopping: { label: 'ช้อปปิ้ง',  icon: '🛍️' },
    salary:   { label: 'เงินเดือน', icon: '💵' },
    other:    { label: 'อื่นๆ',     icon: '📦' }
  };

  let transactions = []; // { id, type, name, category, amount }
  let nextId = 1;
  let searchTerm = '';

  const els = {
    typeIncome: document.getElementById('typeIncome'),
    typeExpense: document.getElementById('typeExpense'),
    name: document.getElementById('txName'),
    category: document.getElementById('txCategory'),
    amount: document.getElementById('txAmount'),
    errMsg: document.getElementById('errMsg'),
    addBtn: document.getElementById('addBtn'),
    search: document.getElementById('searchInput'),
    resultCount: document.getElementById('resultCount'),
    ledgerBody: document.getElementById('ledgerBody'),
    totalIncome: document.getElementById('totalIncome'),
    totalExpense: document.getElementById('totalExpense'),
    netBalance: document.getElementById('netBalance'),
    netStampCircle: document.getElementById('netStampCircle'),
    clearBtn: document.getElementById('clearBtn'),
    todayStamp: document.getElementById('todayStamp')
  };

  function formatBaht(n){
    const sign = n < 0 ? '-' : '';
    return sign + '฿' + Math.abs(n).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function setToday(){
    const d = new Date();
    const opts = { year:'numeric', month:'long', day:'numeric' };
    els.todayStamp.textContent = d.toLocaleDateString('th-TH', opts);
  }

  function validate(name, amount){
    if(!name.trim()) return 'กรุณากรอกชื่อรายการ';
    if(isNaN(amount) || amount <= 0) return 'กรุณากรอกจำนวนเงินให้ถูกต้อง (มากกว่า 0)';
    return '';
  }

  function addTransaction(){
    const type = els.typeIncome.checked ? 'income' : 'expense';
    const name = els.name.value;
    const category = els.category.value;
    const amount = parseFloat(els.amount.value);

    const errText = validate(name, amount);
    els.errMsg.textContent = errText;
    if(errText) return;

    transactions.push({
      id: nextId++,
      type,
      name: name.trim(),
      category,
      amount
    });

    els.name.value = '';
    els.amount.value = '';
    els.name.focus();

    render();
  }

  function clearAll(){
    if(confirm('ยืนยันการล้างข้อมูลรายการทั้งหมด? การกระทำนี้ไม่สามารถย้อนกลับได้')){
      transactions = [];
      nextId = 1;
      render();
    }
  }

  function getFiltered(){
    if(!searchTerm) return transactions;
    const q = searchTerm.toLowerCase();
    return transactions.filter(t => t.name.toLowerCase().includes(q));
  }

  function renderRows(){
    const filtered = getFiltered();
    els.resultCount.textContent = searchTerm
      ? `พบ ${filtered.length} จาก ${transactions.length} รายการ`
      : `ทั้งหมด ${transactions.length} รายการ`;

    if(filtered.length === 0){
      const msg = transactions.length === 0
        ? 'ยังไม่มีรายการ — เริ่มบันทึกรายการแรกของคุณด้านบน'
        : 'ไม่พบรายการที่ตรงกับคำค้นหา';
      els.ledgerBody.innerHTML = `<tr class="empty-row"><td colspan="5">${msg}</td></tr>`;
      return;
    }

    els.ledgerBody.innerHTML = filtered.map((t, idx) => {
      const cat = CATEGORY_META[t.category] || CATEGORY_META.other;
      const typeLabel = t.type === 'income' ? 'รายรับ' : 'รายจ่าย';
      const typeClass = t.type === 'income' ? 'type-income' : 'type-expense';
      const amtClass = t.type === 'income' ? 'amt-income' : 'amt-expense';
      const amtSign = t.type === 'income' ? '+' : '-';
      return `
        <tr>
          <td class="col-id">${idx + 1}</td>
          <td><span class="type-tag ${typeClass}">${typeLabel}</span></td>
          <td>${escapeHtml(t.name)}</td>
          <td><span class="cat-pill">${cat.icon} ${cat.label}</span></td>
          <td class="col-amt ${amtClass}">${amtSign}${formatBaht(t.amount)}</td>
        </tr>`;
    }).join('');
  }

  function renderSummary(){
    const income = transactions.filter(t => t.type === 'income').reduce((s,t) => s + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((s,t) => s + t.amount, 0);
    const net = income - expense;

    els.totalIncome.textContent = formatBaht(income);
    els.totalExpense.textContent = formatBaht(expense);
    els.netBalance.textContent = formatBaht(net);

    els.netStampCircle.classList.toggle('positive', net >= 0);
  }

  function escapeHtml(str){
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function render(){
    renderRows();
    renderSummary();
  }

  els.addBtn.addEventListener('click', addTransaction);
  els.amount.addEventListener('keydown', e => { if(e.key === 'Enter') addTransaction(); });
  els.name.addEventListener('keydown', e => { if(e.key === 'Enter') addTransaction(); });
  els.search.addEventListener('input', e => { searchTerm = e.target.value; renderRows(); });
  els.clearBtn.addEventListener('click', clearAll);

  setToday();
  render();
})();