// Classes Master Seed Database
const initialClasses = [
  { id: 'cls-1', title: 'Power Crossfit', trainer: 'Alex Rivera', time: '07:00 AM', day: 'Mon', category: 'High Intensity', image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80' },
  { id: 'cls-2', title: 'Heavy Powerlifting', trainer: 'Marcus Vance', time: '09:00 AM', day: 'Tue', category: 'Strength', image: 'https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?auto=format&fit=crop&w=800&q=80' },
  { id: 'cls-3', title: 'Zen Vinyasa Yoga', trainer: 'Elena Rostova', time: '06:00 PM', day: 'Wed', category: 'Flexibility', image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=800&q=80' },
  { id: 'cls-4', title: 'Boxing & HIIT Conditioning', trainer: 'Tyson Miller', time: '08:00 AM', day: 'Thu', category: 'Cardio', image: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=800&q=80' },
  { id: 'cls-5', title: 'Core & Abs Sculpting', trainer: 'Sophia Chen', time: '05:00 PM', day: 'Fri', category: 'Core', image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80' },
  { id: 'cls-6', title: 'Weekend Shred Circuit', trainer: 'Alex Rivera', time: '10:00 AM', day: 'Sat', category: 'Full Body', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80' }
];

// ---------- Helpers ----------
const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat'];
const DEFAULT_CAPACITY = 15;
const $ = id => document.getElementById(id);
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeUrl = u => /^https?:\/\//i.test(u) ? u : '';
const toMin = t => { const m = /(\d+):(\d+)\s*(AM|PM)/i.exec(t || ''); if (!m) return 0; let h = +m[1] % 12; if (m[3].toUpperCase() === 'PM') h += 12; return h * 60 + +m[2]; };

// ---------- State ----------
let gymClasses = store.get('fitpulse_classes', null);
if (!Array.isArray(gymClasses)) gymClasses = initialClasses.slice();
let bookings = store.get('fitpulse_bookings', []);
let user = store.get('fitpulse_user', null);
let profile = store.get('fitpulse_profile', { name: 'Sourabh Kumar', email: 'sourabh@fitpulse.io', loc: 'Downtown Arena - Central', goal: 'fatloss' });
let filters = { day: 'All', cat: 'All', q: '' };
let isDarkMode = true, isAnnualPlan = false, bookingTarget = null;

document.addEventListener('DOMContentLoaded', () => {
  applyTheme(store.get('fitpulse_theme', 'dark'));
  fillCategories(); applyFilters(); calculateBMR(); loadProfile(); updateAuthUI(); renderBookings(); animateStats();
  const t = location.hash.slice(1);
  if ($('tab-' + t)) switchTab(t, true);
  $('searchInput').addEventListener('input', e => { filters.q = e.target.value.trim().toLowerCase(); applyFilters(); });
  $('catFilter').addEventListener('change', e => { filters.cat = e.target.value; applyFilters(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') document.querySelectorAll('[id$="Modal"]:not(.hidden)').forEach(m => closeModal(m.id)); });
  document.querySelectorAll('[id$="Modal"]').forEach(m => m.addEventListener('mousedown', e => { if (e.target === m) closeModal(m.id); }));
});

// ---------- Theme & Tabs ----------
function applyTheme(t) {
  isDarkMode = t === 'dark';
  const h = document.documentElement;
  h.classList.toggle('dark', isDarkMode); h.classList.toggle('light', !isDarkMode);
  $('themeIcon').className = isDarkMode ? 'fa-solid fa-moon text-orange-400' : 'fa-solid fa-sun text-orange-500';
  $('themeLabel').textContent = isDarkMode ? 'Dark' : 'Light';
}
function toggleTheme() { applyTheme(isDarkMode ? 'light' : 'dark'); store.set('fitpulse_theme', isDarkMode ? 'dark' : 'light'); }

function switchTab(id, noScroll) {
  document.querySelectorAll('.tab-page').forEach(e => e.classList.add('hidden'));
  document.querySelectorAll('.nav-link').forEach(e => e.classList.remove('active'));
  $('tab-' + id).classList.remove('hidden');
  ['nav-', 'mnav-'].forEach(p => $(p + id)?.classList.add('active'));
  history.replaceState(null, '', '#' + id);
  if (!noScroll) window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ---------- Classes: filter, sort, render ----------
function fillCategories() {
  const cats = [...new Set(gymClasses.map(c => c.category))].sort();
  const s = $('catFilter');
  s.innerHTML = '<option value="All">All Categories</option>' + cats.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join('');
  if (!cats.includes(filters.cat)) filters.cat = 'All';
  s.value = filters.cat;
}
function filterClasses(day) {
  filters.day = day;
  document.querySelectorAll('#dayFilterGroup button').forEach(b => b.classList.toggle('active', b.dataset.day === day));
  applyFilters();
}
function applyFilters() {
  const { day, cat, q } = filters;
  const list = gymClasses
    .filter(c => (day === 'All' || c.day === day) && (cat === 'All' || c.category === cat) && (!q || [c.title, c.trainer, c.category].join(' ').toLowerCase().includes(q)))
    .sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day) || toMin(a.time) - toMin(b.time));
  $('resultCount').textContent = `${list.length} session${list.length === 1 ? '' : 's'}`;
  renderClasses(list);
}
const spotsLeft = c => Math.max(0, (c.capacity || DEFAULT_CAPACITY) - bookings.filter(b => b.classId === c.id).length);

function renderClasses(list) {
  const box = $('classGridContainer');
  if (!list.length) {
    box.innerHTML = `<div class="col-span-full py-12 text-center text-sub space-y-2"><i class="fa-solid fa-calendar-xmark text-4xl opacity-50"></i><p class="text-xs font-bold">No training sessions match your filters.</p></div>`;
    return;
  }
  box.innerHTML = list.map(c => {
    const left = spotsLeft(c), full = left === 0, mine = bookings.some(b => b.classId === c.id);
    const btn = mine ? `<button disabled class="flex-1 bg-emerald-500/15 text-emerald-400 font-extrabold text-xs py-2.5 rounded-xl cursor-default"><i class="fa-solid fa-check mr-1"></i> Booked</button>`
      : full ? `<button disabled class="flex-1 bg-slate-700/50 text-sub font-extrabold text-xs py-2.5 rounded-xl cursor-not-allowed">Class Full</button>`
      : `<button onclick="openBooking('${esc(c.id)}')" class="flex-1 bg-orange-500 hover:bg-orange-400 text-slate-950 font-extrabold text-xs py-2.5 rounded-xl transition">Reserve Slot</button>`;
    const admin = user ? `
      <button onclick="openEditClassModal('${esc(c.id)}')" aria-label="Edit session" class="p-2.5 rounded-xl bg-slate-800 hover:bg-orange-500 hover:text-slate-950 text-slate-300 transition"><i class="fa-solid fa-pen-to-square"></i></button>
      <button onclick="deleteClass('${esc(c.id)}')" aria-label="Delete session" class="p-2.5 rounded-xl bg-slate-800 hover:bg-rose-500 hover:text-white text-slate-300 transition"><i class="fa-solid fa-trash-can"></i></button>` : '';
    return `<article class="class-card card-bg rounded-2xl overflow-hidden border card-border flex flex-col justify-between">
      <div>
        <div class="relative h-48 overflow-hidden img-fallback">
          <img src="${esc(safeUrl(c.image))}" alt="${esc(c.title)}" loading="lazy" onerror="this.style.display='none'" class="w-full h-full object-cover">
          <span class="absolute top-3 left-3 bg-orange-500 text-slate-950 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase">${esc(c.category)}</span>
          <span class="absolute top-3 right-3 text-[10px] font-extrabold px-2.5 py-1 rounded-full ${full ? 'bg-rose-500 text-white' : left <= 4 ? 'bg-amber-400 text-slate-950' : 'bg-slate-950/80 text-emerald-400'}">${full ? 'Full' : left + ' spots left'}</span>
          <span class="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-md text-orange-400 text-xs font-bold px-2.5 py-1 rounded-lg">${esc(c.day)} @ ${esc(c.time)}</span>
        </div>
        <div class="p-5 space-y-2">
          <h3 class="font-extrabold text-brand text-lg">${esc(c.title)}</h3>
          <p class="text-xs text-sub"><i class="fa-solid fa-user-ninja text-orange-500 mr-1.5"></i> Lead Trainer: <span class="text-brand font-semibold">${esc(c.trainer)}</span></p>
        </div>
      </div>
      <div class="p-5 pt-0 flex gap-2">${btn}${admin}</div>
    </article>`;
  }).join('');
}

// ---------- Admin CRUD (login required) ----------
function requireLogin() {
  if (user) return true;
  showToast('Please log in to manage sessions', 'info'); openModal('authModal'); return false;
}
function openAddClassModal() {
  if (!requireLogin()) return;
  $('editClassId').value = '';
  $('classModalTitle').textContent = 'Add Fitness Class Session';
  $('classSubmitBtn').textContent = 'Save Class Session';
  ['classTitle', 'classTrainer', 'classCategory', 'classTime', 'classImage'].forEach(i => $(i).value = '');
  $('classDay').value = 'Mon';
  openModal('classModal');
}
function openEditClassModal(id) {
  const c = gymClasses.find(x => x.id === id); if (!c) return;
  $('editClassId').value = c.id;
  $('classModalTitle').textContent = 'Edit Class Session Details';
  $('classSubmitBtn').textContent = 'Update Session';
  $('classTitle').value = c.title; $('classTrainer').value = c.trainer; $('classCategory').value = c.category;
  $('classDay').value = c.day; $('classTime').value = c.time; $('classImage').value = c.image;
  openModal('classModal');
}
function handleClassSubmit(e) {
  e.preventDefault();
  const image = $('classImage').value.trim();
  if (!safeUrl(image)) return showToast('Image URL must start with http(s)://', 'error');
  const editId = $('editClassId').value;
  const old = gymClasses.find(c => c.id === editId);
  const data = {
    id: editId || 'cls-' + Date.now(), title: $('classTitle').value.trim(), trainer: $('classTrainer').value.trim(),
    category: $('classCategory').value.trim(), day: $('classDay').value, time: $('classTime').value.trim().toUpperCase(),
    image, capacity: old?.capacity || DEFAULT_CAPACITY
  };
  if (old) { gymClasses[gymClasses.indexOf(old)] = data; showToast('Training session updated!'); }
  else { gymClasses.unshift(data); showToast('New fitness class published!'); }
  store.set('fitpulse_classes', gymClasses);
  closeModal('classModal'); fillCategories(); applyFilters();
}
function deleteClass(id) {
  if (!confirm('Cancel and remove this class session?')) return;
  gymClasses = gymClasses.filter(c => c.id !== id);
  bookings = bookings.filter(b => b.classId !== id);
  store.set('fitpulse_classes', gymClasses); store.set('fitpulse_bookings', bookings);
  fillCategories(); applyFilters(); renderBookings();
  showToast('Class session removed from timetable', 'info');
}

// ---------- Bookings ----------
function openBooking(classId = null) {
  bookingTarget = classId;
  const c = gymClasses.find(x => x.id === classId);
  $('bookingSubtitle').textContent = c ? `${c.title} · ${c.day} @ ${c.time} with ${c.trainer}` : 'Claim a free trial pass or confirm your spot.';
  $('bkName').value = user ? user.name : ''; $('bkEmail').value = user ? user.email : '';
  openModal('bookingModal');
}
function handlePassSubmit(e) {
  e.preventDefault();
  const c = gymClasses.find(x => x.id === bookingTarget);
  if (c) {
    if (spotsLeft(c) === 0) return showToast('Sorry, this class just filled up', 'error');
    if (bookings.some(b => b.classId === c.id)) return showToast('You already reserved this class', 'info');
  }
  bookings.push({ id: 'bk-' + Date.now(), classId: c?.id || null, title: c ? `${c.title} · ${c.day} @ ${c.time}` : 'Free Trial Pass', name: $('bkName').value.trim(), date: new Date().toLocaleDateString() });
  store.set('fitpulse_bookings', bookings);
  closeModal('bookingModal'); e.target.reset(); applyFilters(); renderBookings();
  showToast('Reservation confirmed! Check Settings > My Reservations.');
}
function cancelBooking(id) {
  bookings = bookings.filter(b => b.id !== id);
  store.set('fitpulse_bookings', bookings); renderBookings(); applyFilters();
  showToast('Reservation cancelled', 'info');
}
function renderBookings() {
  $('myBookings').innerHTML = bookings.length ? bookings.map(b => `
    <div class="flex items-center justify-between gap-3 p-3 rounded-xl input-field text-xs">
      <div><p class="font-bold text-brand">${esc(b.title)}</p><p class="text-[11px] text-sub">${esc(b.name)} · booked ${esc(b.date)}</p></div>
      <button onclick="cancelBooking('${esc(b.id)}')" class="text-rose-400 hover:text-rose-300 font-bold shrink-0">Cancel</button>
    </div>`).join('') : '<p class="text-xs text-sub">No reservations yet. Book a class from the schedule!</p>';
}

// ---------- BMR & Calories ----------
function calculateBMR() {
  const n = (id, d, min, max) => { const v = parseFloat($(id).value); return v >= min && v <= max ? v : d; };
  const age = n('bmrAge', 25, 10, 100), weight = n('bmrWeight', 75, 25, 300), height = n('bmrHeight', 178, 100, 250);
  const act = parseFloat($('bmrActivity').value) || 1.375;
  const bmr = 10 * weight + 6.25 * height - 5 * age + ($('bmrGender').value === 'male' ? 5 : -161);
  const tdee = bmr * act, bmi = weight / ((height / 100) ** 2);
  const cat = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese';
  const f = v => Math.round(v).toLocaleString();
  $('bmrOutput').textContent = `${f(bmr)} kcal`;
  $('tdeeOutput').textContent = `${f(tdee)} kcal/day`;
  $('fatLossOutput').textContent = `${f(tdee - 500)} kcal`;
  $('muscleGainOutput').textContent = `${f(tdee + 300)} kcal`;
  $('bmiOutput').textContent = `BMI ${bmi.toFixed(1)} · ${cat}`;
}

// ---------- Pricing ----------
function togglePlanBilling() {
  isAnnualPlan = !isAnnualPlan;
  $('planToggleCircle').classList.toggle('translate-x-6', isAnnualPlan);
  $('monthlyLabel').classList.toggle('text-brand', !isAnnualPlan); $('monthlyLabel').classList.toggle('text-sub', isAnnualPlan);
  $('annualLabel').classList.toggle('text-brand', isAnnualPlan); $('annualLabel').classList.toggle('text-sub', !isAnnualPlan);
  document.querySelectorAll('.plan-price').forEach(el => el.textContent = el.dataset[isAnnualPlan ? 'annual' : 'monthly']);
}

// ---------- Auth & Profile ----------
function handleAuthButton() { user ? logout() : openModal('authModal'); }
function handleAuthLogin(e) {
  e.preventDefault();
  const email = $('authEmail').value.trim();
  const local = email.split('@')[0];
  user = { email, name: email.toLowerCase() === profile.email.toLowerCase() ? profile.name : local.charAt(0).toUpperCase() + local.slice(1) };
  store.set('fitpulse_user', user);
  closeModal('authModal'); updateAuthUI(); applyFilters();
  showToast(`Welcome back, ${user.name}!`);
}
function logout() {
  user = null; store.set('fitpulse_user', null); updateAuthUI(); applyFilters();
  showToast('Logged out successfully', 'info');
}
function updateAuthUI() {
  $('loginBtn').innerHTML = user ? `<i class="fa-solid fa-circle-user mr-1"></i>${esc(user.name.split(' ')[0])} <i class="fa-solid fa-right-from-bracket ml-1 opacity-70"></i>` : 'Member Login';
  $('loginBtn').title = user ? 'Click to log out' : '';
}
function loadProfile() {
  $('setName').value = profile.name; $('setEmail').value = profile.email; $('setLoc').value = profile.loc; $('setGoal').value = profile.goal;
}
function handleSettingsSave(e) {
  e.preventDefault();
  profile = { name: $('setName').value.trim(), email: $('setEmail').value.trim(), loc: $('setLoc').value.trim(), goal: $('setGoal').value };
  store.set('fitpulse_profile', profile);
  if (user) { user.name = profile.name; user.email = profile.email; store.set('fitpulse_user', user); updateAuthUI(); }
  showToast('Member profile settings saved!');
}

// ---------- Modals, Toasts, Stats ----------
function openModal(id) {
  const m = $(id); m.classList.remove('hidden'); document.body.style.overflow = 'hidden';
  setTimeout(() => m.querySelector('input:not([type=hidden]),select')?.focus(), 60);
}
function closeModal(id) {
  $(id).classList.add('hidden');
  if (id === 'bookingModal') bookingTarget = null;
  if (!document.querySelector('[id$="Modal"]:not(.hidden)')) document.body.style.overflow = '';
}
function showToast(message, type = 'success') {
  const styles = { success: ['bg-emerald-600/90 border-emerald-400', 'fa-circle-check'], error: ['bg-rose-600/90 border-rose-400', 'fa-circle-exclamation'], info: ['bg-slate-800/90 border-slate-600', 'fa-circle-info'] }[type] || [];
  const t = document.createElement('div');
  t.className = `px-4 py-3 rounded-xl text-xs font-bold text-white shadow-xl backdrop-blur-md border flex items-center gap-2 pointer-events-auto transition duration-300 translate-y-2 opacity-0 ${styles[0]}`;
  t.setAttribute('role', 'status');
  t.innerHTML = `<i class="fa-solid ${styles[1]}"></i><span></span>`;
  t.lastChild.textContent = message;
  $('toastContainer').appendChild(t);
  setTimeout(() => t.classList.remove('translate-y-2', 'opacity-0'), 10);
  setTimeout(() => { t.classList.add('opacity-0'); setTimeout(() => t.remove(), 300); }, 3200);
}
function animateStats() {
  document.querySelectorAll('[data-count]').forEach(el => {
    const end = +el.dataset.count, t0 = performance.now();
    const step = t => { const p = Math.min((t - t0) / 1200, 1); el.textContent = Math.round(end * (1 - (1 - p) ** 3)).toLocaleString() + (el.dataset.suffix || ''); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  });
}
