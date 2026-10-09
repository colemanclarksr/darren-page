/**
 * Peekaboo Garage Doors — Lead Webhook (Google Apps Script)
 *
 * What it does when the website form is submitted:
 *   1. Appends the lead to a Google Sheet (your lead log)
 *   2. Emails Darren
 *   3. Texts Darren through his carrier's email-to-SMS gateway
 *   4. Returns OK to the website
 *
 * SETUP (10 minutes, one time, done from Darren's Google account):
 *   1. Go to sheets.google.com, make a new sheet named "Peekaboo Leads".
 *   2. In that sheet: Extensions > Apps Script. Delete what's there, paste this whole file.
 *   3. Edit the three lines under CONFIG below.
 *   4. Click Deploy > New deployment > type "Web app".
 *        Execute as: Me
 *        Who has access: Anyone
 *      Click Deploy, approve the permissions, copy the Web app URL.
 *   5. Paste that URL into the website where it says LEAD_WEBHOOK_URL.
 *   6. Test: submit the form on the site. A row, an email, and a text should land within seconds.
 *
 * If you ever change this code, you must Deploy > Manage deployments > Edit > New version,
 * or the live URL keeps running the old code.
 */

// ===== CONFIG =====
var NOTIFY_EMAIL = "dk@peekaboodoors.com";         // Darren's email
var NOTIFY_SMS   = "";                               // Darren's number (972-914-9381) is Google Voice, which has no email-to-text gateway, so texts are OFF. Email alerts go to his phone through the Gmail app instead. See "Text alerts" note below.
var SHEET_NAME   = "Leads";                          // tab name inside the spreadsheet
// Text alerts: Google Voice can't receive gateway emails. Two ways to get a buzz on his phone:
//   1. (Free, do this) In the Gmail app on his phone, turn on notifications for "NEW LEAD" emails:
//      Gmail > tap the "NEW LEAD" email > three dots > "Filter messages like this" > create filter >
//      check "Star it" and "Never send to spam". Then Gmail settings > Notifications > All.
//   2. (Later, if needed) A Twilio number (~$1/mo + a penny a text). Ask Coleman, it's a 5-line change here.
// If he ever moves to a regular carrier number, put number@gateway in NOTIFY_SMS:
//   Verizon: @vtext.com   AT&T: @txt.att.net   T-Mobile: @tmomail.net
// ==================

function doPost(e) {
  try {
    var data = parseBody_(e);

    // Honeypot: the site has a hidden field named "company". Bots fill it, people don't.
    if (data.company) return ok_({ ok: true, skipped: "honeypot" });

    var lead = {
      time:   new Date(),
      name:   clean_(data.name),
      phone:  clean_(data.phone),
      city:   clean_(data.city),
      issue:  clean_(data.issue),
      page:   clean_(data.page),
      source: clean_(data.source) || "website"
    };

    if (!lead.name && !lead.phone) return ok_({ ok: false, error: "missing name and phone" });

    logToSheet_(lead);
    notify_(lead);
    return ok_({ ok: true });
  } catch (err) {
    return ok_({ ok: false, error: String(err) });
  }
}

// Lets you open the URL in a browser to confirm it's deployed.
function doGet() {
  return ContentService.createTextOutput("Peekaboo lead webhook is live.");
}

function parseBody_(e) {
  if (!e || !e.postData) return {};
  var ct = (e.postData.type || "").toLowerCase();
  if (ct.indexOf("application/json") > -1) {
    return JSON.parse(e.postData.contents || "{}");
  }
  // text/plain (sent that way to avoid a CORS preflight) may still be JSON
  try { return JSON.parse(e.postData.contents || "{}"); } catch (_) {}
  return e.parameter || {};
}

function logToSheet_(lead) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(["Time", "Name", "Phone", "City", "What's wrong", "Page", "Source", "Status", "Notes"]);
    sh.setFrozenRows(1);
  }
  sh.appendRow([lead.time, lead.name, lead.phone, lead.city, lead.issue, lead.page, lead.source, "New", ""]);
}

function notify_(lead) {
  var when = Utilities.formatDate(lead.time, Session.getScriptTimeZone(), "EEE M/d h:mm a");
  var subject = "NEW LEAD: " + lead.name + " (" + lead.city + ") — " + short_(lead.issue, 40);
  var body =
    "New lead from peekaboodoors.com\n\n" +
    "Name:  " + lead.name + "\n" +
    "Phone: " + lead.phone + "\n" +
    "City:  " + lead.city + "\n" +
    "Issue: " + lead.issue + "\n" +
    "Time:  " + when + "\n" +
    "Page:  " + lead.page + "\n\n" +
    "Call them back now. Tap to call: tel:" + digits_(lead.phone);

  if (NOTIFY_EMAIL) MailApp.sendEmail(NOTIFY_EMAIL, subject, body);

  if (NOTIFY_SMS) {
    // Only runs when NOTIFY_SMS is set. SMS gateways truncate around 160 chars, so keep it tight.
    var sms = "LEAD " + lead.name + " " + lead.phone + " " + lead.city + ": " + short_(lead.issue, 70);
    MailApp.sendEmail(NOTIFY_SMS, "", sms);
  }
}

function ok_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
function clean_(v) { return v == null ? "" : String(v).trim().slice(0, 1000); }
function short_(s, n) { s = s || ""; return s.length > n ? s.slice(0, n - 1) + "…" : s; }
function digits_(s) { return (s || "").replace(/\D/g, ""); }
