const STORAGE_KEY = 'esmBenefitsEmployees';
let employees = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

const $ = id => document.getElementById(id);
const money = n => n.toLocaleString(undefined,{style:'currency',currency:'USD',maximumFractionDigits:0});

function yearsEmployed(hireDate){
  if(!hireDate) return 0;
  const start = new Date(hireDate);
  const now = new Date();
  let years = now.getFullYear() - start.getFullYear();
  const m = now.getMonth() - start.getMonth();
  if(m < 0 || (m === 0 && now.getDate() < start.getDate())) years--;
  return Math.max(0, years);
}

function classification(emp){
  const hrs = Number(emp.weeklyHours || 0);
  if(emp.payType === 'Salary') return 'Salary';
  if(hrs >= 35) return 'Mgt FT';
  if(hrs >= 21) return 'Substantial PT';
  if(hrs >= 5) return 'Short PT';
  return '<5 hrs';
}

function benefits(emp){
  const cls = classification(emp);
  const yrs = yearsEmployed(emp.hireDate);
  const fullYear = yrs >= 1;
  let vacationWeeks = 0;
  if(yrs >= 21) vacationWeeks = 4;
  else if(yrs >= 11) vacationWeeks = 3;
  else if(yrs >= 6) vacationWeeks = 2;
  else if(yrs >= 1) vacationWeeks = 1;

  const personal = !fullYear ? 0 : (cls === 'Salary' || cls === 'Mgt FT' ? 3 : cls === 'Substantial PT' ? 2 : cls === 'Short PT' ? 1 : 0);
  const sick = personal;
  const hco = cls === 'Salary' || cls === 'Mgt FT';
  const ersp = ['Salary','Mgt FT','Substantial PT','Short PT'].includes(cls);
  const tuition = cls === 'Salary' || cls === 'Mgt FT' ? '100%' : cls === 'Substantial PT' ? '25%' : cls === 'Short PT' ? '15%' : 'N/A';
  return {cls, yrs, vacationWeeks, personal, sick, hco, ersp, tuition};
}

function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(employees)); }

function render(){
  const q = $('search').value.toLowerCase();
  const rows = $('employeeRows');
  rows.innerHTML = '';
  const filtered = employees.filter(e => [e.name,e.entity,e.position].join(' ').toLowerCase().includes(q));

  filtered.forEach((emp, index) => {
    const b = benefits(emp);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${emp.name}</strong><br><small>${emp.position || ''}</small></td>
      <td>${emp.entity}</td>
      <td>${b.cls}</td>
      <td>${b.yrs}</td>
      <td>${b.vacationWeeks} wk</td>
      <td>${Math.max(0,b.sick - Number(emp.sickUsed||0))} left</td>
      <td>${Math.max(0,b.personal - Number(emp.personalUsed||0))} left</td>
      <td><span class="pill ${b.hco?'yes':'no'}">${b.hco?'Yes':'No'}</span></td>
      <td><span class="pill ${b.ersp?'yes':'no'}">${b.ersp?'Yes':'No'}</span></td>
      <td>${b.tuition}</td>
      <td><button class="delete" data-i="${employees.indexOf(emp)}">Delete</button></td>`;
    rows.appendChild(tr);
  });

  $('totalEmployees').textContent = employees.length;
  $('hcoCount').textContent = employees.filter(e => benefits(e).hco).length;
  $('ptCount').textContent = employees.filter(e => ['Substantial PT','Short PT','<5 hrs'].includes(benefits(e).cls)).length;
  $('annualHco').textContent = money(employees.filter(e => benefits(e).hco).length * 3600);

  document.querySelectorAll('.delete').forEach(btn => btn.onclick = () => {
    employees.splice(Number(btn.dataset.i),1); save(); render();
  });
}

$('employeeForm').addEventListener('submit', e => {
  e.preventDefault();
  const emp = {
    name:$('name').value.trim(), entity:$('entity').value, position:$('position').value.trim(),
    hireDate:$('hireDate').value, payType:$('payType').value, payRate:$('payRate').value,
    weeklyHours:$('weeklyHours').value, vacationUsed:$('vacationUsed').value,
    sickUsed:$('sickUsed').value, personalUsed:$('personalUsed').value
  };
  const existing = employees.findIndex(x => x.name.toLowerCase() === emp.name.toLowerCase());
  if(existing >= 0) employees[existing] = emp; else employees.push(emp);
  save(); e.target.reset(); $('vacationUsed').value = 0; $('sickUsed').value = 0; $('personalUsed').value = 0; render();
});

$('search').addEventListener('input', render);
$('exportBtn').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(employees, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'esm-benefits-employees.json'; a.click(); URL.revokeObjectURL(url);
});

render();
