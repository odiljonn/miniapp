(function () {
  const cfg = HARDOIL_CONFIG;
  const tg = window.Telegram?.WebApp;

  let currentTab = "home";
  let previousTab = "other";
  let catalogView = "grid";

  function initTelegram() {
    if (!tg) return;

    tg.ready();
    tg.expand();

    const user = tg.initDataUnsafe?.user;
    if (user) {
      const name = user.first_name || user.username || "mehmon";
      document.getElementById("greeting-text").textContent = `Salom ${name} 👋`;

      const avatar = document.getElementById("user-avatar");
      if (user.photo_url) {
        avatar.style.backgroundImage = `url(${user.photo_url})`;
      }
    }

    if (tg.themeParams) {
      document.documentElement.style.setProperty(
        "--tg-theme-bg-color",
        tg.themeParams.bg_color || "#0a0e14"
      );
    }

    tg.setHeaderColor("#0a0e14");
    tg.setBackgroundColor("#0a0e14");
  }

  function bindStaticText() {
    document.getElementById("welcome-text").textContent = cfg.home.welcome;
    document.getElementById("services-title").textContent = cfg.home.servicesTitle;

    document.getElementById("catalog-title").textContent = cfg.catalog.title;
    document.getElementById("catalog-subtitle").textContent = cfg.catalog.subtitle;
    document.getElementById("catalog-section-label").textContent = cfg.catalog.sectionLabel;

    document.getElementById("other-title").textContent = cfg.other.title;
    document.getElementById("other-subtitle").textContent = cfg.other.subtitle;

    document.querySelectorAll("[data-tab-label]").forEach((el) => {
      const key = el.dataset.tabLabel;
      if (cfg.tabs[key]) el.textContent = cfg.tabs[key];
    });

    const loc = cfg.location;
    document.getElementById("location-title").textContent = loc.title || cfg.other.menu[0].label;
    document.getElementById("location-address").textContent = loc.address;
    document.getElementById("location-hours").textContent = loc.workHours;
    const phoneEl = document.getElementById("location-phone");
    phoneEl.textContent = loc.phone;
    phoneEl.href = `tel:${loc.phone.replace(/\s/g, "")}`;
    document.getElementById("location-map").href = loc.mapUrl;

    const fb = cfg.feedback;
    document.getElementById("feedback-title").textContent = fb.title;
    document.getElementById("feedback-subtitle").textContent = fb.subtitle;
    document.getElementById("label-name").textContent = fb.fields.name;
    document.getElementById("label-phone").textContent = fb.fields.phone;
    document.getElementById("label-message").textContent = fb.fields.message;
    document.getElementById("feedback-submit").textContent = fb.submit;
  }

  function renderServices() {
    const container = document.getElementById("service-cards");
    container.innerHTML = cfg.home.services
      .map(
        (s) => `
      <article class="service-card">
        <span class="icon">${s.icon}</span>
        <div>
          <h3>${escapeHtml(s.title)}</h3>
          <p>${escapeHtml(s.desc)}</p>
        </div>
      </article>`
      )
      .join("");
  }

  function renderCatalog() {
    const grid = document.getElementById("catalog-grid");
    grid.classList.toggle("list-view", catalogView === "list");

    grid.innerHTML = cfg.catalogItems
      .map((item) => {
        const playIcon =
          item.type === "video"
            ? `<div class="play-overlay" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          </div>`
            : "";

        return `
        <article class="catalog-item" data-id="${item.id}" data-type="${item.type}" data-src="${escapeAttr(item.src)}" data-title="${escapeAttr(item.title)}">
          <img src="${escapeAttr(item.thumb)}" alt="${escapeAttr(item.title)}" loading="lazy" />
          ${playIcon}
          <span class="item-label">${escapeHtml(item.title)}</span>
        </article>`;
      })
      .join("");

    grid.querySelectorAll(".catalog-item").forEach((el) => {
      el.addEventListener("click", () => openMediaModal(el.dataset));
    });
  }

  function renderOtherMenu() {
    const menu = document.getElementById("other-menu");
    menu.innerHTML = cfg.other.menu
      .map(
        (m) => `
      <button type="button" class="menu-item" data-menu="${m.id}">
        <span class="menu-icon">${m.icon}</span>
        <span>${escapeHtml(m.label)}</span>
        <span class="chevron">›</span>
      </button>`
      )
      .join("");

    menu.querySelectorAll(".menu-item").forEach((btn) => {
      btn.addEventListener("click", () => handleMenuClick(btn.dataset.menu));
    });
  }

  function handleMenuClick(id) {
    if (id === "instagram") {
      const url = cfg.instagram.url;
      if (tg?.openLink) {
        tg.openLink(url);
      } else {
        window.open(url, "_blank");
      }
      return;
    }

    if (id === "location") {
      showPanel("location");
      return;
    }

    if (id === "feedback") {
      showPanel("feedback");
      return;
    }
  }

  function showPanel(panelId) {
    const subPanels = ["location", "feedback"];
    const isSub = subPanels.includes(panelId);

    if (isSub) {
      previousTab = currentTab;
      document.getElementById("bottom-nav").classList.add("hidden");
    } else {
      currentTab = panelId;
      document.getElementById("bottom-nav").classList.remove("hidden");
      document.querySelectorAll(".nav-item").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.tab === panelId);
      });
    }

    document.querySelectorAll(".panel").forEach((p) => {
      p.classList.toggle("active", p.dataset.panel === panelId);
    });

    if (tg?.BackButton) {
      if (isSub) {
        tg.BackButton.show();
      } else {
        tg.BackButton.hide();
      }
    }
  }

  function goBack() {
    currentTab = "other";
    showPanel("other");
    document.querySelectorAll(".nav-item").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.tab === "other");
    });
  }

  function openMediaModal({ type, src, title }) {
    const modal = document.getElementById("media-modal");
    const media = document.getElementById("modal-media");
    document.getElementById("modal-title").textContent = title;

    if (type === "video") {
      media.innerHTML = `<video src="${escapeAttr(src)}" controls autoplay playsinline></video>`;
    } else {
      media.innerHTML = `<img src="${escapeAttr(src)}" alt="${escapeAttr(title)}" />`;
    }

    modal.classList.remove("hidden");
  }

  function closeMediaModal() {
    const modal = document.getElementById("media-modal");
    modal.classList.add("hidden");
    document.getElementById("modal-media").innerHTML = "";
  }

  function setupFeedbackForm() {
    const form = document.getElementById("feedback-form");
    const status = document.getElementById("form-status");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const payload = {
        type: "feedback",
        name: fd.get("name"),
        phone: fd.get("phone"),
        message: fd.get("message"),
        user: tg?.initDataUnsafe?.user || null,
      };

      const submitBtn = document.getElementById("feedback-submit");
      submitBtn.disabled = true;

      try {
        if (tg?.sendData) {
          tg.sendData(JSON.stringify(payload));
          status.textContent = cfg.feedback.success;
          status.className = "form-status success";
          form.reset();
          setTimeout(() => {
            if (tg?.close) tg.close();
          }, 1500);
        } else {
          status.textContent = cfg.feedback.success + " (demo — Telegram ichida yuboriladi)";
          status.className = "form-status success";
          console.log("Feedback:", payload);
          form.reset();
        }
      } catch (err) {
        status.textContent = cfg.feedback.error;
        status.className = "form-status error";
      } finally {
        submitBtn.disabled = false;
        status.classList.remove("hidden");
      }
    });
  }

  function setupNavigation() {
    document.querySelectorAll(".nav-item").forEach((btn) => {
      btn.addEventListener("click", () => showPanel(btn.dataset.tab));
    });

    document.querySelectorAll("[data-back]").forEach((btn) => {
      btn.addEventListener("click", goBack);
    });

    document.querySelectorAll(".view-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".view-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        catalogView = btn.dataset.view;
        renderCatalog();
      });
    });

    document.querySelectorAll("[data-close-modal]").forEach((el) => {
      el.addEventListener("click", closeMediaModal);
    });

    if (tg?.BackButton) {
      tg.BackButton.onClick(goBack);
    }
  }

  function escapeHtml(str) {
    const d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  }

  function escapeAttr(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function init() {
    initTelegram();
    bindStaticText();
    renderServices();
    renderCatalog();
    renderOtherMenu();
    setupFeedbackForm();
    setupNavigation();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
