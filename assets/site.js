// MJB Electrical Group — shared JS
(function(){
  var PHONE = '0449 506 223';
  var PHONE_TEL = '0449506223';

  // Nav scroll state + sticky pill reveal once past hero
  var nav = document.getElementById('nav');
  var sticky = document.querySelector('.sticky');
  var hero = document.querySelector('.hero');
  if(nav || sticky){
    var setState = function(){
      var y = window.scrollY;
      if(nav) nav.classList.toggle('scrolled', y > 50);
      if(sticky){
        var threshold = hero ? hero.offsetTop + hero.offsetHeight - 120 : window.innerHeight * 0.7;
        sticky.classList.toggle('show', y > threshold);
      }
    };
    setState();
    window.addEventListener('scroll', setState, { passive:true });
    window.addEventListener('resize', setState, { passive:true });
  }

  // Mobile drawer
  var tog = document.querySelector('.mob-tog');
  var drawer = document.querySelector('.mdrawer');
  if(tog && drawer){
    var closeDrawer = function(){
      tog.classList.remove('open');
      tog.setAttribute('aria-expanded','false');
      drawer.classList.remove('open');
      document.body.style.overflow = '';
    };
    var openDrawer = function(){
      tog.classList.add('open');
      tog.setAttribute('aria-expanded','true');
      drawer.classList.add('open');
      document.body.style.overflow = 'hidden';
    };
    tog.addEventListener('click', function(){
      if(drawer.classList.contains('open')) closeDrawer(); else openDrawer();
    });
    var closeBtn = drawer.querySelector('.mdrawer-close');
    if(closeBtn) closeBtn.addEventListener('click', closeDrawer);
    document.addEventListener('keydown', function(ev){
      if(ev.key === 'Escape' && drawer.classList.contains('open')) closeDrawer();
    });
    drawer.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', closeDrawer);
    });
  }

  // Fade-in
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(x){ if(x.isIntersecting){ x.target.classList.add('vis'); io.unobserve(x.target); }});
    }, { threshold:0.1, rootMargin:'0px 0px -30px 0px' });
    document.querySelectorAll('.fade').forEach(function(el){ io.observe(el); });
  } else {
    document.querySelectorAll('.fade').forEach(function(el){ el.classList.add('vis'); });
  }

  // Smooth-scroll for in-page links
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener('click', function(ev){
      var hash = a.getAttribute('href');
      if(hash.length <= 1) return;
      var t = document.querySelector(hash);
      if(t){ ev.preventDefault(); t.scrollIntoView({ behavior:'smooth', block:'start' }); }
    });
  });

  // Quote form (multi-step)
  document.querySelectorAll('.qform').forEach(function(qform){
    var cs = 1, fd = {};
    var slides = qform.querySelectorAll('.fslide');
    var steps = qform.querySelectorAll('.fstep');
    if(!slides.length) return;
    var maxStep = slides.length - 1; // last slide is the success screen

    var upd = function(){
      slides.forEach(function(s){ s.classList.remove('active'); });
      var slide = qform.querySelector('.fslide[data-s="'+cs+'"]');
      if(slide) slide.classList.add('active');
      steps.forEach(function(s,i){
        s.classList.remove('active','done');
        if(i+1 === cs) s.classList.add('active');
        if(i+1 < cs) s.classList.add('done');
      });
    };

    qform.querySelectorAll('.ob').forEach(function(b){
      b.addEventListener('click', function(){
        var grp = b.closest('.og');
        grp.querySelectorAll('.ob').forEach(function(x){ x.classList.remove('sel'); });
        b.classList.add('sel');
        var slide = b.closest('.fslide');
        var key = slide.dataset.field || ('Question ' + slide.dataset.s);
        fd[key] = b.dataset.v;
        // Let a nominated field drive the email subject context
        var ctxFrom = qform.dataset.contextFrom;
        if(ctxFrom && key === ctxFrom) qform.dataset.context = b.dataset.v;
        setTimeout(function(){ if(cs < maxStep){ cs++; upd(); } }, 350);
      });
    });

    var showSuccess = function(){
      cs = maxStep + 1;
      slides.forEach(function(s){ s.classList.remove('active'); });
      var done = qform.querySelector('.fslide[data-s="'+cs+'"]');
      if(done) done.classList.add('active');
      steps.forEach(function(s){ s.classList.remove('active'); s.classList.add('done'); });
    };

    var showError = function(msg){
      var errSlot = qform.querySelector('.qform-error');
      if(!errSlot){
        errSlot = document.createElement('div');
        errSlot.className = 'qform-error';
        errSlot.style.cssText = 'margin-top:12px;padding:12px 14px;background:#fef2f2;border:1px solid #fecaca;border-left:3px solid #b10707;color:#8c0505;font-size:.85rem;border-radius:8px;line-height:1.5';
        var contactSlide = qform.querySelector('.fslide[data-s="'+maxStep+'"]');
        if(contactSlide) contactSlide.appendChild(errSlot);
      }
      errSlot.innerHTML = msg;
    };

    var submitBtn = function(){ return qform.querySelector('.fn[data-action="submit"]'); };

    var sendQuote = function(cb){
      var inputs = qform.querySelectorAll('.fslide[data-s="'+cs+'"] .finp');
      var required = qform.querySelectorAll('.fslide[data-s="'+cs+'"] .finp:not([data-optional])');
      var missing = [];
      required.forEach(function(i){ if(!i.value.trim()) missing.push(i.placeholder || i.name); });
      if(missing.length){ alert('Please fill: ' + missing.join(', ')); cb(false); return; }
      inputs.forEach(function(i){
        if(i.value.trim()) fd[i.placeholder || i.name || i.id] = i.value.trim();
      });

      var ctx = qform.dataset.context || 'Quote Request';
      var to = qform.dataset.to || '';

      var userEmail = '';
      Object.keys(fd).forEach(function(k){ if(/email/i.test(k) && !userEmail) userEmail = fd[k]; });

      // Honeypot — silently "succeed" for bots
      var hp = qform.querySelector('input[name="_honey"]');
      if(hp && hp.value){ cb(true); return; }

      var userName = '';
      Object.keys(fd).forEach(function(k){ if(/name/i.test(k) && !userName) userName = fd[k]; });

      var subject = 'Website enquiry'
        + (userName ? ' — ' + userName : '')
        + ' — ' + ctx;

      // Customer contact details first, qualifying answers after.
      var customerRx = /name|phone|mobile|email|suburb|postcode|address/i;
      var customerOrder = ['name','phone','mobile','email','suburb','postcode','address'];
      var customer = {}, other = {};
      Object.keys(fd).forEach(function(k){
        if(customerRx.test(k)) customer[k] = fd[k]; else other[k] = fd[k];
      });
      var customerSorted = {};
      customerOrder.forEach(function(want){
        Object.keys(customer).forEach(function(k){
          if(new RegExp(want,'i').test(k) && !(k in customerSorted)) customerSorted[k] = customer[k];
        });
      });
      Object.keys(customer).forEach(function(k){
        if(!(k in customerSorted)) customerSorted[k] = customer[k];
      });

      var accessKey = qform.dataset.accessKey || '';
      if(!accessKey){
        // No form endpoint configured yet — fail loudly rather than dropping leads.
        showError('This form isn\'t connected yet. Please call <a href="tel:'+PHONE_TEL+'" style="color:#b10707;font-weight:700">'+PHONE+'</a>.');
        cb(false);
        return;
      }

      var payload = {
        access_key: accessKey,
        subject: subject,
        replyto: userEmail || '',
        email: userEmail || ''
      };
      if(to) payload.to = to;
      Object.keys(customerSorted).forEach(function(k){ payload[k] = customerSorted[k]; });
      payload['Service'] = ctx;
      payload['Source Page'] = window.location.href;
      Object.keys(other).forEach(function(k){ payload[k] = other[k]; });

      var btn = submitBtn();
      var origText = btn ? btn.textContent : '';
      if(btn){ btn.disabled = true; btn.textContent = 'Sending…'; btn.style.opacity = '.7'; }

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(function(r){ return r.json().catch(function(){ return {}; }).then(function(j){ return { ok:r.ok, j:j }; }); })
      .then(function(res){
        if(btn){ btn.disabled = false; btn.textContent = origText; btn.style.opacity = ''; }
        if(res.ok && res.j && (res.j.success === true || res.j.success === 'true' || /success/i.test(res.j.message||''))){
          cb(true);
        } else {
          showError('Sorry, we couldn\'t send that automatically. Please call <a href="tel:'+PHONE_TEL+'" style="color:#b10707;font-weight:700">'+PHONE+'</a>.');
          cb(false);
        }
      })
      .catch(function(){
        if(btn){ btn.disabled = false; btn.textContent = origText; btn.style.opacity = ''; }
        showError('Network issue. Please call <a href="tel:'+PHONE_TEL+'" style="color:#b10707;font-weight:700">'+PHONE+'</a>.');
        cb(false);
      });
    };

    qform.querySelectorAll('.fn').forEach(function(btn){
      btn.addEventListener('click', function(){
        if(btn.dataset.action === 'submit'){
          sendQuote(function(success){ if(success) showSuccess(); });
          return;
        }
        if(cs >= maxStep) return;
        var sel = qform.querySelector('.fslide[data-s="'+cs+'"] .ob.sel');
        if(!sel) return;
        cs++; upd();
      });
    });
    qform.querySelectorAll('.fb').forEach(function(b){
      b.addEventListener('click', function(){ if(cs <= 1) return; cs--; upd(); });
    });
  });
})();
