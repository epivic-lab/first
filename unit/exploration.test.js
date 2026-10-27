import {test} from 'node:test';
import assert from 'node:assert/strict';
import {makeJourney,makeStairJourney,blockedGround,blockedUpper,exhibits} from '../src/exploration.js';
test('all three exhibits are reachable via the entrance and continuous stairs',()=>{
 for(const exhibit of exhibits){
  const path=makeJourney({x:-4,z:4.3},0,exhibit.goal,1);
  assert.ok(path,exhibit.id);const stairs=path.filter(p=>p.stair);
  assert.equal(stairs.length,19);assert.equal(stairs[0].y,.51);assert.equal(stairs.at(-1).y,3.96);
  for(let i=1;i<stairs.length;i++){assert.ok(stairs[i].y>stairs[i-1].y);assert.ok(stairs[i].z<stairs[i-1].z);}
  assert.deepEqual(path.at(-1),{...exhibit.goal,floor:1});
  const back=makeJourney(exhibit.goal,1,{x:-4,z:4.3},0);assert.ok(back,'return from '+exhibit.id);
 }
});
test('building can only be entered through the doorway and upstairs stays bounded',()=>{
 assert.equal(blockedGround(-4,2),true);assert.equal(blockedGround(-.65,2),false);
 assert.equal(blockedGround(4.2,-3),true);assert.equal(blockedUpper(5,0),true);
 assert.equal(blockedUpper(3.05,0),true);
 for(const exhibit of exhibits)assert.equal(blockedUpper(exhibit.goal.x,exhibit.goal.z),false);
});
test('upper-floor exhibits connect without revisiting the stairs',()=>{
 for(const a of exhibits)for(const b of exhibits){
  const route=makeJourney(a.goal,1,b.goal,1);assert.ok(route);assert.equal(route.some(p=>p.stair),false);
 }
});

test('can reverse on the stairs or continue to an upstairs destination',()=>{
 const start={x:3.05,y:2.235,z:-.55};
 for(const targetFloor of [0,1]){
  const goal=targetFloor===0?{x:-6,z:9.2}:{x:-4.3,z:-.3};
  const path=makeStairJourney(start,targetFloor,goal);assert.ok(path);
  const steps=path.filter(p=>p.stair);
  assert.ok(Math.abs(steps[0].y-start.y)<.25);
  for(let i=1;i<steps.length;i++)assert.ok(targetFloor===0?steps[i].y<steps[i-1].y:steps[i].y>steps[i-1].y);
  assert.equal(steps.at(-1).floor,targetFloor);assert.deepEqual(path.at(-1),{...goal,floor:targetFloor});
 }
});
