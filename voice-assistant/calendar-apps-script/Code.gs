/**
 * Burland Voice Calendar (separate Apps Script project in burlandevents@gmail.com).
 * Read-only: returns busy date ranges from the Burland calendar for the voice assistant.
 * Only start/end times and "busy" / "note" are returned, never titles, guests, or details.
 * Scope: calendar.readonly (see appsscript.json), so it cannot create, change, or delete events.
 *
 * GET ?from=YYYY-MM-DD&to=YYYY-MM-DD   (max 400 days)
 */
var CAL_ID = 'burlandevents@gmail.com';
var TZ = 'America/Denver';
var BUSY = /reserv|not available|unavailable|booked|block|hold|closed|private|rented|event|wedding|reunion|party/i;
var NOTE_ONLY = /holiday|\brate\b|\$\s?\d/i;

function doGet(e) {
  var p = (e && e.parameter) || {};
  var re = /^\d{4}-\d{2}-\d{2}$/;
  if (!re.test(p.from || '') || !re.test(p.to || '')) { return json_({ ok: false, error: 'dates' }); }
  var from = new Date(p.from + 'T00:00:00'), to = new Date(p.to + 'T23:59:59');
  if (to < from || (to - from) / 86400000 > 400) { return json_({ ok: false, error: 'range' }); }
  var cal = CalendarApp.getCalendarById(CAL_ID) || CalendarApp.getDefaultCalendar();
  var events = cal.getEvents(from, to).map(function (ev) {
    var allDay = ev.isAllDayEvent();
    var f = allDay ? 'yyyyMMdd' : "yyyyMMdd'T'HHmmss";
    var title = ev.getTitle() || '';
    return {
      allDay: allDay,
      start: Utilities.formatDate(ev.getStartTime(), TZ, f),
      end: Utilities.formatDate(ev.getEndTime(), TZ, f),
      kind: NOTE_ONLY.test(title) && !BUSY.test(title) ? 'note' : 'busy'
    };
  });
  return json_({ ok: true, tz: TZ, events: events });
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

// Run once from the editor (select "authorizeOnce", tap Run) to grant read-only calendar access.
function authorizeOnce() {
  var cal = CalendarApp.getCalendarById(CAL_ID) || CalendarApp.getDefaultCalendar();
  Logger.log('OK: can read "' + cal.getName() + '"');
}
