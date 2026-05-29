(function () {
  const cfg = HARDOIL_CONFIG;
  const tg = window.Telegram?.WebApp;

  let currentTab = "home";
  let catalogView = "grid";
  let tgUser = null;

  function haptic(type) {
    try {
      tg?.HapticFeedback?.impactOccurred(type || "light");
    } catch (_) {}
  }

  function initTelegram() {
    if (!tg) return;

    tg.ready();
    tg.expand();
    tg.enableClosingConfirmation();

    tgUser = tg.initDataUnsafe?.user || null;
    if (tgUser) {
      const name = tgUser.first_name || tgUser.username || "mehmon";
      document.getElementById("greeting-text").textContent = `Salom ${name} 👋`;

      const avatar = document.getElementById("user-avatar");
      if (tgUser.photo_url) {
        avatar.style.backgroundImage = `url(${tgUser.photo_url})`;
        avatar.textContent = "";
      }
    }

    const tp = tg.themeParams || {};
    if (tp.bg_color) {
      document.documentElement.style.setProperty("--tg-bg", tp.bg_color);
    }

    const headerColor = "#0a0e14";
    if (tg.setHeaderColor) tg.setHeaderColor(headerColor);
    if (tg.setBackgroundColor) tg.setBackgroundColor(headerColor);
    if (tg.colorScheme === "light") {
      document.body.classList.add("theme-light");
    }
  }

  function bindStaticText() {
    document.getElementById("welcome-text").textContent = cfg.home.welcome;
    document.getElementById("services-title").textContent = cfg.home.servicesTitle;

    document.getElementById("catalog-title").textContent = cfg.catalog.title;
    document.getElementById("catalog-subtitle").textContent = cfg.catalog.subtitle;
    const labelText = document.getElementById("catalog-label-text");
    if (labelText) labelText.textContent = cfg.catalog.sectionLabel;

    document.getElementById("other-title").textContent = cfg.other.title;
    document.getElementById("other-subtitle").textContent = cfg.other.subtitle;

    document.querySelectorAll("[data-tab-label]").forEach((el) => {
      const key = el.dataset.tabLabel;
      if (cfg.tabs[key]) el.textContent = cfg.tabs[key];
    });

    const loc = cfg.location;
    document.getElementById("location-title").textContent = loc.title;
    document.getElementById("location-address").textContent = loc.address;
    document.getElementById("location-hours").textContent = loc.workHours;
    const phoneEl = document.getElementById("location-phone");
    phoneEl.textContent = loc.phone;
    phoneEl.href = `tel:${loc.phone.replace(/[\s-]/g, "")}`;
    document.getElementById("location-map").href = loc.mapUrl;

    const fb = cfg.feedback;
    document.getElementById("feedback-title").textContent = fb.title;
    document.getElementById("feedback-subtitle").textContent = fb.subtitle;
    document.getElementById("label-name").textContent = fb.fields.name;
    document.getElementById("label-phone").textContent = fb.fields.phone;
    document.getElementById("label-message").textContent = fb.fields.message;
    document.getElementById("feedback-submit").textContent = fb.submit;

    if (tgUser?.first_name) {
      const nameInput = document.getElementById("input-name");
      if (nameInput && !nameInput.value) {
        nameInput.value = tgUser.first_name;
      }
    }
  }

  function renderServices() {
    document.getElementById("service-cards").innerHTML = cfg.home.services
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

  function renderHomePreviews() {
    const el = document.getElementById("home-previews");
    if (!el || !cfg.home.previews?.length) return;

    el.innerHTML = cfg.home.previews
      .map(
        (p, i) => `
      <button type="button" class="preview-tile" data-preview-index="${i}" aria-label="${escapeAttr(p.alt)}">
        <img src="${escapeAttr(p.image)}" alt="${escapeAttr(p.alt)}" loading="lazy" />
      </button>`
      )
      .join("");

    el.querySelectorAll(".preview-tile").forEach((btn) => {
      btn.addEventListener("click", () => {
        haptic("light");
        const p = cfg.home.previews[Number(btn.dataset.previewIndex)];
        openMediaModal({ type: "image", src: p.image, title: p.alt });
      });
    });
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
        <article class="catalog-item" tabindex="0" role="button"
          data-type="${item.type}" data-src="${escapeAttr(item.src)}" data-title="${escapeAttr(item.title)}">
          <img src="${escapeAttr(item.thumb)}" alt="${escapeAttr(item.title)}" loading="lazy" />
          ${playIcon}
          <span class="item-label">${escapeHtml(item.title)}</span>
        </article>`;
      })
      .join("");

    grid.querySelectorAll(".catalog-item").forEach((el) => {
      const open = () => {
        haptic("light");
        openMediaModal(el.dataset);
      };
      el.addEventListener("click", open);
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open();
        }
      });
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
      btn.addEventListener("click", () => {
        haptic("light");
        handleMenuClick(btn.dataset.menu);
      });
    });
  }

  function handleMenuClick(id) {
    if (id === "instagram") {
      const url = cfg.instagram.url;
      if (tg?.openLink) tg.openLink(url);
      else window.open(url, "_blank", "noopener,noreferrer");
      return;
    }
    if (id === "location") showPanel("location");
    if (id === "feedback") showPanel("feedback");
  }

  function showPanel(panelId) {
    const subPanels = ["location", "feedback"];
    const isSub = subPanels.includes(panelId);

    if (!isSub) {
      currentTab = panelId;
      document.getElementById("bottom-nav").classList.remove("hidden");
      document.querySelectorAll(".nav-item").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.tab === panelId);
      });
    } else {
      document.getElementById("bottom-nav").classList.add("hidden");
    }

    document.querySelectorAll(".panel").forEach((p) => {
      p.classList.toggle("active", p.dataset.panel === panelId);
    });

    if (tg?.BackButton) {
      if (isSub) tg.BackButton.show();
      else tg.BackButton.hide();
    }

    document.getElementById("app").scrollTop = 0;
  }

  function goBack() {
    haptic("light");
    currentTab = "other";
    showPanel("other");
    document.querySelectorAll(".nav-item").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.tab === "other");
    });
  }

  function openMediaModal({ type, src, title }) {
    const modal = document.getElementById("media-modal");
    const media = document.getElementById("modal-media");
    document.getElementById("modal-title").textContent = title || "";

    if (type === "video") {
      media.innerHTML = `<video src="${escapeAttr(src)}" controls autoplay playsinline></video>`;
    } else {
      media.innerHTML = `<img src="${escapeAttr(src)}" alt="${escapeAttr(title || "")}" />`;
    }

    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }

  function closeMediaModal() {
    document.getElementById("media-modal").classList.add("hidden");
    document.getElementById("modal-media").innerHTML = "";
    document.body.style.overflow = "";
  }

  function setupFeedbackForm() {
    const form = document.getElementById("feedback-form");
    const status = document.getElementById("form-status");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      // user obyektini yubormaymiz — Telegram limiti; bot message.from_user dan oladi
      const payload = {
        type: "feedback",
        name: String(fd.get("name") || "").trim(),
        phone: String(fd.get("phone") || "").trim(),
        message: String(fd.get("message") || "").trim(),
      };

      if (!payload.name || !payload.phone || !payload.message) {
        status.textContent = "Barcha maydonlarni to'ldiring";
        status.className = "form-status error";
        status.classList.remove("hidden");
        return;
      }

      const submitBtn = document.getElementById("feedback-submit");
      submitBtn.disabled = true;
      haptic("medium");

      try {
        if (tg?.sendData) {
          tg.sendData(JSON.stringify(payload));
          status.textContent = cfg.feedback.success;
          status.className = "form-status success";
          form.reset();
          if (tgUser?.first_name) {
            document.getElementById("input-name").value = tgUser.first_name;
          }
          haptic("success");
          setTimeout(() => tg.close?.(), 1400);
        } else {
          status.textContent = cfg.feedback.success + " (demo rejim)";
          status.className = "form-status success";
          console.info("Feedback (demo):", payload);
          form.reset();
        }
      } catch (err) {
        status.textContent = cfg.feedback.error;
        status.className = "form-status error";
        haptic("error");
        console.error(err);
      } finally {
        submitBtn.disabled = false;
        status.classList.remove("hidden");
      }
    });
  }

  function setupNavigation() {
    document.querySelectorAll(".nav-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        haptic("selection");
        showPanel(btn.dataset.tab);
      });
    });

    document.querySelectorAll("[data-back]").forEach((btn) => {
      btn.addEventListener("click", goBack);
    });

    document.querySelectorAll(".view-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        haptic("light");
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
      tg.BackButton.onClick(() => {
        const modal = document.getElementById("media-modal");
        if (!modal.classList.contains("hidden")) {
          closeMediaModal();
          return;
        }
        const subActive = document.querySelector(".sub-panel.active");
        if (subActive) goBack();
      });
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
    renderHomePreviews();
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
