// A small grid search with swept collision checks, shared by clicks and tests.
export function findPath(start, goal, blocked) {
  if (blocked(goal.x, goal.z)) return null;
  const step = .3, minX = -11.4, minZ = -9.6, width = 77, height = 65;
  const cell = p => ({x: Math.max(0, Math.min(width-1, Math.round((p.x-minX)/step))), z: Math.max(0, Math.min(height-1, Math.round((p.z-minZ)/step)))});
  const point = c => ({x: minX+c.x*step, z: minZ+c.z*step});
  const id = c => c.z*width+c.x;
  const clear = (a,b) => {
    const count = Math.max(1, Math.ceil(Math.hypot(b.x-a.x,b.z-a.z)/.06));
    for(let i=1;i<=count;i++) if(blocked(a.x+(b.x-a.x)*i/count,a.z+(b.z-a.z)*i/count))return false;
    return true;
  };
  if(clear(start,goal))return [goal];
  const nearest = p => {
    const c=cell(p);let best=null, distance=Infinity;
    for(let dz=-2;dz<=2;dz++)for(let dx=-2;dx<=2;dx++){
      const n={x:c.x+dx,z:c.z+dz};if(n.x<0||n.z<0||n.x>=width||n.z>=height)continue;
      const q=point(n),d=Math.hypot(q.x-p.x,q.z-p.z);
      if(d<distance&&!blocked(q.x,q.z)&&clear(p,q)){best=n;distance=d;}
    }
    return best;
  };
  const from=nearest(start),to=nearest(goal);if(!from||!to)return null;
  const heuristic=c=>Math.hypot(c.x-to.x,c.z-to.z);
  const open=[{...from,g:0,f:heuristic(from)}],cost=new Map([[id(from),0]]),parents=new Map(),closed=new Set();
  while(open.length){
    open.sort((a,b)=>b.f-a.f);const current=open.pop(),key=id(current);
    if(closed.has(key))continue;
    if(key===id(to)){
      const path=[goal];let cursor=current;
      while(cursor){path.push(point(cursor));cursor=parents.get(id(cursor));}
      path.reverse();
      // Retain only corners that cannot safely be skipped.
      const smooth=[];let anchor=start,i=0;
      while(i<path.length){let j=i;while(j+1<path.length&&clear(anchor,path[j+1]))j++;smooth.push(path[j]);anchor=path[j];i=j+1;}
      return smooth;
    }
    closed.add(key);
    for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++){
      if(!dx&&!dz)continue;
      const n={x:current.x+dx,z:current.z+dz};
      if(n.x<0||n.z<0||n.x>=width||n.z>=height||closed.has(id(n)))continue;
      if(!clear(point(current),point(n)))continue;
      const g=current.g+Math.hypot(dx,dz);
      if(g>=(cost.get(id(n))??Infinity))continue;
      cost.set(id(n),g);parents.set(id(n),current);open.push({...n,g,f:g+heuristic(n)});
    }
  }
  return null;
}
