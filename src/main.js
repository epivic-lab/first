import { FLOOR_HEIGHTS, STAIR_BOTTOM, STAIR_TOP, insideBuilding, blockedGround, blockedUpper, makeJourney, makeStairJourney, exhibits } from './exploration.js';
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
box(24.8,.15,20.8,palette.path,0,.095,0).userData.walkFloor=0;
box(24.3,.07,3.4,palette.road,0,.19,6.9);
box(24.3,.07,1.3,palette.road,0,.19,-8.9);
for(let x=-11;x<12;x+=2.5)box(1,.015,.065,'#dedecb',x,.24,6.9);
for(let x=-11.5;x<=11.5;x+=.75){box(.025,.018,1.3,'#d4cdbb',x,.19,4.3);box(.025,.018,1.1,'#d4cdbb',x,.19,9.5);}
for(let i=0;i<7;i++)box(.33,.02,1.9,'#f3efdb',-7+i*.59,.25,6.9);
box(24,.12,.16,'#f6efda',0,.22,5.12);box(24,.12,.16,'#f6efda',0,.22,8.68);
const obstacles=[];
function obstacle(x,z,w,d){obstacles.push({x,z,w:w/2+.25,d:d/2+.25});}
const upperMeshes=[],facadeMeshes=[];
const collect=(start,list)=>list.push(...scene.children.slice(start));
const groundInterior=new THREE.Group();scene.add(groundInterior);
// Hospital ground floor and a carefully dressed, open upper storey.
box(12.3,.3,8.4,palette.trim,-1.7,.34,-2.1);
box(12,3.15,.18,palette.wall,-1.7,2,-6.12);
box(.18,3.15,8.1,palette.wall,-7.62,2,-2.1);
let startFacade=scene.children.length;
box(.18,3.15,8.1,palette.wall,4.22,2,-2.1);
box(5.95,3.15,.18,palette.wall,-4.7,2,1.92);
box(3.85,3.15,.18,palette.wall,2.36,2,1.92);
box(2.2,.65,.18,palette.wall,-.65,3.25,1.92);
collect(startFacade,facadeMeshes);
// Reception: open circulation from entrance to the staircase.
box(11.65,.08,7.65,'#e4dfcc',-1.7,.5,-2.1,groundInterior).userData.walkFloor=0;
box(2.7,1.02,1.1,'#ddd5be',-3.8,1.03,-2.8,groundInterior);
box(2.85,.12,1.25,palette.white,-3.8,1.6,-2.8,groundInterior);
box(.58,.4,.07,'#527b7e',-3.6,1.85,-2.8,groundInterior);
box(2.35,.4,.55,'#92a99b',-5.7,.83,.2,groundInterior);
box(2.35,.6,.16,'#92a99b',-5.7,1.07,-.04,groundInterior);
box(2.25,.06,.65,'#c5cfb7',-.65,.57,1.35,groundInterior);
const welcome=label('WELCOME TO BORGO',3,'#6d8170');welcome.position.set(-2.5,2.6,-5.99);groundInterior.add(welcome);
const floorLabel=label('RECEPTION  /  00',2.4,'#9b8868');floorLabel.rotation.x=-Math.PI/2;floorLabel.position.set(-.7,.56,-.1);groundInterior.add(floorLabel);
// Quiet floor joints, reception details and a planted corner.
for(let x=-7;x<4;x+=.7)box(.012,.008,7.45,'#d5d1bd',x,.546,-2.1,groundInterior);
for(let z=-5.5;z<1.5;z+=.7)box(11.25,.008,.012,'#d5d1bd',-1.7,.546,z,groundInterior);
box(2.1,.018,1.1,'#c5ccb5',-5.7,.555,1.05,groundInterior);
box(.38,.025,.18,'#a6b8aa',-3.6,1.68,-2.55,groundInterior);
for(let x of [-4.7,-4.15,-3.6,-3.05])box(.035,.62,.02,'#c1ad8e',x,1.02,-2.24,groundInterior);
cylinder(.23,.19,.43,'#cdb696',-6.9,.77,-5.3,groundInterior);
for(let i=0;i<5;i++){const a=i*2.4;sphere(.23,'#83a06a',-6.9+Math.cos(a)*.16,1.22,-5.3+Math.sin(a)*.16,groundInterior,.6,1.6,.7);}
box(1.5,.7,.04,'#d5c9ac',-5.2,2.15,-6,groundInterior);
box(1.37,.58,.03,'#a8bbaa',-5.2,2.15,-5.97,groundInterior);
let startUpper=scene.children.length;
// Split the slabs to leave a real opening for the staircase.
for(const [x,z,w,d] of [[-2.8,-2.1,10.25,8.5],[4.2,-2.1,.65,8.5],[3.05,-4.15,1.45,4.4],[3.05,1.6,1.45,1.1]]){
 box(w,.19,d,palette.white,x,3.66,z);box(w,.16,d,'#e8e3d2',x,3.84,z).userData.walkFloor=1;
}
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
collect(startUpper,upperMeshes);
function frontWindow(x,z=1.966,w=1.25,y=2.25,h=1.85){box(w+.16,h+.16,.1,palette.white,x,y,z);box(w,h,.04,palette.glass,x,y,z+.065);box(.045,h,.05,'#d8e7dc',x,y,z+.1);box(w,.045,.05,'#d8e7dc',x,y+.3,z+.1);box(w+.22,.1,.22,palette.trim,x,y-h/2,z+.06);}
startFacade=scene.children.length;
[-6.55,-4.85,1.3,3.05].forEach(x=>frontWindow(x));
for(let z=-5;z<1;z+=1.9){box(.06,1.85,1.3,palette.glass,4.33,2.25,z);box(.08,1.85,.05,palette.white,4.38,2.25,z);box(.26,.1,1.5,palette.trim,4.4,1.29,z)}
collect(startFacade,facadeMeshes);startUpper=scene.children.length;
for(let x=-6.5;x<4;x+=1.6){box(1.4,1.4,.06,palette.glass,x,5.4,-6);box(.055,1.45,.08,palette.white,x,5.4,-5.95)}
for(let z=-5.1;z<1;z+=1.7){box(.06,1.4,1.4,palette.glass,-7.5,5.4,z);box(.08,1.45,.045,palette.white,-7.45,5.4,z)}
collect(startUpper,upperMeshes);startFacade=scene.children.length;
// Purple identity tower and covered entrance.
box(2.05,5.35,.56,palette.purple,-3.05,3.05,2.08);
box(2.18,.13,.7,'#ac98af',-3.05,5.78,2.08);
box(.32,1.1,.09,palette.white,-3.05,4.6,2.42);box(1.05,.32,.09,palette.white,-3.05,4.6,2.42);
const hospitalName=label('BORGO CLINIC',1.8,'#fff9ec');hospitalName.position.set(-3.05,3.64,2.424);scene.add(hospitalName);
const entryLeft=box(1.1,2.25,.06,'#779ca3',-1.23,1.58,2.02);
const entryRight=box(1.1,2.25,.06,'#779ca3',-.07,1.58,2.02);
entryLeft.userData.door=true;entryRight.userData.door=true;
box(.065,2.3,.1,palette.white,-.65,1.58,2.1);
box(2.65,.11,1.8,palette.white,-.65,.49,2.8);
box(3.05,.22,2.05,palette.purple,-.65,3.22,2.85);box(2.75,.08,1.83,palette.white,-.65,3.36,2.85);
for(const x of [-2.06,.76])box(.13,2.7,.13,palette.purple,x,1.87,3.7);
for(const x of [-1.55,.25])box(.035,.3,.06,'#d5d5c0',x,1.4,2.15);
collect(startFacade,facadeMeshes);startUpper=scene.children.length;
// Rooms: beds, folded blankets, monitors, desks and a stocked pharmacy.
function bed(x,z){box(1.35,.15,2.1,'#bcc7c0',x,4.32,z);box(1.3,.28,1.95,'#faf9ed',x,4.51,z);box(1.28,.06,1.05,'#8cb9ba',x,4.7,z+.4);box(.8,.14,.43,'#fffdf3',x,4.72,z-.65);box(1.4,.65,.1,'#d2ddcd',x,4.43,z-1.03);for(let dx of [-.53,.53])for(let dz of [-.8,.8])cylinder(.035,.035,.45,'#9eafa5',x+dx,4.11,z+dz);box(.5,.55,.55,palette.white,x+1,4.21,z-.6);box(.34,.28,.06,'#3b665d',x+1,4.75,z-.6);box(.25,.015,.015,'#9ad0a3',x+1,4.78,z-.56)}
let exhibitStart=scene.children.length;bed(-5.5,-3.5);scene.children.slice(exhibitStart).forEach(m=>m.userData.exhibit='bed');bed(-3,-3.5);
box(2.6,.14,.8,palette.white,1,4.78,-3.5);for(let x of [0,2])box(.1,.8,.65,palette.trim,x,4.3,-3.5);
const pcMonitor=box(.55,.4,.06,'#566d70',.6,5.05,-3.65);pcMonitor.userData.exhibit='pc';box(.06,.12,.08,'#617b76',.6,4.81,-3.65);
box(.48,.04,.22,'#c1cac1',.6,4.88,-3.3);
exhibitStart=scene.children.length;
for(let x of [0,1.5,3]){box(1.23,1.6,.35,'#f8f4e7',x,4.9,-5.75);for(let y of [4.4,4.85,5.3]){box(1.2,.05,.4,'#c9cbbd',x,y,-5.57);for(let j=0;j<5;j++)box(.1,.19+Math.random()*.08,.12,['#98b9ab','#c9a19a','#96b1bf','#d5c183'][j%4],x-.45+j*.2,y+.14,-5.53)}}
scene.children.slice(exhibitStart).forEach(m=>m.userData.exhibit='library');
function chair(x,z){box(.52,.1,.5,'#7b9e95',x,4.35,z);box(.52,.45,.1,'#7b9e95',x,4.6,z+.24);cylinder(.05,.05,.4,'#71817a',x,4.1,z);box(.6,.04,.08,'#71817a',x,3.94,z);box(.08,.04,.6,'#71817a',x,3.94,z)}chair(.7,-2.4);
collect(startUpper,upperMeshes);
// Fourteen warm stone steps connect the two navigable storeys.
const stairGroup=new THREE.Group();scene.add(stairGroup);
for(let i=0;i<14;i++){const t=(i+1)/14,y=.51+3.45*t,z=1.15-3.4*t;box(1.38,.14,.27,'#d0bc9b',3.05,y-.07,z,stairGroup);box(1.38,.025,.05,'#f5e5c5',3.05,y+.01,z+.11,stairGroup);}
function railing(x){for(let i=0;i<=7;i++){const t=i/7,y=.51+3.45*t,z=1.15-3.4*t;cylinder(.025,.025,.74,'#9c977b',x,y+.37,z,stairGroup);}const a=new THREE.Vector3(x,1.3,1.15),b=new THREE.Vector3(x,4.75,-2.25),delta=b.clone().sub(a);const rail=cylinder(.04,.04,delta.length(),'#9c977b',0,0,0,stairGroup);rail.position.copy(a.add(b).multiplyScalar(.5));rail.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());}railing(2.34);railing(3.76);
groundInterior.visible=false;
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
startUpper=scene.children.length;pot(-6.8,3.96,.9);pot(-1.8,3.96,-5.4);pot(3.6,3.96,.9);collect(startUpper,upperMeshes);pot(-2.5,.4,3.1,.37);pot(1.25,.4,2.8,.37);
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
// Input, guided routes and floor-aware exploration.
let route=[], floor=0, viewFloor=1, pendingExhibit=null, onStairs=false;
const discovered=new Set(), keys=new Set();
let zoom=1, sunset=false, elapsed=0, distance=0, lastZone='';
const helpDialog=document.querySelector('#instructions');
const exhibitDialog=document.querySelector('#exhibit-dialog');
const paused=()=>helpDialog.open||exhibitDialog.open;
function resize(){
 const aspect=innerWidth/innerHeight,extent=innerWidth<600?27.5:15;
 renderer.setSize(innerWidth,innerHeight);
 camera.left=-extent*aspect;camera.right=extent*aspect;camera.top=extent;camera.bottom=-extent;camera.zoom=zoom;camera.updateProjectionMatrix();
 const target=innerWidth<600?new THREE.Vector3(-.5,1.2,-.5):new THREE.Vector3(-4.7,1.5,.9);
 camera.position.copy(target).add(new THREE.Vector3(22,25,31));camera.lookAt(target);camera.updateMatrixWorld();
}
window.addEventListener('resize',resize);resize();
function setZoom(v){zoom=THREE.MathUtils.clamp(v,.65,1.9);camera.zoom=zoom;camera.updateProjectionMatrix()}
canvas.addEventListener('wheel',e=>{e.preventDefault();setZoom(zoom-e.deltaY*.001)},{passive:false});
document.querySelector('#zoom-in').onclick=()=>setZoom(zoom+.12);document.querySelector('#zoom-out').onclick=()=>setZoom(zoom-.12);
function blocked(x,z){return floor===1?blockedUpper(x,z):blockedGround(x,z,obstacles)}
const destination=new THREE.Mesh(new THREE.RingGeometry(.23,.29,40),new THREE.MeshBasicMaterial({color:'#bd765c',side:THREE.DoubleSide,transparent:true,opacity:.85}));
destination.rotation.x=-Math.PI/2;destination.visible=false;scene.add(destination);
function cancelRoute(){route=[];pendingExhibit=null;destination.visible=false;}
const valid=['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d','Shift'];
window.addEventListener('keydown',e=>{
 if(valid.includes(e.key)&&!paused()){
  e.preventDefault();if(onStairs&&e.key!=='Shift')return;
  if(e.key!=='Shift')cancelRoute();keys.add(e.key);
 }
});
window.addEventListener('keyup',e=>keys.delete(e.key));window.addEventListener('blur',()=>keys.clear());document.addEventListener('visibilitychange',()=>keys.clear());
for(const b of document.querySelectorAll('[data-key]')){
 b.addEventListener('pointerdown',e=>{e.preventDefault();if(onStairs||paused())return;b.setPointerCapture(e.pointerId);cancelRoute();keys.add(b.dataset.key)});
 for(const ev of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,()=>keys.delete(b.dataset.key));
}
let toastTimer;
function toast(text){const el=document.querySelector('#toast');el.textContent=text;el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),4500)}
function travel(goal,targetFloor,exhibit=null){
 if(paused())return;
 const path=onStairs?makeStairJourney(player.g.position,targetFloor,goal,obstacles):makeJourney(player.g.position,floor,goal,targetFloor,obstacles);
 if(!path){toast('That spot is not reachable. Choose a clear spot.');return;}
 keys.clear();route=path;pendingExhibit=exhibit;
 destination.position.set(goal.x,targetFloor===1?3.98:(insideBuilding(goal.x,goal.z)?.56:.32),goal.z);destination.visible=true;
 if(targetFloor!==floor)toast(targetFloor===1?'Heading to the first floor via the indoor stairs.':'Heading downstairs to reception.');
 else if(exhibit)toast('Let’s discover: '+exhibit.title.toLowerCase()+'.');
}
const markerElements=[];
function marker({id,title,number,anchor,onClick,type='exhibit'}){
 const b=document.createElement('button');b.className='world-marker '+type;b.dataset.point=id;b.setAttribute('aria-label',title);
 b.innerHTML=`<span class="marker-dot">${number}</span><span class="marker-name">${title}</span>`;
 b.onclick=onClick;document.querySelector('#world-markers').append(b);markerElements.push({b,anchor,type,id});return b;
}
for(const item of exhibits)marker({id:item.id,title:item.title,number:item.number,anchor:item.anchor,onClick:()=>travel(item.goal,item.floor,item)});
const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();let pointerStart=null;
canvas.style.cursor='crosshair';
canvas.addEventListener('pointerdown',e=>{if(e.button===0)pointerStart={x:e.clientX,y:e.clientY}});
canvas.addEventListener('pointercancel',()=>pointerStart=null);
canvas.addEventListener('pointerup',e=>{
 if(!pointerStart||Math.hypot(e.clientX-pointerStart.x,e.clientY-pointerStart.y)>8){pointerStart=null;return;}
 pointerStart=null;if(paused())return;
 const rect=canvas.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);
 const hits=raycaster.intersectObjects(scene.children,true).filter(h=>{let o=h.object;while(o){if(!o.visible)return false;o=o.parent;}return h.object!==destination;});
 const exhibitHit=hits[0]?.object.userData.exhibit;
 if(exhibitHit){const item=exhibits.find(x=>x.id===exhibitHit);travel(item.goal,1,item);return;}
 if(hits[0]?.object.userData.door){travel({x:-.65,z:.7},0);return;}
 if(hits[0]&&hits[0].object.parent===stairGroup){
  // Clicking the visible staircase follows it naturally to the other landing.
  travel(floor===0?{x:1.55,z:-1.35}:{x:3.05,z:1.15},floor===0?1:0);return;
 }
 // Pick the visible walkable surface, not the plane of the player's current
 // floor. A pavement click from upstairs therefore means "walk outside".
 const surface=hits.find(h=>h.object.userData.walkFloor!==undefined&&h.face?.normal.y>.5);
 if(!surface){toast('Choose a clear spot on the floor or path.');return;}
 const targetFloor=surface.object.userData.walkFloor;
 const interior=surface.object.parent===groundInterior;
 const height=targetFloor===1?3.96:interior?.56:.31;
 const target=new THREE.Vector3();
 if(!raycaster.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),-height),target))return;
 const isBlocked=targetFloor===1?blockedUpper(target.x,target.z):blockedGround(target.x,target.z,obstacles);
 if(isBlocked){toast('That spot is occupied. Choose a clear part of the floor.');return;}
 travel({x:target.x,z:target.z},targetFloor);
});
function openExhibit(item){
 cancelRoute();keys.clear();discovered.add(item.id);
 document.querySelector('#exhibit-number').textContent=item.number;
 document.querySelector('#exhibit-category').textContent=item.category;
 document.querySelector('#exhibit-title').textContent=item.title;
 document.querySelector('#exhibit-subtitle').textContent=item.subtitle;
 document.querySelector('#exhibit-dialog').dataset.kind=item.icon;
 document.querySelector('#exhibit-progress').textContent=`${discovered.size} of 3 technologies explored`;
 document.querySelector('#discovery-count').textContent=`${discovered.size} / 3`;
 document.querySelector(`[data-point="${item.id}"]`).classList.add('discovered');
 document.querySelector('#exhibit-art').innerHTML=exhibitArtwork(item.icon);
 exhibitDialog.showModal();document.querySelector('#close-exhibit').focus();
}
function exhibitArtwork(kind){
 const start='<svg viewBox="0 0 420 360" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><ellipse cx="215" cy="290" rx="155" ry="27" fill="#334c3d" opacity=".08"/>';
 const shapes={
 computer:'<path d="M92 87 270 49 335 95 156 135Z" fill="#d6dccc"/><path d="M92 87 156 135 156 251 92 204Z" fill="#8ba49a"/><path d="M156 135 335 95 335 211 156 251Z" fill="#f9f9e9"/><path d="m171 147 148-33v85l-148 33z" fill="#577e7a"/><path d="m187 169 55-12m-55 25 92-20m-92 35 72-16" stroke="#b1d0b6" stroke-width="5" stroke-linecap="round"/><path d="m230 239 25-6v35l-25 6z" fill="#b5bca8"/><path d="m196 274 59-13 32 20-61 14z" fill="#d2d8c4"/><path d="m150 280 57-13 83 49-62 14z" fill="#f9f9e9"/><path d="m171 284 47-9 49 29-47 10z" fill="#a6b6a5"/><circle cx="305" cy="69" r="24" fill="#cf8167"/><path d="m296 69 6 6 12-13" stroke="#fff7df" stroke-width="3"/>',
 bed:'<path d="m73 185 151-84 140 87-155 87z" fill="#9daf9c"/><path d="m73 185 136 83v30L73 215z" fill="#d5d8c3"/><path d="m209 268 155-81v29l-155 82z" fill="#f8f5e7"/><path d="m84 169 140-78 129 80-143 81z" fill="#fff9e8"/><path d="m129 172 142-79 82 78-143 81z" fill="#8eb3a9"/><path d="m100 151 40-23 48 28-41 25z" fill="#fffef3"/><path d="m78 158 3-62 63 38v64z" fill="#c4cfbc"/><path d="m87 112 51 31" stroke="#e7e9d4" stroke-width="5"/><path d="m93 228 1 29m240-34v30" stroke="#879e8c" stroke-width="9"/><circle cx="298" cy="83" r="29" fill="#cf8167"/><path d="M283 83h9l5-12 6 24 5-12h9" stroke="#fff7df" stroke-width="3"/>',
 library:'<path d="m105 96 161-42 61 43-161 44z" fill="#e4d8bc"/><path d="m105 96 61 45v157l-61-44z" fill="#b7ad8c"/><path d="m166 141 161-44v158l-161 43z" fill="#f6f0dc"/><path d="m179 152 135-36v126l-135 36z" fill="#8c9f8b"/><path d="m179 195 135-37m-135 79 135-37" stroke="#eee4c9" stroke-width="8"/><path d="m190 153v34m15-38v34m19-39v34m22-40v34m18-40v34m20-40v34m19-39v34" stroke="#d3b08f" stroke-width="10"/><path d="m192 205v28m20-33v28m22-34v28m22-34v28m23-34v28m22-34v28" stroke="#b9c9b0" stroke-width="12"/><path d="m192 246v27m20-32v27m20-32v27m21-32v27m22-33v27m22-33v27" stroke="#cf9c84" stroke-width="11"/><circle cx="306" cy="65" r="24" fill="#cf8167"/><path d="M296 56h8v17h-8zm11 0h8v17h-8z" stroke="#fff7df" stroke-width="2"/>'
 };return start+shapes[kind]+'</svg>';
}
document.querySelector('#close-exhibit').onclick=document.querySelector('#return-explore').onclick=()=>exhibitDialog.close();
exhibitDialog.addEventListener('close',()=>{keys.clear();document.querySelector('[data-point="'+(exhibits.find(e=>e.title===document.querySelector('#exhibit-title').textContent)?.id||'pc')+'"]').focus({preventScroll:true});});
document.querySelector('#reset').onclick=()=>{player.g.position.set(-4,.31,4.3);floor=0;onStairs=false;cancelRoute();keys.clear();toast('Back at the clinic entrance.')};
document.querySelector('#help').onclick=()=>{keys.clear();helpDialog.showModal()};document.querySelector('#close-help').onclick=document.querySelector('#explore').onclick=()=>helpDialog.close();
document.querySelector('#light').onclick=()=>{sunset=!sunset;sun.color.set(sunset?'#ffc391':'#fff0d7');sun.intensity=sunset?3.2:4.2;sun.position.set(sunset?-25:-14,sunset?12:25,10);hemi.color.set(sunset?'#e6c8b9':'#fff5de');scene.background.set(sunset?'#e9dfd2':'#e8eee8');ground.material=material(sunset?'#e9dfd2':'#e8eee8');document.querySelector('#time').textContent=sunset?'18:42':'10:24';document.querySelector('.scene-info small').textContent=sunset?'The light turns golden':'A spring morning'};
let audioCtx,audioGain,soundOn=false;
document.querySelector('#sound').onclick=async()=>{
 if(!audioCtx){audioCtx=new AudioContext();audioGain=audioCtx.createGain();audioGain.gain.value=0;audioGain.connect(audioCtx.destination);const buffer=audioCtx.createBuffer(1,audioCtx.sampleRate*3,audioCtx.sampleRate),data=buffer.getChannelData(0);let v=0;for(let i=0;i<data.length;i++){v=(v+Math.random()*.02-.01)*.98;data[i]=v}const source=audioCtx.createBufferSource();source.buffer=buffer;source.loop=true;const filter=audioCtx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=700;source.connect(filter).connect(audioGain);source.start()}
 await audioCtx.resume();soundOn=!soundOn;audioGain.gain.setTargetAtTime(soundOn?.35:0,audioCtx.currentTime,.4);document.querySelector('#sound span').textContent=soundOn?'Sound on':'Sound off';
};
const right=new THREE.Vector3(),forward=new THREE.Vector3(),clock=new THREE.Clock();let ready=false;
function groundY(x,z){return insideBuilding(x,z)||x>-1.55&&x<.3&&z<3.7&&z>1.3?.56:.31}
function updateView(){
 const inside=insideBuilding(player.g.position.x,player.g.position.z);
 viewFloor=onStairs?(player.g.position.y>3.4?1:0):(floor===1||!inside?1:0);
 upperMeshes.forEach(m=>m.visible=viewFloor===1);facadeMeshes.forEach(m=>m.visible=viewFloor===1);groundInterior.visible=viewFloor===0;
 people.filter(p=>!p.controlled&&p.g.position.y>3).forEach(p=>p.g.visible=viewFloor===1);
 const nearDoor=floor===0&&Math.hypot(player.g.position.x+.65,player.g.position.z-2)<2;
 entryLeft.position.x=nearDoor?-2.2:-1.23;entryRight.position.x=nearDoor?.9:-.07;
 document.querySelector('#current-floor').textContent=onStairs?'On the indoor stairs':floor===1?'First floor · Care and knowledge':inside?'Ground floor · Reception':'The neighborhood · Outdoors';
 for(const {b,anchor,type,id} of markerElements){
  const show=viewFloor===1;
  b.hidden=!show;if(!show)continue;
  const p=new THREE.Vector3(anchor.x,anchor.y+Math.sin(elapsed*1.7)*.035,anchor.z).project(camera);
  b.style.left=(p.x+1)*innerWidth/2+'px';b.style.top=(1-p.y)*innerHeight/2+'px';
  b.classList.toggle('is-target',pendingExhibit?.id===id);
 }
}
function animate(){
 requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.05);elapsed+=dt;
 let moving=false;
 if(!paused()){
  const dx=(keys.has('ArrowRight')||keys.has('d')?1:0)-(keys.has('ArrowLeft')||keys.has('a')?1:0),dz=(keys.has('ArrowUp')||keys.has('w')?1:0)-(keys.has('ArrowDown')||keys.has('s')?1:0);
  right.setFromMatrixColumn(camera.matrixWorld,0);right.y=0;right.normalize();forward.crossVectors(new THREE.Vector3(0,1,0),right).normalize();
  const direction=right.clone().multiplyScalar(dx).addScaledVector(forward,dz),speed=keys.has('Shift')?3.8:2.4;
  if(route.length){
   const next=route[0];onStairs=Boolean(next.stair);
   const targetY=next.stair?next.y:next.floor===1?3.96:groundY(next.x,next.z);
   const delta=new THREE.Vector3(next.x-player.g.position.x,targetY-player.g.position.y,next.z-player.g.position.z),length=delta.length();
   if(length<.035){
    player.g.position.set(next.x,targetY,next.z);if(next.floor!==undefined)floor=next.floor;route.shift();
    if(!route.length){onStairs=false;destination.visible=false;if(pendingExhibit){const item=pendingExhibit;pendingExhibit=null;openExhibit(item);}}
   }else{
    delta.normalize();const stride=Math.min(speed*dt,length),proposed=player.g.position.clone().addScaledVector(delta,stride);
    if(next.stair||!blocked(proposed.x,proposed.z)){player.g.position.copy(proposed);moving=true;distance+=stride;player.g.rotation.y=Math.atan2(delta.x,delta.z)}
    else{cancelRoute();onStairs=false;toast('The way is blocked. Choose another spot.');}
   }
  }else if(direction.lengthSq()){
   direction.normalize();const stride=speed*dt,nx=player.g.position.x+direction.x*stride,nz=player.g.position.z+direction.z*stride;
   if(!blocked(nx,player.g.position.z))player.g.position.x=nx;if(!blocked(player.g.position.x,nz))player.g.position.z=nz;
   player.g.position.y=floor===1?3.96:groundY(player.g.position.x,player.g.position.z);player.g.rotation.y=Math.atan2(direction.x,direction.z);moving=true;distance+=stride;
   const landing=floor===0?STAIR_BOTTOM:STAIR_TOP;
   if(Math.hypot(player.g.position.x-landing.x,player.g.position.z-landing.z)<.42&&(floor===0?direction.z<-.2:direction.z>.2))travel(floor===0?{x:1.55,z:-1.35}:{x:-.65,z:.7},1-floor);
  }
 }
 if(!route.length)destination.visible=false;
 document.querySelector('#activity').textContent=onStairs?(floor===0?'Heading upstairs':'Heading downstairs'):moving?'Exploring · '+Math.floor(distance)+' m':'Ready to discover';
 player.moving=moving;player.g.userData.marker.position.y=1.85+Math.sin(elapsed*2)*.07;
 for(const p of people){
  if(p.path.length){const t=p.path[p.target],x=t[0]-p.g.position.x,z=t[1]-p.g.position.z,len=Math.hypot(x,z);if(len<.12)p.target=(p.target+1)%p.path.length;else{p.g.position.x+=x/len*p.speed*dt;p.g.position.z+=z/len*p.speed*dt;p.g.rotation.y=Math.atan2(x,z)}p.moving=true}
  const walk=p.moving?Math.sin(elapsed*(p.controlled&&keys.has('Shift')?13:8)+p.phase)*.5:Math.sin(elapsed*1.5+p.phase)*.025;
  p.limbs.forEach((limb,i)=>limb.rotation.x=walk*(i===0||i===3?1:-1));p.body.position.y=p.moving?Math.abs(Math.sin(elapsed*8+p.phase))*.025:Math.sin(elapsed*1.6+p.phase)*.009;
 }
 updateView();renderer.render(scene,camera);
 if(!ready){ready=true;document.querySelector('#loading').style.opacity='0';setTimeout(()=>document.querySelector('#loading').remove(),800);setTimeout(()=>toast('Click where you want to go: inside, outside or upstairs.'),1000);window.__BORGO_READY__=true;}
}
window.borgo={
 projectGround(x,z,y=.31){const p=new THREE.Vector3(x,y,z).project(camera);return{x:(p.x+1)*innerWidth/2,y:(1-p.y)*innerHeight/2}},
 get destination(){return route.length?{...route.at(-1)}:null},get player(){return{x:player.g.position.x,y:player.g.position.y,z:player.g.position.z,floor}},
 get inhabitants(){return people.length},get obstacles(){return obstacles.length},get ready(){return ready},get onStairs(){return onStairs},get viewFloor(){return viewFloor},get discovered(){return [...discovered]}
};
animate();
