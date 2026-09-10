// Kart cartunesco compartilhado pela garagem e pela corrida.
window.buildKart = function(style={}) {
 const T=THREE,g=new T.Group(),color=style.color||'#ff4d64';
 const paint=new T.MeshPhongMaterial({color,shininess:85}), dark=new T.MeshPhongMaterial({color:0x182234,shininess:35}), white=new T.MeshPhongMaterial({color:0xf5f7ff,shininess:90}), chrome=new T.MeshPhongMaterial({color:0x9cbbd2,shininess:110}), rubber=new T.MeshLambertMaterial({color:0x151924});
 const add=(geo,mat,x,y,z)=>{const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;};
 const ball=(mat,x,y,z,sx,sy,sz)=>{const m=add(new T.SphereGeometry(1,20,12),mat,x,y,z);m.scale.set(sx,sy,sz);return m;};
 const box=(mat,x,y,z,sx,sy,sz)=>add(new T.BoxGeometry(sx,sy,sz),mat,x,y,z);
 const buggy=style.body==='buggy', classic=style.body==='classic';
 ball(paint,0,7,0,classic?16:15,buggy?5.5:4,10);
 box(dark,0,4,0,27,3,15);
 ball(paint,12,7,0,classic?8:10,3,classic?8:6);
 box(white,14,9,0,11,0.6,2.2);
 for(const side of [-1,1]) {
  ball(paint,-1,7,side*10,10,3,3.8);
  box(white,0,9.2,side*10,10,0.6,1.8);
  const pipe=add(new T.CylinderGeometry(1.4,1.4,7,12),chrome,-14,6,side*5);pipe.rotation.z=Math.PI/2;
 }
 box(dark,-5,10,0,8,9,9);
 const rimColor=style.wheels==='offroad'?0xffcf54:0xdce9f6;
 const rim=new T.MeshPhongMaterial({color:rimColor,shininess:100});
 const r=style.wheels==='offroad'?6.2:5.2, width=style.wheels==='wide'?6:4.5;
 g.userData.wheels=[];
 for(const x of [-10,11]) for(const side of [-1,1]) {
  const wg=new T.Group();wg.position.set(x,r,side*12);g.add(wg);
  const tire=new T.Mesh(new T.CylinderGeometry(r,r,width,20),rubber);tire.rotation.x=Math.PI/2;tire.castShadow=true;wg.add(tire);
  const hub=new T.Mesh(new T.CylinderGeometry(r*.55,r*.55,width+.3,12),rim);hub.rotation.x=Math.PI/2;wg.add(hub);
  for(let i=0;i<5;i++) {const spoke=new T.Mesh(new T.BoxGeometry(r*.8,1,width+.5),dark);spoke.rotation.z=i*Math.PI/5;wg.add(spoke);}
  if(style.wheels==='offroad') for(let i=0;i<12;i++){const a=i*Math.PI/6,tread=new T.Mesh(new T.BoxGeometry(2,1.3,width+.4),rubber);tread.position.set(Math.cos(a)*r,Math.sin(a)*r,0);tread.rotation.z=a-Math.PI/2;wg.add(tread);}
  g.userData.wheels.push(wg);
 }
 // Piloto de capacete com viseira, luvas e macacão.
 ball(paint,-3,14,0,4.2,5,4.5);
 ball(white,-4,22,0,6.2,6,6);
 ball(paint,-4.7,24,0,5.9,4.2,5.8);
 const visor=new T.MeshPhongMaterial({color:0x142941,shininess:140});
 ball(visor,1.2,22,0,1.8,2.5,4.9);
 for(const side of [-1,1]) {ball(white,3,14,side*4,2,2,2);box(paint,0,14,side*4,6,2.8,2.8);}
 const steer=add(new T.TorusGeometry(3.2,.55,8,16),dark,5,14,0);steer.rotation.y=Math.PI/2;steer.rotation.z=-.4;
 box(chrome,20,4,0,3,3,23);box(chrome,-17,4,0,3,3,23);
 if(style.wing!=='none') {
  for(const side of [-1,1]) box(chrome,-14,11,side*7,1.3,10,1.3);
  box(paint,-14,16,0,6,2,28);box(white,-14,17.1,0,3,.3,26);
  if(style.wing==='double') {box(paint,-14,21,0,6,1.5,28);for(const side of [-1,1])box(paint,-14,18,side*13,6,7,1.4);}
 }
 if(buggy) {const roll=add(new T.TorusGeometry(8,.9,8,16,Math.PI),chrome,-9,13,0);roll.rotation.y=Math.PI/2;}
 if(classic) for(const side of [-1,1])ball(white,18,8,side*5,1.5,2,2);
 const shield=new T.Mesh(new T.SphereGeometry(25,24,16),new T.MeshPhongMaterial({color:0x64ecff,transparent:true,opacity:.22,wireframe:false,depthWrite:false}));shield.position.y=12;shield.visible=false;g.add(shield);g.userData.shield=shield;
 const ice=new T.Group();for(let i=0;i<7;i++){const a=i/7*Math.PI*2,m=new T.Mesh(new T.ConeGeometry(2,10,5),new T.MeshPhongMaterial({color:0x99eaff,transparent:true,opacity:.8}));m.position.set(Math.cos(a)*17,8,Math.sin(a)*17);m.rotation.z=.35;ice.add(m);}ice.visible=false;g.add(ice);g.userData.ice=ice;
 return g;
};
window.disposeKart=function(g){if(!g)return;const geometries=new Set(),materials=new Set(),maps=new Set();g.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material]){materials.add(m);if(m.map)maps.add(m.map);}});geometries.forEach(x=>x.dispose());materials.forEach(x=>x.dispose());maps.forEach(x=>x.dispose());};
