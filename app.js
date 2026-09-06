const topbar=document.getElementById('topbar');
const burger=document.getElementById('burger');
const nav=document.getElementById('nav');
window.addEventListener('scroll',()=>topbar.classList.toggle('scrolled',scrollY>20),{passive:true});
burger?.addEventListener('click',()=>nav.classList.toggle('open'));
nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));
const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
