window.createSeaNavigation=function({walk,clear,size}){
 const cell=10,cols=Math.ceil(size[0]/cell),rows=Math.ceil(size[1]/cell),count=cols*rows;
 const points=Array.from({length:count},(_,i)=>[(i%cols+.5)*cell,(Math.floor(i/cols)+.5)*cell]);
 const grid=Uint8Array.from(points,p=>walk(...p)?1:0),links=new Map();
 function edge(a,b){const k=Math.min(a,b)*count+Math.max(a,b);if(!links.has(k))links.set(k,clear(points[a],points[b]));return links.get(k);}
 function route(start,target,accept=null){
  if(accept?.({x:start[0],y:start[1]})&&walk(...start))return [];
  if(!accept&&walk(...target)&&clear(start,target))return [target];
  // Seed every visible nearby node; a globally nearest node could lie across a wall.
  const dist=new Float64Array(count).fill(Infinity),prev=new Int32Array(count).fill(-1),closed=new Uint8Array(count),heap=[];
  function push(i,cost){const priority=cost+(accept?0:Math.hypot(points[i][0]-target[0],points[i][1]-target[1]));let n=heap.length;heap.push([i,priority,cost]);while(n){const p=(n-1)>>1;if(heap[p][1]<=priority)break;heap[n]=heap[p];n=p;}heap[n]=[i,priority,cost];}
  function pop(){const top=heap[0],last=heap.pop();if(heap.length){let i=0;while(i*2+1<heap.length){let c=i*2+1;if(c+1<heap.length&&heap[c+1][1]<heap[c][1])c++;if(heap[c][1]>=last[1])break;heap[i]=heap[c];i=c;}heap[i]=last;}return [top[0],top[2]];}
  const candidates=[];for(let i=0;i<count;i++)if(grid[i]){const d=Math.hypot(points[i][0]-start[0],points[i][1]-start[1]);if(d<=28)candidates.push([i,d]);}
  for(const [i,d]of candidates)if(clear(start,points[i])){dist[i]=d;push(i,d);}
  if(!heap.length)return [];
  let best=-1,bestGap=Infinity,found=false;
  while(heap.length){const [i,cost]=pop();if(closed[i])continue;closed[i]=1;const p=points[i],gap=Math.hypot(p[0]-target[0],p[1]-target[1]);
   if(gap<bestGap-.001||Math.abs(gap-bestGap)<.001&&cost<dist[best]){best=i;bestGap=gap;}
   if(accept?.({x:p[0],y:p[1]})){best=i;found=true;break;}
   if(!accept&&gap<8&&walk(...target)&&clear(p,target)){best=i;found=true;break;}
   const x=i%cols,y=Math.floor(i/cols);
   for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){
    const nx=x+dx,ny=y+dy,j=ny*cols+nx;if(nx<0||ny<0||nx>=cols||ny>=rows||!grid[j]||closed[j])continue;
    if(dx&&dy&&(!grid[y*cols+nx]||!grid[ny*cols+x]))continue;
    const nd=cost+cell*Math.hypot(dx,dy);if(nd>=dist[j]||!edge(i,j))continue;dist[j]=nd;prev[j]=i;push(j,nd);
   }
  }
  if(best<0||accept&&!found)return [];
  const path=[];for(let i=best;i>=0;i=prev[i])path.push(points[i]);path.reverse();if(found&&!accept)path.push(target);
  const out=[];let from=start,i=0;while(i<path.length){let to=i;for(let j=path.length-1;j>i;j--)if(clear(from,path[j])){to=j;break;}out.push(path[to]);from=path[to];i=to+1;}
  return out.filter((p,i)=>i||Math.hypot(p[0]-start[0],p[1]-start[1])>.25);
 }
 return {route,grid,points};
};
