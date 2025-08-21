document.addEventListener('DOMContentLoaded', function () {
  const calendarEl = document.getElementById('calendar');

  const events = [
    // Upcoming training sessions
    { id: '1', title: 'Phishing Awareness Training', start: '2025-09-15T10:00:00', end: '2025-09-15T11:00:00', extendedProps: { format: 'Virtual' } },
    { id: '2', title: 'Incident Response Workshop', start: '2025-09-22T13:00:00', end: '2025-09-22T15:00:00', extendedProps: { format: 'In-person' } },
    { id: '3', title: 'Password Security Webinar', start: '2025-10-05T09:00:00', end: '2025-10-05T10:00:00', extendedProps: { format: 'Virtual' } },
    { id: '4', title: 'Secure Data Sharing 101', start: '2025-10-21T12:00:00', end: '2025-10-21T12:45:00', extendedProps: { format: 'Hybrid' } },
    { id: '5', title: 'Incident Reporting 101', start: '2025-10-28T12:00:00', end: '2025-10-28T12:45:00', extendedProps: { format: 'Hybrid' } },
    // Past events (for archive)
    { id: 'A', title: 'Secure Coding Basics', start: '2025-06-10T10:00:00', end: '2025-06-10T12:00:00', extendedProps: { format: 'Virtual' } },
    { id: 'B', title: 'Blue Team Drill: Ransomware', start: '2025-05-15T09:00:00', end: '2025-05-15T11:00:00', extendedProps: { format: 'In-person' } }
  ];

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    height: 'auto',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,listMonth'
    },
    events,
    eventClick: function(info) {
      const e = info.event;
      const fmt = e.extendedProps?.format || '';
      const start = e.start ? e.start.toLocaleString() : '';
      const end = e.end ? e.end.toLocaleString() : '';
      alert(`${e.title}\n${fmt}\n${start} – ${end}`);
    }
  });

  calendar.render();

  // Build archive list (events that ended before now)
  const now = new Date();
  const archive = events
    .filter(e => new Date(e.end || e.start) < now)
    .sort((a,b) => new Date(b.start) - new Date(a.start));

  const archiveEl = document.getElementById('archive');
  if (archive.length === 0) {
    archiveEl.innerHTML = '<p class=\"muted\">No past events yet.</p>';
  } else {
    archive.forEach(e => {
      const item = document.createElement('div');
      item.className = 'item';
      const date = new Date(e.start).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
      item.innerHTML = `<div><strong>${e.title}</strong><div class=\"muted\">${date} • ${e.extendedProps?.format || ''}</div></div>`;
      archiveEl.appendChild(item);
    });
  }
});