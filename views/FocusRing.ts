export function focusWithVisibleRing(id: string): void {
  const target = document.getElementById(id);
  if (!target) return;
  target.classList.add('program-focus');
  target.addEventListener('blur', () => target.classList.remove('program-focus'), { once: true });
  target.focus();
}
