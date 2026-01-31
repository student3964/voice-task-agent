/* contactManager.js */
const ContactManager = (function () {
  const STORAGE_KEY = 'contactMap';
  let map = {};

  function _save() {
    const compact = {};
    for (const k of Object.keys(map)) compact[map[k].name] = map[k].email;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(compact));
  }

  function init() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const obj = JSON.parse(raw);
      map = {};
      for (const name of Object.keys(obj)) {
        map[name.toLowerCase()] = { name: name, email: obj[name] };
      }
    } catch (e) { console.error("Contact load failed", e); }
  }

  function getAll() {
    const out = {};
    for (const k of Object.keys(map)) out[map[k].name] = map[k].email;
    return out;
  }

  function findByName(name) {
    const entry = map[name.toLowerCase()];
    return entry ? { name: entry.name, email: entry.email } : null;
  }

  function findByEmail(email) {
    const lower = email.toLowerCase();
    for (const k of Object.keys(map)) {
      if (map[k].email.toLowerCase() === lower) return { name: map[k].name, email: map[k].email };
    }
    return null;
  }

  function hasNameConflict(name, email) {
    const existing = findByName(name);
    if (!existing) return false;
    return existing.email.toLowerCase() !== (email || '').toLowerCase();
  }

  function addContact(name, email) {
    map[name.toLowerCase()] = { name: name.trim(), email: email.trim() };
    _save();
  }

  function removeContact(name) {
    delete map[name.toLowerCase()];
    _save();
  }

  return { init, getAll, findByName, findByEmail, hasNameConflict, addContact, removeContact };
})();
window.ContactManager = ContactManager;