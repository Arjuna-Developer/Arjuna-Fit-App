// ═══════════════════════════════════════════════════════════════════
// ArjunaFit — Global navigation state manager
// app-shell-navigation-state-arju-layout-v1
// Controls: bottom nav, Arju float, workout mode
// ═══════════════════════════════════════════════════════════════════
(function() {
  'use strict';

  var NAV = {
    // Show/hide bottom nav
    setNav: function(visible) {
      document.body.classList.toggle('hide-bottom-nav', !visible);
    },

    // Show/hide Arju floating button
    setArju: function(visible) {
      document.body.classList.toggle('hide-arju-float', !visible);
    },

    // Enter workout active mode
    startWorkout: function() {
      document.body.classList.add('workout-active');
      // hide-bottom-nav and hide-arju-float handled by CSS via .workout-active
    },

    // Exit workout active mode
    endWorkout: function() {
      document.body.classList.remove('workout-active');
    },

    // Per-route setup — call on page init
    setupForRoute: function(route) {
      var noNav  = ['workout', 'login', 'signup', 'onboarding', 'admin', 'payment'];
      var noArju = ['coach', 'workout', 'login', 'signup', 'onboarding', 'admin'];

      var r = route || window.location.pathname;
      var isNoNav  = noNav.some(function(p)  { return r.includes(p); });
      var isNoArju = noArju.some(function(p) { return r.includes(p); });

      NAV.setNav(!isNoNav);
      NAV.setArju(!isNoArju);
    },
  };

  window.NAV = NAV;

  // Auto-setup on load
  document.addEventListener('DOMContentLoaded', function() {
    NAV.setupForRoute();
  });

  console.log('[NAV] global nav-state loaded');
})();
