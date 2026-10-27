import '@fontsource/dm-sans/latin-400.css';
import '@fontsource/dm-sans/latin-500.css';
import '@fontsource/dm-sans/latin-600.css';
import '@fontsource/dm-sans/latin-700.css';
import '@fontsource/manrope/latin-500.css';
import * as THREE from 'three';

const canvas = document.querySelector('#world');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.22;
const scene = new THREE.Scene();
scene.background = new THREE.Color('#e8eee8');
const camera = new THREE.OrthographicCamera(-20, 20, 15, -15, .1, 160);
const hemi = new THREE.HemisphereLight('#fff5de', '#788f83', 2.3); scene.add(hemi);
const sun = new THREE.DirectionalLight('#fff0d7', 4.2);
sun.position.set(-14, 25, 10); sun.castShadow = true;
sun.shadow.mapSize.set(2048,2048); sun.shadow.camera.left=-23;sun.shadow.camera.right=23;sun.shadow.camera.top=23;sun.shadow.camera.bottom=-23;
sun.shadow.normalBias=.04;sun.shadow.bias=-.00015;sun.shadow.camera.far=80;sun.shadow.radius=4; scene.add(sun);
scene.add(new THREE.AmbientLight('#ffffff', .3));
const mats = {};
function material(color, roughness=.85, metalness=0) { const key=color+roughness+metalness; return mats[key] ||= new THREE.MeshStandardMaterial({color,roughness,metalness}); }
const palette={wall:'#f4edda',white:'#fff9ec',trim:'#dbd9c5',purple:'#927a99',purpleDark:'#776283',glass:'#6c9baf',grass:'#a5b785',edge:'#d7d6c2',path:'#e7dfcd',road:'#929d98',leaf:'#64814c',leafLight:'#859d59',wood:'#b28d64',skin:'#e3b88e'};
function box(w,h,d,color,x=0,y=0,z=0,parent=scene){let m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material(color));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function cylinder(rt,rb,h,color,x,y,z,parent=scene,segments=12){let m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,segments),material(color));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function sphere(r,color,x,y,z,parent=scene,sx=1,sy=1,sz=1){const m=new THREE.Mesh(new THREE.IcosahedronGeometry(r,2),material(color));m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function label(text,width,color='#536a5b',bg=null){const c=document.createElement('canvas');c.width=1024;c.height=256;const ctx=c.getContext('2d');if(bg){ctx.fillStyle=bg;ctx.fillRect(0,0,c.width,c.height)}ctx.fillStyle=color;ctx.font='600 100px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,512,128);const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;const m=new THREE.Mesh(new THREE.PlaneGeometry(width,width/4),new THREE.MeshBasicMaterial({map:texture,transparent:!bg,side:THREE.DoubleSide}));return m;}
// Floating landscaped block, with a beveled edge rather than an infinite ground.
const ground=box(200,.1,200,'#e8eee8',0,-.8,0);ground.castShadow=false;
box(25,.6,21,palette.edge,0,-.28,0);
box(24.8,.15,20.8,palette.path,0,.095,0);
box(24.3,.07,3.4,palette.road,0,.19,6.9);
box(24.3,.07,1.3,palette.road,0,.19,-8.9);
for(let x=-11;x<12;x+=2.5)box(1,.015,.065,'#dedecb',x,.24,6.9);
for(let x=-11.5;x<=11.5;x+=.75){box(.025,.018,1.3,'#d4cdbb',x,.19,4.3);box(.025,.018,1.1,'#d4cdbb',x,.19,9.5);}
for(let i=0;i<7;i++)box(.33,.02,1.9,'#f3efdb',-7+i*.59,.25,6.9);
box(24,.12,.16,'#f6efda',0,.22,5.12);box(24,.12,.16,'#f6efda',0,.22,8.68);
const obstacles=[];
function obstacle(x,z,w,d){obstacles.push({x,z,w:w/2+.25,d:d/2+.25});}
// Hospital ground floor and a carefully dressed, open upper storey.
box(12.3,.3,8.4,palette.trim,-1.7,.34,-2.1);
box(12,3.15,8.1,palette.wall,-1.7,2,-2.1);obstacle(-1.7,-2.1,12.2,8.2);
box(12.5,.19,8.5,palette.white,-1.7,3.66,-2.1);
box(12,.16,8.05,'#e8e3d2',-1.7,3.84,-2.1);
// Rear and left walls on the upper floor, leaving a dollhouse view.
box(12,2.55,.18,palette.wall,-1.7,5.15,-6.12);
box(.18,2.55,8.1,palette.wall,-7.62,5.15,-2.1);
box(12.4,.18,.38,palette.white,-1.7,6.5,-6.12);
box(.38,.18,8.5,palette.white,-7.62,6.5,-2.1);
box(.15,.9,8.1,palette.wall,4.22,4.36,-2.1);
box(.36,.13,8.3,palette.white,4.22,4.87,-2.1);
box(12,.65,.18,palette.wall,-1.7,4.25,1.92);
box(12.2,.13,.35,palette.white,-1.7,4.62,1.92);
box(.14,2.3,5.4,palette.white,-1.4,5,-3.3);
box(2.1,2.3,.14,palette.white,-6.5,5,-1.4);
function frontWindow(x,z=1.966,w=1.25,y=2.25,h=1.85){box(w+.16,h+.16,.1,palette.white,x,y,z);box(w,h,.04,palette.glass,x,y,z+.065);box(.045,h,.05,'#d8e7dc',x,y,z+.1);box(w,.045,.05,'#d8e7dc',x,y+.3,z+.1);box(w+.22,.1,.22,palette.trim,x,y-h/2,z+.06);}
[-6.55,-4.85,1.3,3.05].forEach(x=>frontWindow(x));
for(let z=-5;z<1;z+=1.9){box(.06,1.85,1.3,palette.glass,4.33,2.25,z);box(.08,1.85,.05,palette.white,4.38,2.25,z);box(.26,.1,1.5,palette.trim,4.4,1.29,z)}
for(let x=-6.5;x<4;x+=1.6){box(1.4,1.4,.06,palette.glass,x,5.4,-6);box(.055,1.45,.08,palette.white,x,5.4,-5.95)}
for(let z=-5.1;z<1;z+=1.7){box(.06,1.4,1.4,palette.glass,-7.5,5.4,z);box(.08,1.45,.045,palette.white,-7.45,5.4,z)}
// Purple identity tower and covered entrance.
box(2.05,5.35,.56,palette.purple,-3.05,3.05,2.08);
box(2.18,.13,.7,'#ac98af',-3.05,5.78,2.08);
box(.32,1.1,.09,palette.white,-3.05,4.6,2.42);box(1.05,.32,.09,palette.white,-3.05,4.6,2.42);
const hospitalName=label('CLINICA BORGO',1.8,'#fff9ec');hospitalName.position.set(-3.05,3.64,2.424);scene.add(hospitalName);
box(2.3,2.25,.08,'#557f88',-.65,1.58,2.02);
box(.065,2.3,.1,palette.white,-.65,1.58,2.1);
box(2.65,.11,1.8,palette.white,-.65,.49,2.8);
box(3.05,.22,2.05,palette.purple,-.65,3.22,2.85);box(2.75,.08,1.83,palette.white,-.65,3.36,2.85);
for(const x of [-2.06,.76])box(.13,2.7,.13,palette.purple,x,1.87,3.7);
for(const x of [-1.55,.25])box(.035,.3,.06,'#d5d5c0',x,1.4,2.15);
// Rooms: beds, folded blankets, monitors, desks and a stocked pharmacy.
function bed(x,z){box(1.35,.15,2.1,'#bcc7c0',x,4.32,z);box(1.3,.28,1.95,'#faf9ed',x,4.51,z);box(1.28,.06,1.05,'#8cb9ba',x,4.7,z+.4);box(.8,.14,.43,'#fffdf3',x,4.72,z-.65);box(1.4,.65,.1,'#d2ddcd',x,4.43,z-1.03);for(let dx of [-.53,.53])for(let dz of [-.8,.8])cylinder(.035,.035,.45,'#9eafa5',x+dx,4.11,z+dz);box(.5,.55,.55,palette.white,x+1,4.21,z-.6);box(.34,.28,.06,'#3b665d',x+1,4.75,z-.6);box(.25,.015,.015,'#9ad0a3',x+1,4.78,z-.56)}
bed(-5.5,-3.5);bed(-3,-3.5);
box(2.6,.14,.8,palette.white,1,4.78,-3.5);for(let x of [0,2])box(.1,.8,.65,palette.trim,x,4.3,-3.5);
box(.55,.4,.06,'#566d70',.6,5.05,-3.65);box(.06,.12,.08,'#617b76',.6,4.81,-3.65);
box(.48,.04,.22,'#c1cac1',.6,4.88,-3.3);
for(let x of [0,1.5,3]){box(1.23,1.6,.35,'#f8f4e7',x,4.9,-5.75);for(let y of [4.4,4.85,5.3]){box(1.2,.05,.4,'#c9cbbd',x,y,-5.57);for(let j=0;j<5;j++)box(.1,.19+Math.random()*.08,.12,['#98b9ab','#c9a19a','#96b1bf','#d5c183'][j%4],x-.45+j*.2,y+.14,-5.53)}}
function chair(x,z){box(.52,.1,.5,'#7b9e95',x,4.35,z);box(.52,.45,.1,'#7b9e95',x,4.6,z+.24);cylinder(.05,.05,.4,'#71817a',x,4.1,z);box(.6,.04,.08,'#71817a',x,3.94,z);box(.08,.04,.6,'#71817a',x,3.94,z)}chair(.7,-2.4);chair(2.7,-3.4);
// Bushes and softly faceted trees.
let seed=17;function rand(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
function bush(x,z,r=.4,y=.45){sphere(r,palette.leafLight,x,y,z,scene,1,.8,1);sphere(r*.7,palette.leaf,x+.15,y-.05,z+.12)}
function tree(x,z,s=1){const g=new THREE.Group();g.position.set(x,.24,z);scene.add(g);cylinder(.09*s,.14*s,1.8*s,'#8e7952',0,.95*s,0,g);for(let i=0;i<13;i++){const a=i*2.4;const r=.45*Math.sqrt(i/13)*s; sphere((.5+rand()*.18)*s,i%3?'#829653':'#668249',Math.cos(a)*r,(1.8+(i%4)*.32)*s,Math.sin(a)*r,g,.85,1.2,.85)}cylinder(1.02*s,1.02*s,.13,palette.trim,x,.27,z);cylinder(.93*s,.93*s,.07,'#acb58a',x,.36,z);obstacle(x,z,1.4*s,1.4*s)}
function garden(x,z,w,d){box(w,.16,d,palette.white,x,.28,z);box(w-.16,.03,d-.16,palette.grass,x,.38,z);}
garden(-9.8,-2.5,2.65,10.1);garden(8.4,-3.1,4.4,8.9);garden(8.4,2.6,4.4,2.3);garden(-9.7,2.9,2.9,2);garden(-1,9.65,9,1.1);
[[-9.8,-6.2,1],[-9.8,-2.4,.85],[-9.8,1.2,.9],[7.3,-6,.95],[9.5,-3.3,1.03],[7.4,.1,.85],[10,2.5,.85],[-10.3,3,.68]].forEach(t=>tree(...t));
for(let i=0;i<14;i++){bush(-5+i*.62,9.65,.33);if(i<6)bush(6.7+i*.63,3.1,.38)}
for(let i=0;i<7;i++)bush(-10.6+i*.32,-7,.28);
function pot(x,y,z,s=.3){cylinder(s*.8,s*.6,s*1.3,'#d2b899',x,y+s*.6,z);for(let j=0;j<5;j++){const a=j*2.4;let leaf=sphere(s*.45,'#71905e',x+Math.cos(a)*s*.5,y+s*1.6,z+Math.sin(a)*s*.5,scene,.5,1.8,.6);leaf.rotation.z=Math.sin(a)*.5}}
pot(-6.8,3.96,.9);pot(-1.8,3.96,-5.4);pot(3.6,3.96,.9);pot(-2.5,.4,3.1,.37);pot(1.25,.4,2.8,.37);
function bench(x,z,rot=0){const g=new THREE.Group();g.position.set(x,.3,z);g.rotation.y=rot;scene.add(g);for(let i=0;i<4;i++)box(1.65,.075,.11,palette.wood,0,.5,-.2+i*.14,g);for(let i=0;i<3;i++)box(1.65,.1,.065,palette.wood,0,.78+i*.13,-.3,g);for(let dx of [-.62,.62]){box(.07,.55,.52,'#52685a',dx,.23,0,g);box(.06,1,.06,'#52685a',dx,.57,-.32,g)}obstacle(x,z,1.7,.8)}
bench(7.5,1.65);bench(-9.8,4.25);bench(9,-6.6,Math.PI/2);
// Small plaza with fountain.
cylinder(1.35,1.4,.2,palette.white,8,-.0,-.2); // mostly nestled in garden
const fountain=new THREE.Group();fountain.position.set(8,.43,-.3);scene.add(fountain);cylinder(1.05,1.12,.28,'#d9d8c2',0,.08,0,fountain,40);cylinder(.92,.92,.02,'#8fbdba',0,.24,0,fountain,40);cylinder(.16,.22,.52,'#d6d6bd',0,.45,0,fountain);sphere(.2,'#a3d2cb',0,.78,0,fountain);obstacle(8,-.3,2.4,2.4);
function lamp(x,z){cylinder(.045,.055,2.7,'#697c6b',x,1.6,z);box(.45,.12,.45,'#677b68',x,2.98,z);box(.28,.35,.28,'#fff1bf',x,2.76,z);cylinder(.14,.2,.1,'#697c6b',x,.33,z)}lamp(-6,4.65);lamp(5.2,4.65);lamp(11,8.95);
function bollard(x,z){cylinder(.075,.09,.55,'#7b8777',x,.55,z);cylinder(.08,.08,.08,'#e8d8ae',x,.75,z)}for(let x=-4;x<5;x+=1.5)bollard(x,4.95);
// Ambulance, rounded silhouette assembled from layered forms.
function vehicle(x,z,ambulance=true){const g=new THREE.Group();g.position.set(x,.45,z);scene.add(g);box(3.2,.65,1.35,'#f6f1df',0,.6,0,g);box(2.1,.8,1.36,'#fff9ed',-.45,1.25,0,g);box(.86,.55,1.25,'#d9e4d9',1.02,1.02,0,g);box(.055,.42,1.05,'#638b9a',1.48,1.1,0,g);box(.7,.4,.045,'#729ca7',.98,1.12,.69,g);box(.7,.4,.045,'#729ca7',.98,1.12,-.69,g);box(3,.14,1.39,'#cb735d',0,.65,0,g);box(.6,.12,.55,'#b9c6bc',-.15,1.74,0,g);box(.2,.13,.5,'#b55d4d',-.4,1.84,0,g);box(.2,.13,.5,'#7eafba',.1,1.84,0,g);for(let side of [-1,1]){box(.11,.5,.03,'#bb6c59',-.6,1.25,side*.697,g);box(.5,.11,.03,'#bb6c59',-.6,1.25,side*.697,g);for(let xx of [-1.02,1.04]){const wheel=cylinder(.32,.32,.18,'#3f4944',xx,.3,side*.68,g,20);wheel.rotation.x=Math.PI/2;const hub=cylinder(.17,.17,.19,'#b6beb4',xx,.3,side*.69,g,20);hub.rotation.x=Math.PI/2}}for(let zz of [-.45,.45])box(.035,.17,.22,'#fff1bd',1.62,.65,zz,g);box(.12,.12,1.4,'#bbc4b8',1.6,.38,0,g);obstacle(x,z,3.4,1.6);return g;}
vehicle(2.6,6.9);
// Illustrated standing wayfinding signs.
function sign(x,z,n){const g=new THREE.Group();scene.add(g);g.position.set(x,.3,z);cylinder(.028,.028,1.3,'#b4bca6',0,.65,0,g);const disc=cylinder(.31,.31,.07,'#f5f2df',0,1.45,0,g,32);disc.rotation.x=Math.PI/2;const t=label(n,.55,'#b57561');t.position.set(0,1.45,.05);g.add(t)}sign(-5.8,3.6,'01');sign(1.3,3.8,'02');sign(5.5,1.8,'03');
// People: independent jointed figures, each with a walking cycle.
const people=[];
function person(x,z,color,controlled=false,y=.31){const g=new THREE.Group();g.position.set(x,y,z);scene.add(g);const body=new THREE.Group();g.add(body);box(.29,.43,.19,color,0,.78,0,body);sphere(.155,palette.skin,0,1.18,0,body,.82,1.05,.84);sphere(.15,controlled?'#504638':'#635544',0,1.25,-.018,body,.84,.65,.88);box(.08,.1,.06,palette.skin,0,1.01,0,body);const limbs=[];for(let side of [-1,1]){const leg=new THREE.Group();leg.position.set(side*.085,.58,0);body.add(leg);box(.095,.4,.1,'#485d59',0,-.19,0,leg);box(.11,.07,.19,'#eee6cc',0,-.41,.04,leg);const arm=new THREE.Group();arm.position.set(side*.2,.96,0);body.add(arm);box(.085,.28,.09,color,0,-.14,0,arm);sphere(.052,palette.skin,0,-.31,0,arm);limbs.push(leg,arm)}
if(controlled){const ring=new THREE.Mesh(new THREE.RingGeometry(.39,.43,48),new THREE.MeshBasicMaterial({color:'#bd765c',side:THREE.DoubleSide,transparent:true,opacity:.7}));ring.rotation.x=-Math.PI/2;ring.position.y=.025;g.add(ring);const marker=new THREE.Group();marker.position.y=1.85;g.add(marker);const a=new THREE.Mesh(new THREE.OctahedronGeometry(.11),material('#c9795d'));marker.add(a);g.userData.marker=marker;}
const p={g,body,limbs,x,z,controlled,phase:rand()*6,speed:.45+rand()*.35,path:[],target:0,moving:false};people.push(p);return p;}
const player=person(-4,4.3,'#cc795e',true);
const routes=[[[ -6.8,4.1],[-3.3,4.1],[-3.3,3],[-6.8,3]],[[5.7,9.4],[10.8,9.4],[10.8,4.4],[5.7,4.4]], [[-10.8,5],[-7.8,5],[-7.8,9.4],[-10.8,9.4]],[[4.8,-7.5],[10.8,-7.5],[10.8,-4.8],[5.2,-4.8]], [[-1.8,4.45],[4.4,4.45],[4.4,3.5],[-1.8,3.5]], [[-11.2,-5.5],[-11.2,1],[-8,1],[-8,-5.5]]];
routes.forEach((path,i)=>{const p=person(...path[0],['#638f91','#dfc18d','#7d8199','#a1ad7b','#d9a18c','#8fa7b3'][i]);p.path=path;p.target=1});
person(-5,-4.8,'#f8f5e6',false,3.98);person(2.7,-4.3,'#f8f5e6',false,3.98);person(-.2,-2.25,'#a0b6b4',false,3.98);
// Render and input. Screen-relative motion is projected onto the ground plane.
const keys=new Set();let zoom=1, sunset=false, elapsed=0, distance=0, lastZone='';
function resize(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h);const aspect=w/h;const extent=innerWidth<600?27.5:15;camera.left=-extent*aspect;camera.right=extent*aspect;camera.top=extent;camera.bottom=-extent;camera.zoom=zoom;camera.updateProjectionMatrix();const target=innerWidth<600?new THREE.Vector3(-.5,1.2,-.5):new THREE.Vector3(-4.7,1.5,.9);camera.position.copy(target).add(new THREE.Vector3(22,25,31));camera.lookAt(target)}window.addEventListener('resize',resize);resize();
function setZoom(v){zoom=THREE.MathUtils.clamp(v,.65,1.9);camera.zoom=zoom;camera.updateProjectionMatrix()}
canvas.addEventListener('wheel',e=>{e.preventDefault();setZoom(zoom-e.deltaY*.001)},{passive:false});document.querySelector('#zoom-in').onclick=()=>setZoom(zoom+.12);document.querySelector('#zoom-out').onclick=()=>setZoom(zoom-.12);
const valid=['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d','Shift'];
window.addEventListener('keydown',e=>{if(valid.includes(e.key)&&!document.querySelector('dialog').open){e.preventDefault();keys.add(e.key)}});window.addEventListener('keyup',e=>keys.delete(e.key));window.addEventListener('blur',()=>keys.clear());document.addEventListener('visibilitychange',()=>keys.clear());
for(const b of document.querySelectorAll('[data-key]')){b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys.add(b.dataset.key)});for(const ev of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,()=>keys.delete(b.dataset.key))}
function blocked(x,z){return Math.abs(x)>11.6||Math.abs(z)>9.8||obstacles.some(o=>Math.abs(x-o.x)<o.w&&Math.abs(z-o.z)<o.d)}
let toastTimer;function toast(text){const el=document.querySelector('#toast');el.textContent=text;el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),4500)}
document.querySelector('#reset').onclick=()=>{player.g.position.set(-4,.31,4.3);keys.clear();toast('Eccoti di nuovo davanti alla clinica.')};
const dialog=document.querySelector('dialog');document.querySelector('#help').onclick=()=>{keys.clear();dialog.showModal()};document.querySelector('#close-help').onclick=document.querySelector('#explore').onclick=()=>dialog.close();
document.querySelector('#light').onclick=()=>{sunset=!sunset;sun.color.set(sunset?'#ffc391':'#fff0d7');sun.intensity=sunset?3.2:4.2;sun.position.set(sunset?-25:-14,sunset?12:25,10);hemi.color.set(sunset?'#e6c8b9':'#fff5de');scene.background.set(sunset?'#e9dfd2':'#e8eee8');ground.material=material(sunset?'#e9dfd2':'#e8eee8');document.querySelector('#time').textContent=sunset?'18:42':'10:24';document.querySelector('.scene-info small').textContent=sunset?'La luce si fa gentile':'Una mattina di primavera';toast(sunset?'L’ora dorata. Ancora due passi?':'Il quartiere si risveglia.')};
// Subtle optional ambient audio, generated locally without audio downloads.
let audioCtx, audioGain, soundOn=false;document.querySelector('#sound').onclick=async()=>{if(!audioCtx){audioCtx=new AudioContext();audioGain=audioCtx.createGain();audioGain.gain.value=0;audioGain.connect(audioCtx.destination);const buffer=audioCtx.createBuffer(1,audioCtx.sampleRate*3,audioCtx.sampleRate);const data=buffer.getChannelData(0);let v=0;for(let i=0;i<data.length;i++){v=(v+Math.random()*.02-.01)*.98;data[i]=v}const source=audioCtx.createBufferSource();source.buffer=buffer;source.loop=true;const filter=audioCtx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=700;source.connect(filter).connect(audioGain);source.start();}await audioCtx.resume();soundOn=!soundOn;audioGain.gain.setTargetAtTime(soundOn?.35:0,audioCtx.currentTime,.4);document.querySelector('#sound span').textContent=soundOn?'Suono on':'Suono off';document.querySelector('#sound').setAttribute('aria-label',soundOn?'Disattiva suoni ambientali':'Attiva suoni ambientali')};
const right=new THREE.Vector3(), forward=new THREE.Vector3();const clock=new THREE.Clock();let ready=false;
function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.05);elapsed+=dt;
let dx=(keys.has('ArrowRight')||keys.has('d')?1:0)-(keys.has('ArrowLeft')||keys.has('a')?1:0),dy=(keys.has('ArrowUp')||keys.has('w')?1:0)-(keys.has('ArrowDown')||keys.has('s')?1:0);
right.setFromMatrixColumn(camera.matrixWorld,0);right.y=0;right.normalize();forward.crossVectors(new THREE.Vector3(0,1,0),right).normalize();
const direction=right.clone().multiplyScalar(dx).addScaledVector(forward,dy);const moving=direction.lengthSq()>0;if(moving){direction.normalize();const speed=keys.has('Shift')?3.8:2.1;const nx=player.g.position.x+direction.x*speed*dt,nz=player.g.position.z+direction.z*speed*dt;if(!blocked(nx,player.g.position.z))player.g.position.x=nx;if(!blocked(player.g.position.x,nz))player.g.position.z=nz;player.g.rotation.y=Math.atan2(direction.x,direction.z);distance+=speed*dt;document.querySelector('#activity').textContent=(keys.has('Shift')?'Una corsetta':'A spasso')+' · '+Math.floor(distance)+' m';}
player.moving=moving;player.g.userData.marker.position.y=1.85+Math.sin(elapsed*2)*.07;
for(const p of people){if(p.path.length){const t=p.path[p.target];const x=t[0]-p.g.position.x,z=t[1]-p.g.position.z,len=Math.hypot(x,z);if(len<.12)p.target=(p.target+1)%p.path.length;else{p.g.position.x+=x/len*p.speed*dt;p.g.position.z+=z/len*p.speed*dt;p.g.rotation.y=Math.atan2(x,z)}p.moving=true}const walk=p.moving?Math.sin(elapsed*(p.controlled&&keys.has('Shift')?13:8)+p.phase)*.5:Math.sin(elapsed*1.5+p.phase)*.025;p.limbs.forEach((limb,i)=>limb.rotation.x=walk*(i===0||i===3?1:-1));p.body.position.y=p.moving?Math.abs(Math.sin(elapsed*8+p.phase))*.025:Math.sin(elapsed*1.6+p.phase)*.009;}
const x=player.g.position.x,z=player.g.position.z;const zone=z<4.2&&x>-2.6&&x<1.5?'clinic':x>6&&z<4?'garden':z>8.5?'walk':'';if(zone&&zone!==lastZone){toast({clinic:'Clinica Borgo · Un posto dove prendersi cura.',garden:'Il giardino dei piccoli incontri. Fermati un momento.',walk:'La passeggiata · La città ha il tuo passo.'}[zone]);lastZone=zone}
renderer.render(scene,camera);if(!ready){ready=true;document.querySelector('#loading').style.opacity='0';setTimeout(()=>document.querySelector('#loading').remove(),800);setTimeout(()=>toast('Sei il vicino in corallo. Muoviti con le frecce.'),1000);window.__BORGO_READY__=true;}
}
// Small read-only diagnostics for smoke tests and accessibility integrations.
window.borgo={get player(){return{x:player.g.position.x,z:player.g.position.z}},get inhabitants(){return people.length},get obstacles(){return obstacles.length},get ready(){return ready}};
animate();
