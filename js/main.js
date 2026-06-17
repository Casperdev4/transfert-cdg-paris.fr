/* ===================================================================
   TRANSFERT CDG PARIS — Scripts
   =================================================================== */
(function () {
  'use strict';

  /* ---- Header au scroll ---- */
  var header = document.getElementById('header');
  function onScroll() {
    if (window.scrollY > 40) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll);
  onScroll();

  /* ---- Menu mobile ---- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  function closeMenu() {
    nav.classList.remove('open');
    burger.classList.remove('active');
    burger.setAttribute('aria-expanded', 'false');
  }
  burger.addEventListener('click', function () {
    var isOpen = nav.classList.toggle('open');
    burger.classList.toggle('active');
    burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
  nav.querySelectorAll('.nav__link').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  /* ---- Année dans le footer ---- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- Date minimale = aujourd'hui ---- */
  var dateInput = document.getElementById('date');
  if (dateInput) {
    var today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
  }

  /* ---- Pré-remplissage du véhicule (formulaire d'accueil) ---- */
  var vehicleSelect = document.getElementById('vehicle');
  if (vehicleSelect) {
    function setVehicle(name) {
      if (!name) return;
      Array.prototype.forEach.call(vehicleSelect.options, function (opt) {
        if (opt.value === name) vehicleSelect.value = name;
      });
    }
    // 1) depuis l'URL : index.html?vehicule=Mercedes%20Classe%20S
    var params = new URLSearchParams(window.location.search);
    setVehicle(params.get('vehicule'));
    // 2) au clic sur "Réserver" d'une carte de la flotte (même page)
    document.querySelectorAll('a[data-vehicle]').forEach(function (link) {
      link.addEventListener('click', function () {
        setVehicle(link.getAttribute('data-vehicle'));
      });
    });
  }

  /* ---- Apparition au scroll (reveal) ---- */
  var revealEls = document.querySelectorAll(
    '.card, .vehicle, .perk, .pricing__row, .faq__item, .section__head'
  );
  revealEls.forEach(function (el) { el.classList.add('reveal'); });

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ---- Formulaire de réservation ---- */
  var form = document.getElementById('bookingForm');
  var feedback = document.getElementById('formFeedback');

  function isValidEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      feedback.textContent = '';
      feedback.className = 'booking__feedback';

      var required = form.querySelectorAll('[required]');
      var valid = true;

      required.forEach(function (field) {
        field.classList.remove('invalid');
        if (!field.value.trim()) {
          field.classList.add('invalid');
          valid = false;
        }
      });

      var email = document.getElementById('email');
      if (email.value.trim() && !isValidEmail(email.value.trim())) {
        email.classList.add('invalid');
        valid = false;
      }

      if (!valid) {
        feedback.textContent = 'Merci de remplir correctement tous les champs obligatoires.';
        feedback.classList.add('error');
        return;
      }

      /* Construction d'un message pré-rempli (mailto) */
      var data = {
        nom: document.getElementById('name').value.trim(),
        tel: document.getElementById('phone').value.trim(),
        email: email.value.trim(),
        depart: document.getElementById('from').value.trim(),
        arrivee: document.getElementById('to').value.trim(),
        date: document.getElementById('date').value,
        heure: document.getElementById('time').value,
        vehicule: document.getElementById('vehicle').value,
        passagers: document.getElementById('passengers').value,
        message: document.getElementById('message').value.trim()
      };

      var corps =
        'Demande de réservation - ASC Driver%0D%0A%0D%0A' +
        'Nom : ' + data.nom + '%0D%0A' +
        'Téléphone : ' + data.tel + '%0D%0A' +
        'Email : ' + data.email + '%0D%0A' +
        'Prise en charge : ' + data.depart + '%0D%0A' +
        'Destination : ' + data.arrivee + '%0D%0A' +
        'Date : ' + data.date + ' à ' + data.heure + '%0D%0A' +
        'Véhicule : ' + data.vehicule + '%0D%0A' +
        'Passagers : ' + data.passagers + '%0D%0A' +
        'Précisions : ' + (data.message || '—');

      var mailto = 'mailto:asc.driver@outlook.com' +
        '?subject=' + encodeURIComponent('Réservation transfert — ' + data.nom) +
        '&body=' + corps;

      feedback.textContent = 'Merci ' + data.nom + ' ! Votre messagerie va s\'ouvrir pour confirmer l\'envoi.';
      feedback.classList.add('success');

      window.location.href = mailto;
      form.reset();
    });
  }

  /* ---- Formulaire multi-étapes (hero des pages véhicule) ---- */
  document.querySelectorAll('.multistep').forEach(function (msForm) {
    var steps = msForm.querySelectorAll('.form-step');
    var dots = msForm.querySelectorAll('.step-dot');
    var current = 0;

    function showStep(i) {
      steps.forEach(function (s, idx) { s.classList.toggle('active', idx === i); });
      dots.forEach(function (d, idx) { d.classList.toggle('active', idx <= i); });
      current = i;
    }

    function validateStep(stepEl) {
      var ok = true;
      stepEl.querySelectorAll('[required]').forEach(function (f) {
        f.classList.remove('invalid');
        if (!f.value.trim()) { f.classList.add('invalid'); ok = false; }
        if (f.type === 'email' && f.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim())) {
          f.classList.add('invalid'); ok = false;
        }
      });
      return ok;
    }

    msForm.querySelectorAll('.hf-next').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (validateStep(steps[current])) showStep(Math.min(current + 1, steps.length - 1));
      });
    });
    msForm.querySelectorAll('.hf-prev').forEach(function (btn) {
      btn.addEventListener('click', function () { showStep(Math.max(current - 1, 0)); });
    });

    var dateField = msForm.querySelector('input[type="date"]');
    if (dateField) dateField.setAttribute('min', new Date().toISOString().split('T')[0]);

    var feedback = msForm.querySelector('.hf-feedback');
    msForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validateStep(steps[current])) return;

      function val(n) { var el = msForm.querySelector('[name="' + n + '"]'); return el ? el.value.trim() : ''; }
      var vehicle = msForm.getAttribute('data-vehicle') || '';

      var corps =
        'Demande de devis - ASC Driver%0D%0A%0D%0A' +
        'Véhicule : ' + vehicle + '%0D%0A' +
        'Prise en charge : ' + val('from') + '%0D%0A' +
        'Destination : ' + val('to') + '%0D%0A' +
        'Date : ' + val('date') + ' à ' + val('time') + '%0D%0A' +
        'Passagers : ' + val('passengers') + '%0D%0A' +
        'Bagages : ' + val('luggage') + '%0D%0A' +
        'Nom : ' + val('name') + '%0D%0A' +
        'Téléphone : ' + val('phone') + '%0D%0A' +
        'Email : ' + val('email');

      var mailto = 'mailto:asc.driver@outlook.com' +
        '?subject=' + encodeURIComponent('Devis ' + vehicle + ' — ' + val('name')) +
        '&body=' + corps;

      feedback.textContent = 'Merci ' + val('name') + ' ! Votre messagerie va s\'ouvrir pour confirmer l\'envoi.';
      feedback.className = 'hf-feedback success';
      window.location.href = mailto;
    });
  });
})();
