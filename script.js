/* ==== Контактні дані компанії — типові значення, поки не завантажився content/site.json ==== */
const CONTACT = {
  phone: '+380001234567',
  phoneDisplay: '+38 (000) 123-45-67',
  telegram: 'santehnik_plus',   // username Telegram-бота/акаунта без @
  viber: '380001234567',        // номер Viber, тільки цифри, з кодом країни, без +
  email: 'info@santehnik-plus.ua',
};
/* ============================================================================================ */

document.getElementById('year').textContent = new Date().getFullYear();

function applyContact() {
  document.querySelectorAll('[data-contact="tel"]').forEach(el => el.href = `tel:${CONTACT.phone}`);
  document.querySelectorAll('[data-contact="tel-text"]').forEach(el => el.textContent = CONTACT.phoneDisplay);
  document.querySelectorAll('[data-contact="email"]').forEach(el => el.href = `mailto:${CONTACT.email}`);
  document.querySelectorAll('[data-contact="telegram-text"]').forEach(el => el.textContent = `@${CONTACT.telegram}`);
  document.querySelectorAll('[data-contact="telegram"]').forEach(el => {
    el.href = `https://t.me/${CONTACT.telegram}?text=${encodeURIComponent("Вітаю! Хочу замовити виклик сантехніка.")}`;
  });
  document.querySelectorAll('[data-contact="viber"]').forEach(el => {
    el.href = `viber://chat?number=%2B${CONTACT.viber}`;
  });
}
applyContact();

/* Ціни, контакти, дані майстра, відгуки, FAQ, фото і відео — підвантажуються
   з content/site.json, яким керує адмін-панель на /admin (без потреби редагувати код) */
fetch('content/site.json')
  .then(r => r.ok ? r.json() : null)
  .then(site => {
    if (!site) return;

    if (site.contact) {
      Object.assign(CONTACT, {
        phone: site.contact.phone || CONTACT.phone,
        phoneDisplay: site.contact.phone_display || CONTACT.phoneDisplay,
        telegram: site.contact.telegram || CONTACT.telegram,
        viber: site.contact.viber || CONTACT.viber,
        email: site.contact.email || CONTACT.email,
      });
      applyContact();
    }

    if (site.master_photo) {
      const img = document.getElementById('masterPhotoImg');
      if (img) img.src = site.master_photo;
    }

    if (site.portfolio_video) {
      const source = document.getElementById('portfolioVideoSource');
      const video = document.getElementById('portfolioVideo');
      const link = document.getElementById('portfolioVideoLink');
      if (source) source.src = site.portfolio_video;
      if (link) link.href = site.portfolio_video;
      if (video) video.load();
    }

    if (site.master) {
      const m = site.master;
      const setText = (id, val) => {
        if (!val) return;
        const el = document.getElementById(id);
        if (el) el.textContent = val;
      };
      setText('heroBadge', m.hero_badge);
      setText('heroIntro', m.hero_intro);
      setText('masterName', m.name);
      setText('masterYears', m.experience_years);
      setText('masterBio', m.bio);
      setText('masterScheduleLine', m.schedule_line);
      setText('masterCallBtnText', m.call_button_text);
      setText('advantageText', m.advantage_text);
      setText('ctaText', m.cta_text);
      setText('contactsLocationLine', m.location_line);
    }

    if (Array.isArray(site.prices) && site.prices.length) {
      const grid = document.getElementById('pricesGrid');
      if (grid) {
        grid.innerHTML = site.prices.map(p => `
          <div class="price${p.accent ? ' price--accent' : ''}">
            ${p.tag ? `<span class="price__tag">${p.tag}</span>` : ''}
            <h3>${p.title}</h3>
            <div class="price__value">${p.value}</div>
            <ul>${(p.items || []).map(i => `<li>${i}</li>`).join('')}</ul>
          </div>
        `).join('');
      }
    }

    if (Array.isArray(site.reviews) && site.reviews.length) {
      const grid = document.getElementById('reviewsGrid');
      if (grid) {
        grid.innerHTML = site.reviews.map(r => `
          <div class="review">
            <div class="review__stars">★★★★★</div>
            <p>${r.text}</p>
            <div class="review__author">${r.author}</div>
          </div>
        `).join('');
      }
    }

    if (Array.isArray(site.faq) && site.faq.length) {
      const list = document.getElementById('faqList');
      if (list) {
        list.innerHTML = site.faq.map((f, i) => `
          <details class="faq__item"${i === 0 ? ' open' : ''}>
            <summary>${f.question}</summary>
            <p>${f.answer}</p>
          </details>
        `).join('');
      }
    }
  })
  .catch(() => {}); // JSON недоступний — лишаємо вміст за замовчуванням з HTML

/* Мобільне меню */
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');
burger.addEventListener('click', () => nav.classList.toggle('open'));
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));

/* Плаваюче меню зв'язку */
const fabToggle = document.getElementById('fabToggle');
const fabMenu = document.getElementById('fabMenu');
fabToggle.addEventListener('click', () => fabMenu.classList.toggle('open'));

/* Форма заявки: обрати канал — надіслати запит саме туди */
const form = document.getElementById('callForm');
const note = document.getElementById('formNote');

function buildMessage() {
  const name = form.name.value.trim();
  const phone = form.phone.value.trim();
  const message = form.message.value.trim();
  let text = `Заявка з сайту "Сантехнік Плюс"\nІм'я: ${name}\nТелефон: ${phone}`;
  if (message) text += `\nОпис проблеми: ${message}`;
  return { name, phone, text };
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

form.querySelectorAll('.channel-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    if (!form.name.value.trim() || !form.phone.value.trim()) {
      note.textContent = "Будь ласка, вкажіть ім'я та телефон.";
      form.name.reportValidity();
      return;
    }
    const { text } = buildMessage();
    const channel = btn.dataset.channel;

    if (channel === 'tel') {
      window.location.href = `tel:${CONTACT.phone}`;
      note.textContent = 'Наберіть, будь ласка, дзвінок — ми на лінії.';
    } else if (channel === 'email') {
      window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent('Заявка з сайту')}&body=${encodeURIComponent(text)}`;
      note.textContent = 'Відкрили ваш поштовий клієнт із заповненим листом.';
    } else if (channel === 'telegram') {
      window.open(`https://t.me/${CONTACT.telegram}?text=${encodeURIComponent(text)}`, '_blank');
      note.textContent = 'Відкрили Telegram-чат із заповненим повідомленням.';
    } else if (channel === 'viber') {
      const copied = await copyToClipboard(text);
      window.location.href = `viber://chat?number=%2B${CONTACT.viber}`;
      note.textContent = copied
        ? 'Текст заявки скопійовано — вставте його в чат Viber, що відкрився.'
        : 'Відкрили Viber-чат. Опишіть, будь ласка, проблему в повідомленні.';
    }
  });
});

/* Плавна поява секцій при скролі */
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && revealEls.length) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
  revealEls.forEach(el => revealObserver.observe(el));
} else {
  revealEls.forEach(el => el.classList.add('is-visible'));
}
