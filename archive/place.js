/* Cubicle layout editor: drag/resize the character + 24 items on the empty
   cubicle, then Copy layout to get the coordinates for the game. */

const HERO = { file:"level-11.png", x:31, y:99, size:70, name:"CHARACTER", hero:true }; // size = height%
const ITEMS0 = [
  ["item-01.png",42,86,15,"chair"],["item-02.png",50,60,22,"standing desk"],
  ["item-03.png",50,42,12,"monitor"],["item-04.png",62,60,6,"tower"],
  ["item-05.png",88,72,10,"filing cabinet"],["item-06.png",88,90,9,"mini fridge"],
  ["item-07.png",12,60,12,"bookshelf"],["item-08.png",9,72,10,"plant"],
  ["item-09.png",44,55,4,"mug"],["item-10.png",50,58,11,"keyboard"],
  ["item-11.png",38,54,7,"lamp"],["item-12.png",56,56,3,"sticky notes"],
  ["item-13.png",41,56,4,"stapler"],["item-14.png",64,56,7,"coffee machine"],
  ["item-15.png",47,55,3,"rubber duck"],["item-16.png",59,55,4,"bobblehead"],
  ["item-17.png",53,54,5,"newton's cradle"],["item-18.png",45,56,3,"stress ball"],
  ["item-19.png",41,56,3,"fidget cube"],["item-20.png",35,56,4,"photo frame"],
  ["item-21.png",20,35,9,"cat poster"],["item-22.png",70,34,15,"whiteboard"],
  ["item-23.png",60,24,6,"wall clock"],["item-24.png",34,28,7,"plaque"],
];

const cache={};
function keyed(file){
  if(cache[file])return Promise.resolve(cache[file]);
  return new Promise(res=>{const img=new Image();img.onload=()=>{
    const s=Math.min(1,460/img.naturalWidth),w=Math.round(img.naturalWidth*s),h=Math.round(img.naturalHeight*s);
    const cv=document.createElement("canvas");cv.width=w;cv.height=h;const cx=cv.getContext("2d");cx.drawImage(img,0,0,w,h);
    const im=cx.getImageData(0,0,w,h),p=im.data,br=p[0],bg=p[1],bb=p[2],th=42;
    const near=i=>Math.abs(p[i]-br)<th&&Math.abs(p[i+1]-bg)<th&&Math.abs(p[i+2]-bb)<th;
    const st=[],seen=new Uint8Array(w*h);
    for(let x=0;x<w;x++){st.push(x);st.push((h-1)*w+x);}
    for(let y=0;y<h;y++){st.push(y*w);st.push(y*w+w-1);}
    while(st.length){const idx=st.pop();if(seen[idx])continue;seen[idx]=1;const i=idx*4;if(!near(i))continue;p[i+3]=0;
      const x=idx%w,y=(idx/w)|0;if(x>0)st.push(idx-1);if(x<w-1)st.push(idx+1);if(y>0)st.push(idx-w);if(y<h-1)st.push(idx+w);}
    cx.putImageData(im,0,0);cache[file]=cv.toDataURL();res(cache[file]);};img.src="assets/"+file;});
}

const stage=document.getElementById("stage");
let objs=[]; let sel=null;

function mk(o){
  const el=document.createElement("img"); el.className="obj"+(o.hero?" hero":"");
  el.dataset.name=o.name; o.el=el;
  place(o); stage.appendChild(el);
  keyed(o.file).then(u=>el.src=u);
  el.addEventListener("pointerdown",e=>{e.preventDefault();select(o);startDrag(o,e);});
  return o;
}
function place(o){
  o.el.style.left=o.x+"%"; o.el.style.top=o.y+"%";
  if(o.hero) o.el.style.height=o.size+"%"; else o.el.style.width=o.w+"%";
}
function select(o){
  sel=o; objs.forEach(x=>x.el.classList.toggle("on",x===o));
  document.getElementById("selName").textContent=o.name;
  document.getElementById("lbl").textContent=o.name+"  ("+o.x.toFixed(1)+", "+o.y.toFixed(1)+")";
}
function startDrag(o,e){
  o.el.setPointerCapture(e.pointerId); o.el.style.cursor="grabbing";
  const r=stage.getBoundingClientRect();
  const move=ev=>{
    o.x=Math.max(0,Math.min(100,(ev.clientX-r.left)/r.width*100));
    o.y=Math.max(0,Math.min(100,(ev.clientY-r.top)/r.height*100));
    place(o); document.getElementById("lbl").textContent=o.name+"  ("+o.x.toFixed(1)+", "+o.y.toFixed(1)+")";
    document.getElementById("xy").textContent=o.name+": x "+o.x.toFixed(1)+"%, y "+o.y.toFixed(1)+"%, "+(o.hero?"h "+o.size.toFixed(1):"w "+o.w.toFixed(1))+"%";
  };
  const up=ev=>{o.el.releasePointerCapture(e.pointerId);o.el.style.cursor="grab";
    o.el.removeEventListener("pointermove",move);o.el.removeEventListener("pointerup",up);dump();};
  o.el.addEventListener("pointermove",move); o.el.addEventListener("pointerup",up);
}
function resize(o,d){
  if(o.hero){o.size=Math.max(5,Math.min(120,o.size+d));} else {o.w=Math.max(1,Math.min(80,o.w+d));}
  place(o); dump();
  document.getElementById("xy").textContent=o.name+": "+(o.hero?"h "+o.size.toFixed(1):"w "+o.w.toFixed(1))+"%";
}
stage.addEventListener("wheel",e=>{ if(!sel)return; e.preventDefault(); resize(sel, e.deltaY<0?0.8:-0.8); },{passive:false});
window.addEventListener("keydown",e=>{ if(!sel)return;
  if(e.key==="="||e.key==="+")resize(sel,0.8); else if(e.key==="-"||e.key==="_")resize(sel,-0.8);});

function dump(){
  const rows=objs.filter(o=>!o.hero).map(o=>`  ["${o.file}",${o.x.toFixed(1)},${o.y.toFixed(1)},${o.w.toFixed(1)},"${o.name}"],`);
  const hero=objs.find(o=>o.hero);
  document.getElementById("out").value=
`// character: left ${hero.x.toFixed(1)}%, top ${hero.y.toFixed(1)}%, height ${hero.size.toFixed(1)}%
const ITEMS = [\n${rows.join("\n")}\n];`;
}

function boot(){
  objs=[mk({...HERO}), ...ITEMS0.map(([file,x,y,w,name])=>mk({file,x,y,w,name}))];
  select(objs[0]); dump();
  document.getElementById("copy").onclick=()=>{const t=document.getElementById("out");t.select();
    navigator.clipboard?.writeText(t.value); document.getElementById("copy").textContent="✓ Copied";
    setTimeout(()=>document.getElementById("copy").textContent="📋 Copy layout",1200);};
  document.getElementById("reset").onclick=()=>location.reload();
  document.getElementById("tidy").onclick=()=>{ // fan items out along the bottom to grab them
    let i=0; objs.filter(o=>!o.hero).forEach(o=>{ o.x=5+(i%12)*8; o.y=97-Math.floor(i/12)*0; o.w=Math.min(o.w,6); i++; place(o);}); dump();};
}
document.addEventListener("DOMContentLoaded",boot);
