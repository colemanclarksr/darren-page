(function () {
  var PHONE = '+19729149381';
  var PHONE_DISPLAY = '(972) 914-9381';

  // Mobile menu
  var toggle = document.querySelector('.mobile-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Prefill service from ?service= on the request page
  var params = new URLSearchParams(window.location.search);
  var service = params.get('service');
  var serviceSelect = document.querySelector('select[name="service"]');
  if (service && serviceSelect) {
    for (var i = 0; i < serviceSelect.options.length; i++) {
      if (serviceSelect.options[i].value === service) { serviceSelect.selectedIndex = i; break; }
    }
  }

  // Forms: build a text message to Darren with the details.
  // There is no server on this site, so the visitor's own phone sends the text.
  var labels = {
    name: 'Name', phone: 'Phone', city: 'City', service: 'Service',
    issue: 'Issue', day: 'Best day', time: 'Best time', method: 'Contact by', details: 'Details'
  };

  document.querySelectorAll('form[data-demo-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = form.querySelector('.form-status');
      if (!form.checkValidity()) { form.reportValidity(); return; }

      var data = new FormData(form);
      var lines = ['Website request for Peekaboo Garage Doors'];
      data.forEach(function (value, key) {
        value = String(value).trim();
        if (value) lines.push((labels[key] || key) + ': ' + value);
      });
      var body = encodeURIComponent(lines.join('\n'));
      var isApple = /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent);
      var smsHref = 'sms:' + PHONE + (isApple ? '&' : '?') + 'body=' + body;

      if (status) {
        status.classList.remove('error');
        status.innerHTML = 'Almost done. Your text to Darren is ready, tap <strong>Send</strong> in your messages app to finish. ' +
          'If nothing opened, <a href="tel:' + PHONE + '">call or text ' + PHONE_DISPLAY + '</a>.';
      }
      window.location.href = smsHref;
    });
  });
})();
