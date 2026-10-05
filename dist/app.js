(() => {
  const input=document.querySelector('#project-search');
  if(input){
    const buttons=[...document.querySelectorAll('[data-filter]')],cards=[...document.querySelectorAll('[data-project]')],reset=document.querySelector('#reset-filters');
    let filter='all';
    const params=new URLSearchParams(location.search);input.value=params.get('q')||'';
    if(buttons.some(b=>b.dataset.filter===params.get('filter')))filter=params.get('filter');
    function update(push=true){
      const q=input.value.trim().toLowerCase();let count=0;
      cards.forEach(c=>{const type=filter==='all'||(filter==='published'&&c.dataset.status==='Published')||(filter==='public'&&c.dataset.source==='Public source')||(filter==='private'&&c.dataset.source==='Private source');c.hidden=!(type&&c.dataset.search.includes(q));if(!c.hidden)count++;});
      buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===filter)));
      document.querySelector('#result-count').textContent=`${count} ${count===1?'project':'projects'}`;
      document.querySelector('.empty-state').hidden=!!count;reset.hidden=filter==='all'&&!q;
      if(push){const u=new URL(location.href);q?u.searchParams.set('q',input.value.trim()):u.searchParams.delete('q');filter==='all'?u.searchParams.delete('filter'):u.searchParams.set('filter',filter);history.replaceState(null,'',u);}
    }
    buttons.forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.filter;update();}));input.addEventListener('input',()=>update());
    function clear(){filter='all';input.value='';update();input.focus();}
    reset.addEventListener('click',clear);document.querySelector('#empty-reset').addEventListener('click',clear);update(false);
  }
  const dialog=document.querySelector('.lightbox');
  if(dialog){
    const thumbs=[...document.querySelectorAll('.gallery-open')],image=document.querySelector('#lightbox-image');let index=0,opener;
    function display(i){index=(i+thumbs.length)%thumbs.length;const thumb=thumbs[index].querySelector('img');image.src=thumb.src;image.alt=thumb.alt;document.querySelector('#lightbox-caption').textContent=thumbs[index].closest('figure').querySelector('figcaption').textContent;document.querySelector('#screen-counter').textContent=`${index+1} / ${thumbs.length}`;}
    thumbs.forEach((b,i)=>b.addEventListener('click',()=>{opener=b;display(i);dialog.showModal();document.body.classList.add('dialog-open');}));
    document.querySelector('.lightbox-close').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('close',()=>{document.body.classList.remove('dialog-open');opener?.focus();});
    dialog.addEventListener('click',ev=>{if(ev.target===dialog)dialog.close();});
    document.querySelector('#prev-screen').addEventListener('click',()=>display(index-1));document.querySelector('#next-screen').addEventListener('click',()=>display(index+1));
    dialog.addEventListener('keydown',ev=>{if(ev.key==='ArrowRight'){ev.preventDefault();display(index+1);}if(ev.key==='ArrowLeft'){ev.preventDefault();display(index-1);}});
  }
})();
