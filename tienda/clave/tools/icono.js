// genera el path de un engranaje centrado en 0,0
function gear(teeth, rOut, rIn, frac=0.5){
  let d="";const step=2*Math.PI/teeth;
  for(let i=0;i<teeth;i++){
    const a=i*step, w=step*frac/2, t=step*0.12;
    const pts=[[rIn,a-step/2+t],[rIn,a-w-t],[rOut,a-w+t*0.2],[rOut,a+w-t*0.2],[rIn,a+w+t],[rIn,a+step/2-t]];
    pts.forEach(([r,an],k)=>{d+=(i===0&&k===0?"M":"L")+(r*Math.cos(an)).toFixed(2)+","+(r*Math.sin(an)).toFixed(2);});
  }
  return d+"Z";
}
const g=gear(10,370,310,0.5);
const fg=(scale)=>`<g transform="translate(512 512) scale(${scale})">
 <defs>
  <linearGradient id="br" x1="0" y1="-1" x2="0" y2="1" gradientUnits="objectBoundingBox"><stop offset="0" stop-color="#FFE3A3"/><stop offset=".45" stop-color="#E7B04A"/><stop offset="1" stop-color="#9A6F1E"/></linearGradient>
  <radialGradient id="hub" r=".8"><stop offset="0" stop-color="#21414C"/><stop offset="1" stop-color="#0A1418"/></radialGradient>
 </defs>
 <path d="${g}" fill="#5E420A" transform="translate(0 18)"/>
 <path d="${g}" fill="url(#br)"/>
 <circle r="232" fill="url(#hub)" stroke="#5E420A" stroke-width="14"/>
 ${Array.from({length:24},(_,i)=>{const a=i*Math.PI/12;const r1=i%2?196:186,r2=214;return `<line x1="${(r1*Math.cos(a)).toFixed(1)}" y1="${(r1*Math.sin(a)).toFixed(1)}" x2="${(r2*Math.cos(a)).toFixed(1)}" y2="${(r2*Math.sin(a)).toFixed(1)}" stroke="#E7B04A" stroke-opacity="${i%2?.35:.75}" stroke-width="8" stroke-linecap="round"/>`}).join("")}
 <path d="M0 -112a62 62 0 0 1 34 114l26 112h-120l26 -112a62 62 0 0 1 34 -114z" fill="#FFD587"/>
 <circle cx="-150" cy="-150" r="0" />
 <circle cx="0" cy="-262" r="0"/>
</g>`;
const dots=(scale)=>`<g transform="translate(512 512) scale(${scale})">
 <circle cx="-118" cy="160" r="22" fill="#FF9A4D"/><circle cx="0" cy="182" r="0" fill="#45D4F0"/><circle cx="118" cy="160" r="22" fill="#FF6FB5"/>
</g>`;
const bg=`<defs><radialGradient id="bg" cx=".5" cy=".3" r=".9"><stop offset="0" stop-color="#25505D"/><stop offset=".6" stop-color="#132a32"/><stop offset="1" stop-color="#0B171B"/></radialGradient></defs><rect width="1024" height="1024" fill="url(#bg)"/>`;
const svg=(inner)=>`<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">${inner}</svg>`;
const fs=require('fs');
fs.writeFileSync('icon-only.svg',svg(bg+fg(1.0)));
fs.writeFileSync('icon-foreground.svg',svg(fg(0.72)));
fs.writeFileSync('icon-background.svg',svg(bg));
