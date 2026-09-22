/**
 * Shadcn UI Interactive Component Controller
 * Provides dynamic behavior for Toasts, Dialogs, Sheets, Accordions, Tabs, and Command Palette
 */

window.Shadcn = (function () {
  let toastContainer = null;

  function initToastContainer() {
    if (!toastContainer) {
      toastContainer = document.createElement("div");
      toastContainer.className = "cn-toast-container";
      document.body.appendChild(toastContainer);
    }
  }

  return {
    /**
     * Trigger a Shadcn Toast Notification
     * @param {Object} options - { title, description, variant: 'default'|'success'|'destructive', duration: 4000 }
     */
    toast: function (options = {}) {
      initToastContainer();
      const { title, description, variant = 'default', duration = 3500 } = options;

      const toastElem = document.createElement("div");
      const variantClass = variant === 'destructive' ? 'cn-toast-destructive' : (variant === 'success' ? 'cn-toast-success' : '');
      toastElem.className = `cn-toast ${variantClass}`;

      const iconMap = {
        destructive: '<i class="fa-solid fa-triangle-exclamation" style="color:#f87171;"></i>',
        success: '<i class="fa-solid fa-circle-check" style="color:#34d399;"></i>',
        default: '<i class="fa-solid fa-bell" style="color:#818cf8;"></i>'
      };

      toastElem.innerHTML = `
        <div style="font-size: 1.1rem;">${iconMap[variant] || iconMap.default}</div>
        <div style="flex:1;">
          <div class="cn-toast-title">${title || 'Notification'}</div>
          ${description ? `<div class="cn-toast-description">${description}</div>` : ''}
        </div>
        <button style="background:none;border:none;color:#94a3b8;cursor:pointer;font-size:0.9rem;" onclick="this.parentElement.remove()">✕</button>
      `;

      toastContainer.appendChild(toastElem);

      setTimeout(() => {
        toastElem.style.opacity = '0';
        toastElem.style.transform = 'translateY(10px)';
        toastElem.style.transition = 'all 0.25s ease';
        setTimeout(() => toastElem.remove(), 250);
      }, duration);
    },

    /**
     * Open a Shadcn Dialog Modal
     */
    openDialog: function (dialogId) {
      const dialog = document.getElementById(dialogId);
      if (dialog) dialog.classList.add("active");
    },

    /**
     * Close a Shadcn Dialog Modal
     */
    closeDialog: function (dialogId) {
      const dialog = document.getElementById(dialogId);
      if (dialog) dialog.classList.remove("active");
    },

    /**
     * Open a Side Drawer Sheet
     */
    openSheet: function (sheetId) {
      const overlay = document.getElementById(sheetId + "-overlay") || document.getElementById(sheetId);
      const content = document.getElementById(sheetId + "-content") || document.getElementById(sheetId);
      if (overlay) overlay.classList.add("active");
      if (content) content.classList.add("active");
    },

    /**
     * Close a Side Drawer Sheet
     */
    closeSheet: function (sheetId) {
      const overlay = document.getElementById(sheetId + "-overlay") || document.getElementById(sheetId);
      const content = document.getElementById(sheetId + "-content") || document.getElementById(sheetId);
      if (overlay) overlay.classList.remove("active");
      if (content) content.classList.remove("active");
    },

    /**
     * Toggle Accordion Item
     */
    toggleAccordion: function (headerElem) {
      const item = headerElem.closest(".cn-accordion-item");
      if (!item) return;
      const isAlreadyActive = item.classList.contains("active");

      // Optional: Close sibling items in accordion
      const accordion = item.closest(".cn-accordion");
      if (accordion) {
        accordion.querySelectorAll(".cn-accordion-item").forEach(el => el.classList.remove("active"));
      }

      if (!isAlreadyActive) {
        item.classList.add("active");
      }
    },

    /**
     * Switch Tabs
     */
    switchTab: function (triggerElem, contentId) {
      const tabsList = triggerElem.closest(".cn-tabs-list");
      const tabsContainer = triggerElem.closest(".cn-tabs");

      if (tabsList) {
        tabsList.querySelectorAll(".cn-tabs-trigger").forEach(btn => btn.classList.remove("active"));
        triggerElem.classList.add("active");
      }

      if (tabsContainer) {
        tabsContainer.querySelectorAll(".cn-tabs-content").forEach(c => c.classList.remove("active"));
        const target = document.getElementById(contentId);
        if (target) target.classList.add("active");
      }
    },

    /**
     * Toggle Switch Component
     */
    toggleSwitch: function (switchElem) {
      switchElem.classList.toggle("active");
      const isChecked = switchElem.classList.contains("active");
      if (switchElem.dataset.onChange) {
        window[switchElem.dataset.onChange]?.(isChecked);
      }
    },

    /**
     * Open Command Palette
     */
    openCommandPalette: function () {
      const cmd = document.getElementById("cnCommandPalette");
      if (cmd) {
        cmd.classList.add("active");
        const input = cmd.querySelector(".cn-command-input");
        if (input) input.focus();
      }
    },

    /**
     * Close Command Palette
     */
    closeCommandPalette: function () {
      const cmd = document.getElementById("cnCommandPalette");
      if (cmd) cmd.classList.remove("active");
    }
  };
})();

// Global Keyboard Listener for Cmd + K / Ctrl + K and ESC
document.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    Shadcn.openCommandPalette();
  }
  if (e.key === "Escape") {
    Shadcn.closeCommandPalette();
    document.querySelectorAll(".cn-dialog-overlay.active").forEach(d => d.classList.remove("active"));
    document.querySelectorAll(".cn-sheet-overlay.active, .cn-sheet-content.active").forEach(s => s.classList.remove("active"));
  }
});
