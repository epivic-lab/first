import { findPath } from './navigation.js';
export const FLOOR_HEIGHTS = [.51, 3.96];
export const STAIR_BOTTOM = {x:3.05,z:1.15};
export const STAIR_TOP = {x:3.05,z:-2.25};
export const insideBuilding = (x,z) => x>-7.35&&x<3.95&&z>-5.85&&z<1.7;
const rect=(x,z,cx,cz,w,d)=>Math.abs(x-cx)<w/2&&Math.abs(z-cz)<d/2;
export function blockedGround(x,z,outdoorObstacles=[]) {
  if(Math.abs(x)>11.6||Math.abs(z)>9.8)return true;
  if(rect(x,z,-1.7,-2.1,12.7,8.7)) {
    const entrance=x>-1.5&&x<.2&&z>1.35;
    if(!insideBuilding(x,z)&&!entrance)return true;
    if(rect(x,z,3.05,-.45,1.65,2.8))return true; // staircase, entered at its foot
    if(rect(x,z,-3.8,-2.8,3.1,1.5)||rect(x,z,-5.7,.2,2.8,.95))return true;
  }
  return outdoorObstacles.some(o=>Math.abs(x-o.x)<o.w&&Math.abs(z-o.z)<o.d);
}
export function blockedUpper(x,z) {
  if(x< -7.25||x>3.95||z< -5.45||z>1.5)return true;
  if(rect(x,z,3.05,-.45,1.65,2.8))return true;
  if(rect(x,z,-1.4,-3.3,.58,5.85)||rect(x,z,-6.5,-1.4,2.55,.58))return true;
  if(rect(x,z,-5.5,-3.5,1.8,2.55)||rect(x,z,-3,-3.5,1.8,2.55))return true;
  if(rect(x,z,1,-3.5,3.05,1.25)||rect(x,z,.7,-2.4,.95,.95))return true;
  if(rect(x,z,1.5,-5.75,4.8,.8))return true;
  return false;
}
export function makeJourney(start,level,goal,targetLevel,outdoorObstacles=[]) {
  const blocked=[(x,z)=>blockedGround(x,z,outdoorObstacles),blockedUpper];
  const leg=(from,to,floor)=>{
    const path=findPath(from,to,blocked[floor]);
    return path?.map(p=>({...p,floor}));
  };
  if(level===targetLevel)return leg(start,goal,level);
  const bottom=STAIR_BOTTOM,top=STAIR_TOP;
  const before=leg(start,level===0?bottom:top,level);
  const after=leg(level===0?top:bottom,goal,targetLevel);
  if(!before||!after)return null;
  const steps=[];
  for(let i=0;i<=18;i++){
    const t=level===0?i/18:1-i/18;
    steps.push({x:bottom.x,z:bottom.z+(top.z-bottom.z)*t,y:FLOOR_HEIGHTS[0]+(FLOOR_HEIGHTS[1]-FLOOR_HEIGHTS[0])*t,stair:true,...(i===18?{floor:targetLevel}:{})});
  }
  return [...before,...steps,...after];
}
export const exhibits=[
 {id:'pc',number:'01',title:'Il PC connesso',category:'SISTEMI DIGITALI',subtitle:'Dove le informazioni diventano cura.',icon:'computer',anchor:{x:.6,y:5.55,z:-3.65},goal:{x:-.25,z:-2.25},floor:1},
 {id:'bed',number:'02',title:'Il letto intelligente',category:'AMBIENTI DI CURA',subtitle:'La tecnologia, vicino alle persone.',icon:'bed',anchor:{x:-5.5,y:5.25,z:-3.5},goal:{x:-4.3,z:-3.25},floor:1},
 {id:'library',number:'03',title:'La libreria delle risorse',category:'CONOSCENZA CONDIVISA',subtitle:'Ogni risorsa al posto giusto.',icon:'library',anchor:{x:2,y:6.05,z:-5.6},goal:{x:1.65,z:-4.65},floor:1}
];
