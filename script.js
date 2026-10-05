// Classes Master Seed Database
const initialClasses = [
  { id: 'cls-1', title: 'Power Crossfit', trainer: 'Alex Rivera', time: '07:00 AM', day: 'Mon', category: 'High Intensity', image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80' },
  { id: 'cls-2', title: 'Heavy Powerlifting', trainer: 'Marcus Vance', time: '09:00 AM', day: 'Tue', category: 'Strength', image: 'https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?auto=format&fit=crop&w=800&q=80' },
  { id: 'cls-3', title: 'Zen Vinyasa Yoga', trainer: 'Elena Rostova', time: '06:00 PM', day: 'Wed', category: 'Flexibility', image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=800&q=80' },
  { id: 'cls-4', title: 'Boxing & HIIT Conditioning', trainer: 'Tyson Miller', time: '08:00 AM', day: 'Thu', category: 'Cardio', image: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=800&q=80' },
  { id: 'cls-5', title: 'Core & Abs Sculpting', trainer: 'Sophia Chen', time: '05:00 PM', day: 'Fri', category: 'Core', image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80' },
  { id: 'cls-6', title: 'Weekend Shred Circuit', trainer: 'Alex Rivera', time: '10:00 AM', day: 'Sat', category: 'Full Body', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80' }
];

// App State Management
let gymClasses = JSON.parse(localStorage.getItem('fitpulse_classes')) || initialClasses;
let currentDayFilter = 'All';
let isDarkMode = true;
let isAnnualPlan = false;

document.addEventListener('DOMContentLoaded', () => {
  renderClasses(gymClasses);
  calculateBMR();
});

function saveClassesToStorage() {
  localStorage.setItem('fitpulse_classes', JSON.stringify(gymClasses));
}

// Theme Switcher
function toggleTheme() {
  isDarkMode = !isDarkMode;
  const html = document.documentElement;
  const icon = document.getElementById('themeIcon');
  const label = document.getElementById('themeLabel');

  if (isDarkMode) {
    html.classList.remove('light');
    html.classList.add('dark');
    icon.className = 'fa-solid fa-moon text-orange-400';
    label.textContent = 'Dark';
  } else {
    html.classList.remove('dark');
    html.classList.add('light');
    icon.className = 'fa-solid fa-sun text-orange-500';
    label.textContent = 'Light';
  }
}

// Tab Switcher
function switchTab(tabId) {
  document.querySelectorAll('.tab-page').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));

  document.getElementById(`tab-${tabId}`).classList.remove('hidden');
  document.getElementById(`nav-${tabId}`).classList.add('active');
}

// Filter Classes by Day
function filterClasses(day) {
  currentDayFilter = day;
  document.querySelectorAll('#dayFilterGroup button').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');

  if (day === 'All') {
    renderClasses(gymClasses);
  } else {
    const filtered = gymClasses.filter(c => c.day === day);
    renderClasses(filtered);
  }
}

// Render Fitness Class Cards
function renderClasses(list) {
  const container = document.getElementById('classGridContainer');
  container.innerHTML = '';

  if (list.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-12 text-center text-sub space-y-2">
        <i class="fa-solid fa-calendar-xmark text-4xl text-slate-500"></i>
        <p class="text-xs font-bold">No training sessions scheduled for this day.</p>
      </div>
    `;
    return;
  }

  list.forEach(item => {
    const card = document.createElement('div');
    card.className = 'class-card card-bg rounded-2xl overflow-hidden border card-border flex flex-col justify-between';
    card.innerHTML = `
      <div>
        <div class="relative h-48 overflow-hidden">
          <img src="${item.image}" alt="${item.title}" class="w-full h-full object-cover">
          <span class="absolute top-3 left-3 bg-orange-500 text-slate-950 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase">${item.category}</span>
          <span class="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-md text-orange-400 text-xs font-bold px-2.5 py-1 rounded-lg">${item.day} @ ${item.time}</span>
        </div>
        <div class="p-5 space-y-2">
          <h3 class="font-extrabold text-brand text-lg">${item.title}</h3>
          <p class="text-xs text-sub"><i class="fa-solid fa-user-ninja text-orange-500 mr-1.5"></i> Lead Trainer: <span class="text-brand font-semibold">${item.trainer}</span></p>
        </div>
      </div>
      <div class="p-5 pt-0 flex gap-2">
        <button onclick="openModal('bookingModal')" class="flex-1 bg-orange-500 hover:bg-orange-400 text-slate-950 font-extrabold text-xs py-2.5 rounded-xl transition">
          Reserve Slot
        </button>
        <button onclick="openEditClassModal('${item.id}')" class="p-2.5 rounded-xl bg-slate-800 hover:bg-orange-500 hover:text-slate-950 text-slate-300 transition" title="Edit Session">
          <i class="fa-solid fa-pen-to-square"></i>
        </button>
        <button onclick="deleteClass('${item.id}')" class="p-2.5 rounded-xl bg-slate-800 hover:bg-rose-500 hover:text-white text-slate-300 transition" title="Delete Session">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

// Gym Admin Class CRUD Controls
function openAddClassModal() {
  document.getElementById('editClassId').value = '';
  document.getElementById('classModalTitle').textContent = 'Add Fitness Class Session';
  document.getElementById('classSubmitBtn').textContent = 'Save Class Session';

  document.getElementById('classTitle').value = '';
  document.getElementById('classTrainer').value = '';
  document.getElementById('classCategory').value = '';
  document.getElementById('classTime').value = '';
  document.getElementById('classImage').value = '';

  openModal('classModal');
}

function openEditClassModal(id) {
  const item = gymClasses.find(c => c.id === id);
  if (!item) return;

  document.getElementById('editClassId').value = item.id;
  document.getElementById('classModalTitle').textContent = 'Edit Class Session Details';
  document.getElementById('classSubmitBtn').textContent = 'Update Session';

  document.getElementById('classTitle').value = item.title;
  document.getElementById('classTrainer').value = item.trainer;
  document.getElementById('classCategory').value = item.category;
  document.getElementById('classDay').value = item.day;
  document.getElementById('classTime').value = item.time;
  document.getElementById('classImage').value = item.image;

  openModal('classModal');
}

function handleClassSubmit(e) {
  e.preventDefault();

  const editId = document.getElementById('editClassId').value;
  const newClassData = {
    id: editId || 'cls-' + Date.now(),
    title: document.getElementById('classTitle').value,
    trainer: document.getElementById('classTrainer').value,
    category: document.getElementById('classCategory').value,
    day: document.getElementById('classDay').value,
    time: document.getElementById('classTime').value,
    image: document.getElementById('classImage').value
  };

  if (editId) {
    const idx = gymClasses.findIndex(c => c.id === editId);
    if (idx !== -1) gymClasses[idx] = newClassData;
    showToast('Training session updated!', 'success');
  } else {
    gymClasses.unshift(newClassData);
    showToast('New fitness class published!', 'success');
  }

  saveClassesToStorage();
  closeModal('classModal');
  filterClasses(currentDayFilter);
}

function deleteClass(id) {
  if (confirm('Are you sure you want to cancel and remove this class session?')) {
    gymClasses = gymClasses.filter(c => c.id !== id);
    saveClassesToStorage();
    filterClasses(currentDayFilter);
    showToast('Class session removed from timetable', 'info');
  }
}

// BMR & Calorie Calculator Engine
function calculateBMR() {
  const gender = document.getElementById('bmrGender').value;
  const age = parseFloat(document.getElementById('bmrAge').value) || 25;
  const weight = parseFloat(document.getElementById('bmrWeight').value) || 75;
  const height = parseFloat(document.getElementById('bmrHeight').value) || 178;
  const activity = parseFloat(document.getElementById('bmrActivity').value) || 1.375;

  let bmr = 0;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  const tdee = bmr * activity;

  document.getElementById('bmrOutput').textContent = `${Math.round(bmr).toLocaleString()} kcal`;
  document.getElementById('tdeeOutput').textContent = `${Math.round(tdee).toLocaleString()} kcal/day`;
  document.getElementById('fatLossOutput').textContent = `${Math.round(tdee - 500).toLocaleString()} kcal`;
  document.getElementById('muscleGainOutput').textContent = `${Math.round(tdee + 300).toLocaleString()} kcal`;
}

// Pricing Toggle
function togglePlanBilling() {
  isAnnualPlan = !isAnnualPlan;
  const circle = document.getElementById('planToggleCircle');
  
  if (isAnnualPlan) {
    circle.classList.add('translate-x-6');
  } else {
    circle.classList.remove('translate-x-6');
  }

  document.querySelectorAll('.plan-price').forEach(el => {
    el.textContent = isAnnualPlan ? el.getAttribute('data-annual') : el.getAttribute('data-monthly');
  });
}

// Settings & Auth Handlers
function handleSettingsSave(e) {
  e.preventDefault();
  showToast('Member profile settings updated!', 'success');
}

function handleAuthLogin(e) {
  e.preventDefault();
  closeModal('authModal');
  showToast('Logged in as Member Sourabh Kumar', 'success');
}

function handlePassSubmit(e) {
  e.preventDefault();
  closeModal('bookingModal');
  showToast('Class reservation confirmed! Confirmation sent to email.', 'success');
}

// Modal Helpers
function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

// Toast System
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `px-4 py-3 rounded-xl text-xs font-bold text-white shadow-xl backdrop-blur-md border flex items-center gap-2 pointer-events-auto transition transform translate-y-2 opacity-0 ${type === 'success' ? 'bg-emerald-600/90 border-emerald-400' : 'bg-slate-800/90 border-slate-600'}`;
  toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${message}`;

  container.appendChild(toast);
  setTimeout(() => toast.classList.remove('translate-y-2', 'opacity-0'), 10);
  setTimeout(() => {
    toast.classList.add('opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
