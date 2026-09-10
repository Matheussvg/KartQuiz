(()=>{
 const $=s=>document.querySelector(s),defaults={color:'#ff4d64',body:'sport',wheels:'standard',wing:'sport',character:'driver'};
 let saved;try{saved=JSON.parse(localStorage.getItem('kart-style-v6'));}catch{}
 window.kartStyle={...defaults,...(saved&&typeof saved==='object'?saved:{})};
 if(!/^#[0-9a-f]{6}$/i.test(window.kartStyle.color))window.kartStyle.color=defaults.color;
 for(const [key,allowed] of Object.entries({character:['driver','monkey','turtle','rabbit'],body:['sport','buggy','classic','italian','monster','formula'],wheels:['standard','wide','offroad','monster','neon','retro'],wing:['none','sport','double']}))if(!allowed.includes(window.kartStyle[key]))window.kartStyle[key]=defaults[key];
 let renderer,scene,camera,kart,open=false;
 const fields={color:$('#kartColor'),body:$('#kartBody'),wheels:$('#kartWheels'),wing:$('#kartWing'),character:$('#kartCharacter')};
 const getDraft=()=>Object.fromEntries(Object.entries(fields).map(([k,e])=>[k,e.value]));
 function rebuild(){if(kart){scene.remove(kart);disposeKart(kart);}kart=buildKart(getDraft());scene.add(kart);$('#garageSaved').textContent='';}
 function size(){if(!renderer)return;const c=$('#garageCanvas');renderer.setSize(c.clientWidth,c.clientHeight,false);camera.aspect=c.clientWidth/c.clientHeight;camera.updateProjectionMatrix();}
 function init(){renderer=new THREE.WebGLRenderer({canvas:$('#garageCanvas'),antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(38,1,1,500);camera.position.set(83,56,88);camera.lookAt(0,17,0);scene.add(new THREE.HemisphereLight(0xe5f4ff,0x465663,1));const light=new THREE.DirectionalLight(0xfff1df,1.1);light.position.set(30,60,50);scene.add(light);const floor=new THREE.Mesh(new THREE.CylinderGeometry(31,33,2,64),new THREE.MeshPhongMaterial({color:0x2d485a,shininess:70}));floor.position.y=-2;scene.add(floor);const ring=new THREE.Mesh(new THREE.TorusGeometry(32,.4,8,64),new THREE.MeshBasicMaterial({color:0xc5ff54}));ring.rotation.x=Math.PI/2;ring.position.y=-.7;scene.add(ring);}
 function frame(t){if(!open)return;if(kart)kart.rotation.y=t*.00025;renderer.render(scene,camera);requestAnimationFrame(frame);}
 for(const b of document.querySelectorAll('.garageOpen'))b.onclick=()=>{for(const [k,e]of Object.entries(fields))e.value=window.kartStyle[k];$('#garage').classList.remove('hidden');$('#lobby').inert=true;open=true;if(!renderer)init();rebuild();size();requestAnimationFrame(frame);$('#garageClose').focus();};
 window.closeGarage=()=>{open=false;$('#garage').classList.add('hidden');$('#lobby').inert=false;};
 $('#garageClose').onclick=window.closeGarage;
 $('#garageSave').onclick=()=>{window.kartStyle=getDraft();let persisted=true;try{localStorage.setItem('kart-style-v6',JSON.stringify(window.kartStyle));}catch{persisted=false;}window.dispatchEvent(new Event('kart-customized'));$('#garageSaved').textContent=persisted?'Kart salvo! Pronto para a largada.':'Kart aplicado nesta sessão.';};
 for(const e of Object.values(fields))e.addEventListener('input',rebuild);
 addEventListener('resize',size);addEventListener('keydown',e=>{if(e.key==='Escape'&&open)window.closeGarage();});
})();
