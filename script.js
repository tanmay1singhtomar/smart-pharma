/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Smart Warehouse – Medicine Inventory Management System
 * Pure Vanilla JavaScript Implementation (Zero Frameworks, Zero External APIs)
 * Designed for BTech 3rd-Year Academic Project Demonstration
 * 
 * Core Capabilities:
 * 1. LocalStorage Persistence & Initial Pharma Seed Data
 * 2. Real-time Inventory Analytics (Units, Low Stock, Expiring, Out of Stock, INR Valuation)
 * 3. Dynamic HTML5 Canvas Chart Visualizer
 * 4. Multi-criteria Filtering, Live Search, Sorting & Pagination
 * 5. Complete CRUD for Medicine Master & Stock Movement Ledger (In/Out/Returned/Damaged)
 * 6. Automated Expiry Tracking & Low Stock Detection
 * 7. Smart Rule-Based Reorder Engine: ROP = (ADU * LeadTime) + SafetyStock
 * 8. Report Generator with Formatted Printing and Pure JS CSV Exporter
 * 9. Live Notification Bell & Drawer
 * 10. Authentication & Configurable Warehouse Settings
 */

(function () {
  'use strict';

  // ==========================================================================
  // 1. DATA MODELS & INITIAL SEED DATA
  // ==========================================================================
  
  // Storage Keys
  const STORAGE_KEYS = {
    MEDICINES: 'smartmed_medicines_v2',
    MOVEMENTS: 'smartmed_movements_v2',
    SETTINGS: 'smartmed_settings_v2',
    AUTH: 'smartmed_auth_v2',
    NOTIFS: 'smartmed_notifs_v2'
  };

  // Indian Pharmaceutical Sample Dataset
  const INITIAL_MEDICINES = [
    {
      id: "MED-1001",
      name: "Paracetamol 500mg",
      category: "Analgesic",
      batch: "BTH-PAR-2401",
      quantity: 350,
      minStock: 100,
      maxStock: 800,
      mfgDate: "2025-01-15",
      expiryDate: "2027-03-31",
      supplier: "Cipla Ltd",
      purchasePrice: 12.50,
      sellingPrice: 20.00,
      dailyUsage: 25,
      leadTimeDays: 4,
      safetyStock: 40
    },
    {
      id: "MED-1002",
      name: "Amoxicillin 500mg",
      category: "Antibiotic",
      batch: "BTH-AMX-2402",
      quantity: 42,
      minStock: 80,
      maxStock: 500,
      mfgDate: "2024-04-10",
      // Expiring in ~12 days from reference local time (2026-09-24)
      expiryDate: "2026-10-06",
      supplier: "Sun Pharma",
      purchasePrice: 65.00,
      sellingPrice: 95.00,
      dailyUsage: 10,
      leadTimeDays: 6,
      safetyStock: 30
    },
    {
      id: "MED-1003",
      name: "Azithromycin 250mg",
      category: "Antibiotic",
      batch: "BTH-AZI-2403",
      quantity: 180,
      minStock: 60,
      maxStock: 400,
      mfgDate: "2025-03-12",
      expiryDate: "2027-08-15",
      supplier: "Cipla Ltd",
      purchasePrice: 85.00,
      sellingPrice: 125.00,
      dailyUsage: 8,
      leadTimeDays: 5,
      safetyStock: 20
    },
    {
      id: "MED-1004",
      name: "Cetirizine 10mg",
      category: "Antihistamine",
      batch: "BTH-CET-2404",
      quantity: 28,
      minStock: 60,
      maxStock: 300,
      mfgDate: "2025-02-10",
      expiryDate: "2027-04-20",
      supplier: "Dr. Reddy's Lab",
      purchasePrice: 18.00,
      sellingPrice: 28.00,
      dailyUsage: 12,
      leadTimeDays: 4,
      safetyStock: 25
    },
    {
      id: "MED-1005",
      name: "Ibuprofen 400mg",
      category: "Analgesic",
      batch: "BTH-IBU-2405",
      quantity: 240,
      minStock: 90,
      maxStock: 500,
      mfgDate: "2025-01-20",
      expiryDate: "2027-09-10",
      supplier: "Abbott India",
      purchasePrice: 22.00,
      sellingPrice: 35.00,
      dailyUsage: 15,
      leadTimeDays: 3,
      safetyStock: 30
    },
    {
      id: "MED-1006",
      name: "Omeprazole 20mg",
      category: "Gastrointestinal",
      batch: "BTH-OME-2406",
      quantity: 165,
      minStock: 70,
      maxStock: 400,
      mfgDate: "2025-05-18",
      expiryDate: "2027-05-18",
      supplier: "Dr. Reddy's Lab",
      purchasePrice: 32.00,
      sellingPrice: 48.00,
      dailyUsage: 14,
      leadTimeDays: 5,
      safetyStock: 25
    },
    {
      id: "MED-1007",
      name: "Metformin 500mg",
      category: "Antidiabetic",
      batch: "BTH-MET-2407",
      quantity: 0, // OUT OF STOCK
      minStock: 120,
      maxStock: 600,
      mfgDate: "2025-01-10",
      expiryDate: "2027-03-31",
      supplier: "USV Pvt Ltd",
      purchasePrice: 28.00,
      sellingPrice: 42.00,
      dailyUsage: 22,
      leadTimeDays: 5,
      safetyStock: 50
    },
    {
      id: "MED-1008",
      name: "Vitamin D3 60,000 IU",
      category: "Vitamins & Supplements",
      batch: "BTH-VIT-2408",
      quantity: 290,
      minStock: 60,
      maxStock: 500,
      mfgDate: "2025-06-10",
      expiryDate: "2027-11-20",
      supplier: "Alkem Laboratories",
      purchasePrice: 75.00,
      sellingPrice: 110.00,
      dailyUsage: 9,
      leadTimeDays: 4,
      safetyStock: 25
    },
    {
      id: "MED-1009",
      name: "Atorvastatin 20mg",
      category: "Cardiovascular",
      batch: "BTH-ATO-2409",
      quantity: 45,
      minStock: 80,
      maxStock: 400,
      mfgDate: "2025-02-14",
      expiryDate: "2027-01-14",
      supplier: "Zydus Cadila",
      purchasePrice: 92.00,
      sellingPrice: 140.00,
      dailyUsage: 11,
      leadTimeDays: 7,
      safetyStock: 35
    },
    {
      id: "MED-1010",
      name: "Pantoprazole 40mg",
      category: "Gastrointestinal",
      batch: "BTH-PAN-2410",
      quantity: 320,
      minStock: 90,
      maxStock: 550,
      mfgDate: "2025-07-01",
      expiryDate: "2027-07-01",
      supplier: "Alkem Laboratories",
      purchasePrice: 48.00,
      sellingPrice: 72.00,
      dailyUsage: 16,
      leadTimeDays: 4,
      safetyStock: 30
    },
    {
      id: "MED-1011",
      name: "Ciprofloxacin 500mg",
      category: "Antibiotic",
      batch: "BTH-CIP-2411",
      quantity: 65,
      minStock: 60,
      maxStock: 300,
      mfgDate: "2024-01-10",
      // Expired 6 days ago relative to 2026-09-24
      expiryDate: "2026-09-18",
      supplier: "Cipla Ltd",
      purchasePrice: 54.00,
      sellingPrice: 80.00,
      dailyUsage: 8,
      leadTimeDays: 5,
      safetyStock: 20
    },
    {
      id: "MED-1012",
      name: "Telmisartan 40mg",
      category: "Cardiovascular",
      batch: "BTH-TEL-2412",
      quantity: 210,
      minStock: 70,
      maxStock: 450,
      mfgDate: "2025-03-25",
      expiryDate: "2027-10-30",
      supplier: "Glenmark Pharma",
      purchasePrice: 68.00,
      sellingPrice: 105.00,
      dailyUsage: 12,
      leadTimeDays: 5,
      safetyStock: 25
    },
    {
      id: "MED-1013",
      name: "Doxycycline 100mg",
      category: "Antibiotic",
      batch: "BTH-DOX-2413",
      quantity: 140,
      minStock: 50,
      maxStock: 300,
      mfgDate: "2025-04-05",
      expiryDate: "2027-06-15",
      supplier: "Torrent Pharma",
      purchasePrice: 42.00,
      sellingPrice: 65.00,
      dailyUsage: 7,
      leadTimeDays: 4,
      safetyStock: 15
    },
    {
      id: "MED-1014",
      name: "Losartan Potassium 50mg",
      category: "Cardiovascular",
      batch: "BTH-LOS-2414",
      quantity: 35,
      minStock: 65,
      maxStock: 300,
      mfgDate: "2025-02-22",
      expiryDate: "2027-02-22",
      supplier: "Torrent Pharma",
      purchasePrice: 58.00,
      sellingPrice: 88.00,
      dailyUsage: 9,
      leadTimeDays: 6,
      safetyStock: 25
    },
    {
      id: "MED-1015",
      name: "Montelukast 10mg",
      category: "Respiratory",
      batch: "BTH-MON-2415",
      quantity: 220,
      minStock: 75,
      maxStock: 400,
      mfgDate: "2025-05-15",
      expiryDate: "2027-05-15",
      supplier: "Mankind Pharma",
      purchasePrice: 78.00,
      sellingPrice: 115.00,
      dailyUsage: 10,
      leadTimeDays: 4,
      safetyStock: 25
    }
  ];

  const INITIAL_MOVEMENTS = [
    {
      id: "TXN-901",
      medicineId: "MED-1007",
      medicineName: "Metformin 500mg",
      type: "Stock Out",
      quantity: 120,
      date: "2026-09-23 15:30",
      user: "Dr. Rajesh Sharma",
      reason: "Emergency Ward Refill - Exhausted Remaining Lot"
    },
    {
      id: "TXN-902",
      medicineId: "MED-1001",
      medicineName: "Paracetamol 500mg",
      type: "Stock In",
      quantity: 200,
      date: "2026-09-23 11:15",
      user: "Suresh Kumar",
      reason: "Direct Bulk Delivery from Cipla Depot"
    },
    {
      id: "TXN-903",
      medicineId: "MED-1002",
      medicineName: "Amoxicillin 500mg",
      type: "Stock Out",
      quantity: 38,
      date: "2026-09-22 17:40",
      user: "Dr. Rajesh Sharma",
      reason: "OPD Prescription Dispatch"
    },
    {
      id: "TXN-904",
      medicineId: "MED-1008",
      medicineName: "Vitamin D3 60,000 IU",
      type: "Stock In",
      quantity: 150,
      date: "2026-09-22 09:20",
      user: "Suresh Kumar",
      reason: "Preventive Care Seasonal Stocking"
    },
    {
      id: "TXN-905",
      medicineId: "MED-1011",
      medicineName: "Ciprofloxacin 500mg",
      type: "Damaged",
      quantity: 15,
      date: "2026-09-21 14:10",
      user: "Anjali Verma",
      reason: "Moisture seepage on carton corner during transit"
    },
    {
      id: "TXN-906",
      medicineId: "MED-1005",
      medicineName: "Ibuprofen 400mg",
      type: "Returned",
      quantity: 10,
      date: "2026-09-20 16:05",
      user: "Dr. Rajesh Sharma",
      reason: "Unused surgical floor surplus return"
    },
    {
      id: "TXN-907",
      medicineId: "MED-1004",
      medicineName: "Cetirizine 10mg",
      type: "Stock Out",
      quantity: 32,
      date: "2026-09-19 12:25",
      user: "Suresh Kumar",
      reason: "Allergy Ward Weekly Supply"
    },
    {
      id: "TXN-908",
      medicineId: "MED-1009",
      medicineName: "Atorvastatin 20mg",
      type: "Stock Out",
      quantity: 35,
      date: "2026-09-18 10:45",
      user: "Dr. Rajesh Sharma",
      reason: "Cardiology Inpatient Dispensary Allocation"
    }
  ];

  const DEFAULT_SETTINGS = {
    warehouseName: "Apex Pharma Central Logistics Hub - Unit #4",
    licenseNo: "DL-ND-2024-PH-8891",
    managerName: "Dr. Rajesh Sharma",
    managerRole: "Chief Pharmacist & Inventory Lead",
    email: "rajesh.sharma@apexpharma.in",
    currency: "INR (₹)",
    theme: "light",
    strictAlerts: true
  };

  // ==========================================================================
  // 2. STATE REPOSITORY (LOCALSTORAGE)
  // ==========================================================================
  
  const AppState = {
    medicines: [],
    movements: [],
    settings: {},
    notifications: [],
    currentUser: null,
    activeView: 'dashboard',
    
    // Inventory table state
    inventoryFilter: {
      search: '',
      category: 'all',
      status: 'all',
      sortBy: 'name',
      sortDir: 'asc',
      page: 1,
      pageSize: 10
    },

    init() {
      // 1. Load or seed medicines
      const storedMeds = localStorage.getItem(STORAGE_KEYS.MEDICINES);
      if (storedMeds) {
        try {
          this.medicines = JSON.parse(storedMeds);
        } catch (e) {
          this.medicines = [...INITIAL_MEDICINES];
        }
      } else {
        this.medicines = [...INITIAL_MEDICINES];
        this.saveMedicines();
      }

      // 2. Load or seed movements
      const storedMoves = localStorage.getItem(STORAGE_KEYS.MOVEMENTS);
      if (storedMoves) {
        try {
          this.movements = JSON.parse(storedMoves);
        } catch (e) {
          this.movements = [...INITIAL_MOVEMENTS];
        }
      } else {
        this.movements = [...INITIAL_MOVEMENTS];
        this.saveMovements();
      }

      // 3. Load or seed settings
      const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (storedSettings) {
        try {
          this.settings = JSON.parse(storedSettings);
        } catch (e) {
          this.settings = { ...DEFAULT_SETTINGS };
        }
      } else {
        this.settings = { ...DEFAULT_SETTINGS };
        this.saveSettings();
      }

      // Apply saved theme
      if (this.settings.theme === 'dark') {
        document.body.classList.add('dark-theme');
      } else {
        document.body.classList.remove('dark-theme');
      }

      // 4. Load Auth
      const storedAuth = localStorage.getItem(STORAGE_KEYS.AUTH);
      if (storedAuth) {
        try {
          this.currentUser = JSON.parse(storedAuth);
        } catch (e) {
          this.currentUser = null;
        }
      }

      // 5. Generate notifications
      this.generateLiveNotifications();
    },

    saveMedicines() {
      localStorage.setItem(STORAGE_KEYS.MEDICINES, JSON.stringify(this.medicines));
    },

    saveMovements() {
      localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(this.movements));
    },

    saveSettings() {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
    },

    saveAuth() {
      if (this.currentUser) {
        localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(this.currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEYS.AUTH);
      }
    },

    resetAllData() {
      this.medicines = JSON.parse(JSON.stringify(INITIAL_MEDICINES));
      this.movements = JSON.parse(JSON.stringify(INITIAL_MOVEMENTS));
      this.settings = { ...DEFAULT_SETTINGS };
      this.saveMedicines();
      this.saveMovements();
      this.saveSettings();
      this.generateLiveNotifications();
    },

    // Automated Alert & Notification Generator
    generateLiveNotifications() {
      const notifs = [];
      const today = new Date();

      this.medicines.forEach(med => {
        const expDate = new Date(med.expiryDate);
        const daysToExpiry = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));

        // Out of stock
        if (med.quantity <= 0) {
          notifs.push({
            id: `notif-oos-${med.id}`,
            type: 'danger',
            title: `Critical Out of Stock: ${med.name}`,
            desc: `Inventory count is 0 units. Immediate procurement requisition needed.`,
            time: 'System Alert'
          });
        }
        // Low stock
        else if (med.quantity <= med.minStock) {
          notifs.push({
            id: `notif-low-${med.id}`,
            type: 'warning',
            title: `Low Stock Warning: ${med.name}`,
            desc: `Current stock (${med.quantity} units) is below minimum threshold (${med.minStock} units).`,
            time: 'Threshold Monitor'
          });
        }

        // Expired
        if (daysToExpiry < 0) {
          notifs.push({
            id: `notif-exp-${med.id}`,
            type: 'danger',
            title: `Expired Batch Alert: ${med.name}`,
            desc: `Batch ${med.batch} expired ${Math.abs(daysToExpiry)} days ago. Quarantine immediately!`,
            time: 'Quality Control'
          });
        }
        // Expiring in <= 30 days
        else if (daysToExpiry <= 30) {
          notifs.push({
            id: `notif-exps-${med.id}`,
            type: 'warning',
            title: `Expiring Soon: ${med.name}`,
            desc: `Batch ${med.batch} will expire in ${daysToExpiry} days (${med.expiryDate}). Prioritize dispatch.`,
            time: 'Shelf Life Monitor'
          });
        }
      });

      // Recent Stock movement notice
      if (this.movements.length > 0) {
        const lastMove = this.movements[0];
        notifs.push({
          id: `notif-move-${lastMove.id}`,
          type: 'info',
          title: `Recent Stock Movement: ${lastMove.type}`,
          desc: `${lastMove.quantity} units of ${lastMove.medicineName} logged by ${lastMove.user}.`,
          time: lastMove.date
        });
      }

      this.notifications = notifs;
      this.updateNotificationBadge();
    },

    updateNotificationBadge() {
      const badge = document.getElementById('notif-badge-count');
      const drawerBadge = document.getElementById('drawer-badge-count');
      const count = this.notifications.length;
      if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
      }
      if (drawerBadge) {
        drawerBadge.textContent = `${count} alerts`;
      }
    }
  };

  // ==========================================================================
  // 3. UTILITIES & CALCULATORS
  // ==========================================================================
  
  // Format Indian Currency (₹)
  function formatINR(number) {
    if (isNaN(number)) return '₹0.00';
    return '₹ ' + Number(number).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  // Calculate Days Remaining to Expiry
  function getDaysToExpiry(expiryDateStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exp = new Date(expiryDateStr);
    exp.setHours(0, 0, 0, 0);
    return Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
  }

  // Automatic Medicine Status Evaluator
  function getMedicineStatus(med) {
    const days = getDaysToExpiry(med.expiryDate);
    if (days < 0) {
      return { code: 'expired', label: 'Expired', badgeClass: 'badge expired' };
    }
    if (med.quantity <= 0) {
      return { code: 'out-of-stock', label: 'Out of Stock', badgeClass: 'badge out-of-stock' };
    }
    if (days <= 30) {
      return { code: 'expiring-soon', label: 'Expiring Soon', badgeClass: 'badge expiring-30' };
    }
    if (med.quantity <= med.minStock) {
      return { code: 'low-stock', label: 'Low Stock', badgeClass: 'badge low-stock' };
    }
    return { code: 'in-stock', label: 'In Stock', badgeClass: 'badge in-stock' };
  }

  // Toast Notification Trigger
  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Icon based on type
    let iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
    if (type === 'success') {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
    } else if (type === 'danger') {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
    }

    toast.innerHTML = `${iconSvg} <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => toast.remove(), 250);
    }, 3500);
  }

  // ==========================================================================
  // 4. CHART VISUALIZATION (VANILLA HTML5 CANVAS)
  // ==========================================================================
  
  function renderStockOverviewChart() {
    const canvas = document.getElementById('stock-canvas-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    // Scale for crisp high DPI rendering
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    ctx.clearRect(0, 0, width, height);

    // Group medicines by category and aggregate total stock units
    const categoryTotals = {};
    AppState.medicines.forEach(m => {
      categoryTotals[m.category] = (categoryTotals[m.category] || 0) + Number(m.quantity);
    });

    const categories = Object.keys(categoryTotals);
    if (categories.length === 0) return;

    const values = categories.map(c => categoryTotals[c]);
    const maxVal = Math.max(...values, 100);

    // Layout configuration
    const paddingLeft = 45;
    const paddingRight = 20;
    const paddingTop = 25;
    const paddingBottom = 45;
    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    // Background horizontal grid lines
    const gridLines = 4;
    ctx.lineWidth = 1;
    ctx.strokeStyle = document.body.classList.contains('dark-theme') ? '#1e293b' : '#f1f5f9';
    ctx.fillStyle = document.body.classList.contains('dark-theme') ? '#94a3b8' : '#64748b';
    ctx.font = '10px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'right';

    for (let i = 0; i <= gridLines; i++) {
      const y = paddingTop + (chartHeight / gridLines) * i;
      const valLabel = Math.round(maxVal - (maxVal / gridLines) * i);
      
      ctx.beginPath();
      ctx.moveTo(paddingLeft, y);
      ctx.lineTo(width - paddingRight, y);
      ctx.stroke();

      ctx.fillText(valLabel, paddingLeft - 8, y + 3);
    }

    // Bar drawing
    const barWidth = Math.min(36, (chartWidth / categories.length) * 0.6);
    const step = chartWidth / categories.length;

    // Palette for bars
    const barColors = ['#2563eb', '#0d9488', '#d97706', '#7c3aed', '#dc2626', '#0284c7'];

    categories.forEach((cat, idx) => {
      const val = categoryTotals[cat];
      const barH = (val / maxVal) * chartHeight;
      const x = paddingLeft + (idx * step) + (step - barWidth) / 2;
      const y = paddingTop + chartHeight - barH;

      // Gradient Fill
      const grad = ctx.createLinearGradient(0, y, 0, y + barH);
      const color = barColors[idx % barColors.length];
      grad.addColorStop(0, color);
      grad.addColorStop(1, color + '99');

      ctx.fillStyle = grad;
      // Rounded bar top
      const r = 4;
      ctx.beginPath();
      ctx.moveTo(x, y + barH);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.lineTo(x + barWidth - r, y);
      ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + r);
      ctx.lineTo(x + barWidth, y + barH);
      ctx.closePath();
      ctx.fill();

      // Top value text
      ctx.fillStyle = document.body.classList.contains('dark-theme') ? '#f8fafc' : '#0f172a';
      ctx.textAlign = 'center';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(val, x + barWidth / 2, y - 5);

      // Category label (shortened)
      ctx.fillStyle = document.body.classList.contains('dark-theme') ? '#94a3b8' : '#64748b';
      ctx.font = '10px -apple-system, BlinkMacSystemFont, sans-serif';
      let label = cat;
      if (label.length > 10) label = label.substring(0, 9) + '…';
      ctx.fillText(label, x + barWidth / 2, height - paddingBottom + 16);
    });
  }

  // ==========================================================================
  // 5. VIEW ROUTER & NAVIGATION
  // ==========================================================================
  
  function navigateTo(viewId) {
    AppState.activeView = viewId;

    // Toggle active state on page views
    const views = document.querySelectorAll('.page-view');
    views.forEach(v => {
      if (v.id === `view-${viewId}`) {
        v.classList.add('active');
      } else {
        v.classList.remove('active');
      }
    });

    // Update sidebar navigation active links
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      if (item.getAttribute('data-view') === viewId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Close mobile sidebar if open
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.remove('mobile-open');

    // Render relevant view data
    switch (viewId) {
      case 'dashboard':
        renderDashboard();
        break;
      case 'inventory':
        renderInventoryTable();
        break;
      case 'movement':
        renderMovementsTable();
        break;
      case 'low-stock':
        renderLowStockTable();
        break;
      case 'expiry':
        renderExpiryTable();
        break;
      case 'reorder':
        renderReorderTable();
        break;
      case 'reports':
        generateSelectedReport();
        break;
      case 'settings':
        populateSettingsForm();
        break;
    }
  }

  // ==========================================================================
  // 6. DASHBOARD MODULE
  // ==========================================================================
  
  function renderDashboard() {
    const meds = AppState.medicines;
    
    // 1. Calculate KPI Metrics
    const totalMeds = meds.length;
    const totalUnits = meds.reduce((acc, m) => acc + Number(m.quantity), 0);
    const lowStockCount = meds.filter(m => m.quantity > 0 && m.quantity <= m.minStock).length;
    const outOfStockCount = meds.filter(m => m.quantity <= 0).length;
    
    // Expiring soon (days <= 30 and days >= 0)
    const expiringSoonCount = meds.filter(m => {
      const d = getDaysToExpiry(m.expiryDate);
      return d >= 0 && d <= 30;
    }).length;

    // Total Inventory Valuation (sum of purchasePrice * quantity)
    const totalValuation = meds.reduce((acc, m) => acc + (Number(m.purchasePrice) * Number(m.quantity)), 0);

    // Update KPI Card DOM
    document.getElementById('stat-total-meds').textContent = totalMeds;
    document.getElementById('stat-total-units').textContent = totalUnits.toLocaleString('en-IN');
    document.getElementById('stat-low-stock').textContent = lowStockCount;
    document.getElementById('stat-expiring').textContent = expiringSoonCount;
    document.getElementById('stat-out-of-stock').textContent = outOfStockCount;
    document.getElementById('stat-valuation').textContent = formatINR(totalValuation);

    // Update sidebar badges
    const navLowStock = document.getElementById('nav-badge-lowstock');
    if (navLowStock) {
      navLowStock.textContent = lowStockCount + outOfStockCount;
      navLowStock.style.display = (lowStockCount + outOfStockCount > 0) ? 'inline-block' : 'none';
    }

    const navExpiry = document.getElementById('nav-badge-expiry');
    if (navExpiry) {
      const expiredCount = meds.filter(m => getDaysToExpiry(m.expiryDate) < 0).length;
      navExpiry.textContent = expiringSoonCount + expiredCount;
      navExpiry.style.display = (expiringSoonCount + expiredCount > 0) ? 'inline-block' : 'none';
    }

    // 2. Render Canvas Chart
    setTimeout(renderStockOverviewChart, 50);

    // 3. Render Stock Health Breakdown
    const safeCount = meds.filter(m => {
      const d = getDaysToExpiry(m.expiryDate);
      return m.quantity > m.minStock && d > 30;
    }).length;

    const safePct = totalMeds ? Math.round((safeCount / totalMeds) * 100) : 0;
    const lowPct = totalMeds ? Math.round((lowStockCount / totalMeds) * 100) : 0;
    const expPct = totalMeds ? Math.round((expiringSoonCount / totalMeds) * 100) : 0;
    const oosPct = totalMeds ? Math.round((outOfStockCount / totalMeds) * 100) : 0;

    const healthList = document.getElementById('stock-health-container');
    if (healthList) {
      healthList.innerHTML = `
        <div class="stock-health-item">
          <div class="health-item-meta">
            <span class="health-item-title">
              <span style="color:#16a34a">●</span> Safe Stock Health
            </span>
            <span class="health-item-value">${safeCount} items (${safePct}%)</span>
          </div>
          <div class="progress-bar"><div class="progress-fill green" style="width: ${safePct}%"></div></div>
        </div>
        <div class="stock-health-item">
          <div class="health-item-meta">
            <span class="health-item-title">
              <span style="color:#d97706">●</span> Low Stock Reserves
            </span>
            <span class="health-item-value">${lowStockCount} items (${lowPct}%)</span>
          </div>
          <div class="progress-bar"><div class="progress-fill amber" style="width: ${lowPct}%"></div></div>
        </div>
        <div class="stock-health-item">
          <div class="health-item-meta">
            <span class="health-item-title">
              <span style="color:#2563eb">●</span> Expiring Within 30 Days
            </span>
            <span class="health-item-value">${expiringSoonCount} items (${expPct}%)</span>
          </div>
          <div class="progress-bar"><div class="progress-fill blue" style="width: ${expPct}%"></div></div>
        </div>
        <div class="stock-health-item">
          <div class="health-item-meta">
            <span class="health-item-title">
              <span style="color:#dc2626">●</span> Stock Out / Critical
            </span>
            <span class="health-item-value">${outOfStockCount} items (${oosPct}%)</span>
          </div>
          <div class="progress-bar"><div class="progress-fill rose" style="width: ${oosPct}%"></div></div>
        </div>
      `;
    }

    // 4. Render Dashboard Recent Movements Table (Top 5)
    const recentMovementsTbody = document.getElementById('dash-recent-movements-tbody');
    if (recentMovementsTbody) {
      const topMoves = AppState.movements.slice(0, 5);
      if (topMoves.length === 0) {
        recentMovementsTbody.innerHTML = `<tr><td colspan="4" class="text-center" style="padding:1.5rem; color:var(--text-muted);">No stock movements recorded yet.</td></tr>`;
      } else {
        recentMovementsTbody.innerHTML = topMoves.map(m => {
          let badgeClass = 'movement-in';
          if (m.type === 'Stock Out') badgeClass = 'movement-out';
          if (m.type === 'Returned') badgeClass = 'movement-returned';
          if (m.type === 'Damaged') badgeClass = 'movement-damaged';

          return `
            <tr>
              <td>
                <div style="font-weight:600">${escapeHtml(m.medicineName)}</div>
                <div style="font-size:0.7rem; color:var(--text-muted);">${escapeHtml(m.id)} · ${escapeHtml(m.reason)}</div>
              </td>
              <td><span class="badge ${badgeClass}">${escapeHtml(m.type)}</span></td>
              <td class="num font-bold" style="text-align:right;">${m.type === 'Stock Out' || m.type === 'Damaged' ? '-' : '+'}${m.quantity}</td>
              <td style="font-size:0.75rem; color:var(--text-muted); text-align:right;">${escapeHtml(m.date.split(' ')[0])}</td>
            </tr>
          `;
        }).join('');
      }
    }

    // 5. Render Dashboard Critical Low Stock Table
    const lowStockTbody = document.getElementById('dash-lowstock-tbody');
    if (lowStockTbody) {
      const criticalMeds = meds.filter(m => m.quantity <= m.minStock).slice(0, 5);
      if (criticalMeds.length === 0) {
        lowStockTbody.innerHTML = `<tr><td colspan="4" class="text-center" style="padding:1.5rem; color:var(--text-muted);">All medicine stocks are at safe levels.</td></tr>`;
      } else {
        lowStockTbody.innerHTML = criticalMeds.map(m => {
          const shortage = Math.max(0, m.minStock - m.quantity);
          const status = getMedicineStatus(m);
          return `
            <tr>
              <td>
                <div style="font-weight:600">${escapeHtml(m.name)}</div>
                <div style="font-size:0.7rem; color:var(--text-muted);">${escapeHtml(m.category)} · ${escapeHtml(m.supplier)}</div>
              </td>
              <td class="num" style="text-align:center;">
                <span style="font-weight:700; color:${m.quantity === 0 ? 'var(--danger)' : 'var(--warning)'};">${m.quantity}</span> / ${m.minStock}
              </td>
              <td class="num" style="text-align:center; color:var(--danger); font-weight:600;">-${shortage}</td>
              <td style="text-align:right;">
                <button class="btn-text-sm" onclick="SmartWarehouse.quickOrderModal('${m.id}')" style="font-size:0.75rem; padding:0.2rem 0.5rem; border:1px solid var(--primary-border);">
                  Reorder
                </button>
              </td>
            </tr>
          `;
        }).join('');
      }
    }

    // 6. Render Dashboard Expiring Soon Table
    const expiringTbody = document.getElementById('dash-expiring-tbody');
    if (expiringTbody) {
      const expList = meds
        .map(m => ({ ...m, daysRemaining: getDaysToExpiry(m.expiryDate) }))
        .filter(m => m.daysRemaining <= 45)
        .sort((a, b) => a.daysRemaining - b.daysRemaining)
        .slice(0, 5);

      if (expList.length === 0) {
        expiringTbody.innerHTML = `<tr><td colspan="4" class="text-center" style="padding:1.5rem; color:var(--text-muted);">No batches nearing expiration within 45 days.</td></tr>`;
      } else {
        expiringTbody.innerHTML = expList.map(m => {
          let badgeText = `${m.daysRemaining} days`;
          let badgeClass = 'badge expiring-30';
          if (m.daysRemaining < 0) {
            badgeText = `Expired (${Math.abs(m.daysRemaining)}d ago)`;
            badgeClass = 'badge expired';
          } else if (m.daysRemaining <= 7) {
            badgeText = `${m.daysRemaining} days (Critical)`;
            badgeClass = 'badge expiring-7';
          }

          return `
            <tr>
              <td>
                <div style="font-weight:600">${escapeHtml(m.name)}</div>
                <div style="font-size:0.7rem; color:var(--text-muted);">Batch: ${escapeHtml(m.batch)}</div>
              </td>
              <td style="font-size:0.75rem;">${m.expiryDate}</td>
              <td class="num" style="text-align:center;">${m.quantity}</td>
              <td style="text-align:right;"><span class="${badgeClass}">${badgeText}</span></td>
            </tr>
          `;
        }).join('');
      }
    }
  }

  // ==========================================================================
  // 7. INVENTORY PAGE MODULE (SEARCH, FILTER, SORT, CRUD, PAGINATION)
  // ==========================================================================
  
  function renderInventoryTable() {
    const filter = AppState.inventoryFilter;
    let list = [...AppState.medicines];

    // Category Filter
    if (filter.category !== 'all') {
      list = list.filter(m => m.category === filter.category);
    }

    // Status Filter
    if (filter.status !== 'all') {
      list = list.filter(m => {
        const s = getMedicineStatus(m);
        return s.code === filter.status;
      });
    }

    // Text Search
    if (filter.search.trim()) {
      const term = filter.search.toLowerCase().trim();
      list = list.filter(m =>
        m.name.toLowerCase().includes(term) ||
        m.id.toLowerCase().includes(term) ||
        m.batch.toLowerCase().includes(term) ||
        m.supplier.toLowerCase().includes(term) ||
        m.category.toLowerCase().includes(term)
      );
    }

    // Sort
    list.sort((a, b) => {
      let valA = a[filter.sortBy];
      let valB = b[filter.sortBy];

      if (filter.sortBy === 'name' || filter.sortBy === 'category' || filter.sortBy === 'supplier') {
        valA = (valA || '').toString().toLowerCase();
        valB = (valB || '').toString().toLowerCase();
        return filter.sortDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      } else if (filter.sortBy === 'expiryDate') {
        const dateA = new Date(valA);
        const dateB = new Date(valB);
        return filter.sortDir === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        // numeric: quantity, purchasePrice, minStock
        valA = Number(valA);
        valB = Number(valB);
        return filter.sortDir === 'asc' ? valA - valB : valB - valA;
      }
    });

    // Populate category dropdown options if needed
    const catSelect = document.getElementById('inv-filter-category');
    if (catSelect && catSelect.options.length <= 1) {
      const categories = [...new Set(AppState.medicines.map(m => m.category))].sort();
      categories.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c;
        opt.textContent = c;
        catSelect.appendChild(opt);
      });
    }

    // Pagination calculations
    const totalRecords = list.length;
    const totalPages = Math.ceil(totalRecords / filter.pageSize) || 1;
    if (filter.page > totalPages) filter.page = totalPages;
    const startIndex = (filter.page - 1) * filter.pageSize;
    const pagedRecords = list.slice(startIndex, startIndex + filter.pageSize);

    // Update DOM table
    const tbody = document.getElementById('inventory-table-tbody');
    const emptyState = document.getElementById('inventory-empty-state');
    const tableEl = document.getElementById('inventory-data-table');

    if (totalRecords === 0) {
      if (tbody) tbody.innerHTML = '';
      if (tableEl) tableEl.style.display = 'none';
      if (emptyState) emptyState.style.display = 'block';
    } else {
      if (emptyState) emptyState.style.display = 'none';
      if (tableEl) tableEl.style.display = 'table';

      tbody.innerHTML = pagedRecords.map(m => {
        const status = getMedicineStatus(m);
        return `
          <tr>
            <td class="num font-bold" style="color:var(--primary); font-size:0.75rem;">${escapeHtml(m.id)}</td>
            <td>
              <div style="font-weight:600; color:var(--text-main);">${escapeHtml(m.name)}</div>
              <div style="font-size:0.7rem; color:var(--text-muted);">ADU: ${m.dailyUsage}/day · Lead: ${m.leadTimeDays}d</div>
            </td>
            <td><span style="font-size:0.75rem; color:var(--text-muted);">${escapeHtml(m.category)}</span></td>
            <td class="num" style="font-size:0.75rem;">${escapeHtml(m.batch)}</td>
            <td class="num" style="font-weight:700; text-align:right;">${m.quantity}</td>
            <td class="num" style="color:var(--text-muted); text-align:right;">${m.minStock}</td>
            <td style="font-size:0.75rem; text-align:center;">${m.expiryDate}</td>
            <td style="font-size:0.75rem;">${escapeHtml(m.supplier)}</td>
            <td class="num" style="text-align:right; font-weight:600;">${formatINR(m.purchasePrice)}</td>
            <td><span class="${status.badgeClass}">${status.label}</span></td>
            <td>
              <div class="table-actions">
                <button class="action-btn btn-edit" title="Edit Medicine" onclick="SmartWarehouse.openEditMedicineModal('${m.id}')">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                </button>
                <button class="action-btn" title="Quick Stock Movement" onclick="SmartWarehouse.openStockModalWithMedicine('${m.id}')">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 16V4M7 4L3 8M7 4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/></svg>
                </button>
                <button class="action-btn btn-delete" title="Delete Medicine" onclick="SmartWarehouse.deleteMedicine('${m.id}')">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }

    // Pagination info & controls
    const infoEl = document.getElementById('inv-pagination-info');
    if (infoEl) {
      const from = totalRecords === 0 ? 0 : startIndex + 1;
      const to = Math.min(startIndex + filter.pageSize, totalRecords);
      infoEl.textContent = `Showing ${from} - ${to} of ${totalRecords} medicines`;
    }

    const prevBtn = document.getElementById('inv-page-prev');
    const nextBtn = document.getElementById('inv-page-next');
    const pageNum = document.getElementById('inv-current-page');

    if (prevBtn) prevBtn.disabled = filter.page <= 1;
    if (nextBtn) nextBtn.disabled = filter.page >= totalPages;
    if (pageNum) pageNum.textContent = `Page ${filter.page} of ${totalPages || 1}`;
  }

  // ==========================================================================
  // 8. ADD & EDIT MEDICINE MODULE
  // ==========================================================================
  
  function openAddMedicineModal() {
    const form = document.getElementById('add-medicine-form');
    if (!form) return;
    form.reset();

    // Auto generate next Medicine ID
    const nextNum = 1000 + AppState.medicines.length + 1;
    document.getElementById('med-input-id').value = `MED-${nextNum}`;
    document.getElementById('med-modal-mode').value = 'add';
    document.getElementById('med-modal-title').textContent = 'Add New Medicine to Warehouse';

    openModal('modal-add-medicine');
  }

  function openEditMedicineModal(id) {
    const med = AppState.medicines.find(m => m.id === id);
    if (!med) return;

    document.getElementById('med-modal-mode').value = 'edit';
    document.getElementById('med-modal-title').textContent = `Edit Medicine (${med.id})`;

    document.getElementById('med-input-id').value = med.id;
    document.getElementById('med-input-name').value = med.name;
    document.getElementById('med-input-category').value = med.category;
    document.getElementById('med-input-batch').value = med.batch;
    document.getElementById('med-input-qty').value = med.quantity;
    document.getElementById('med-input-min').value = med.minStock;
    document.getElementById('med-input-max').value = med.maxStock || med.minStock * 4;
    document.getElementById('med-input-mfg').value = med.mfgDate;
    document.getElementById('med-input-exp').value = med.expiryDate;
    document.getElementById('med-input-supplier').value = med.supplier;
    document.getElementById('med-input-buyprice').value = med.purchasePrice;
    document.getElementById('med-input-sellprice').value = med.sellingPrice;
    document.getElementById('med-input-usage').value = med.dailyUsage || 10;
    document.getElementById('med-input-lead').value = med.leadTimeDays || 4;

    openModal('modal-add-medicine');
  }

  function handleSaveMedicine(e) {
    e.preventDefault();

    const id = document.getElementById('med-input-id').value.trim();
    const name = document.getElementById('med-input-name').value.trim();
    const category = document.getElementById('med-input-category').value.trim();
    const batch = document.getElementById('med-input-batch').value.trim();
    const qty = parseInt(document.getElementById('med-input-qty').value, 10);
    const minStock = parseInt(document.getElementById('med-input-min').value, 10);
    const maxStock = parseInt(document.getElementById('med-input-max').value, 10) || minStock * 4;
    const mfgDate = document.getElementById('med-input-mfg').value;
    const expiryDate = document.getElementById('med-input-exp').value;
    const supplier = document.getElementById('med-input-supplier').value.trim();
    const buyPrice = parseFloat(document.getElementById('med-input-buyprice').value);
    const sellPrice = parseFloat(document.getElementById('med-input-sellprice').value);
    const usage = parseInt(document.getElementById('med-input-usage').value, 10) || 10;
    const lead = parseInt(document.getElementById('med-input-lead').value, 10) || 4;
    const mode = document.getElementById('med-modal-mode').value;

    // Field Validation
    if (!id || !name || !category || !batch || isNaN(qty) || isNaN(minStock) || !mfgDate || !expiryDate || !supplier || isNaN(buyPrice) || isNaN(sellPrice)) {
      showToast('Please fill out all required fields with valid values.', 'danger');
      return;
    }

    if (new Date(expiryDate) <= new Date(mfgDate)) {
      showToast('Expiry date must be after manufacturing date.', 'danger');
      return;
    }

    if (qty < 0 || minStock < 0 || buyPrice < 0 || sellPrice < 0) {
      showToast('Quantities and prices cannot be negative.', 'danger');
      return;
    }

    const payload = {
      id,
      name,
      category,
      batch,
      quantity: qty,
      minStock,
      maxStock,
      mfgDate,
      expiryDate,
      supplier,
      purchasePrice: buyPrice,
      sellingPrice: sellPrice,
      dailyUsage: usage,
      leadTimeDays: lead,
      safetyStock: Math.round(usage * 2)
    };

    if (mode === 'add') {
      // Check ID duplicate
      if (AppState.medicines.some(m => m.id === id)) {
        showToast(`Medicine with ID ${id} already exists.`, 'danger');
        return;
      }
      AppState.medicines.unshift(payload);

      // Log initial movement for added batch
      if (qty > 0) {
        AppState.movements.unshift({
          id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
          medicineId: id,
          medicineName: name,
          type: "Stock In",
          quantity: qty,
          date: new Date().toISOString().replace('T', ' ').substring(0, 16),
          user: AppState.currentUser ? AppState.currentUser.name : "Warehouse Manager",
          reason: "Initial Stock Enrollment"
        });
        AppState.saveMovements();
      }

      showToast(`Medicine "${name}" enrolled successfully.`, 'success');
    } else {
      const idx = AppState.medicines.findIndex(m => m.id === id);
      if (idx !== -1) {
        AppState.medicines[idx] = payload;
        showToast(`Medicine "${name}" updated successfully.`, 'success');
      }
    }

    AppState.saveMedicines();
    AppState.generateLiveNotifications();
    closeModal('modal-add-medicine');

    // Refresh whichever view is visible
    if (AppState.activeView === 'inventory') renderInventoryTable();
    if (AppState.activeView === 'dashboard') renderDashboard();
    if (AppState.activeView === 'low-stock') renderLowStockTable();
    if (AppState.activeView === 'expiry') renderExpiryTable();
    if (AppState.activeView === 'reorder') renderReorderTable();
  }

  function deleteMedicine(id) {
    const med = AppState.medicines.find(m => m.id === id);
    if (!med) return;

    if (confirm(`Are you sure you want to delete ${med.name} (${med.id}) from warehouse inventory?`)) {
      AppState.medicines = AppState.medicines.filter(m => m.id !== id);
      AppState.saveMedicines();
      AppState.generateLiveNotifications();
      showToast(`Removed "${med.name}" from inventory.`, 'info');

      renderInventoryTable();
      if (AppState.activeView === 'dashboard') renderDashboard();
    }
  }

  // ==========================================================================
  // 9. STOCK MOVEMENT MODULE (IN, OUT, RETURNED, DAMAGED)
  // ==========================================================================
  
  function renderMovementsTable() {
    const tbody = document.getElementById('movement-table-tbody');
    if (!tbody) return;

    if (AppState.movements.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center" style="padding:2.5rem; color:var(--text-muted);">No stock movements recorded yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = AppState.movements.map(m => {
      let badgeClass = 'movement-in';
      let sign = '+';
      if (m.type === 'Stock Out') {
        badgeClass = 'movement-out';
        sign = '-';
      } else if (m.type === 'Returned') {
        badgeClass = 'movement-returned';
        sign = '+';
      } else if (m.type === 'Damaged') {
        badgeClass = 'movement-damaged';
        sign = '-';
      }

      return `
        <tr>
          <td class="num font-bold" style="color:var(--text-muted); font-size:0.75rem;">${escapeHtml(m.id)}</td>
          <td>
            <div style="font-weight:600;">${escapeHtml(m.medicineName)}</div>
            <div style="font-size:0.7rem; color:var(--text-muted);">${escapeHtml(m.medicineId || '')}</div>
          </td>
          <td><span class="badge ${badgeClass}">${escapeHtml(m.type)}</span></td>
          <td class="num font-bold" style="text-align:right;">${sign}${m.quantity} units</td>
          <td style="font-size:0.75rem; text-align:center;">${escapeHtml(m.date)}</td>
          <td style="font-size:0.75rem;">${escapeHtml(m.user)}</td>
          <td style="font-size:0.75rem; color:var(--text-muted);">${escapeHtml(m.reason)}</td>
        </tr>
      `;
    }).join('');
  }

  function openStockMovementModal(type = 'Stock In', defaultMedId = null) {
    const form = document.getElementById('stock-movement-form');
    if (!form) return;
    form.reset();

    const titleEl = document.getElementById('movement-modal-title');
    if (titleEl) titleEl.textContent = `Record New Stock Transaction (${type})`;

    const typeSelect = document.getElementById('move-input-type');
    if (typeSelect) typeSelect.value = type;

    // Populate medicine select
    const medSelect = document.getElementById('move-input-medicine');
    if (medSelect) {
      medSelect.innerHTML = `<option value="">-- Choose Medicine --</option>` +
        AppState.medicines.map(m => `<option value="${m.id}" ${defaultMedId === m.id ? 'selected' : ''}>${escapeHtml(m.name)} (Current: ${m.quantity})</option>`).join('');
    }

    // Default user
    const userField = document.getElementById('move-input-user');
    if (userField) {
      userField.value = AppState.currentUser ? AppState.currentUser.name : "Dr. Rajesh Sharma";
    }

    openModal('modal-stock-movement');
  }

  function openStockModalWithMedicine(medId) {
    openStockMovementModal('Stock In', medId);
  }

  function handleSaveStockMovement(e) {
    e.preventDefault();

    const medId = document.getElementById('move-input-medicine').value;
    const type = document.getElementById('move-input-type').value;
    const qty = parseInt(document.getElementById('move-input-qty').value, 10);
    const user = document.getElementById('move-input-user').value.trim() || 'Warehouse Pharmacist';
    const reason = document.getElementById('move-input-reason').value.trim() || 'General adjustment';

    if (!medId || isNaN(qty) || qty <= 0) {
      showToast('Please select a medicine and enter a positive quantity.', 'danger');
      return;
    }

    const med = AppState.medicines.find(m => m.id === medId);
    if (!med) {
      showToast('Selected medicine was not found.', 'danger');
      return;
    }

    // Check if stock out exceeds inventory
    if ((type === 'Stock Out' || type === 'Damaged') && qty > med.quantity) {
      showToast(`Cannot deduct ${qty} units. Current stock is only ${med.quantity} units!`, 'danger');
      return;
    }

    // Update actual medicine stock count
    if (type === 'Stock In' || type === 'Returned') {
      med.quantity += qty;
    } else if (type === 'Stock Out' || type === 'Damaged') {
      med.quantity -= qty;
    }

    // Generate Transaction Record
    const txnRecord = {
      id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      medicineId: med.id,
      medicineName: med.name,
      type,
      quantity: qty,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      user,
      reason
    };

    AppState.movements.unshift(txnRecord);
    AppState.saveMedicines();
    AppState.saveMovements();
    AppState.generateLiveNotifications();

    closeModal('modal-stock-movement');
    showToast(`Successfully recorded ${type} of ${qty} units for "${med.name}".`, 'success');

    // Re-render
    if (AppState.activeView === 'movement') renderMovementsTable();
    if (AppState.activeView === 'dashboard') renderDashboard();
    if (AppState.activeView === 'inventory') renderInventoryTable();
    if (AppState.activeView === 'low-stock') renderLowStockTable();
  }

  // ==========================================================================
  // 10. LOW STOCK MODULE & REORDER PURCHASE ORDER
  // ==========================================================================
  
  function renderLowStockTable() {
    const tbody = document.getElementById('lowstock-table-tbody');
    if (!tbody) return;

    // Filter medicines where quantity <= minStock
    const lowStockMeds = AppState.medicines.filter(m => m.quantity <= m.minStock);

    if (lowStockMeds.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="text-center" style="padding:2.5rem; color:var(--text-muted);">Excellent! No medicines are below the minimum threshold.</td></tr>`;
      return;
    }

    tbody.innerHTML = lowStockMeds.map(m => {
      const shortage = Math.max(0, m.minStock - m.quantity);
      // Suggested Reorder Quantity = (maxStock - currentQuantity)
      const suggestedQty = (m.maxStock || m.minStock * 4) - m.quantity;
      const status = getMedicineStatus(m);

      return `
        <tr>
          <td>
            <div style="font-weight:600;">${escapeHtml(m.name)}</div>
            <div style="font-size:0.7rem; color:var(--text-muted);">${escapeHtml(m.id)} · ${escapeHtml(m.category)}</div>
          </td>
          <td class="num" style="font-weight:700; color:${m.quantity === 0 ? 'var(--danger)' : 'var(--warning)'}; text-align:right;">
            ${m.quantity}
          </td>
          <td class="num" style="text-align:right; color:var(--text-muted);">${m.minStock}</td>
          <td class="num font-bold" style="text-align:right; color:var(--danger);">-${shortage} units</td>
          <td style="font-size:0.75rem;">${escapeHtml(m.supplier)}</td>
          <td class="num font-bold" style="text-align:right; color:var(--primary); font-size:0.875rem;">
            +${suggestedQty} units
          </td>
          <td><span class="${status.badgeClass}">${status.label}</span></td>
          <td>
            <button class="btn-action-primary" style="padding:0.35rem 0.75rem; font-size:0.75rem;" onclick="SmartWarehouse.quickOrderModal('${m.id}')">
              Generate Reorder
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  function quickOrderModal(medId) {
    const med = AppState.medicines.find(m => m.id === medId);
    if (!med) return;

    const suggested = (med.maxStock || med.minStock * 4) - med.quantity;
    
    document.getElementById('po-med-id').value = med.id;
    document.getElementById('po-med-name').textContent = `${med.name} (${med.id})`;
    document.getElementById('po-med-supplier').textContent = med.supplier;
    document.getElementById('po-med-curstock').textContent = `${med.quantity} units`;
    document.getElementById('po-med-minstock').textContent = `${med.minStock} units`;
    document.getElementById('po-order-qty').value = suggested > 0 ? suggested : med.minStock * 2;
    document.getElementById('po-unit-price').textContent = formatINR(med.purchasePrice);
    
    updatePOTotal();
    openModal('modal-generate-reorder');
  }

  function updatePOTotal() {
    const medId = document.getElementById('po-med-id').value;
    const qty = parseInt(document.getElementById('po-order-qty').value, 10) || 0;
    const med = AppState.medicines.find(m => m.id === medId);
    if (med) {
      const total = qty * med.purchasePrice;
      document.getElementById('po-total-cost').textContent = formatINR(total);
    }
  }

  function handleConfirmReorder() {
    const medId = document.getElementById('po-med-id').value;
    const qty = parseInt(document.getElementById('po-order-qty').value, 10);
    const med = AppState.medicines.find(m => m.id === medId);
    
    if (!med || isNaN(qty) || qty <= 0) {
      showToast('Invalid purchase order quantity.', 'danger');
      return;
    }

    // Auto log as incoming delivery or simulate instant fulfillment
    med.quantity += qty;
    
    AppState.movements.unshift({
      id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      medicineId: med.id,
      medicineName: med.name,
      type: "Stock In",
      quantity: qty,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      user: AppState.currentUser ? AppState.currentUser.name : "Procurement Lead",
      reason: `Automated Reorder Purchase Order from ${med.supplier}`
    });

    AppState.saveMedicines();
    AppState.saveMovements();
    AppState.generateLiveNotifications();

    closeModal('modal-generate-reorder');
    showToast(`Purchase order created! Added ${qty} units of "${med.name}" to inventory.`, 'success');

    if (AppState.activeView === 'low-stock') renderLowStockTable();
    if (AppState.activeView === 'dashboard') renderDashboard();
    if (AppState.activeView === 'inventory') renderInventoryTable();
    if (AppState.activeView === 'reorder') renderReorderTable();
  }

  // ==========================================================================
  // 11. EXPIRY TRACKING MODULE
  // ==========================================================================
  
  function renderExpiryTable(filterType = 'all') {
    const tbody = document.getElementById('expiry-table-tbody');
    if (!tbody) return;

    let list = AppState.medicines.map(m => {
      const days = getDaysToExpiry(m.expiryDate);
      let cat = 'safe';
      if (days < 0) cat = 'expired';
      else if (days <= 7) cat = 'expiring-7';
      else if (days <= 30) cat = 'expiring-30';

      return {
        ...m,
        daysRemaining: days,
        expiryCategory: cat
      };
    });

    // Apply Filter
    if (filterType !== 'all') {
      list = list.filter(m => m.expiryCategory === filterType);
    }

    // Sort by most critical expiration first
    list.sort((a, b) => a.daysRemaining - b.daysRemaining);

    // Summary counts for badges
    const expiredCount = AppState.medicines.filter(m => getDaysToExpiry(m.expiryDate) < 0).length;
    const exp7Count = AppState.medicines.filter(m => {
      const d = getDaysToExpiry(m.expiryDate);
      return d >= 0 && d <= 7;
    }).length;
    const exp30Count = AppState.medicines.filter(m => {
      const d = getDaysToExpiry(m.expiryDate);
      return d > 7 && d <= 30;
    }).length;

    const countExpEl = document.getElementById('exp-count-expired');
    const count7El = document.getElementById('exp-count-7');
    const count30El = document.getElementById('exp-count-30');

    if (countExpEl) countExpEl.textContent = expiredCount;
    if (count7El) count7El.textContent = exp7Count;
    if (count30El) count30El.textContent = exp30Count;

    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center" style="padding:2.5rem; color:var(--text-muted);">No records matching the selected expiry timeframe.</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(m => {
      let badgeClass = 'badge safe';
      let badgeText = `${m.daysRemaining} days left`;
      
      if (m.daysRemaining < 0) {
        badgeClass = 'badge expired';
        badgeText = `Expired ${Math.abs(m.daysRemaining)} days ago`;
      } else if (m.daysRemaining <= 7) {
        badgeClass = 'badge expiring-7';
        badgeText = `Critical: ${m.daysRemaining} days`;
      } else if (m.daysRemaining <= 30) {
        badgeClass = 'badge expiring-30';
        badgeText = `Urgent: ${m.daysRemaining} days`;
      }

      const totalValuation = m.quantity * m.purchasePrice;

      return `
        <tr>
          <td>
            <div style="font-weight:600;">${escapeHtml(m.name)}</div>
            <div style="font-size:0.7rem; color:var(--text-muted);">${escapeHtml(m.id)} · ${escapeHtml(m.supplier)}</div>
          </td>
          <td class="num" style="font-size:0.75rem;">${escapeHtml(m.batch)}</td>
          <td style="font-size:0.75rem; text-align:center;">${m.expiryDate}</td>
          <td class="num font-bold" style="text-align:right;">${m.quantity} units</td>
          <td class="num" style="text-align:right; font-weight:600;">${formatINR(totalValuation)}</td>
          <td><span class="${badgeClass}">${badgeText}</span></td>
          <td>
            ${m.daysRemaining < 0 ? `
              <button class="btn-text-sm" style="color:var(--danger); border:1px solid var(--danger-border);" onclick="SmartWarehouse.quarantineBatch('${m.id}')">
                Quarantine Batch
              </button>
            ` : `
              <button class="btn-text-sm" style="color:var(--primary);" onclick="SmartWarehouse.openStockMovementModal('Stock Out', '${m.id}')">
                Prioritize Dispatch
              </button>
            `}
          </td>
        </tr>
      `;
    }).join('');
  }

  function quarantineBatch(medId) {
    const med = AppState.medicines.find(m => m.id === medId);
    if (!med || med.quantity <= 0) return;

    if (confirm(`Quarantine and write-off ${med.quantity} expired units of ${med.name}?`)) {
      const qty = med.quantity;
      med.quantity = 0;

      AppState.movements.unshift({
        id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
        medicineId: med.id,
        medicineName: med.name,
        type: "Damaged",
        quantity: qty,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        user: AppState.currentUser ? AppState.currentUser.name : "Quality Auditor",
        reason: `Disposed Expired Batch ${med.batch}`
      });

      AppState.saveMedicines();
      AppState.saveMovements();
      AppState.generateLiveNotifications();
      showToast(`Quarantined ${qty} units of expired batch ${med.batch}.`, 'info');

      renderExpiryTable();
    }
  }

  // ==========================================================================
  // 12. SMART REORDER RECOMMENDATIONS MODULE
  // ==========================================================================
  
  function renderReorderTable() {
    const tbody = document.getElementById('reorder-table-tbody');
    if (!tbody) return;

    tbody.innerHTML = AppState.medicines.map(m => {
      const dailyUsage = m.dailyUsage || 10;
      const leadTime = m.leadTimeDays || 4;
      const safetyStock = m.safetyStock || Math.round(dailyUsage * 2);

      // Classical Inventory Formula:
      // Reorder Point (ROP) = (Average Daily Usage × Lead Time) + Safety Stock
      const reorderPoint = (dailyUsage * leadTime) + safetyStock;
      
      // Condition: Current Stock <= Reorder Point
      const requiresReorder = m.quantity <= reorderPoint;
      
      // Suggested Order Quantity = (Max Stock Level - Current Stock)
      const maxStock = m.maxStock || m.minStock * 4;
      const suggestedOrderQty = Math.max(0, maxStock - m.quantity);

      return `
        <tr>
          <td>
            <div style="font-weight:600;">${escapeHtml(m.name)}</div>
            <div style="font-size:0.7rem; color:var(--text-muted);">${escapeHtml(m.id)} · ${escapeHtml(m.supplier)}</div>
          </td>
          <td class="num font-bold" style="text-align:right;">${m.quantity}</td>
          <td class="num" style="text-align:right;">${dailyUsage} units/day</td>
          <td class="num" style="text-align:center;">${leadTime} days</td>
          <td class="num" style="text-align:right; color:var(--text-muted);">${safetyStock} units</td>
          <td class="num font-bold" style="text-align:right; color:var(--primary);">${reorderPoint}</td>
          <td class="num font-bold" style="text-align:right; font-size:0.875rem;">
            ${requiresReorder ? `<span style="color:var(--danger)">+${suggestedOrderQty}</span>` : `<span style="color:var(--text-muted)">0</span>`}
          </td>
          <td>
            ${requiresReorder 
              ? `<span class="badge danger">REORDER REQUIRED</span>` 
              : `<span class="badge safe">STOCK SUFFICIENT</span>`
            }
          </td>
          <td>
            ${requiresReorder ? `
              <button class="btn-action-primary" style="padding:0.3rem 0.65rem; font-size:0.75rem;" onclick="SmartWarehouse.quickOrderModal('${m.id}')">
                Order Now
              </button>
            ` : `
              <span style="font-size:0.75rem; color:var(--text-subtle);">Optimal</span>
            `}
          </td>
        </tr>
      `;
    }).join('');
  }

  // ==========================================================================
  // 13. REPORTS MODULE & CSV EXPORTER
  // ==========================================================================
  
  function generateSelectedReport() {
    const reportType = document.getElementById('report-select-type').value;
    const timeFilter = document.getElementById('report-select-time').value;

    const previewTitle = document.getElementById('report-preview-title');
    const previewTbody = document.getElementById('report-preview-tbody');
    const previewThead = document.getElementById('report-preview-thead');

    let rows = [];
    let headers = [];
    let summaryUnits = 0;
    let summaryValuation = 0;

    if (reportType === 'total-inventory') {
      previewTitle.textContent = "Comprehensive Inventory Valuation & Stock Ledger";
      headers = ["Medicine ID", "Medicine Name", "Category", "Batch", "Stock Qty", "Unit Price", "Total Valuation", "Status"];
      rows = AppState.medicines.map(m => {
        const val = m.quantity * m.purchasePrice;
        summaryUnits += m.quantity;
        summaryValuation += val;
        return [
          m.id,
          m.name,
          m.category,
          m.batch,
          `${m.quantity} units`,
          formatINR(m.purchasePrice),
          formatINR(val),
          getMedicineStatus(m).label
        ];
      });
    } else if (reportType === 'low-stock') {
      previewTitle.textContent = "Low Stock & Critical Replenishment Requisition Report";
      headers = ["Medicine ID", "Medicine Name", "Current Qty", "Min Threshold", "Shortage", "Supplier", "Est. Replenishment Cost"];
      const filtered = AppState.medicines.filter(m => m.quantity <= m.minStock);
      rows = filtered.map(m => {
        const shortage = Math.max(0, m.minStock - m.quantity);
        const repCost = shortage * m.purchasePrice;
        summaryUnits += m.quantity;
        summaryValuation += repCost;
        return [
          m.id,
          m.name,
          `${m.quantity} units`,
          `${m.minStock} units`,
          `-${shortage}`,
          m.supplier,
          formatINR(repCost)
        ];
      });
    } else if (reportType === 'expired-batches') {
      previewTitle.textContent = "Expired & Quarantined Drug Audit Report";
      headers = ["Medicine ID", "Medicine Name", "Batch", "Expiry Date", "Days Overdue", "Loss Valuation", "Supplier"];
      const filtered = AppState.medicines.filter(m => getDaysToExpiry(m.expiryDate) < 0);
      rows = filtered.map(m => {
        const days = Math.abs(getDaysToExpiry(m.expiryDate));
        const loss = m.quantity * m.purchasePrice;
        summaryUnits += m.quantity;
        summaryValuation += loss;
        return [
          m.id,
          m.name,
          m.batch,
          m.expiryDate,
          `${days} days overdue`,
          formatINR(loss),
          m.supplier
        ];
      });
    } else if (reportType === 'expiring-soon') {
      previewTitle.textContent = "Expiring Batches (Next 30 Days Forecast)";
      headers = ["Medicine ID", "Medicine Name", "Batch", "Expiry Date", "Days Remaining", "Stock at Risk", "Potential Loss"];
      const filtered = AppState.medicines.filter(m => {
        const d = getDaysToExpiry(m.expiryDate);
        return d >= 0 && d <= 30;
      });
      rows = filtered.map(m => {
        const d = getDaysToExpiry(m.expiryDate);
        const loss = m.quantity * m.purchasePrice;
        summaryUnits += m.quantity;
        summaryValuation += loss;
        return [
          m.id,
          m.name,
          m.batch,
          m.expiryDate,
          `${d} days`,
          `${m.quantity} units`,
          formatINR(loss)
        ];
      });
    } else if (reportType === 'stock-in') {
      previewTitle.textContent = "Stock Inflow & Consignment Audit Trail";
      headers = ["Txn ID", "Medicine", "Quantity", "Date & Time", "Received By", "Log Reason"];
      const filtered = AppState.movements.filter(m => m.type === 'Stock In');
      rows = filtered.map(m => {
        summaryUnits += m.quantity;
        return [
          m.id,
          m.medicineName,
          `+${m.quantity} units`,
          m.date,
          m.user,
          m.reason
        ];
      });
    } else if (reportType === 'stock-out') {
      previewTitle.textContent = "Stock Outflow & Hospital Dispensing Log";
      headers = ["Txn ID", "Medicine", "Dispatched Qty", "Date & Time", "Authorized By", "Purpose / Ward"];
      const filtered = AppState.movements.filter(m => m.type === 'Stock Out');
      rows = filtered.map(m => {
        summaryUnits += m.quantity;
        return [
          m.id,
          m.medicineName,
          `-${m.quantity} units`,
          m.date,
          m.user,
          m.reason
        ];
      });
    }

    // Update Report Summary Cards
    document.getElementById('report-stat-total-items').textContent = rows.length;
    document.getElementById('report-stat-total-units').textContent = summaryUnits.toLocaleString('en-IN');
    document.getElementById('report-stat-total-valuation').textContent = formatINR(summaryValuation);

    // Populate Headers
    previewThead.innerHTML = `<tr>${headers.map(h => `<th>${escapeHtml(h)}</th>`).join('')}</tr>`;

    // Populate Rows
    if (rows.length === 0) {
      previewTbody.innerHTML = `<tr><td colspan="${headers.length}" class="text-center" style="padding:2.5rem; color:var(--text-muted);">No records found matching the specified report criteria.</td></tr>`;
    } else {
      previewTbody.innerHTML = rows.map(r => `
        <tr>${r.map(col => `<td>${escapeHtml(col)}</td>`).join('')}</tr>
      `).join('');
    }
  }

  // Pure Vanilla JavaScript CSV Exporter
  function exportReportToCSV() {
    const reportType = document.getElementById('report-select-type').value;
    const thead = document.getElementById('report-preview-thead');
    const tbody = document.getElementById('report-preview-tbody');

    const headers = [];
    thead.querySelectorAll('th').forEach(th => headers.push(th.textContent.trim()));

    const rows = [];
    tbody.querySelectorAll('tr').forEach(tr => {
      const rowCols = [];
      tr.querySelectorAll('td').forEach(td => {
        let text = td.textContent.trim().replace(/"/g, '""');
        // If has comma, quote it
        if (text.includes(',') || text.includes('\n')) {
          text = `"${text}"`;
        }
        rowCols.push(text);
      });
      if (rowCols.length > 0) rows.push(rowCols.join(','));
    });

    if (rows.length === 0) {
      showToast('No report data available to export.', 'warning');
      return;
    }

    const csvContent = headers.join(',') + '\n' + rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `smartmed_warehouse_report_${reportType}_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('CSV Report downloaded successfully.', 'success');
  }

  function printCurrentReport() {
    window.print();
  }

  // ==========================================================================
  // 14. SETTINGS MODULE
  // ==========================================================================
  
  function populateSettingsForm() {
    const s = AppState.settings;
    document.getElementById('set-warehouse-name').value = s.warehouseName || '';
    document.getElementById('set-license-no').value = s.licenseNo || '';
    document.getElementById('set-manager-name').value = s.managerName || '';
    document.getElementById('set-manager-role').value = s.managerRole || '';
    document.getElementById('set-email').value = s.email || '';
    document.getElementById('set-theme-select').value = s.theme || 'light';
  }

  function handleSaveSettings(e) {
    e.preventDefault();

    AppState.settings = {
      warehouseName: document.getElementById('set-warehouse-name').value.trim(),
      licenseNo: document.getElementById('set-license-no').value.trim(),
      managerName: document.getElementById('set-manager-name').value.trim(),
      managerRole: document.getElementById('set-manager-role').value.trim(),
      email: document.getElementById('set-email').value.trim(),
      theme: document.getElementById('set-theme-select').value
    };

    AppState.saveSettings();

    // Apply theme
    if (AppState.settings.theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }

    // Update user profile display in topbar
    const nameEl = document.getElementById('topbar-user-name');
    const roleEl = document.getElementById('topbar-user-role');
    if (nameEl) nameEl.textContent = AppState.settings.managerName;
    if (roleEl) roleEl.textContent = AppState.settings.managerRole;

    showToast('Warehouse settings and preferences saved.', 'success');
    renderStockOverviewChart();
  }

  // ==========================================================================
  // 15. AUTHENTICATION MODULE (LOGIN / LOGOUT)
  // ==========================================================================
  
  function checkAuth() {
    const loginView = document.getElementById('login-screen');
    const appView = document.getElementById('app-container');

    if (AppState.currentUser) {
      if (loginView) loginView.style.display = 'none';
      if (appView) appView.style.display = 'flex';
      
      const nameEl = document.getElementById('topbar-user-name');
      const roleEl = document.getElementById('topbar-user-role');
      if (nameEl) nameEl.textContent = AppState.currentUser.name;
      if (roleEl) roleEl.textContent = AppState.currentUser.role;

      navigateTo(AppState.activeView);
    } else {
      if (loginView) loginView.style.display = 'flex';
      if (appView) appView.style.display = 'none';
    }
  }

  function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('login-email').value.trim();
    const pass = document.getElementById('login-password').value.trim();

    if (!email || !pass) {
      showToast('Please enter both username/email and password.', 'danger');
      return;
    }

    // Demo Authentication Acceptance
    AppState.currentUser = {
      email,
      name: AppState.settings.managerName || "Dr. Rajesh Sharma",
      role: AppState.settings.managerRole || "Warehouse Admin"
    };

    AppState.saveAuth();
    showToast(`Welcome back, ${AppState.currentUser.name}!`, 'success');
    checkAuth();
  }

  function fillDemoLogin() {
    document.getElementById('login-email').value = 'admin@smartmed.in';
    document.getElementById('login-password').value = 'warehouse2026';
    showToast('Demo credentials autofilled. Click "Sign In" to proceed.', 'info');
  }

  function handleLogout() {
    if (confirm('Are you sure you want to sign out of the Smart Warehouse System?')) {
      AppState.currentUser = null;
      AppState.saveAuth();
      checkAuth();
      showToast('Signed out successfully.', 'info');
    }
  }

  // ==========================================================================
  // 16. MODAL & DRAWER HELPERS
  // ==========================================================================
  
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
  }

  function toggleNotificationsDrawer() {
    const drawer = document.getElementById('notifications-drawer');
    if (!drawer) return;

    drawer.classList.toggle('active');

    // Populate drawer items
    const content = document.getElementById('notifications-list-container');
    if (content && drawer.classList.contains('active')) {
      if (AppState.notifications.length === 0) {
        content.innerHTML = `<div style="text-align:center; padding:2rem; color:var(--text-muted); font-size:0.85rem;">No active alerts. All inventory parameters normal!</div>`;
      } else {
        content.innerHTML = AppState.notifications.map(n => `
          <div class="notification-item unread">
            <div class="notif-header">
              <span class="badge ${n.type === 'danger' ? 'danger' : (n.type === 'warning' ? 'warning' : 'info')}">${n.type.toUpperCase()}</span>
              <span>${n.time}</span>
            </div>
            <div class="notif-title">${escapeHtml(n.title)}</div>
            <div class="notif-desc">${escapeHtml(n.desc)}</div>
          </div>
        `).join('');
      }
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ==========================================================================
  // 17. INITIALIZATION & EVENT LISTENERS
  // ==========================================================================
  
  document.addEventListener('DOMContentLoaded', () => {
    AppState.init();

    // Set Live Clock
    const dateEl = document.getElementById('topbar-live-date');
    if (dateEl) {
      const updateClock = () => {
        const now = new Date();
        dateEl.textContent = now.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });
      };
      updateClock();
    }

    // Attach Login Listeners
    const loginForm = document.getElementById('login-form');
    if (loginForm) loginForm.addEventListener('submit', handleLogin);

    const demoLoginBtn = document.getElementById('btn-demo-login-fill');
    if (demoLoginBtn) demoLoginBtn.addEventListener('click', fillDemoLogin);

    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

    // Sidebar navigation clicks
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const view = item.getAttribute('data-view');
        if (view) navigateTo(view);
      });
    });

    // Mobile Hamburger
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('sidebar');
    if (mobileMenuBtn && sidebar) {
      mobileMenuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('mobile-open');
      });
    }

    // Top Search Live Handler
    const globalSearchInput = document.getElementById('topbar-global-search');
    if (globalSearchInput) {
      globalSearchInput.addEventListener('input', (e) => {
        const val = e.target.value;
        if (AppState.activeView !== 'inventory') {
          navigateTo('inventory');
        }
        AppState.inventoryFilter.search = val;
        AppState.inventoryFilter.page = 1;
        const invInput = document.getElementById('inv-search-input');
        if (invInput) invInput.value = val;
        renderInventoryTable();
      });
    }

    // Inventory Controls
    const invSearch = document.getElementById('inv-search-input');
    if (invSearch) {
      invSearch.addEventListener('input', (e) => {
        AppState.inventoryFilter.search = e.target.value;
        AppState.inventoryFilter.page = 1;
        renderInventoryTable();
      });
    }

    const invCat = document.getElementById('inv-filter-category');
    if (invCat) {
      invCat.addEventListener('change', (e) => {
        AppState.inventoryFilter.category = e.target.value;
        AppState.inventoryFilter.page = 1;
        renderInventoryTable();
      });
    }

    const invStatus = document.getElementById('inv-filter-status');
    if (invStatus) {
      invStatus.addEventListener('change', (e) => {
        AppState.inventoryFilter.status = e.target.value;
        AppState.inventoryFilter.page = 1;
        renderInventoryTable();
      });
    }

    const invPageSize = document.getElementById('inv-page-size');
    if (invPageSize) {
      invPageSize.addEventListener('change', (e) => {
        AppState.inventoryFilter.pageSize = parseInt(e.target.value, 10);
        AppState.inventoryFilter.page = 1;
        renderInventoryTable();
      });
    }

    // Table Sorting Headers
    document.querySelectorAll('.data-table th.sortable').forEach(th => {
      th.addEventListener('click', () => {
        const sortField = th.getAttribute('data-sort');
        if (AppState.inventoryFilter.sortBy === sortField) {
          AppState.inventoryFilter.sortDir = AppState.inventoryFilter.sortDir === 'asc' ? 'desc' : 'asc';
        } else {
          AppState.inventoryFilter.sortBy = sortField;
          AppState.inventoryFilter.sortDir = 'asc';
        }
        renderInventoryTable();
      });
    });

    // Pagination buttons
    const prevBtn = document.getElementById('inv-page-prev');
    const nextBtn = document.getElementById('inv-page-next');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (AppState.inventoryFilter.page > 1) {
          AppState.inventoryFilter.page--;
          renderInventoryTable();
        }
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        AppState.inventoryFilter.page++;
        renderInventoryTable();
      });
    }

    // Add Medicine Form
    const addMedForm = document.getElementById('add-medicine-form');
    if (addMedForm) addMedForm.addEventListener('submit', handleSaveMedicine);

    // Stock Movement Form
    const stockMoveForm = document.getElementById('stock-movement-form');
    if (stockMoveForm) stockMoveForm.addEventListener('submit', handleSaveStockMovement);

    // Purchase Order Reorder quantity change
    const poQtyInput = document.getElementById('po-order-qty');
    if (poQtyInput) poQtyInput.addEventListener('input', updatePOTotal);

    const poConfirmBtn = document.getElementById('btn-confirm-reorder-po');
    if (poConfirmBtn) poConfirmBtn.addEventListener('click', handleConfirmReorder);

    // Reports trigger
    const genReportBtn = document.getElementById('btn-generate-report');
    if (genReportBtn) genReportBtn.addEventListener('click', generateSelectedReport);

    const exportCsvBtn = document.getElementById('btn-export-csv');
    if (exportCsvBtn) exportCsvBtn.addEventListener('click', exportReportToCSV);

    const printReportBtn = document.getElementById('btn-print-report');
    if (printReportBtn) printReportBtn.addEventListener('click', printCurrentReport);

    // Settings Form
    const settingsForm = document.getElementById('settings-form');
    if (settingsForm) settingsForm.addEventListener('submit', handleSaveSettings);

    const resetDataBtn = document.getElementById('btn-reset-demo-data');
    if (resetDataBtn) {
      resetDataBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all inventory and transaction data to default pharmaceutical demo records?')) {
          AppState.resetAllData();
          showToast('Warehouse demo dataset restored to factory defaults.', 'success');
          navigateTo('dashboard');
        }
      });
    }

    // Notifications Drawer toggle
    const notifBtn = document.getElementById('topbar-notif-btn');
    if (notifBtn) notifBtn.addEventListener('click', toggleNotificationsDrawer);

    const closeDrawerBtn = document.getElementById('btn-close-notif-drawer');
    if (closeDrawerBtn) closeDrawerBtn.addEventListener('click', toggleNotificationsDrawer);

    const markReadBtn = document.getElementById('btn-mark-all-read');
    if (markReadBtn) {
      markReadBtn.addEventListener('click', () => {
        AppState.notifications = [];
        AppState.updateNotificationBadge();
        toggleNotificationsDrawer();
        showToast('All notifications cleared.', 'info');
      });
    }

    // Modal Close buttons
    document.querySelectorAll('.modal-close-btn, .btn-modal-cancel').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal-overlay');
        if (modal) modal.classList.remove('active');
      });
    });

    // Close modal on click outside
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('active');
        }
      });
    });

    // Window Resize -> Re-render Canvas Chart
    window.addEventListener('resize', () => {
      if (AppState.activeView === 'dashboard') {
        renderStockOverviewChart();
      }
    });

    // Initial Auth Check
    checkAuth();
  });

  // Global API attachment for inline onclick calls in HTML templates
  window.SmartWarehouse = {
    navigateTo,
    openAddMedicineModal,
    openEditMedicineModal,
    deleteMedicine,
    openStockMovementModal,
    openStockModalWithMedicine,
    quickOrderModal,
    quarantineBatch,
    renderExpiryTable
  };

})();
