(function () {
  var hdr = document.getElementById('hdr');
  var burger = document.getElementById('burger');

  function onScroll() {
    if (window.scrollY > 30) hdr.classList.add('solid');
    else if (!hdr.dataset.sticky) hdr.classList.remove('solid');
  }
  if (hdr && !hdr.dataset.sticky) { onScroll(); window.addEventListener('scroll', onScroll, { passive: true }); }
  else if (hdr) hdr.classList.add('solid');

  if (burger) {
    burger.addEventListener('click', function () {
      var o = hdr.classList.toggle('open');
      burger.setAttribute('aria-expanded', o ? 'true' : 'false');
      if (o) hdr.classList.add('solid');
    });
    document.querySelectorAll('.nav a').forEach(function (a) {
      a.addEventListener('click', function () {
        hdr.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // reveal
  var rv = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
    rv.forEach(function (el) { io.observe(el); });
  } else {
    rv.forEach(function (el) { el.classList.add('in'); });
  }

  // filter
  var chips = document.querySelectorAll('.chip');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.card'));
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (c) { c.classList.remove('on'); });
      chip.classList.add('on');
      var f = chip.getAttribute('data-filter');
      cards.forEach(function (c) {
        var show = f === 'all' || c.getAttribute('data-cat') === f;
        c.style.display = show ? '' : 'none';
      });
    });
  });

  // floating wechat
  var fabPop = document.getElementById('fabPop');
  var fabWx = document.getElementById('fabWx');
  var mbarWx = document.getElementById('mbarWx');
  function togglePop(e) {
    if (e) e.stopPropagation();
    if (!fabPop) return;
    var on = fabPop.classList.toggle('on');
    if (fabWx) fabWx.setAttribute('aria-expanded', on ? 'true' : 'false');
  }
  if (fabWx) fabWx.addEventListener('click', togglePop);
  if (mbarWx) mbarWx.addEventListener('click', togglePop);
  document.addEventListener('click', function (e) {
    if (fabPop && fabPop.classList.contains('on') && !fabPop.contains(e.target)) fabPop.classList.remove('on');
  });

  // lightbox
  var lb = document.getElementById('lb');
  if (!lb) return;
  var lbImg = document.getElementById('lbImg');
  var lbCap = document.getElementById('lbCap');
  var cur = -1, list = [];
  var lbPushed = false;   // 是否已压入历史记录

  function visible() {
    return cards.filter(function (c) { return c.style.display !== 'none'; });
  }
  function show(i) {
    list = visible();
    if (!list.length) return;
    if (i < 0) i = list.length - 1;
    if (i >= list.length) i = 0;
    cur = i;
    var card = list[i];
    var img = card.querySelector('img');
    // 先用已缓存的缩略图铺底，避免大图下载期间黑屏
    var thumb = img.currentSrc || img.src;
    lb.style.backgroundImage = 'url("' + thumb + '")';
    lb.style.backgroundSize = 'contain';
    lb.style.backgroundPosition = 'center';
    lb.style.backgroundRepeat = 'no-repeat';
    lbImg.src = card.getAttribute('data-full') || img.src;
    lbImg.alt = img.alt || '';
    lbCap.textContent = (card.getAttribute('data-cap') || '') + '　·　点空白或返回关闭';
    lb.classList.add('on');
    document.body.style.overflow = 'hidden';
    lb.setAttribute('aria-hidden', 'false');
  }

  // 打开大图时压一条历史记录：手机/浏览器的「返回」变成关闭大图，而不是离开网站
  function pushLbState() {
    if (lbPushed) return;
    try {
      history.pushState({ lb: 1 }, '', location.href);
      lbPushed = true;
    } catch (e) { lbPushed = false; }
  }

  function close(fromPop) {
    lb.classList.remove('on');
    document.body.style.overflow = '';
    lbImg.removeAttribute('src');
    lb.style.backgroundImage = '';
    lb.setAttribute('aria-hidden', 'true');
    if (lbPushed && !fromPop) {
      lbPushed = false;
      history.back();   // 主动关闭时把那条历史记录退掉，保持返回键行为正常
      return;
    }
    lbPushed = false;
  }

  window.addEventListener('popstate', function () {
    if (lbPushed) close(true);
  });

  cards.forEach(function (card) {
    card.addEventListener('click', function (e) {
      e.preventDefault();
      show(visible().indexOf(card));
      pushLbState();
    });
  });
  document.getElementById('lbClose').addEventListener('click', function () { close(false); });
  document.getElementById('lbPrev').addEventListener('click', function (e) { e.stopPropagation(); show(cur - 1); });
  document.getElementById('lbNext').addEventListener('click', function (e) { e.stopPropagation(); show(cur + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) close(false); });
  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('on')) return;
    if (e.key === 'Escape') close(false);
    if (e.key === 'ArrowLeft') show(cur - 1);
    if (e.key === 'ArrowRight') show(cur + 1);
  });

  // swipe on mobile
  var sx = 0;
  lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1));
  }, { passive: true });
})();
