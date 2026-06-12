'use strict';
/**
 * bodygraph.js v16
 * module.exports = { generateBodygraph }
 */

const PC = {
  bg:'#FAF4F1', cD:'#90734B', cU:'#EEE3D4', str:'#BEA582',
  chP:'#30302E', chR:'#A62121',
  gG:'#EDD5A0', gGT:'#7A5020', gGS:'#C8A060',
  gW:'#FFFFFF',  gWT:'#A08060', gWS:'#C8B090',
  bS:'#D4C0A0',
};
const ZOD_COL = '#C8A060';
const T_J34 = 0.308;
const W = 900, H = 1010, CX = 450;

const THICK_P = new Set(['Moon','Mars','Venus']);
const MED_P   = new Set(['Sun','Earth','NorthNode','SouthNode','Mercury','Neptune']);

const PS = {
  Sun:'☉', Earth:'⊕', NorthNode:'☊', 'North Node':'☊',
  SouthNode:'☋', 'South Node':'☋', Moon:'☽', Mercury:'☿',
  Venus:'♀', Mars:'♂', Jupiter:'♃', Saturn:'♄',
  Uranus:'♅', Neptune:'♆', Pluto:'♇',
};

const SC = {
  Head:        {x:450,y:57,  shape:'tri-up',    s:52},
  Ajna:        {x:450,y:168, shape:'tri-down',  s:70},
  Throat:      {x:450,y:350, shape:'hex',       s:80},
  G:           {x:450,y:520, shape:'diamond',   dw:154,dh:134},
  Ego:         {x:556,y:568, shape:'circle',    r:34},
  SolarPlexus: {x:685,y:705, shape:'tri-left',  s:72},
  Sacral:      {x:450,y:713, shape:'circle',    r:76},
  Spleen:      {x:215,y:700, shape:'tri-right', s:72},
  Root:        {x:450,y:882, shape:'rect',      w:130,h:130,rx:14},
};

const GO = {
  Head:{61:[0,15],63:[25,16],64:[-25,16]},
  Ajna:{4:[25,-25],11:[27,4],17:[-27,4],24:[0,-25],43:[0,45],47:[-25,-25]},
  Throat:{8:[0,54],12:[53,0],16:[-53,-29],20:[-53,24],23:[0,-54],31:[-27,44],33:[27,44],35:[53,-29],45:[48,27],56:[27,-44],62:[-27,-44]},
  G:{1:[0,-39],2:[0,42],7:[-27,-19],10:[-49,0],13:[27,-19],15:[-26,23],25:[49,2],46:[25,22]},
  Ego:{21:[10,-14],26:[-11,13],40:[11,13],51:[-12,-11]},
  Sacral:{3:[0,57],5:[-25,-49],9:[26,51],14:[0,-56],27:[-55,15],29:[25,-51],34:[-47,-29],42:[-26,51],59:[57,15]},
  Root:{19:[46,-19],38:[-46,9],39:[45,8],41:[46,39],52:[26,-47],53:[-26,-47],54:[-46,-19],58:[-46,38],60:[0,-47]},
  Spleen:{18:[-22,39],28:[0,22],32:[26,12],44:[27,-13],48:[-21,-42],50:[54,0],57:[3,-27]},
  SolarPlexus:{6:[-54,0],22:[-3,-27],30:[21,37],36:[22,-40],37:[-26,-13],49:[-25,11],55:[-1,23]},
};

const STD_CH = [
  'Ajna:47|Head:64','Ajna:24|Head:61','Ajna:4|Head:63',
  'Ajna:17|Throat:62','Ajna:11|Throat:56','Ajna:43|Throat:23',
  'G:7|Throat:31','G:1|Throat:8','G:13|Throat:33',
  'Ego:21|Throat:45','SolarPlexus:22|Throat:12','SolarPlexus:36|Throat:35',
  'Spleen:48|Throat:16',
  'Ego:40|SolarPlexus:37','Ego:51|G:25',
  'G:15|Sacral:5','G:2|Sacral:14','G:46|Sacral:29',
  'Ego:26|Spleen:44',
  'Sacral:59|SolarPlexus:6','Sacral:27|Spleen:50',
  'Root:53|Sacral:42','Root:60|Sacral:3','Root:52|Sacral:9',
  'Root:19|SolarPlexus:49','Root:39|SolarPlexus:55','Root:41|SolarPlexus:30',
  'Root:58|Spleen:18','Root:38|Spleen:28','Root:54|Spleen:32',
];

const posMap = {ex:'▲',fall:'▼',jux:'✶'};
const posCol = {ex:'#D97706',fall:'#9CA3AF',jux:'#7C3AED'};
const PW = 108;

function norm(dx,dy){const l=Math.hypot(dx,dy);return l>0?[dx/l,dy/l]:[0,0];}

function roundedPoly(pts,r){
  const n=pts.length;let d='';
  for(let i=0;i<n;i++){
    const cur=pts[i],prev=pts[(i+n-1)%n],next=pts[(i+1)%n];
    const tp=norm(prev[0]-cur[0],prev[1]-cur[1]);
    const tn=norm(next[0]-cur[0],next[1]-cur[1]);
    const p1=[cur[0]+tp[0]*r,cur[1]+tp[1]*r];
    const p2=[cur[0]+tn[0]*r,cur[1]+tn[1]*r];
    d+=(i===0?'M':'L')+p1[0].toFixed(1)+','+p1[1].toFixed(1);
    d+=' Q'+cur[0].toFixed(1)+','+cur[1].toFixed(1)+' '+p2[0].toFixed(1)+','+p2[1].toFixed(1);
  }
  return d+'Z';
}

function centerPath(c,x,y){
  const r=12;
  switch(c.shape){
    case 'tri-up':    return roundedPoly([[x,y-c.s*1.15],[x-c.s,y+c.s*0.58],[x+c.s,y+c.s*0.58]],r);
    case 'tri-down':  return roundedPoly([[x-c.s,y-c.s*0.58],[x+c.s,y-c.s*0.58],[x,y+c.s*1.15]],r);
    case 'tri-left':  return roundedPoly([[x-c.s*1.15,y],[x+c.s*0.58,y-c.s],[x+c.s*0.58,y+c.s]],r);
    case 'tri-right': return roundedPoly([[x+c.s*1.15,y],[x-c.s*0.58,y-c.s],[x-c.s*0.58,y+c.s]],r);
    case 'hex':{const pts=Array.from({length:6},function(_,i){const a=Math.PI/6+i*Math.PI/3;return[x+c.s*Math.cos(a),y+c.s*Math.sin(a)];});return roundedPoly(pts,9);}
    case 'diamond':{const hw=c.dw/2,hh=c.dh/2;return roundedPoly([[x,y-hh],[x+hw,y],[x,y+hh],[x-hw,y]],14);}
    default:return null;
  }
}

function gXY(cn,g){const c=SC[cn],o=(GO[cn]||{})[g]||[0,0];return[c.x+o[0],c.y+o[1]];}

function chanPerp(dx,dy,off){
  const len=Math.hypot(dx,dy);if(len<1)return[[0,0],[0,0]];
  const p1x=-dy/len*off,p1y=dx/len*off,p2x=dy/len*off,p2y=-dx/len*off;
  const r1=(p1y>p2y+0.001)||(Math.abs(p1y-p2y)<=0.001&&p1x>=p2x);
  return r1?[[p1x,p1y],[p2x,p2y]]:[[p2x,p2y],[p1x,p1y]];
}

function drawChanLine(x1,y1,x2,y2,gA,gB,pG,dG){
  const dx=x2-x1,dy=y2-y1,len=Math.hypot(dx,dy);if(len<1)return'';
  const sw=4.5,OFF=sw/2;
  const perp=chanPerp(dx,dy,OFF);
  const rx=perp[0][0],ry=perp[0][1],dpx=perp[1][0],dpy=perp[1][1];
  const pAct=pG.has(gA)||pG.has(gB),dAct=dG.has(gA)||dG.has(gB);
  const po=pAct?0.90:0.07,dop=dAct?0.90:0.07;
  const f=function(v){return v.toFixed(1);};
  return '<line x1="'+f(x1+dpx)+'" y1="'+f(y1+dpy)+'" x2="'+f(x2+dpx)+'" y2="'+f(y2+dpy)+'" stroke="'+PC.chP+'" stroke-width="'+sw+'" stroke-linecap="round" opacity="'+po+'"/>'+
         '<line x1="'+f(x1+rx)+'" y1="'+f(y1+ry)+'" x2="'+f(x2+rx)+'" y2="'+f(y2+ry)+'" stroke="'+PC.chR+'" stroke-width="'+sw+'" stroke-linecap="round" opacity="'+dop+'"/>';
}

function lineIntersect(x1,y1,x2,y2,x3,y3,x4,y4){
  const d=(x1-x2)*(y3-y4)-(y1-y2)*(x3-x4);
  if(Math.abs(d)<0.001)return null;
  const t=((x1-x3)*(y3-y4)-(y1-y3)*(x3-x4))/d;
  return[x1+t*(x2-x1),y1+t*(y2-y1)];
}

function drawIntCh(pG,dG){
  const p1=gXY('Spleen',57),p2=gXY('Throat',20);
  return drawChanLine(p1[0],p1[1],p2[0],p2[1],57,20,pG,dG);
}

function drawIntSpine(pG,dG){
  const g20=gXY('Throat',20),g57=gXY('Spleen',57);
  const g10=gXY('G',10),g34=gXY('Sacral',34);
  const g20x=g20[0],g20y=g20[1],g57x=g57[0],g57y=g57[1];
  const g10x=g10[0],g10y=g10[1],g34x=g34[0],g34y=g34[1];
  const ddy=g20y-g57y;if(Math.abs(ddy)<1)return'';
  const T10=Math.max(0.01,Math.min(0.99,(g10y-g57y)/ddy));
  const j10x=g57x+T10*(g20x-g57x);
  const j34x=g57x+T_J34*(g20x-g57x),j34y=g57y+T_J34*ddy;
  const sw=4.5,OFF=sw/2;
  const cLen=Math.hypot(g20x-g57x,ddy)||1;
  const cnx=(g20x-g57x)/cLen,cny=ddy/cLen;
  const cx1=g57x-cnx*300,cy1=g57y-cny*300,cx2=g20x+cnx*300,cy2=g20y+cny*300;
  function stub(sx,sy,ex,ey,gA,gB){
    const sdx=ex-sx,sdy=ey-sy;if(Math.hypot(sdx,sdy)<1)return'';
    const perp=chanPerp(sdx,sdy,OFF);
    const rx=perp[0][0],ry=perp[0][1],dpx=perp[1][0],dpy=perp[1][1];
    const pAct=pG.has(gA)||pG.has(gB),dAct=dG.has(gA)||dG.has(gB);
    const po=pAct?0.90:0.07,dop=dAct?0.90:0.07;
    const bEnd=lineIntersect(sx+dpx,sy+dpy,sx+dpx+sdx,sy+dpy+sdy,cx1,cy1,cx2,cy2)||[ex+dpx,ey+dpy];
    const rEnd=lineIntersect(sx+rx,sy+ry,sx+rx+sdx,sy+ry+sdy,cx1,cy1,cx2,cy2)||[ex+rx,ey+ry];
    const f=function(v){return v.toFixed(1);};
    return '<line x1="'+f(sx+dpx)+'" y1="'+f(sy+dpy)+'" x2="'+f(bEnd[0])+'" y2="'+f(bEnd[1])+'" stroke="'+PC.chP+'" stroke-width="'+sw+'" stroke-linecap="round" opacity="'+dop+'"/>'+
           '<line x1="'+f(sx+rx)+'" y1="'+f(sy+ry)+'" x2="'+f(rEnd[0])+'" y2="'+f(rEnd[1])+'" stroke="'+PC.chR+'" stroke-width="'+sw+'" stroke-linecap="round" opacity="'+po+'"/>';
  }
  return stub(g10x,g10y,j10x,g10y,10,20)+stub(g34x,g34y,j34x,j34y,34,10);
}

function symAttrs(planet,col){
  if(THICK_P.has(planet))return' stroke="'+col+'" stroke-width="1.2" paint-order="stroke"';
  if(MED_P.has(planet))  return' stroke="'+col+'" stroke-width="0.75" paint-order="stroke"';
  return'';
}

function drawPlanetPanel(acts,isDes,px){
  if(!acts||!acts.length)return'';
  const col=isDes?PC.chR:PC.chP;
  const rH=54,hH=58,pH=acts.length*rH+hH-10;
  var r='<rect x="'+px+'" y="44" width="'+PW+'" height="'+pH+'" rx="8" fill="#FFF" opacity="0.45"/>';
  r+='<text x="'+(px+PW/2)+'" y="40" text-anchor="middle" font-family="Arial" font-size="15" font-weight="bold" fill="'+col+'">'+(isDes?'Design':'Personality')+'</text>';
  acts.forEach(function(a,i){
    const yt=hH+i*rH,yg=yt+22,yc=yt+37;
    const sym=PS[a.planet]||'?',fsym=a.planet==='Sun'?28:23;
    const gl=String(a.gate||''),ln=String(a.line||'');
    const ctb=a.ctb||'',zod=a.zodiac||'';
    const ps=a.pos?(posMap[a.pos]||''):'';
    const pc2=a.pos?(posCol[a.pos]||''):'';
    const glW=gl.length*8+14;
    const sa=symAttrs(a.planet,col);
    if(isDes){
      r+='<text x="'+(px+13)+'" y="'+(yg+2)+'" text-anchor="middle" font-family="Arial" font-size="'+fsym+'" fill="'+col+'"'+sa+'>'+sym+'</text>';
      r+='<text x="'+(px+28)+'" y="'+yg+'" font-family="Arial" font-size="13" fill="'+col+'"><tspan font-weight="700">'+gl+'</tspan><tspan font-weight="700">.'+ln+'</tspan></text>';
      r+='<text x="'+(px+28)+'" y="'+yc+'" font-family="Arial" font-size="9" fill="'+col+'" opacity="0.6">'+ctb+'</text>';
      if(ps)r+='<text x="'+(px+28+glW)+'" y="'+(yg-1)+'" font-family="Arial" font-size="11" font-weight="bold" fill="'+pc2+'">'+ps+'</text>';
      r+='<text x="'+(px+PW-3)+'" y="'+yg+'" text-anchor="end" font-family="Arial" font-size="11" fill="'+ZOD_COL+'" opacity="0.5">'+zod+'</text>';
    } else {
      const glEnd=px+PW-28;
      r+='<text x="'+(px+PW-13)+'" y="'+(yg+2)+'" text-anchor="middle" font-family="Arial" font-size="'+fsym+'" fill="'+col+'"'+sa+'>'+sym+'</text>';
      r+='<text x="'+glEnd+'" y="'+yg+'" text-anchor="end" font-family="Arial" font-size="13" fill="'+col+'"><tspan font-weight="700">'+gl+'</tspan><tspan font-weight="700">.'+ln+'</tspan></text>';
      r+='<text x="'+glEnd+'" y="'+yc+'" text-anchor="end" font-family="Arial" font-size="9" fill="'+col+'" opacity="0.6">'+ctb+'</text>';
      if(ps)r+='<text x="'+(glEnd-glW-1)+'" y="'+(yg-1)+'" text-anchor="end" font-family="Arial" font-size="11" font-weight="bold" fill="'+pc2+'">'+ps+'</text>';
      r+='<text x="'+(px+3)+'" y="'+yg+'" font-family="Arial" font-size="11" fill="'+ZOD_COL+'" opacity="0.5">'+zod+'</text>';
    }
    if(i<acts.length-1)r+='<line x1="'+(px+5)+'" y1="'+(yt+rH-2)+'" x2="'+(px+PW-5)+'" y2="'+(yt+rH-2)+'" stroke="#E8DDD0" stroke-width="0.5"/>';
  });
  return r;
}

function drawVariables(data){
  const vars=data.variables||{};
  const hx=SC.Head.x,hy=SC.Head.y;
  const pos={leftUp:[hx-186,hy+33],rightUp:[hx+186,hy+33],leftDown:[hx-186,hy+108],rightDown:[hx+186,hy+108]};
  const sz=9;var s='';
  ['leftUp','rightUp','leftDown','rightDown'].forEach(function(key){
    const ax=pos[key][0],ay=pos[key][1];
    const col=key.indexOf('right')>=0?PC.chP:PC.chR;
    const v=vars[key]||{};
    const isLeft=typeof v==='string'?v==='L':(v.dir?v.dir==='L':key.indexOf('left')>=0);
    s+=isLeft?
      '<polygon points="'+(ax-sz)+','+ay+' '+(ax+sz)+','+(ay-sz)+' '+(ax+sz)+','+(ay+sz)+'" fill="'+col+'" opacity="0.85"/>':
      '<polygon points="'+(ax+sz)+','+ay+' '+(ax-sz)+','+(ay-sz)+' '+(ax-sz)+','+(ay+sz)+'" fill="'+col+'" opacity="0.85"/>';
    if(typeof v==='object'){
      [{val:v.color,ox:isLeft?-32:32},{val:v.tone,ox:isLeft?-62:62},{val:v.base,ox:isLeft?-94:94}].forEach(function(item){
        if(item.val==null)return;
        const lx=ax+item.ox;
        s+='<circle cx="'+lx+'" cy="'+ay+'" r="11" fill="none" stroke="'+col+'" stroke-width="1.5"/>';
        s+='<text x="'+lx+'" y="'+(ay+4)+'" text-anchor="middle" font-family="Arial" font-size="10" font-weight="700" fill="'+col+'">'+item.val+'</text>';
      });
    }
  });
  return s;
}

function drawBodySilhouette(){
  return '<path d="M '+CX+',30 C '+(CX+58)+',30 '+(CX+88)+',88 '+(CX+88)+',155 C '+(CX+88)+',222 '+(CX+62)+',272 '+(CX+38)+',290 C '+(CX+50)+',308 '+(CX+62)+',332 '+(CX+64)+',352 C '+(CX+96)+',374 '+(CX+162)+',410 '+(CX+224)+',462 C '+(CX+286)+',514 '+(CX+300)+',620 '+(CX+290)+',726 C '+(CX+278)+',832 '+(CX+232)+',906 '+(CX+152)+',948 C '+(CX+98)+',966 '+(CX+50)+',972 '+CX+',972 C '+(CX-50)+',972 '+(CX-98)+',966 '+(CX-152)+',948 C '+(CX-232)+',906 '+(CX-278)+',832 '+(CX-290)+',726 C '+(CX-300)+',620 '+(CX-286)+',514 '+(CX-224)+',462 C '+(CX-162)+',410 '+(CX-96)+',374 '+(CX-64)+',352 C '+(CX-62)+',332 '+(CX-50)+',308 '+(CX-38)+',290 C '+(CX-62)+',272 '+(CX-88)+',222 '+(CX-88)+',155 C '+(CX-88)+',88 '+(CX-58)+',30 '+CX+',30 Z" fill="'+PC.bS+'" opacity="0.2"/>';
}

function generateBodygraph(data){
  const defined=new Set((data.centers&&data.centers.defined)||[]);
  const pG=new Set((data.gates&&data.gates.personalityGates)||[]);
  const dG=new Set((data.gates&&data.gates.designGates)||[]);
  const dActs=(data.activations&&data.activations.design)||[];
  const pActs=(data.activations&&data.activations.personality)||[];
  const chart=data.chart||{};

  var s='<svg xmlns="http://www.w3.org/2000/svg" width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'">';
  s+='<rect width="'+W+'" height="'+H+'" fill="'+PC.bg+'"/>';
  s+=drawBodySilhouette();

  // Каналы: сначала 57-20, потом заглушки 10/34 поверх
  s+=drawIntCh(pG,dG);
  s+=drawIntSpine(pG,dG);
  STD_CH.forEach(function(ck){
    const parts=ck.split('|');
    const ap=parts[0].split(':'),bp=parts[1].split(':');
    const cn1=ap[0],g1=parseInt(ap[1]),cn2=bp[0],g2=parseInt(bp[1]);
    const p1=gXY(cn1,g1),p2=gXY(cn2,g2);
    s+=drawChanLine(p1[0],p1[1],p2[0],p2[1],g1,g2,pG,dG);
  });

  // Центры
  Object.entries(SC).forEach(function(entry){
    const name=entry[0],c=entry[1];
    const fill=defined.has(name)?PC.cD:PC.cU,sw=2.5;
    const d=centerPath(c,c.x,c.y);
    if(d)s+='<path d="'+d+'" fill="'+fill+'" stroke="'+PC.str+'" stroke-width="'+sw+'"/>';
    else if(c.shape==='circle')s+='<circle cx="'+c.x+'" cy="'+c.y+'" r="'+c.r+'" fill="'+fill+'" stroke="'+PC.str+'" stroke-width="'+sw+'"/>';
    else s+='<rect x="'+(c.x-c.w/2)+'" y="'+(c.y-c.h/2)+'" width="'+c.w+'" height="'+c.h+'" rx="'+c.rx+'" fill="'+fill+'" stroke="'+PC.str+'" stroke-width="'+sw+'"/>';
  });

  // Ворота
  Object.entries(GO).forEach(function(entry){
    const cn=entry[0],gates=entry[1];
    const c=SC[cn],isDef=defined.has(cn);
    Object.entries(gates).forEach(function(ge){
      const g=parseInt(ge[0]),off=ge[1];
      const gx=c.x+off[0],gy=c.y+off[1];
      const r=11,fs=g>=10?10:11;
      const gold=pG.has(g)||dG.has(g)||isDef;
      const fill=gold?PC.gG:PC.gW,tf=gold?PC.gGT:PC.gWT,st=gold?PC.gGS:PC.gWS;
      s+='<circle cx="'+gx.toFixed(1)+'" cy="'+gy.toFixed(1)+'" r="'+r+'" fill="'+fill+'" stroke="'+st+'" stroke-width="1.2"/>';
      s+='<text x="'+gx.toFixed(1)+'" y="'+(gy+3.8).toFixed(1)+'" text-anchor="middle" font-family="Arial" font-size="'+fs+'" font-weight="700" fill="'+tf+'">'+g+'</text>';
    });
  });

  s+=drawVariables(data);
  s+=drawPlanetPanel(dActs,true,7);
  s+=drawPlanetPanel(pActs,false,W-7-PW);

  if(chart.type){
    s+='<rect x="0" y="'+(H-48)+'" width="'+W+'" height="48" fill="'+PC.chP+'" opacity="0.9"/>';
    s+='<text x="'+CX+'" y="'+(H-26)+'" text-anchor="middle" font-family="Arial" font-size="14" font-weight="bold" letter-spacing="1.5" fill="#FFF">'+chart.type.toUpperCase()+' · '+(chart.profile||'')+'</text>';
    s+='<text x="'+CX+'" y="'+(H-8)+'" text-anchor="middle" font-family="Arial" font-size="10" fill="#EDD8B0">'+(chart.authority||'')+' · '+(chart.definition||'')+'</text>';
  }
  s+='<text x="16" y="'+(H-8)+'" font-family="Arial" font-size="9" fill="'+PC.str+'" opacity="0.7">Designed by Nataly Popovych</text>';
  s+='</svg>';
  return s;
}

module.exports = {generateBodygraph: generateBodygraph};
