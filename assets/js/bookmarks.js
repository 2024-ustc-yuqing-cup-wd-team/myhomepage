/*
 * Bookmarks tool.
 * Stores at most ten URLs in localStorage; no network calls except favicon lookups.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'mh.bookmarks.v1';
  var MAX_BOOKMARKS = 10;

  var form = document.getElementById('bookmark-form');
  var input = document.getElementById('bookmark-url');
  var error = document.getElementById('form-error');
  var grid = document.getElementById('bookmark-grid');
  var empty = document.getElementById('empty-state');
  var counter = document.getElementById('counter');
  var deleteToggle = document.getElementById('toggle-delete-mode');

  if (!form || !input || !grid) {
    return;
  }

  var bookmarks = load();

  function load() {
    try {
      var parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed.filter(isBookmark).slice(0, MAX_BOOKMARKS);
    } catch (err) {
      return [];
    }
  }

  function isBookmark(item) {
    return item && typeof item.url === 'string' && typeof item.domain === 'string';
  }

  function save() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
    } catch (err) {
      /* Storage may be unavailable (private mode); the session still works in memory. */
    }
  }

  function parseUrl(raw) {
    var value = raw.trim();
    if (value === '' || /\s/.test(value)) {
      return null;
    }
    if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(value)) {
      value = 'https://' + value;
    }
    var url = new URL(value);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return null;
    }
    if (!/^[a-z0-9.-]+$/i.test(url.hostname) || url.hostname.indexOf('..') !== -1) {
      return null;
    }
    if (url.hostname.indexOf('.') === -1 && url.hostname !== 'localhost') {
      return null;
    }
    return url;
  }

  function monogramTone(domain) {
    var hash = 0;
    for (var i = 0; i < domain.length; i += 1) {
      hash = (hash * 31 + domain.charCodeAt(i)) % 6;
    }
    return hash;
  }

  function createItem(bookmark) {
    var item = document.createElement('li');
    item.className = 'bookmark';

    var link = document.createElement('a');
    link.className = 'bookmark-link';
    link.href = bookmark.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';

    var icon = document.createElement('span');
    icon.className = 'bookmark-icon';
    icon.dataset.tone = String(monogramTone(bookmark.domain));
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = bookmark.domain.charAt(0).toUpperCase();

    var label = document.createElement('span');
    label.className = 'bookmark-domain';
    label.textContent = bookmark.domain;
    label.title = bookmark.url;

    link.appendChild(icon);
    link.appendChild(label);

    var remove = document.createElement('button');
    remove.className = 'bookmark-delete';
    remove.type = 'button';
    remove.textContent = '\u00d7';
    remove.setAttribute('aria-label', 'Remove ' + bookmark.domain);
    remove.addEventListener('click', function () {
      bookmarks = bookmarks.filter(function (entry) {
        return entry.url !== bookmark.url;
      });
      save();
      render();
    });

    item.appendChild(link);
    item.appendChild(remove);
    return item;
  }

  function render() {
    grid.textContent = '';
    bookmarks.forEach(function (bookmark) {
      grid.appendChild(createItem(bookmark));
    });
    empty.hidden = bookmarks.length > 0;
    counter.textContent = bookmarks.length + ' / ' + MAX_BOOKMARKS;
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    error.textContent = '';

    var url;
    try {
      url = parseUrl(input.value);
    } catch (err) {
      url = null;
    }

    if (!url) {
      error.textContent = 'Enter a valid address, for example jw.ustc.edu.cn.';
      return;
    }
    if (bookmarks.length >= MAX_BOOKMARKS) {
      error.textContent = 'You can save up to ' + MAX_BOOKMARKS + ' bookmarks. Remove one first.';
      return;
    }
    if (bookmarks.some(function (entry) { return entry.url === url.href; })) {
      error.textContent = 'That bookmark is already saved.';
      return;
    }

    bookmarks.push({
      url: url.href,
      domain: url.hostname.replace(/^www\./, '')
    });
    save();
    render();
    form.reset();
    input.focus();
  });

  deleteToggle.addEventListener('click', function () {
    var active = grid.classList.toggle('is-deleting');
    deleteToggle.setAttribute('aria-pressed', String(active));
    deleteToggle.textContent = active ? 'Done' : 'Delete mode';
  });

  render();
})();
