/*
 * Calendar tool.
 * Wraps FullCalendar and persists events in localStorage.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'mh.calendar.events.v1';

  var root = document.getElementById('calendar');
  if (!root || !window.FullCalendar) {
    return;
  }

  var dialog = document.getElementById('event-dialog');
  var form = document.getElementById('event-form');
  var titleInput = document.getElementById('event-title');
  var whenLabel = document.getElementById('event-when');
  var dialogTitle = document.getElementById('dialog-title');
  var deleteButton = document.getElementById('event-delete');

  var current = { event: null, start: null, end: null, allDay: false };

  function load() {
    try {
      var parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed.filter(function (event) {
        return event && typeof event.title === 'string' && typeof event.start === 'string';
      });
    } catch (err) {
      return [];
    }
  }

  function save(events) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch (err) {
      /* Storage may be unavailable; events still live in this session. */
    }
  }

  function snapshot() {
    return calendar.getEvents().map(function (event) {
      return {
        id: event.id,
        title: event.title,
        start: event.startStr,
        end: event.endStr,
        allDay: event.allDay
      };
    });
  }

  function uid() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      return window.crypto.randomUUID();
    }
    return 'ev-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  }

  function describe(startStr, endStr, allDay) {
    var start = new Date(startStr);
    var options = { weekday: 'short', month: 'short', day: 'numeric' };
    if (!allDay) {
      options.hour = '2-digit';
      options.minute = '2-digit';
      options.hour12 = false;
    }
    var text = start.toLocaleString('en-US', options);
    if (!allDay && endStr) {
      var end = new Date(endStr);
      text += ' \u2013 ' + end.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    }
    return text;
  }

  function openCreate(startStr, endStr, allDay) {
    current = { event: null, start: startStr, end: endStr, allDay: allDay };
    dialogTitle.textContent = 'New event';
    titleInput.value = '';
    whenLabel.textContent = describe(startStr, endStr, allDay);
    deleteButton.hidden = true;
    dialog.showModal();
    titleInput.focus();
  }

  function openEdit(event) {
    current = { event: event, start: event.startStr, end: event.endStr, allDay: event.allDay };
    dialogTitle.textContent = 'Edit event';
    titleInput.value = event.title;
    whenLabel.textContent = describe(event.startStr, event.endStr, event.allDay);
    deleteButton.hidden = false;
    dialog.showModal();
    titleInput.focus();
    titleInput.select();
  }

  function commit() {
    var title = titleInput.value.trim();
    if (!title) {
      titleInput.focus();
      return;
    }

    if (current.event) {
      current.event.setProp('title', title);
    } else {
      calendar.addEvent({
        id: uid(),
        title: title,
        start: current.start,
        end: current.end,
        allDay: current.allDay
      });
    }

    save(snapshot());
    dialog.close();
  }

  var viewButtons = Array.prototype.slice.call(
    document.querySelectorAll('.view-switch [data-view]')
  );

  function syncViewButtons(viewType) {
    viewButtons.forEach(function (button) {
      button.setAttribute('aria-pressed', String(button.getAttribute('data-view') === viewType));
    });
  }

  var calendar = new window.FullCalendar.Calendar(root, {
    initialView: 'dayGridMonth',
    height: 'auto',
    firstDay: 1,
    selectable: true,
    selectMirror: true,
    editable: false,
    dayMaxEvents: true,
    events: load(),
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: ''
    },
    buttonText: { today: 'Today' },
    datesSet: function (info) {
      syncViewButtons(info.view.type);
    },
    eventDidMount: function (info) {
      info.el.setAttribute('title', info.event.title);
    },
    dateClick: function (info) {
      openCreate(info.dateStr, null, info.allDay);
    },
    select: function (info) {
      openCreate(info.startStr, info.endStr, info.allDay);
      calendar.unselect();
    },
    eventClick: function (info) {
      info.jsEvent.preventDefault();
      openEdit(info.event);
    }
  });

  form.addEventListener('submit', function (event) {
    var action = event.submitter ? event.submitter.value : 'save';

    if (action === 'cancel') {
      return; // The dialog closes itself (method="dialog").
    }

    event.preventDefault();

    if (action === 'delete') {
      if (current.event) {
        current.event.remove();
      }
      save(snapshot());
      dialog.close();
      return;
    }

    commit();
  });

  viewButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      calendar.changeView(button.getAttribute('data-view'));
    });
  });

  calendar.render();
})();
