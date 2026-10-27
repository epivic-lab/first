import {test} from 'node:test';
import assert from 'node:assert/strict';
import {findPath} from '../src/navigation.js';
const blocked=(x,z)=>Math.abs(x)>11.6||Math.abs(z)>9.8||(Math.abs(x)<2&&Math.abs(z)<2);
test('routes around an obstacle and every segment stays clear',()=>{
 const start={x:-4,z:0},goal={x:4,z:0},path=findPath(start,goal,blocked);
 assert.ok(path?.length>1);assert.deepEqual(path.at(-1),goal);
 let previous=start;
 for(const p of path){for(let t=0;t<=1;t+=.005)assert.equal(blocked(previous.x+(p.x-previous.x)*t,previous.z+(p.z-previous.z)*t),false);previous=p;}
});
test('rejects blocked and disconnected destinations',()=>{
 assert.equal(findPath({x:-4,z:0},{x:0,z:0},blocked),null);
 assert.equal(findPath({x:-4,z:0},{x:4,z:0},(x,z)=>blocked(x,z)||Math.abs(x)<.4),null);
});
test('returns the exact destination on a clear direct route',()=>{
 const goal={x:-4,z:6};assert.deepEqual(findPath({x:-4,z:0},goal,blocked),[goal]);
});
