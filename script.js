/* ==== Контактні дані компанії — редагуйте тільки тут ==== */
const CONTACT = {
  phone: '+380001234567',
  phoneDisplay: '+38 (000) 123-45-67',
  telegram: 'santehnik_plus',   // username Telegram-бота/акаунта без @
  viber: '380001234567',        // номер Viber, тільки цифри, з кодом країни, без +
  email: 'info@santehnik-plus.ua',
};
/* ========================================================= */

document.getElementById('year').textContent = new Date().getFullYear();

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
