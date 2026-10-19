/**
 * FAN LESTARI - LUXURY OUTDOOR RENTAL ENGINE
 * Interactive behaviors: Navigation, Catalog Filtering, Realtime Booking Calculator,
 * WhatsApp Order Generator, Gallery Lightbox, Live Business Hours Status.
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileDrawer();
  initBusinessHours();
  initCatalogFilters();
  initRentalCalculator();
  initGalleryLightbox();
  initSmoothScroll();
});

/* ==========================================================================
   1. Dynamic Navbar & Scroll
   ========================================================================== */
function initNavbar() {
  const navbar = document.querySelector('.luxury-navbar');
  if (!navbar) return;

  const handleScroll = () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/* ==========================================================================
   2. Mobile Drawer Navigation
   ========================================================================== */
function initMobileDrawer() {
  const toggleBtn = document.querySelector('.mobile-toggle');
  const drawer = document.querySelector('.mobile-drawer');
  const closeBtn = document.querySelector('.drawer-close');
  const overlay = document.querySelector('.drawer-overlay');

  if (!toggleBtn || !drawer) return;

  const openDrawer = () => {
    drawer.classList.add('active');
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    drawer.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  toggleBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (overlay) overlay.addEventListener('click', closeDrawer);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('active')) {
      closeDrawer();
    }
  });
}

/* ==========================================================================
   3. Realtime Business Hours (WIB / Pekalongan Time)
   ========================================================================== */
function initBusinessHours() {
  const statusEl = document.querySelector('.business-status-badge');
  if (!statusEl) return;

  // Calculate WIB (UTC+7)
  const now = new Date();
  const utcHours = now.getUTCHours();
  const wibHours = (utcHours + 7) % 24;
  const wibDay = now.getUTCDay(); // 0 is Sunday

  let isOpen = false;
  let closeTime = '18.00 WIB';

  if (wibDay >= 1 && wibDay <= 6) {
    // Senin - Sabtu (08:00 - 18:00)
    isOpen = wibHours >= 8 && wibHours < 18;
    closeTime = '18.00 WIB';
  } else {
    // Minggu (09:00 - 16:00)
    isOpen = wibHours >= 9 && wibHours < 16;
    closeTime = '16.00 WIB';
  }

  if (isOpen) {
    statusEl.innerHTML = `<span class="pulse-dot"></span> Buka Sekarang (Tutup ${closeTime})`;
    statusEl.classList.add('status-open');
  } else {
    statusEl.innerHTML = `<span class="pulse-dot" style="background:#EF4444;"></span> Tutup Sekarang (Buka 08.00 WIB)`;
    statusEl.classList.add('status-closed');
  }
}

/* ==========================================================================
   4. Equipment Catalog Filter & Search
   ========================================================================== */
function initCatalogFilters() {
  const pills = document.querySelectorAll('.category-pill');
  const cards = document.querySelectorAll('.equipment-card');
  const searchInput = document.querySelector('.catalog-search-input');

  if (!cards.length) return;

  let currentCategory = 'all';
  let searchQuery = '';

  const applyFilters = () => {
    cards.forEach((card) => {
      const cardCategory = card.dataset.category || 'all';
      const cardTitle = (card.querySelector('.card-title')?.textContent || '').toLowerCase();
      const cardDesc = (card.querySelector('.card-description')?.textContent || '').toLowerCase();

      const matchesCategory = currentCategory === 'all' || cardCategory === currentCategory;
      const matchesSearch = !searchQuery || cardTitle.includes(searchQuery) || cardDesc.includes(searchQuery);

      if (matchesCategory && matchesSearch) {
        card.style.display = 'flex';
        card.style.opacity = '1';
        card.style.transform = 'scale(1)';
      } else {
        card.style.display = 'none';
        card.style.opacity = '0';
        card.style.transform = 'scale(0.95)';
      }
    });
  };

  pills.forEach((pill) => {
    pill.addEventListener('click', () => {
      pills.forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      currentCategory = pill.dataset.filter || 'all';
      applyFilters();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      applyFilters();
    });
  }
}

/* ==========================================================================
   5. Interactive Rental Calculator & WhatsApp Booking Generator
   ========================================================================== */
function initRentalCalculator() {
  const bookingForm = document.getElementById('rentalBookingForm');
  if (!bookingForm) return;

  const durationInput = document.getElementById('rentalDuration');
  const startDateInput = document.getElementById('rentalStartDate');
  const gearCheckboxes = document.querySelectorAll('.gear-checkbox');
  const summaryList = document.getElementById('orderSummaryList');
  const summaryDays = document.getElementById('summaryDays');
  const summaryTotal = document.getElementById('summaryGrandTotal');
  const waSubmitBtn = document.getElementById('btnSubmitBookingWA');

  const updateCalculations = () => {
    let duration = parseInt(durationInput?.value || 1, 10);
    if (isNaN(duration) || duration < 1) duration = 1;

    let subtotalPerDay = 0;
    const selectedItems = [];

    gearCheckboxes.forEach((cb) => {
      if (cb.checked) {
        const itemRow = cb.closest('.gear-item-row');
        const price = parseInt(cb.dataset.price || 0, 10);
        const name = cb.dataset.name || cb.value;
        const qtyInput = itemRow.querySelector('.gear-item-qty');
        let qty = parseInt(qtyInput?.value || 1, 10);
        if (isNaN(qty) || qty < 1) qty = 1;

        const itemSubtotal = price * qty;
        subtotalPerDay += itemSubtotal;

        selectedItems.push({
          name,
          price,
          qty,
          itemSubtotal
        });
      }
    });

    const grandTotal = subtotalPerDay * duration;

    // Render Order Summary
    if (summaryList) {
      if (selectedItems.length === 0) {
        summaryList.innerHTML = `<div class="summary-empty" style="color:var(--text-muted);font-size:0.88rem;text-align:center;padding:1.5rem 0;">Pilih perlengkapan di samping untuk melihat rincian biaya.</div>`;
      } else {
        summaryList.innerHTML = selectedItems
          .map(
            (item) => `
          <div class="summary-item">
            <span>${item.name} (${item.qty}x)</span>
            <span>Rp ${(item.itemSubtotal * duration).toLocaleString('id-ID')}</span>
          </div>
        `
          )
          .join('');
      }
    }

    if (summaryDays) {
      summaryDays.textContent = `${duration} Hari`;
    }

    if (summaryTotal) {
      summaryTotal.textContent = `Rp ${grandTotal.toLocaleString('id-ID')}`;
    }

    return { duration, selectedItems, grandTotal };
  };

  // Event Listeners for Live Update
  gearCheckboxes.forEach((cb) => {
    cb.addEventListener('change', (e) => {
      const itemRow = e.target.closest('.gear-item-row');
      const qtyInput = itemRow.querySelector('.gear-item-qty');
      if (qtyInput) {
        qtyInput.disabled = !e.target.checked;
        if (e.target.checked && (!qtyInput.value || qtyInput.value < 1)) {
          qtyInput.value = 1;
        }
      }
      updateCalculations();
    });
  });

  const qtyInputs = document.querySelectorAll('.gear-item-qty');
  qtyInputs.forEach((input) => {
    input.addEventListener('input', updateCalculations);
  });

  if (durationInput) {
    durationInput.addEventListener('input', updateCalculations);
  }

  // Handle WhatsApp Checkout
  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const custName = document.getElementById('bookingName')?.value.trim();
      const custPhone = document.getElementById('bookingPhone')?.value.trim();
      const custAddress = document.getElementById('bookingAddress')?.value.trim() || 'Pekalongan';
      const startDate = startDateInput?.value || 'Segera';

      const calc = updateCalculations();

      if (calc.selectedItems.length === 0) {
        showLuxuryToast('⚠️ Silakan pilih minimal satu peralatan outdoor untuk disewa.');
        return;
      }

      // Build WhatsApp Message
      let message = `Halo Fan Lestari Outdoor! 👋\n`;
      message += `Saya ingin melakukan reservasi sewa peralatan outdoor dengan data berikut:\n\n`;
      message += `👤 *Nama:* ${custName}\n`;
      message += `📱 *No. WhatsApp:* ${custPhone}\n`;
      message += `📍 *Domisili:* ${custAddress}\n`;
      message += `📅 *Tanggal Mulai:* ${startDate}\n`;
      message += `⏳ *Durasi Sewa:* ${calc.duration} Hari\n\n`;
      message += `📦 *Daftar Peralatan:*\n`;

      calc.selectedItems.forEach((item, index) => {
        message += `${index + 1}. ${item.name} (${item.qty} unit) - Rp ${(item.itemSubtotal * calc.duration).toLocaleString('id-ID')}\n`;
      });

      message += `\n💰 *Total Estimasi Biaya:* Rp ${calc.grandTotal.toLocaleString('id-ID')}\n\n`;
      message += `Mohon konfirmasi ketersediaan barang dan petunjuk proses sewa selanjutnya. Terima kasih! 🏕️`;

      const encodedMsg = encodeURIComponent(message);
      const waUrl = `https://wa.me/6287711808500?text=${encodedMsg}`;

      showLuxuryToast('🚀 Menyiapkan pesanan dan mengalihkan ke WhatsApp...');

      setTimeout(() => {
        window.open(waUrl, '_blank');
      }, 700);
    });
  }

  // Initial Calculation
  updateCalculations();
}

/* ==========================================================================
   6. Gallery Lightbox Modal
   ========================================================================== */
function initGalleryLightbox() {
  const galleryItems = document.querySelectorAll('.gallery-item');
  if (!galleryItems.length) return;

  // Create Lightbox DOM if not exists
  let modal = document.querySelector('.lightbox-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'lightbox-modal';
    modal.innerHTML = `
      <div class="lightbox-content">
        <button class="lightbox-close" aria-label="Tutup">&times;</button>
        <img src="" alt="Detail Dokumentasi" class="lightbox-img">
      </div>
    `;
    document.body.appendChild(modal);
  }

  const lightboxImg = modal.querySelector('.lightbox-img');
  const closeBtn = modal.querySelector('.lightbox-close');

  const openLightbox = (imgSrc) => {
    lightboxImg.src = imgSrc;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    modal.classList.remove('active');
    lightboxImg.src = '';
    document.body.style.overflow = '';
  };

  galleryItems.forEach((item) => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      if (img) openLightbox(img.src);
    });
  });

  closeBtn.addEventListener('click', closeLightbox);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeLightbox();
    }
  });
}

/* ==========================================================================
   7. Toast Notification Utility
   ========================================================================== */
function showLuxuryToast(message, duration = 4000) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'luxury-toast';
  toast.innerHTML = `
    <i class="fa fa-info-circle" style="color:var(--gold-primary);"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
    }, 400);
  }, duration);
}

/* ==========================================================================
   8. Smooth Scroll Anchor
   ========================================================================== */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || !targetId) return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}
