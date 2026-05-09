document.addEventListener("DOMContentLoaded", function () {
  const CONTACTS = {
    whatsappNumber: "79271829661",
    publicPhoneDisplay: "+7 927 182 96 61",
    maxUrl: "", // сюда можно вставить ссылку на MAX, когда будет
  };

  const burger = document.getElementById("burger");
  const nav = document.getElementById("nav");

  function setBurgerExpanded(isExpanded) {
    if (!burger) return;
    burger.setAttribute("aria-expanded", isExpanded ? "true" : "false");
    burger.setAttribute("aria-label", isExpanded ? "Закрыть меню" : "Открыть меню");
    burger.textContent = isExpanded ? "×" : "☰";
  }

  if (burger && nav) {
    burger.addEventListener("click", function () {
      nav.classList.toggle("active");
      setBurgerExpanded(nav.classList.contains("active"));
    });

    document.querySelectorAll(".nav a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("active");
        setBurgerExpanded(false);
      });
    });
  }

  document.querySelectorAll(".faq-item").forEach(function (item) {
    const button = item.querySelector(".faq-question");
    const icon = button ? button.querySelector("span") : null;

    if (button && icon) {
      button.addEventListener("click", function () {
        item.classList.toggle("active");
        icon.textContent = item.classList.contains("active") ? "−" : "+";
      });
    }
  });

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll(".reveal").forEach(function (element) {
    observer.observe(element);
  });

  function createToast() {
    const wrap = document.createElement("div");
    wrap.className = "toast";
    wrap.innerHTML = [
      '<div class="toast__inner" role="status" aria-live="polite">',
      '  <div class="toast__text"></div>',
      '  <button class="toast__btn" type="button">ОК</button>',
      "</div>",
    ].join("");

    document.body.appendChild(wrap);
    const inner = wrap.querySelector(".toast__inner");
    const text = wrap.querySelector(".toast__text");
    const btn = wrap.querySelector(".toast__btn");

    function hide() {
      inner.classList.remove("visible");
    }

    btn.addEventListener("click", hide);

    return {
      show: function (message) {
        text.textContent = message;
        inner.classList.add("visible");
        window.clearTimeout(wrap.__t);
        wrap.__t = window.setTimeout(hide, 4500);
      },
    };
  }

  const toast = createToast();

  function onlyDigits(value) {
    return String(value || "").replace(/\D/g, "");
  }

  function formatRuPhone(digits) {
    // ожидаем 11 цифр, начиная с 7
    const d = onlyDigits(digits);
    const normalized = d.startsWith("8") ? ("7" + d.slice(1)) : d;
    const x = normalized.startsWith("7") ? normalized.slice(1) : normalized;

    const p1 = x.slice(0, 3);
    const p2 = x.slice(3, 6);
    const p3 = x.slice(6, 8);
    const p4 = x.slice(8, 10);

    let out = "+7";
    if (p1) out += " (" + p1;
    if (p1 && p1.length === 3) out += ")";
    if (p2) out += " " + p2;
    if (p3) out += "-" + p3;
    if (p4) out += "-" + p4;
    return out;
  }

  const phoneInput = document.getElementById("phone");
  if (phoneInput) {
    phoneInput.addEventListener("input", function () {
      const digits = onlyDigits(phoneInput.value);
      phoneInput.value = formatRuPhone(digits);
    });
  }

  // MAX ссылки: если пустая — отключаем
  document.querySelectorAll('a[href="#"]').forEach(function (a) {
    if (a.textContent && a.textContent.trim().toUpperCase() === "MAX") {
      if (CONTACTS.maxUrl) {
        a.href = CONTACTS.maxUrl;
      } else {
        a.addEventListener("click", function (e) {
          e.preventDefault();
          toast.show("Ссылка на MAX будет добавлена позже.");
        });
      }
    }
  });

  const contactForm = document.getElementById("contactForm");

  function buildRequestText(data) {
    const lines = [
      "Здравствуйте! Хочу записаться на консультацию.",
      "",
      "Имя: " + data.name,
      "Телефон: " + data.phone,
      "Возраст ребенка: " + data.child,
    ];
    if (data.message) lines.push("Запрос: " + data.message);
    lines.push("", "Спасибо!");
    return lines.join("\n");
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_) {
      return false;
    }
  }

  if (contactForm) {
    contactForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      const fd = new FormData(contactForm);
      const name = String(fd.get("name") || "").trim();
      const phone = String(fd.get("phone") || "").trim();
      const child = String(fd.get("child") || "").trim();
      const message = String(fd.get("message") || "").trim();

      if (!name || !phone || !child) {
        toast.show("Пожалуйста, заполните имя, телефон и возраст ребенка.");
        return;
      }

      const text = buildRequestText({ name, phone, child, message });
      const waUrl = "https://wa.me/" + CONTACTS.whatsappNumber + "?text=" + encodeURIComponent(text);

      const copied = await copyToClipboard(text);
      window.open(waUrl, "_blank", "noopener,noreferrer");

      toast.show(
        copied
          ? "Открыл WhatsApp. Текст заявки также скопирован."
          : "Открыл WhatsApp. Если нужно — скопируйте текст из формы вручную."
      );

      contactForm.reset();
    });
  }
});

