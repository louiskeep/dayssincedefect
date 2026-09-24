/* v5 main screen — cubicle layout preview.
   Keys out the flat cream background from each generated PNG (flood-fill from
   edges, so interior whites survive), then places the character + items. */

const LEVELS = [
  ["office-1-navy.png","The Coder",""],
  ["level-01.png","Button-down","+3 Dad Energy"],
  ["level-02.png","Slacks","+4 Business Casual"],
  ["level-03.png","Dress shoes","+5 Corner-Office Aura"],
  ["level-04.png","Blue-light glasses","+8 Alertness"],
  ["level-05.png","Company t-shirt","+6 Team Spirit"],
  ["level-06.png","Crossfit (buff)","+15 Gains"],
  ["level-07.png","Cyborg eyes","+12 Perception"],
  ["level-08.png","Suspicious backpack","-5 Sneak"],
  ["level-09.png","Robot arm","+30 Grip"],
  ["level-10.png","Wifi antenna","+10 Connectivity"],
  ["level-11.png","Company card","+30 Purchasing Power"],
  ["level-12.png","POWER SUIT","+100 Executive Presence"],
];

/* item slots calibrated to cubicle-1.png (front view; desk top ~y47%, floor y55-100%).
   [file, x%, y%(bottom anchor), width%, name]. First-pass placement, easy to tune. */
const ITEMS = [
  // floor furniture (behind / beside the character)
  ["item-01.png",42,86,15,"chair"],          // in front of desk
  ["item-08.png",9,72,10,"plant"],            // left corner
  ["item-07.png",12,60,12,"bookshelf"],       // left against wall
  ["item-02.png",20,64,15,"standing desk"],   // left side surface
  ["item-05.png",91,72,10,"filing cabinet"],  // right
  ["item-06.png",89,90,9,"mini fridge"],      // right foreground
  ["item-04.png",60,60,6,"tower"],            // under desk
  // desk-left surface small items (desk top ~y47-49%)
  ["item-11.png",35,47,7,"lamp"],
  ["item-20.png",33,49,4,"photo frame"],
  ["item-13.png",39,49,4,"stapler"],
  ["item-09.png",44,48,4,"mug"],
  ["item-15.png",48,48,3,"rubber duck"],
  ["item-17.png",51,47,5,"newton's cradle"],
  ["item-12.png",54,49,3,"sticky notes"],
  ["item-16.png",57,48,4,"bobblehead"],
  ["item-18.png",46,49,3,"stress ball"],
  ["item-19.png",41,49,3,"fidget cube"],
  // computer station (upgrades over the built-in CRT area) + coffee on the L-return
  ["item-03.png",70,45,12,"monitor"],
  ["item-10.png",67,52,11,"keyboard"],
  ["item-14.png",82,49,7,"coffee machine"],
  // wall decor (on the fabric panels)
  ["item-21.png",20,30,9,"cat poster"],
  ["item-22.png",45,29,15,"whiteboard"],
  ["item-23.png",59,18,6,"wall clock"],
  ["item-24.png",34,22,7,"plaque"],
];

const cache = {};
function keyed(file){
  if(cache[file]) return Promise.resolve(cache[file]);
  return new Promise(res=>{
    const img=new Image();
    img.onload=()=>{
      const scale=Math.min(1, 460/img.naturalWidth);
      const w=Math.round(img.naturalWidth*scale), h=Math.round(img.naturalHeight*scale);
      const cv=document.createElement("canvas"); cv.width=w; cv.height=h;
      const cx=cv.getContext("2d"); cx.drawImage(img,0,0,w,h);
      const im=cx.getImageData(0,0,w,h), p=im.data;
      const br=p[0],bg=p[1],bb=p[2], th=42;
      const near=i=>Math.abs(p[i]-br)<th&&Math.abs(p[i+1]-bg)<th&&Math.abs(p[i+2]-bb)<th;
      const stack=[]; const seen=new Uint8Array(w*h);
      for(let x=0;x<w;x++){ stack.push(x); stack.push((h-1)*w+x); }
      for(let y=0;y<h;y++){ stack.push(y*w); stack.push(y*w+w-1); }
      while(stack.length){
        const idx=stack.pop(); if(seen[idx]) continue; seen[idx]=1;
        const i=idx*4; if(!near(i)) continue; p[i+3]=0;
        const x=idx%w, y=(idx/w)|0;
        if(x>0)stack.push(idx-1); if(x<w-1)stack.push(idx+1);
        if(y>0)stack.push(idx-w); if(y<h-1)stack.push(idx+w);
      }
      cx.putImageData(im,0,0);
      cache[file]=cv.toDataURL(); res(cache[file]);
    };
    img.src="assets/"+file;
  });
}

const stage=document.getElementById("stage");
let heroEl=null;
async function renderHero(level){
  const [file,name,stat]=LEVELS[level];
  const url=await keyed(file);
  if(!heroEl){ heroEl=document.createElement("img"); heroEl.className="hero"; stage.appendChild(heroEl); }
  heroEl.src=url;
  heroEl.style.left="31%"; heroEl.style.top="99%"; heroEl.style.height="70%";
  document.getElementById("lv").textContent=level;
  document.getElementById("lvVal").textContent=level;
  document.getElementById("lvbar").style.width=(level/12*100)+"%";
  document.getElementById("lvnote").textContent=level? `${name} · ${stat}` : name;
  document.getElementById("tag").textContent=`Level ${level} · ${name}`;
}

async function renderItems(count){
  stage.querySelectorAll(".spr").forEach(e=>e.remove());
  document.getElementById("itemct").textContent=`${count}/24`;
  document.getElementById("itVal").textContent=count;
  for(let i=0;i<count;i++){
    const [file,x,y,w]=ITEMS[i];
    const url=await keyed(file);
    const el=document.createElement("img"); el.className="spr"; el.src=url;
    el.style.left=x+"%"; el.style.top=y+"%"; el.style.width=w+"%";
    // everything behind the hero, except foreground floor furniture (y>82)
    el.style.zIndex = (y>82) ? 6 : 2;
    stage.appendChild(el);
  }
}

async function boot(){
  await renderHero(3);
  await renderItems(8);
  document.getElementById("lvRange").addEventListener("input",e=>renderHero(+e.target.value));
  document.getElementById("itRange").addEventListener("input",e=>renderItems(+e.target.value));
  document.getElementById("allItems").addEventListener("click",()=>{ document.getElementById("itRange").value=24; renderItems(24); });
  document.getElementById("noItems").addEventListener("click",()=>{ document.getElementById("itRange").value=0; renderItems(0); });
}
document.addEventListener("DOMContentLoaded",boot);
