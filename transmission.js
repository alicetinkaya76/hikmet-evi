(() => {
  'use strict';
  const data = window.TRANSMISSION_DATA;
  if (!data) return;
  const profiles = new Map(data.profiles.map(profile => [profile.id, profile]));
  const select = document.getElementById('translator-select');
  const map = document.getElementById('transmission-map');
  const layer = document.getElementById('map-active');
  const stops = document.getElementById('map-stops');
  const section = document.getElementById('ceviri-haritasi');
  const ns = 'http://www.w3.org/2000/svg';
  const width = 1000, height = 620;
  let current, zoom = 1, view = {x:0,y:0,w:width,h:height}, drag = null;
  const project = place => ({x:(place.lon+15)*1000/65,y:(60-place.lat)*1000/(65*Math.cos(35*Math.PI/180))});
  const el = (name, attrs, content) => {
    const node = document.createElementNS(ns,name);
    Object.entries(attrs).forEach(([key,value]) => node.setAttribute(key,String(value)));
    if (content !== undefined) node.textContent = content;
    return node;
  };
  const clampView = () => {
    view.x = Math.max(0,Math.min(width-view.w,view.x));
    view.y = Math.max(0,Math.min(height-view.h,view.y));
  };
  const render = () => {
    if (!current) return;
    const ratio = view.w / Math.max(map.getBoundingClientRect().width,280);
    layer.replaceChildren();
    current.connections.forEach(edge => {
      const a = project(data.places[edge.from]), b = project(data.places[edge.to]);
      const dx=b.x-a.x,dy=b.y-a.y;
      const path=el('path',{d:`M${a.x},${a.y} Q${(a.x+b.x)/2-dy*.14},${(a.y+b.y)/2+dx*.14} ${b.x},${b.y}`,class:'map-link','vector-effect':'non-scaling-stroke'});
      path.appendChild(el('title',{},edge.label));
      layer.appendChild(path);
    });
    current.points.forEach((point,index) => {
      const place=data.places[point.place], p=project(place);
      const group=el('g',{});
      if (point.role==='approx') group.appendChild(el('circle',{cx:p.x,cy:p.y,r:19*ratio,class:'map-point approx','vector-effect':'non-scaling-stroke'}));
      group.appendChild(el('circle',{cx:p.x,cy:p.y,r:6*ratio,class:'map-point '+point.role,'vector-effect':'non-scaling-stroke'}));
      const anchor = place.anchor || (p.x>850?'end':'start');
      const offset = anchor==='end'?-12:12;
      const label=el('text',{x:p.x+offset*ratio,y:p.y+(place.labelDy||-11)*ratio,'font-size':14*ratio,'text-anchor':anchor,class:'map-label'},place.name);
      group.appendChild(label);
      group.appendChild(el('title',{},`${index+1}. ${place.name}: ${point.note}`));
      layer.appendChild(group);
    });
    map.setAttribute('viewBox',`${view.x} ${view.y} ${view.w} ${view.h}`);
    map.classList.toggle('is-zoomed',zoom>1);
    document.getElementById('map-zoom-status').textContent=`${Math.round(zoom*100)}%`;
    document.getElementById('map-zoom-out').disabled=zoom<=1;
    document.getElementById('map-zoom-in').disabled=zoom>=3.375;
  };
  const setZoom = value => {
    const oldCentre={x:view.x+view.w/2,y:view.y+view.h/2};
    if (zoom===1 && value>1) {
      const positions=current.points.map(point=>project(data.places[point.place]));
      oldCentre.x=(Math.min(...positions.map(p=>p.x))+Math.max(...positions.map(p=>p.x)))/2;
      oldCentre.y=(Math.min(...positions.map(p=>p.y))+Math.max(...positions.map(p=>p.y)))/2;
    }
    zoom=Math.max(1,Math.min(3.375,value));
    view={x:oldCentre.x-width/zoom/2,y:oldCentre.y-height/zoom/2,w:width/zoom,h:height/zoom};
    clampView();render();
  };
  const choose = (id, scroll=false) => {
    current=profiles.get(id)||data.profiles[0];
    select.value=current.id;
    document.querySelectorAll('.translator-profile').forEach(profile=>{profile.hidden=profile.id!==current.id;});
    document.getElementById('network-title').textContent=current.name;
    document.getElementById('network-subtitle').textContent=current.mapSummary;
    const readingNote=document.getElementById('profile-reading-note');
    readingNote.textContent=current.readingNote;
    (current.readingLinks||[]).forEach(readingLink=>{
      const link=document.createElement('a');
      link.href=readingLink.url;link.textContent=readingLink.label+' ↗';
      readingNote.append(document.createElement('br'),link);
    });
    document.getElementById('map-description').textContent=current.mapSummary+' '+current.points.map(p=>data.places[p.place].name+': '+p.note).join(' ');
    stops.replaceChildren();
    current.points.forEach(point=>{
      const item=document.createElement('li');
      const title=document.createElement('strong'); title.textContent=data.places[point.place].name;
      const note=document.createElement('span');note.textContent=point.note;
      item.append(title,note);stops.appendChild(item);
    });
    zoom=1;view={x:0,y:0,w:width,h:height};render();
    document.title=current.name+' · Çevirmenler ve bilginin yolları | Hikmet Evi';
    if(scroll) section.scrollIntoView({block:'start'});
  };
  select.disabled=false;
  select.addEventListener('change',()=>{
    if(location.hash==='#'+select.value) choose(select.value,true);
    else location.hash=select.value;
  });
  const followHash = (scroll=false) => {
    const id=location.hash.slice(1);
    if(id==='adelard-terimleri'){
      choose('adelard');
      document.title='Adelard’ın Arapça terimleri | Hikmet Evi';
      if(scroll)document.getElementById(id)?.scrollIntoView({block:'start'});
    }else if(profiles.has(id))choose(id,scroll);
    else{
      if(!current)choose('adelard');
      if(id==='yasaklar')document.title='Astroloji ve Paris kararları | Hikmet Evi';
      if(scroll)document.getElementById(id)?.scrollIntoView({block:'start'});
    }
  };
  window.addEventListener('hashchange',()=>followHash(true));
  document.getElementById('map-zoom-in').addEventListener('click',()=>setZoom(zoom*1.5));
  document.getElementById('map-zoom-out').addEventListener('click',()=>setZoom(zoom/1.5));
  document.getElementById('map-reset').addEventListener('click',()=>setZoom(1));
  map.addEventListener('pointerdown',event=>{
    if(zoom<=1 || event.button!==0)return;
    drag={id:event.pointerId,x:event.clientX,y:event.clientY,startX:view.x,startY:view.y};
    map.setPointerCapture(event.pointerId);event.preventDefault();
  });
  map.addEventListener('pointermove',event=>{
    if(!drag||event.pointerId!==drag.id)return;
    const bounds=map.getBoundingClientRect();
    view.x=drag.startX-(event.clientX-drag.x)*view.w/bounds.width;
    view.y=drag.startY-(event.clientY-drag.y)*view.h/bounds.height;
    clampView();render();
  });
  const stopDrag=()=>{drag=null;};
  map.addEventListener('pointerup',stopDrag);map.addEventListener('pointercancel',stopDrag);
  map.addEventListener('keydown',event=>{
    if(event.key==='+'||event.key==='='){event.preventDefault();setZoom(zoom*1.5);}
    else if(event.key==='-'){event.preventDefault();setZoom(zoom/1.5);}
    else if(event.key==='Home'){event.preventDefault();setZoom(1);}
    else if(zoom>1&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){
      event.preventDefault();
      if(event.key==='ArrowLeft')view.x-=view.w*.12;
      if(event.key==='ArrowRight')view.x+=view.w*.12;
      if(event.key==='ArrowUp')view.y-=view.h*.12;
      if(event.key==='ArrowDown')view.y+=view.h*.12;
      clampView();render();
    }
  });
  document.body.classList.add('transmission-enhanced');
  followHash();
  // Initial fragment scrolling can run after deferred scripts and hide the map's reading links.
  window.addEventListener('pageshow',()=>{
    if(location.hash)requestAnimationFrame(()=>followHash(true));
  });
  if(window.ResizeObserver)new ResizeObserver(render).observe(map);
  else window.addEventListener('resize',render);
})();
