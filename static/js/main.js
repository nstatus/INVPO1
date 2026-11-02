// =========================================================
// нейро.5 — небольшие улучшения интерфейса.
// Здесь нет тяжёлых библиотек: только чистый JavaScript.
// =========================================================

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------- 1. Шапка и полоса чтения ----------

const header = document.querySelector(".site-header");
const readingProgress = document.querySelector("[data-reading-progress]");

function updateOnScroll() {
  if (header) {
    header.classList.toggle("is-scrolled", window.scrollY > 10);
  }

  if (readingProgress) {
    const pageHeight = document.documentElement.scrollHeight - window.innerHeight;
    const percent = pageHeight > 0 ? (window.scrollY / pageHeight) * 100 : 0;
    readingProgress.style.width = percent + "%";
  }
}

window.addEventListener("scroll", updateOnScroll, { passive: true });
updateOnScroll();

// ---------- 2. Мобильное меню ----------

const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector("#nav");

function closeMenu() {
  if (!nav || !navToggle) return;

  nav.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.setAttribute("aria-label", "Открыть меню");
}

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Закрыть меню" : "Открыть меню");
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  document.addEventListener("click", (event) => {
    if (!nav.contains(event.target) && !navToggle.contains(event.target)) {
      closeMenu();
    }
  });
}

// ---------- 3. Плавное появление блоков ----------

const revealItems = document.querySelectorAll("[data-reveal]");

if (reduceMotion || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
}

// ---------- 4. Подсветка карточки под курсором ----------

if (window.matchMedia("(hover: hover)").matches) {
  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      card.style.setProperty("--my", `${event.clientY - rect.top}px`);
    });
  });
}

// ---------- 5. Лёгкий параллакс карточки в герое ----------

const heroVisual = document.querySelector("[data-parallax]");

if (heroVisual && !reduceMotion && window.matchMedia("(hover: hover)").matches) {
  heroVisual.addEventListener("pointermove", (event) => {
    const rect = heroVisual.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;

    heroVisual.style.setProperty("--parallax-x", (x / rect.width) * 18);
    heroVisual.style.setProperty("--parallax-y", (y / rect.height) * 14);
  });

  heroVisual.addEventListener("pointerleave", () => {
    heroVisual.style.setProperty("--parallax-x", 0);
    heroVisual.style.setProperty("--parallax-y", 0);
  });
}

// ---------- 6. Автоматическое скрытие уведомлений ----------

document.querySelectorAll("[data-toast]").forEach((toast) => {
  const hideToast = () => {
    toast.classList.add("is-hiding");
    window.setTimeout(() => toast.remove(), 300);
  };

  const timer = window.setTimeout(hideToast, 7000);
  const closeButton = toast.querySelector("[data-toast-close]");

  if (closeButton) {
    closeButton.addEventListener("click", () => {
      window.clearTimeout(timer);
      hideToast();
    });
  }
});

// ---------- 7. Подсветка активного пункта содержания ----------

const tocLinks = Array.from(document.querySelectorAll(".toc a"));

if (tocLinks.length && "IntersectionObserver" in window) {
  const sections = tocLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        tocLinks.forEach((link) => {
          link.classList.toggle(
            "is-active",
            link.getAttribute("href") === "#" + entry.target.id
          );
        });
      });
    },
    { rootMargin: "-18% 0px -68% 0px", threshold: 0 }
  );

  sections.forEach((section) => spy.observe(section));
}

// ---------- 8. Проверка формы подписки ----------

const subscribeForm = document.querySelector("[data-subscribe-form]");

if (subscribeForm) {
  const emailInput = subscribeForm.querySelector('input[type="email"]');

  subscribeForm.addEventListener("submit", (event) => {
    if (!emailInput || !emailInput.checkValidity()) {
      event.preventDefault();
      if (emailInput) emailInput.reportValidity();
    }
  });
}
