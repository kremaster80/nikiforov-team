(() => {
  const header = document.getElementById('siteHeader');
  const menu = document.getElementById('mainNav');
  const menuButton = document.getElementById('menuButton');
  const track = document.getElementById('goalTrack');
  const progress = document.getElementById('sliderProgress');

  const syncHeader = () => header?.classList.toggle('scrolled', scrollY > 24);
  syncHeader(); addEventListener('scroll', syncHeader, {passive:true});

  menuButton?.addEventListener('click', () => {
    const open = !menu.classList.contains('open');
    menu.classList.toggle('open', open); menuButton.classList.toggle('open', open); menuButton.setAttribute('aria-expanded', String(open));
  });
  menu?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { menu.classList.remove('open'); menuButton?.classList.remove('open'); menuButton?.setAttribute('aria-expanded','false'); }));

  const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { const delay = Number(entry.target.dataset.delay || 0); setTimeout(() => entry.target.classList.add('in'), delay); revealObserver.unobserve(entry.target); }
  }), {threshold:.12, rootMargin:'0px 0px -30px'});
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  document.querySelectorAll('.faq-list details').forEach(d => d.addEventListener('toggle', () => {
    if (!d.open) return; document.querySelectorAll('.faq-list details').forEach(o => { if (o !== d) o.open = false; });
  }));

  const cardStep = () => { const card = track?.querySelector('.goal-card'); if (!card) return 0; return card.getBoundingClientRect().width + 16; };
  document.querySelector('[data-slide="prev"]')?.addEventListener('click', () => track.scrollBy({left:-cardStep(),behavior:'smooth'}));
  document.querySelector('[data-slide="next"]')?.addEventListener('click', () => track.scrollBy({left:cardStep(),behavior:'smooth'}));
  const syncProgress = () => { if (!track || !progress) return; const max = track.scrollWidth - track.clientWidth; const pct = max ? track.scrollLeft/max : 0; progress.style.transform = `scaleX(${Math.max(.12,pct)})`; progress.style.width='100%'; };
  track?.addEventListener('scroll', syncProgress,{passive:true}); syncProgress();

  if (matchMedia('(pointer:fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const frame = document.querySelector('.hero-frame');
    frame?.addEventListener('pointermove', e => {
      const r=frame.getBoundingClientRect(), x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
      frame.querySelectorAll('.floating').forEach((el,i)=> el.style.transform=`translate(${x*(i+1)*6}px,${y*(i+1)*5}px)`);
    });
    frame?.addEventListener('pointerleave',()=>frame.querySelectorAll('.floating').forEach(el=>el.style.transform=''));
  }
})();
