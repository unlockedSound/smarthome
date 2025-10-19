async function loadSection(el) {
  const name = el.getAttribute('data-include');
  try {
    const res = await fetch(`./components/${name}.html`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to load ${name}`);
    const html = await res.text();
    el.innerHTML = html;
  } catch (e) {
    el.innerHTML = `<div class="p-4 text-sm text-red-300">Missing component: ${name}</div>`;
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const sections = document.querySelectorAll('[data-include]');
  await Promise.all(Array.from(sections).map(loadSection));
});


