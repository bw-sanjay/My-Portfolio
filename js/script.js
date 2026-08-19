    (function () {
      var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      /* ---------------- custom cursor ---------------- */
      var dot = document.getElementById('cursorDot');
      var ring = document.getElementById('cursorRing');
      var hasHover = window.matchMedia('(hover:hover)').matches;
      if (hasHover) {
        var mx = 0, my = 0, rx = 0, ry = 0;
        window.addEventListener('mousemove', function (e) {
          mx = e.clientX; my = e.clientY;
          dot.style.left = mx + 'px'; dot.style.top = my + 'px';
        });
        function loop() {
          rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
          ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
          requestAnimationFrame(loop);
        }
        loop();
        document.querySelectorAll('a,button,[data-magnetic]').forEach(function (el) {
          el.addEventListener('mouseenter', function () { ring.classList.add('hover'); });
          el.addEventListener('mouseleave', function () { ring.classList.remove('hover'); });
        });
      }

      /* ---------------- magnetic buttons ---------------- */
      if (hasHover) {
        document.querySelectorAll('[data-magnetic]').forEach(function (el) {
          el.addEventListener('mousemove', function (e) {
            var r = el.getBoundingClientRect();
            var x = e.clientX - r.left - r.width / 2;
            var y = e.clientY - r.top - r.height / 2;
            el.style.transform = 'translate(' + x * 0.18 + 'px,' + y * 0.35 + 'px)';
          });
          el.addEventListener('mouseleave', function () { el.style.transform = 'translate(0,0)'; });
        });
      }

      /* ---------------- hero waveform ---------------- */
      var wf = document.getElementById('waveform');
      var bars = 22;
      for (var i = 0; i < bars; i++) {
        var s = document.createElement('span');
        var h = 14 + Math.random() * 56;
        s.style.height = h + 'px';
        s.style.animationDelay = (Math.random() * 1.6) + 's';
        s.style.animationDuration = (1.1 + Math.random() * 1.1) + 's';
        wf.appendChild(s);
      }
      if (reduceMotion) {
        wf.querySelectorAll('span').forEach(function (s) { s.style.animation = 'none'; s.style.transform = 'scaleY(.6)'; });
        document.getElementById('heroPhoto').style.animation = 'none';
      }

      /* ---------------- Lenis Smooth Scroll Global ---------------- */
      var lenis = null;
      if (typeof Lenis !== 'undefined' && !reduceMotion) {
        lenis = new Lenis({
          duration: 1.2,
          easing: function (t) {
            return Math.min(1, 1.001 - Math.pow(2, -10 * t));
          },
          orientation: 'vertical',
          gestureOrientation: 'vertical',
          smoothWheel: true,
          wheelMultiplier: 1.0,
          touchMultiplier: 1.2,
          infinite: false
        });

        function lenisRaf(time) {
          lenis.raf(time);
          requestAnimationFrame(lenisRaf);
        }
        requestAnimationFrame(lenisRaf);
      }

      // Smooth scroll helper for anchors & navigation
      function smoothScrollTo(target, offset) {
        if (target === undefined || target === null) return;
        var off = typeof offset === 'number' ? offset : -65;
        if (lenis) {
          lenis.scrollTo(target, {
            offset: off,
            duration: 1.3,
            easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }
          });
        } else if (typeof target === 'number') {
          window.scrollTo({ top: target, behavior: reduceMotion ? 'auto' : 'smooth' });
        } else if (target.scrollIntoView) {
          target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
        }
      }

      // Global smooth anchor navigation
      document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
          var targetId = this.getAttribute('href');
          if (!targetId || targetId === '#') return;
          var targetEl = document.querySelector(targetId);
          if (targetEl) {
            e.preventDefault();
            smoothScrollTo(targetEl, -65);
          }
        });
      });

      /* ---------------- scroll reveal ---------------- */
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('in-view'); }
        });
      }, { threshold: 0.15 });
      document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

      var ioClips = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.style.transitionDelay = (en.target.dataset.i * 60) + 'ms';
            en.target.classList.add('in-view');
          }
        });
      }, { threshold: 0.1 });
      document.querySelectorAll('.clip').forEach(function (el, i) { el.dataset.i = i; ioClips.observe(el); });

      /* ---------------- parallax on scroll ---------------- */
      var heroPhoto = document.getElementById('heroPhoto');
      var bgIcons = document.querySelectorAll('.bg-icon');
      function onScrollParallax() {
        var y = window.scrollY;
        if (heroPhoto) { heroPhoto.style.transform = 'translateY(' + Math.min(y * 0.08, 40) + 'px)'; }
        bgIcons.forEach(function (el, i) {
          var speed = 0.04 + (i % 3) * 0.02;
          el.style.transform = 'translateY(' + (y * speed) + 'px) rotate(' + (y * 0.01) + 'deg)';
        });
      }
      if (!reduceMotion) {
        window.addEventListener('scroll', onScrollParallax, { passive: true });
        if (lenis) { lenis.on('scroll', onScrollParallax); }
      }

      /* ---------------- Ads & Reels Infinite Carousel ---------------- */
      (function initAdsCarousel() {
        var carousel = document.getElementById('adsCarousel');
        var prevBtn = document.getElementById('adsPrevBtn');
        var nextBtn = document.getElementById('adsNextBtn');
        var dotsContainer = document.getElementById('adsDots');
        if (!carousel) return;

        var originalCards = Array.from(carousel.querySelectorAll('.ads-card'));
        var originalCount = originalCards.length;
        if (originalCount === 0) return;

        // Clone sets for seamless infinite wrapping: [Set 0 (clone), Set 1 (original), Set 2 (clone)]
        var cloneBefore = originalCards.map(function (c) { var cl = c.cloneNode(true); cl.classList.add('is-clone'); return cl; });
        var cloneAfter = originalCards.map(function (c) { var cl = c.cloneNode(true); cl.classList.add('is-clone'); return cl; });

        // Insert clones before
        cloneBefore.reverse().forEach(function (cl) {
          carousel.insertBefore(cl, carousel.firstChild);
        });
        // Insert clones after
        cloneAfter.forEach(function (cl) {
          carousel.appendChild(cl);
        });

        // Calculate card dimensions and total set width
        function getMetrics() {
          var firstCard = carousel.querySelector('.ads-card');
          var gap = 20;
          if (firstCard && firstCard.nextElementSibling) {
            var g = firstCard.nextElementSibling.offsetLeft - (firstCard.offsetLeft + firstCard.offsetWidth);
            if (g > 0) gap = g;
          }
          var cardWidth = firstCard ? firstCard.offsetWidth : 220;
          var cardStep = cardWidth + gap;
          var setWidth = cardStep * originalCount;
          return { cardWidth: cardWidth, gap: gap, cardStep: cardStep, setWidth: setWidth };
        }

        // Initialize scroll position in the center (Set 1 - original)
        var isLooping = false;
        var mInit = getMetrics();
        carousel.scrollLeft = mInit.setWidth;

        // Build dynamic dots for all original cards
        if (dotsContainer) {
          dotsContainer.innerHTML = '';
          for (var d = 0; d < originalCount; d++) {
            var dot = document.createElement('span');
            dot.className = 'ads-dot' + (d === 0 ? ' active' : '');
            dot.dataset.idx = d;
            (function (idx) {
              dot.addEventListener('click', function () {
                var m = getMetrics();
                var currentCycle = Math.round(carousel.scrollLeft / m.setWidth);
                var target = currentCycle * m.setWidth + idx * m.cardStep;
                carousel.scrollTo({ left: target, behavior: reduceMotion ? 'auto' : 'smooth' });
              });
            })(d);
            dotsContainer.appendChild(dot);
          }
        }

        function updateDots() {
          var dots = dotsContainer ? dotsContainer.querySelectorAll('.ads-dot') : [];
          if (!dots.length) return;
          var m = getMetrics();
          if (m.setWidth <= 0 || m.cardStep <= 0) return;
          var normalized = ((carousel.scrollLeft % m.setWidth) + m.setWidth) % m.setWidth;
          var activeIdx = Math.min(originalCount - 1, Math.max(0, Math.round(normalized / m.cardStep)));
          dots.forEach(function (dot, i) {
            dot.classList.toggle('active', i === activeIdx);
          });
        }

        // Infinite boundary loop check
        function checkInfiniteLoop() {
          if (isLooping) return;
          var m = getMetrics();
          if (m.setWidth <= 0) return;

          // If scrolled into left clone set
          if (carousel.scrollLeft < m.setWidth * 0.4) {
            isLooping = true;
            carousel.style.scrollBehavior = 'auto';
            carousel.scrollLeft += m.setWidth;
            carousel.style.scrollBehavior = '';
            isLooping = false;
          }
          // If scrolled into right clone set
          else if (carousel.scrollLeft > m.setWidth * 1.6) {
            isLooping = true;
            carousel.style.scrollBehavior = 'auto';
            carousel.scrollLeft -= m.setWidth;
            carousel.style.scrollBehavior = '';
            isLooping = false;
          }

          updateDots();
        }

        // Prev & Next Buttons (always enabled for infinite looping)
        if (prevBtn) {
          prevBtn.disabled = false;
          prevBtn.addEventListener('click', function () {
            var m = getMetrics();
            var scrollAmount = Math.max(m.cardStep * 2, carousel.clientWidth * 0.75);
            if (carousel.scrollLeft < m.setWidth * 0.5) {
              carousel.style.scrollBehavior = 'auto';
              carousel.scrollLeft += m.setWidth;
              carousel.style.scrollBehavior = '';
            }
            carousel.scrollBy({ left: -scrollAmount, behavior: reduceMotion ? 'auto' : 'smooth' });
          });
        }

        if (nextBtn) {
          nextBtn.disabled = false;
          nextBtn.addEventListener('click', function () {
            var m = getMetrics();
            var scrollAmount = Math.max(m.cardStep * 2, carousel.clientWidth * 0.75);
            if (carousel.scrollLeft > m.setWidth * 1.5) {
              carousel.style.scrollBehavior = 'auto';
              carousel.scrollLeft -= m.setWidth;
              carousel.style.scrollBehavior = '';
            }
            carousel.scrollBy({ left: scrollAmount, behavior: reduceMotion ? 'auto' : 'smooth' });
          });
        }

        // Drag to scroll
        var isDown = false;
        var startX = 0;
        var scrollLeftInit = 0;

        carousel.addEventListener('mousedown', function (e) {
          isDown = true;
          carousel.classList.add('is-dragging');
          startX = e.pageX - carousel.offsetLeft;
          scrollLeftInit = carousel.scrollLeft;
        });

        window.addEventListener('mouseup', function () {
          if (isDown) {
            isDown = false;
            carousel.classList.remove('is-dragging');
          }
        });

        carousel.addEventListener('mouseleave', function () {
          if (isDown) {
            isDown = false;
            carousel.classList.remove('is-dragging');
          }
        });

        carousel.addEventListener('mousemove', function (e) {
          if (!isDown) return;
          e.preventDefault();
          var x = e.pageX - carousel.offsetLeft;
          var walk = (x - startX) * 1.5;
          carousel.scrollLeft = scrollLeftInit - walk;
          checkInfiniteLoop();
        });

        // Mouse wheel horizontal scroll with seamless infinite wrapping
        carousel.addEventListener('wheel', function (e) {
          if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
            e.preventDefault();
            carousel.scrollLeft += e.deltaY * 1.2;
            checkInfiniteLoop();
          }
        }, { passive: false });

        carousel.addEventListener('scroll', checkInfiniteLoop, { passive: true });
        window.addEventListener('resize', function () {
          checkInfiniteLoop();
        }, { passive: true });

        // Initial alignment
        setTimeout(function () {
          var m = getMetrics();
          carousel.scrollLeft = m.setWidth;
          updateDots();
        }, 100);
      })();

      /* ---------------- scrubber / timecode ---------------- */
      var chapters = [
        { id: 'top', label: 'HERO' },
        { id: 'about', label: 'ABOUT' },
        { id: 'toolkit', label: 'TOOLKIT' },
        { id: 'credits', label: 'CREDITS' },
        { id: 'ads', label: 'ADS & REELS' },
        { id: 'reel', label: 'REEL' },
        { id: 'numbers', label: 'NUMBERS' },
        { id: 'contact', label: 'CONTACT' }
      ];
      var marksWrap = document.getElementById('scrubberMarks');
      var track = document.getElementById('scrubTrack');
      var fill = document.getElementById('scrubFill');
      var head = document.getElementById('scrubHead');
      var tcDisplay = document.getElementById('tcDisplay');
      var footTC = document.getElementById('footTC');
      var chapterName = document.getElementById('chapterName');
      var markEls = [];

      function docHeight() {
        return document.documentElement.scrollHeight - window.innerHeight;
      }

      function layoutMarks() {
        marksWrap.innerHTML = ''; markEls = [];
        var dh = docHeight();
        chapters.forEach(function (ch) {
          var el = document.getElementById(ch.id);
          if (!el) return;
          var top = el.getBoundingClientRect().top + window.scrollY;
          var pct = dh > 0 ? (top / dh) * 100 : 0;
          pct = Math.max(0, Math.min(100, pct));
          var m = document.createElement('div');
          m.className = 'mark'; m.textContent = ch.label;
          m.style.left = pct + '%';
          m.addEventListener('click', function () {
            smoothScrollTo(el, -65);
          });
          marksWrap.appendChild(m);
          markEls.push({ el: m, pct: pct, label: ch.label });
        });
      }

      function formatTC(totalSeconds) {
        var fps = 24;
        var h = Math.floor(totalSeconds / 3600);
        var m = Math.floor((totalSeconds % 3600) / 60);
        var s = Math.floor(totalSeconds % 60);
        var f = Math.floor((totalSeconds * fps) % fps);
        function p(n) { return (n < 10 ? '0' : '') + n; }
        return p(h) + ':' + p(m) + ':' + p(s) + ':' + p(f);
      }

      var TOTAL_DURATION = 300; // fictional 5:00 reel length

      function update() {
        var dh = docHeight();
        var pct = dh > 0 ? (window.scrollY / dh) * 100 : 0;
        pct = Math.max(0, Math.min(100, pct));
        fill.style.width = pct + '%';
        head.style.left = pct + '%';
        var tc = formatTC((pct / 100) * TOTAL_DURATION);
        tcDisplay.textContent = tc;
        footTC.textContent = tc;

        var current = 'HERO';
        markEls.forEach(function (mk) {
          if (pct + 0.5 >= mk.pct) { current = mk.label; mk.el.classList.add('active'); } else { mk.el.classList.remove('active'); }
        });
        chapterName.textContent = current;
      }

      track.addEventListener('click', function (e) {
        var r = track.getBoundingClientRect();
        var pct = (e.clientX - r.left) / r.width;
        smoothScrollTo(pct * docHeight(), 0);
      });

      window.addEventListener('scroll', update, { passive: true });
      if (lenis) { lenis.on('scroll', update); }
      window.addEventListener('resize', function () { layoutMarks(); update(); });
      layoutMarks(); update();
      setTimeout(function () { layoutMarks(); update(); }, 400);

      /* =====================================================
         PREMIUM UPGRADE — JS
         ===================================================== */

      /* ---- topbar glass ---- */
      var topbarEl = document.getElementById('topbar');
      if (topbarEl) {
        function updateTopbar() { topbarEl.classList.toggle('scrolled', window.scrollY > 55); }
        window.addEventListener('scroll', updateTopbar, { passive: true });
        if (lenis) { lenis.on('scroll', updateTopbar); }
        updateTopbar();
      }

      /* ---- hero h1 char split (white) ---- */
      var heroTitle = document.getElementById('heroTitle');
      if (heroTitle && !reduceMotion) {
        var _txt = heroTitle.textContent.trim();
        heroTitle.innerHTML = '';
        _txt.split('').forEach(function (ch, i) {
          var sp = document.createElement('span');
          sp.className = 'char';
          sp.textContent = ch === ' ' ? '\u00a0' : ch;
          sp.style.transitionDelay = (120 + i * 55) + 'ms';
          sp.style.color = '#f2efe9';
          sp.style.webkitTextFillColor = '#f2efe9';
          heroTitle.appendChild(sp);
        });
        setTimeout(function () { heroTitle.classList.add('chars-in'); }, 80);
      }

      /* ---- typewriter role text ---- */
      var roleEl = document.getElementById('heroRole');
      if (roleEl && !reduceMotion) {
        var _full = roleEl.textContent;
        roleEl.textContent = '';
        roleEl.style.opacity = '1';
        roleEl.style.transform = 'none';
        var _cur = document.createElement('span');
        _cur.className = 'typewriter-cursor';
        roleEl.appendChild(_cur);
        var _ci = 0;
        function twType() {
          if (_ci < _full.length) {
            roleEl.insertBefore(document.createTextNode(_full[_ci]), _cur);
            _ci++;
            setTimeout(twType, _ci < 28 ? 36 : 18);
          } else {
            setTimeout(function () { _cur.style.display = 'none'; }, 2400);
          }
        }
        setTimeout(twType, 920);
      }

      /* ---- floating available badge ---- */
      var _hp = document.getElementById('heroPhoto');
      if (_hp) {
        var _badge = document.createElement('div');
        _badge.className = 'available-badge';
        _badge.innerHTML = '<span class="ab-dot"></span>Available for Work';
        _hp.appendChild(_badge);
      }

      /* ---- chip random tilt ---- */
      document.querySelectorAll('.chip').forEach(function (c) {
        c.style.setProperty('--chip-rot', (Math.random() * 4 - 2).toFixed(1) + 'deg');
      });

      /* ---- 3D card tilt removed (no card backgrounds) ---- */


      /* ---- vitals stagger ---- */
      var _vitals = document.querySelector('.vitals');
      if (_vitals) {
        var ioVit = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) {
            if (en.isIntersecting) { _vitals.classList.add('reveal-done'); ioVit.disconnect(); }
          });
        }, { threshold: 0.2 });
        ioVit.observe(_vitals);
      }

      /* ---- stat counter roll-up ---- */
      function animateCounter(el) {
        var raw = el.textContent.trim();
        var m = raw.match(/^([^0-9]*)([0-9,]+)(.*)$/);
        if (!m) return;
        var pre = m[1], numS = m[2], suf = m[3];
        var target = parseInt(numS.replace(/,/g, ''), 10);
        var useComma = numS.indexOf(',') > -1;
        if (isNaN(target) || target <= 0) return;
        var t0 = null, dur = 1550;
        function step(ts) {
          if (!t0) t0 = ts;
          var p = Math.min((ts - t0) / dur, 1);
          var ease = 1 - Math.pow(1 - p, 3);
          var cur = Math.round(ease * target);
          el.textContent = pre + (useComma ? cur.toLocaleString() : cur) + suf;
          if (p < 1) requestAnimationFrame(step);
          else el.textContent = raw;
        }
        requestAnimationFrame(step);
      }
      var ioStat = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var s = en.target;
          s.classList.add('in-view');
          var num = s.querySelector('.num');
          if (num && !reduceMotion) setTimeout(function () { animateCounter(num); }, 220);
          ioStat.unobserve(s);
        });
      }, { threshold: 0.3 });
      document.querySelectorAll('.stat').forEach(function (s, i) {
        s.style.transitionDelay = (i * 95) + 'ms';
        ioStat.observe(s);
      });

      /* ---- multi-direction [data-reveal] ---- */
      var ioDir = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('in-view'); }
        });
      }, { threshold: 0.12 });
      document.querySelectorAll('[data-reveal]').forEach(function (el) { ioDir.observe(el); });

      /* ---- [data-stagger] groups ---- */
      var ioSg = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('in-view'); }
        });
      }, { threshold: 0.08 });
      document.querySelectorAll('[data-stagger]').forEach(function (el) { ioSg.observe(el); });

      /* ---- eyebrow shimmer reveal ---- */
      var ioEye = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('eye-in'); ioEye.unobserve(en.target); }
        });
      }, { threshold: 0.5 });
      document.querySelectorAll('.eyebrow').forEach(function (el) { ioEye.observe(el); });

      /* ---- headline reveal (safe — no clip, no display:none) ---- */
      if (!reduceMotion) {
        document.querySelectorAll('h2.headline').forEach(function (h) {
          // Only animate if NOT already visible from the .reveal.in-view system
          if (h.classList.contains('in-view')) return;
          h.style.opacity = '0';
          h.style.transform = 'translateY(28px)';
          var ioH = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
              if (en.isIntersecting) {
                en.target.style.opacity = '1';
                en.target.style.transform = 'translateY(0)';
                ioH.unobserve(en.target);
              }
            });
          }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });
          ioH.observe(h);
          // Immediate check — if already in viewport, reveal now
          var r = h.getBoundingClientRect();
          if (r.top < window.innerHeight - 20) {
            h.style.opacity = '1';
            h.style.transform = 'translateY(0)';
          }
        });
      }

    })();
