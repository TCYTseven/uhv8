(function () {
  "use strict";

  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function fitStage() {
    var w = document.documentElement.clientWidth;
    var z = w <= 860 ? 1 : Math.min(1, w / 1440);
    document.documentElement.style.setProperty("--page-zoom", z);
  }
  fitStage();
  window.addEventListener("resize", fitStage);

  var KICKOFF = new Date("2027-01-15T19:00:00-05:00").getTime();
  var cdEls = {
    days: document.querySelector('[data-cd="days"]'),
    hours: document.querySelector('[data-cd="hours"]'),
    minutes: document.querySelector('[data-cd="minutes"]'),
    seconds: document.querySelector('[data-cd="seconds"]')
  };
  function pad(n, w) {
    n = String(n);
    while (n.length < w) n = "0" + n;
    return n;
  }

  function tick() {
    var diff = KICKOFF - Date.now();
    if (diff < 0) diff = 0;
    var d = Math.floor(diff / 86400000);
    var h = Math.floor(diff / 3600000) % 24;
    var m = Math.floor(diff / 60000) % 60;
    var s = Math.floor(diff / 1000) % 60;
    if (cdEls.days) {
      cdEls.days.textContent = pad(d, 3);
      cdEls.hours.textContent = pad(h, 2);
      cdEls.minutes.textContent = pad(m, 2);
      cdEls.seconds.textContent = pad(s, 2);
    }
  }
  tick();
  setInterval(tick, 1000);

  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !REDUCED) {
    var ro = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("on");
            ro.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 }
    );
    revealEls.forEach(function (el) { ro.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("on"); });
  }

  var footer = document.querySelector(".footer");
  if (footer) {
    if ("IntersectionObserver" in window && !REDUCED) {
      var fo = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) {
              footer.classList.add("revealed");
              fo.disconnect();
            }
          });
        },
        { threshold: 0.35 }
      );
      fo.observe(footer);
    } else {
      footer.classList.add("revealed");
    }
  }

  var mToggle = document.querySelector(".menu-toggle");
  var mMenu = document.getElementById("mobile-menu");
  if (mToggle && mMenu) {
    var closeMenu = function () {
      mMenu.hidden = true;
      mToggle.setAttribute("aria-expanded", "false");
    };
    mToggle.addEventListener("click", function () {
      var opening = mMenu.hidden;
      mMenu.hidden = !opening;
      mToggle.setAttribute("aria-expanded", opening ? "true" : "false");
    });
    mMenu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape") closeMenu();
    });
    window.addEventListener("resize", function () {
      if (document.documentElement.clientWidth > 860) closeMenu();
    });
  }

  document.querySelectorAll(".faq-item").forEach(function (item) {
    var btn = item.querySelector(".faq-btn");
    if (!btn) return;
    item.addEventListener("click", function () {
      var open = item.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });

  var installer = document.querySelector(".installer-wrap");
  var pct = document.querySelector(".inst-pct");
  var instMsg = document.querySelector(".inst-msg");
  if (installer && pct) {
    var startPct = function () {
      var t0 = null;
      var DURATION = 2600;
      var DELAY = 350;
      function step(ts) {
        if (t0 === null) t0 = ts;
        var el = ts - t0 - DELAY;
        if (el < 0) { requestAnimationFrame(step); return; }
        var p = Math.min(1, el / DURATION);
        var eased = 1 - Math.pow(1 - p, 3);
        pct.textContent = Math.round(eased * 100) + "%";
        if (p < 1) requestAnimationFrame(step);
        else if (instMsg) instMsg.textContent = "motivation installed. ";
      }
      requestAnimationFrame(step);
    };
    if ("IntersectionObserver" in window && !REDUCED) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) {
              installer.classList.add("go");
              startPct();
              io.disconnect();
            }
          });
        },
        { threshold: 0.4 }
      );
      io.observe(installer);
    } else {
      installer.classList.add("go");
      pct.textContent = "100%";
      if (instMsg) instMsg.textContent = "motivation installed. ";
    }
  }

  var sky = document.querySelector(".pricing-sky");
  if (sky) {
    var ctx = sky.getContext("2d");
    var stars = [];
    var clouds = [];
    var W = 0, H = 0;

    function sizeSky() {
      var section = sky.parentNode;
      W = sky.clientWidth || 1440;
      H = section.offsetHeight || 1000;
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      sky.width = W * dpr;
      sky.height = H * dpr;
      sky.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function seedSky() {
      var i;
      for (i = 0; i < 90; i++) {
        stars.push({
          fx: Math.random(),
          fy: Math.random(),
          r: Math.random() * 1.4 + 0.4,
          tw: Math.random() * Math.PI * 2,
          sp: 0.4 + Math.random() * 1.2
        });
      }
      for (i = 0; i < 7; i++) {
        clouds.push({
          fx: Math.random(),
          fy: Math.random(),
          w: 160 + Math.random() * 260,
          h: 26 + Math.random() * 30,
          v: 0.08 + Math.random() * 0.18,
          drift: 0,
          o: 0.25 + Math.random() * 0.3
        });
      }
    }

    function drawSky(t) {
      ctx.clearRect(0, 0, W, H);
      var g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#8d6bd6");
      g.addColorStop(0.35, "#b89fe9");
      g.addColorStop(0.7, "#e6ddf8");
      g.addColorStop(1, "#f5f5f5");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      var i, s, c, x, y;
      for (i = 0; i < stars.length; i++) {
        s = stars[i];
        x = s.fx * W;
        y = s.fy * H * 0.45;
        var a = 0.35 + 0.65 * Math.abs(Math.sin(s.tw + t * 0.001 * s.sp));
        ctx.globalAlpha = a * (1 - y / (H * 0.55));
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(x, y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      for (i = 0; i < clouds.length; i++) {
        c = clouds[i];
        c.drift += c.v;
        x = ((c.fx * W + c.drift) % (W + c.w * 2)) - c.w;
        y = H * 0.12 + c.fy * H * 0.4;
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(1, (c.h * 2.2) / c.w);
        var grad = ctx.createRadialGradient(0, 0, 0, 0, 0, c.w / 2);
        grad.addColorStop(0, "rgba(255,255,255," + c.o + ")");
        grad.addColorStop(0.55, "rgba(255,255,255," + c.o * 0.45 + ")");
        grad.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = grad;
        ctx.fillRect(-c.w / 2, -c.w / 2, c.w, c.w);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    }

    var skyVisible = true;
    var skyRaf = null;
    function loopSky(t) {
      drawSky(t);
      skyRaf = skyVisible && !REDUCED ? requestAnimationFrame(loopSky) : null;
    }
    function wakeSky() {
      if (skyRaf === null && skyVisible && !REDUCED) skyRaf = requestAnimationFrame(loopSky);
    }

    sizeSky();
    seedSky();
    drawSky(0);
    if ("IntersectionObserver" in window && !REDUCED) {
      skyVisible = false;
      var so = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          skyVisible = e.isIntersecting;
          wakeSky();
        });
      }, { rootMargin: "100px 0px" });
      so.observe(sky.parentNode);
    } else if (!REDUCED) {
      wakeSky();
    }
    window.addEventListener("resize", function () {
      sizeSky();
      if (REDUCED || skyRaf === null) drawSky(0);
    });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        sizeSky();
        if (REDUCED || skyRaf === null) drawSky(0);
      });
    }
  }
})();
