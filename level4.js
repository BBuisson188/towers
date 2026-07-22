"use strict";

const $=id=>document.getElementById(id);
const params=new URLSearchParams(location.search);
const playerTeam=params.get("team")==="blue"?"blue":"red";
const bossTeam=playerTeam==="blue"?"red":"blue";
const difficulty=["easy","medium","hard"].includes(params.get("difficulty"))?params.get("difficulty"):"medium";
const DIFFICULTY={
  easy:{warning:2.7,interval:3.8,bossDamage:.95},
  medium:{warning:2.1,interval:2.5,bossDamage:1.25},
  hard:{warning:1.5,interval:1.6,bossDamage:1.65}
}[difficulty];
const C={towerHp:150,zoneHp:420,coreHp:850,towerDamage:7,towerRate:1.45,soldierHp:150,soldierDamage:4,soldierRate:1.15,smashDamage:34,smashRate:1.25,soldierTravel:7.5,shieldUses:4,shieldDuration:5,shieldCooldown:8};
const DEFAULT_LAYOUT={
  boss:{x:0.375092867756315,y:0.4197494033412888,scale:.33},
  towers:[[0.54322209653092,0.7563265752625438],[0.6132400075414781,0.7240008751458576],[0.6755161199095022,0.6953216161026837],[0.7355297888386124,0.6673351808634772],[0.8037330316742082,0.7334816219369895],[0.7372737556561086,0.7754886231038507],[0.6669966063348416,0.8121535880980163],[0.5902384992458521,0.8553274504084014]]
};
const BOSS_DATA={
  blue:{
    name:"THE BLUE GIANT",
    shortName:"Blue Giant",
    idle:"assets/blue-giant.png",
    damaged:"assets/boss/giant-right-arm-destroyed.png",
    slam:"assets/boss/giant-slam.png",
    special:"Megalodon",
    specialArt:"assets/red-megalodon.png",
    labels:{leftFist:"QUAKE FIST",roar:"PRIMAL ROAR",spines:"CRYSTAL SPINES",rightFist:"CRYSTAL FIST",core:"EXPOSED CORE"}
  },
  red:{
    name:"THE RED MEGALODON",
    shortName:"Red Megalodon",
    idle:"assets/red-megalodon.png",
    damaged:"assets/red-megalodon.png",
    slam:"assets/red-megalodon.png",
    special:"Giant",
    specialArt:"assets/blue-giant.png",
    labels:{leftFist:"TAIL SHOCKWAVE",roar:"VOID ROAR",spines:"DORSAL MISSILES",rightFist:"PLASMA JAWS",core:"EXPOSED CORE"}
  }
};
const bossData=BOSS_DATA[bossTeam];
const soldierAsset=(pose,frame=0)=>"assets/soldiers/"+playerTeam+"-"+pose+(frame?"-"+(frame+1):"")+".png";
const soldierPreloads=[["walk-away",0],["walk-away",1],["walk-away",2],["walk-side",0],["walk-side",1],["walk-side",2],["attack-fire",0],["attack-smash",0]].map(([pose,frame])=>{const image=new Image();image.src=soldierAsset(pose,frame);return image});
const stage=$("boss-stage");
const bossVisual=$("boss-visual");
const towerField=$("tower-field");
const soldierField=$("soldier-field");
const effects=$("battle-effects");
const nodes=[...document.querySelectorAll(".target-node")];
const nodeByZone=Object.fromEntries(nodes.map(node=>[node.dataset.zone,node]));
const ui={
  count:$("tower-count"),team:$("player-team-label"),bossName:$("boss-name"),coreLabel:$("core-label"),coreFill:$("core-fill"),alert:$("boss-alert"),
  selectedLabel:$("selected-label"),selectedState:$("selected-state"),deploy:$("deploy-button"),special:$("special-button"),shield:$("shield-button"),
  pause:$("pause-button"),briefing:$("battle-briefing"),briefingTitle:$("briefing-title"),start:$("start-button"),pauseMenu:$("pause-menu"),
  resume:$("resume-button"),result:$("result-menu"),resultTitle:$("result-title"),resultKicker:$("result-kicker"),resultDetail:$("result-detail"),restart:$("restart-button")
};
let layout=readLayout();
let towers=[];
let soldiers=[];
let state={phase:"briefing",time:0,lastFrame:performance.now(),selectedUnit:null,pendingZone:null,currentZone:"leftFist",nextBossAttack:0,attack:null,lastBossAttack:null,roarUntil:0,shieldUses:C.shieldUses,shieldReadyAt:0,specialUsed:0,nextSoldier:1,events:[]};

const zones={
  leftFist:{hp:C.zoneHp,maxHp:C.zoneHp,alive:true},
  roar:{hp:C.zoneHp,maxHp:C.zoneHp,alive:true},
  spines:{hp:C.zoneHp,maxHp:C.zoneHp,alive:true},
  rightFist:{hp:C.zoneHp,maxHp:C.zoneHp,alive:true},
  core:{hp:C.coreHp,maxHp:C.coreHp,alive:true,locked:true}
};

function cloneDefault(){return JSON.parse(JSON.stringify(DEFAULT_LAYOUT))}

function validLayout(value){
  return value&&value.boss&&Array.isArray(value.towers)&&value.towers.length===8&&
    [value.boss.x,value.boss.y,value.boss.scale].every(Number.isFinite)&&
    value.towers.every(point=>Array.isArray(point)&&point.length===2&&point.every(Number.isFinite));
}

function readLayout(){
  try{
    const value=JSON.parse(localStorage.getItem("towerBattleBossLayout"));
    return validLayout(value)?value:cloneDefault();
  }catch{
    return cloneDefault();
  }
}

function placeBoss(){
  const boss=layout.boss;
  const scale=bossTeam==="red"?Math.min(.7,boss.scale*1.22):boss.scale;
  const heightFraction=scale*window.innerWidth/(1.5*window.innerHeight);
  stage.style.left=(boss.x-scale/2)*100+"%";
  stage.style.top=(boss.y-heightFraction)*100+"%";
  stage.style.width=scale*100+"%";
}

function configureFaction(){
  document.body.classList.toggle("player-blue",playerTeam==="blue");
  stage.classList.toggle("megalodon",bossTeam==="red");
  ui.team.textContent=playerTeam.toUpperCase();
  ui.bossName.textContent=bossData.name;
  ui.briefingTitle.textContent=bossData.shortName;
  $("boss-idle").src=bossData.idle;
  $("boss-damaged").src=bossData.damaged;
  $("boss-slam").src=bossData.slam;
  for(const [zone,label] of Object.entries(bossData.labels)){
    const node=nodeByZone[zone];
    if(node)node.querySelector("span").textContent=label;
  }
}

function createTowers(){
  towerField.replaceChildren();
  towers=layout.towers.map(([x,y],index)=>{
    const el=document.createElement("div");
    const img=document.createElement("img");
    const health=document.createElement("span");
    const fill=document.createElement("i");
    el.className="battle-tower";
    el.style.left=x*100+"%";
    el.style.top=y*100+"%";
    el.dataset.id="T"+(index+1);
    img.src=playerTeam==="blue"?"assets/blue-tower.png":"assets/red-tower.png";
    img.alt="";
    health.className="unit-health";
    health.append(fill);
    el.append(img,health);
    towerField.append(el);
    const tower={id:"T"+(index+1),kind:"tower",x,y,hp:C.towerHp,maxHp:C.towerHp,alive:true,target:"leftFist",nextFire:.4+index*.11,soldierId:null,rearmAt:0,shieldUntil:0,el,fill};
    el.addEventListener("pointerdown",event=>{event.preventDefault();selectUnit(tower)});
    return tower;
  });
}

function unitCenter(unit){
  const rect=unit.el.getBoundingClientRect();
  return{x:rect.left+rect.width/2,y:rect.top+rect.height*.4};
}

function nodeCenter(zone){
  const rect=nodeByZone[zone].getBoundingClientRect();
  return{x:rect.left+rect.width/2,y:rect.top+rect.height/2};
}

function lineEffect(className,from,to,life=700){
  const line=document.createElement("i");
  const dx=to.x-from.x,dy=to.y-from.y;
  line.className=className;
  line.style.left=from.x+"px";
  line.style.top=from.y+"px";
  line.style.width=Math.hypot(dx,dy)+"px";
  line.style.setProperty("--angle",Math.atan2(dy,dx)+"rad");
  effects.append(line);
  window.setTimeout(()=>line.remove(),life);
  return line;
}

function impactAt(point){
  const ring=document.createElement("i");
  ring.className="impact-ring";
  ring.style.left=point.x+"px";
  ring.style.top=point.y+"px";
  effects.append(ring);
  window.setTimeout(()=>ring.remove(),700);
}
function damagePop(point,value,hostile=false){
  const pop=document.createElement("span");
  pop.className="damage-pop"+(hostile?" hostile":"");
  pop.textContent=typeof value==="number"?"-"+Math.round(value):value;
  pop.style.left=point.x+"px";
  pop.style.top=point.y+"px";
  effects.append(pop);
  window.setTimeout(()=>pop.remove(),850);
}

function schedule(delay,action){
  state.events.push({at:state.time+delay,action});
}

function updateEvents(){
  const ready=state.events.filter(event=>event.at<=state.time);
  state.events=state.events.filter(event=>event.at>state.time);
  for(const event of ready)event.action();
}

function updateUnitHealth(unit){
  unit.fill.style.width=Math.max(0,unit.hp/unit.maxHp*100)+"%";
}

function selectUnit(unit){
  if(state.phase!=="playing"||!unit.alive)return;
  if(state.selectedUnit)state.selectedUnit.el.classList.remove("selected");
  state.selectedUnit=unit;
  unit.el.classList.add("selected");
  if(state.pendingZone&&targetAvailable(state.pendingZone)){
    assignTarget(unit,state.pendingZone);
    state.currentZone=state.pendingZone;
    state.pendingZone=null;
  }
  updateHud();
}

function targetAvailable(zone){
  const target=zones[zone];
  return target&&target.alive&&(zone!=="core"||!target.locked);
}

function selectZone(zone){
  if(state.phase!=="playing"||!targetAvailable(zone))return;
  state.currentZone=zone;
  for(const node of nodes)node.classList.toggle("selected",node.dataset.zone===zone);
  if(state.selectedUnit){
    assignTarget(state.selectedUnit,zone);
    state.pendingZone=null;
  }else{
    state.pendingZone=zone;
  }
  updateHud();
}

function nextTarget(){
  return ["leftFist","rightFist","spines","roar"].find(targetAvailable)||(targetAvailable("core")?"core":null);
}

function setSoldierPose(soldier,pose,frame=0){
  const poseKey=pose+":"+frame;
  if(soldier.poseKey===poseKey)return;
  soldier.pose=pose;
  soldier.poseKey=poseKey;
  soldier.sprite.src=soldierAsset(pose,frame);
}

function assignTarget(unit,target){
  if(!unit||unit.target===target)return;
  if(unit.kind==="soldier"){
    unit.routeStartX=unit.x;
    unit.routeStartY=unit.y;
    unit.progress=0;
    unit.routeLeg++;
    setSoldierPose(unit,"walk-side");
    unit.nextFire=Math.max(unit.nextFire,state.time+.2);
  }
  unit.target=target;
}

function targetFor(unit){
  if(targetAvailable(unit.target))return unit.target;
  const target=nextTarget();
  if(target)assignTarget(unit,target);
  return target;
}

function createSoldier(tower){
  const el=document.createElement("div");
  const sprite=document.createElement("img");
  const health=document.createElement("span");
  const fill=document.createElement("i");
  sprite.className="soldier-sprite";
  sprite.src=soldierAsset("walk-away");
  sprite.alt="";
  health.className="unit-health";
  health.append(fill);
  el.className="battle-soldier";
  el.append(sprite,health);
  soldierField.append(el);
  const soldier={id:"S"+state.nextSoldier++,kind:"soldier",source:tower,x:tower.x,y:tower.y,routeStartX:tower.x,routeStartY:tower.y,routeLeg:0,hp:C.soldierHp,maxHp:C.soldierHp,alive:true,target:targetFor(tower)||"leftFist",progress:0,nextFire:state.time+.3,nextSmash:state.time+1,shieldUntil:0,attackFrame:0,pose:"walk-away",poseKey:"walk-away:0",el,sprite,fill};
  tower.soldierId=soldier.id;
  soldiers.push(soldier);
  el.addEventListener("pointerdown",event=>{event.preventDefault();selectUnit(soldier)});
  positionSoldier(soldier);
  selectUnit(soldier);
}

function positionSoldier(soldier){
  const target=targetFor(soldier);
  if(!target)return;
  const targetPoint=nodeCenter(target);
  const arenaRect=$("arena").getBoundingClientRect();
  const tx=(targetPoint.x-arenaRect.left)/arenaRect.width;
  const ty=(targetPoint.y-arenaRect.top)/arenaRect.height;
  const eased=1-Math.pow(1-soldier.progress,1.35);
  soldier.x=soldier.routeStartX+(tx-soldier.routeStartX)*eased;
  soldier.y=soldier.routeStartY+(ty-soldier.routeStartY)*eased;
  soldier.el.style.left=soldier.x*100+"%";
  soldier.el.style.top=soldier.y*100+"%";
}

function deploySoldier(){
  const unit=state.selectedUnit;
  if(state.phase!=="playing"||!unit||unit.kind!=="tower"||!unit.alive||unit.soldierId)return;
  createSoldier(unit);
  updateHud();
}

function destroyUnit(unit){
  if(!unit.alive)return;
  unit.alive=false;
  unit.el.classList.add("destroyed");
  if(unit.kind==="tower"){
    if(unit.soldierId){
      const soldier=soldiers.find(item=>item.id===unit.soldierId&&item.alive);
      if(soldier)destroyUnit(soldier);
    }
    updateSpecials();
    if(towers.every(tower=>!tower.alive))endBattle(false);
  }else{
    unit.source.soldierId=null;
    unit.source.rearmAt=state.time+3;
    window.setTimeout(()=>unit.el.remove(),450);
  }
  if(state.selectedUnit===unit)state.selectedUnit=null;
  updateHud();
}

function damageUnit(unit,amount){
  if(!unit||!unit.alive)return;
  if(unit.shieldUntil>state.time){
    impactAt(unitCenter(unit));
    damagePop(unitCenter(unit),"BLOCKED",true);
    return;
  }
  unit.hp=Math.max(0,unit.hp-amount);
  unit.el.classList.remove("under-attack");
  unit.el.classList.add("hit");
  window.setTimeout(()=>unit.el.classList.remove("hit"),430);
  updateUnitHealth(unit);
  impactAt(unitCenter(unit));
  damagePop(unitCenter(unit),amount,true);
  if(unit.hp<=0)destroyUnit(unit);
}

function damageZone(zone,amount){
  if(state.phase!=="playing"||!targetAvailable(zone))return;
  const target=zones[zone];
  target.hp=Math.max(0,target.hp-amount);
  stage.classList.add("hit");
  window.setTimeout(()=>stage.classList.remove("hit"),480);
  impactAt(nodeCenter(zone));
  damagePop(nodeCenter(zone),amount);
  if(target.hp<=0){
    target.alive=false;
    nodeByZone[zone].classList.add("destroyed");
    if(zone==="core"){
      endBattle(true);
    }else if(["leftFist","rightFist","spines","roar"].every(key=>!zones[key].alive)){
      zones.core.locked=false;
      nodeByZone.core.classList.remove("hidden");
      state.currentZone="core";
      for(const tower of towers)if(tower.alive)tower.target="core";
      for(const soldier of soldiers)if(soldier.alive)assignTarget(soldier,"core");
    }
  }
  renderBossHealth();
}

function renderBossHealth(){
  for(const [zone,target] of Object.entries(zones)){
    const node=nodeByZone[zone];
    if(!node)continue;
    node.querySelector("b").style.width=Math.max(0,target.hp/target.maxHp*100)+"%";
    node.classList.toggle("damaged",target.alive&&target.hp/target.maxHp<=.55);
    node.classList.toggle("critical",target.alive&&target.hp/target.maxHp<=.25);
  }
  stage.classList.toggle("arm-damaged",bossTeam==="blue"&&zones.rightFist.hp/zones.rightFist.maxHp<=.55);
  stage.classList.toggle("system-critical",Object.values(zones).some(zone=>zone.alive&&zone.hp/zone.maxHp<=.25));
  if(zones.core.locked){
    ui.coreLabel.textContent="CORE LOCKED";
    ui.coreFill.style.width="100%";
  }else{
    ui.coreLabel.textContent="CORE "+Math.ceil(zones.core.hp/zones.core.maxHp*100)+"%";
    ui.coreFill.style.width=Math.max(0,zones.core.hp/zones.core.maxHp*100)+"%";
  }
  if(!targetAvailable(state.currentZone)){
    const target=nextTarget();
    if(target)selectZone(target);
  }
  updateHud();
}

function fireAtZone(unit,damage){
  const target=targetFor(unit);
  if(!target)return;
  lineEffect("energy-shot",unitCenter(unit),nodeCenter(target),430);
  schedule(.3,()=>damageZone(target,damage));
}

function updateTowers(){
  if(state.time<state.roarUntil)return;
  for(const tower of towers){
    if(!tower.alive)continue;
    const unavailable=tower.soldierId||state.time<tower.rearmAt;
    tower.el.classList.toggle("weapon-offline",Boolean(unavailable));
    if(unavailable||state.time<tower.nextFire)continue;
    tower.nextFire=state.time+C.towerRate;
    fireAtZone(tower,C.towerDamage);
  }
}

function updateSoldiers(dt){
  for(const soldier of soldiers){
    if(!soldier.alive)continue;
    const target=targetFor(soldier);
    if(!target){
      soldier.el.classList.remove("walking");
      continue;
    }
    soldier.el.classList.toggle("walking",soldier.progress<1);
    if(soldier.progress<1){
      soldier.progress=Math.min(1,soldier.progress+dt/C.soldierTravel);
      setSoldierPose(soldier,soldier.routeLeg?"walk-side":"walk-away",Math.floor(state.time/.15)%3);
      positionSoldier(soldier);
      if(soldier.progress>=1){
        setSoldierPose(soldier,"attack-fire");
      }
      if(state.time>=soldier.nextFire){
        soldier.nextFire=state.time+C.soldierRate;
        fireAtZone(soldier,C.soldierDamage);
      }
    }else if(state.time>=soldier.nextSmash){
      soldier.nextSmash=state.time+C.smashRate;
      soldier.attackFrame=1-soldier.attackFrame;
      setSoldierPose(soldier,soldier.attackFrame?"attack-smash":"attack-fire");
      soldier.el.classList.add("smashing");
      window.setTimeout(()=>soldier.el.classList.remove("smashing"),420);
      stage.classList.add("hit");
      window.setTimeout(()=>stage.classList.remove("hit"),480);
      damageZone(soldier.target,C.smashDamage);
      impactAt(nodeCenter(soldier.target));
    }
  }
}

function livingUnits(includeSoldiers=true){
  const units=towers.filter(tower=>tower.alive);
  return includeSoldiers?units.concat(soldiers.filter(soldier=>soldier.alive)):units;
}

function chooseTargets(zone){
  const towersAlive=towers.filter(tower=>tower.alive);
  const all=livingUnits(true);
  const shuffled=list=>list.slice().sort(()=>Math.random()-.5);
  const byHealth=towersAlive.slice().sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp);
  const focusChance=difficulty==="hard"?.95:difficulty==="medium"?.82:.55;
  const primary=Math.random()<focusChance?byHealth[0]:shuffled(towersAlive)[0];
  const otherTowers=towersAlive.filter(unit=>unit!==primary);
  const otherUnits=all.filter(unit=>unit!==primary);
  if(zone==="leftFist")return [primary,...shuffled(otherTowers).slice(0,1)].filter(Boolean);
  if(zone==="spines")return [primary,...shuffled(otherUnits).slice(0,2)].filter(Boolean);
  if(zone==="rightFist")return primary?[primary]:[];
  if(zone==="core")return [primary,...shuffled(otherTowers).slice(0,1)].filter(Boolean);
  return towersAlive;
}

function startBossTelegraph(){
  let attacks=["leftFist","rightFist","spines","roar"].filter(key=>zones[key].alive);
  if(!attacks.length&&!zones.core.locked&&zones.core.alive)attacks=["core"];
  if(!attacks.length)return;
  if(attacks.length>1)attacks=attacks.filter(key=>key!==state.lastBossAttack);
  const zone=attacks[Math.floor(Math.random()*attacks.length)];
  const targets=chooseTargets(zone);
  const warnings=[];
  nodeByZone[zone].classList.add("telegraphed");
  for(const unit of targets){
    unit.el.classList.add("under-attack");
    const warning=lineEffect("warning-line",nodeCenter(zone),unitCenter(unit),DIFFICULTY.warning*1000+200);
    warnings.push(warning);
  }
  ui.alert.textContent=bossData.labels[zone]+" CHARGING";
  ui.alert.classList.remove("hidden","strike");
  state.attack={zone,targets,warnings,executeAt:state.time+DIFFICULTY.warning};
}

function missileEffect(from,unit){
  const target=unitCenter(unit);
  const missile=document.createElement("i");
  missile.className="crystal-missile";
  missile.style.left=from.x+"px";
  missile.style.top=from.y+"px";
  missile.style.setProperty("--dx",target.x-from.x+"px");
  missile.style.setProperty("--dy",target.y-from.y+"px");
  effects.append(missile);
  window.setTimeout(()=>missile.remove(),900);
}

function executeBossAttack(){
  const attack=state.attack;
  if(!attack)return;
  nodeByZone[attack.zone].classList.remove("telegraphed");
  for(const warning of attack.warnings)warning.remove();
  for(const unit of attack.targets)unit.el.classList.remove("under-attack");
  ui.alert.textContent=bossData.labels[attack.zone]+" ATTACKS";
  ui.alert.classList.add("strike");
  window.setTimeout(()=>ui.alert.classList.add("hidden"),1000);
  const destroyedSystems=["leftFist","rightFist","spines","roar"].filter(zone=>!zones[zone].alive).length;
  const multiplier=DIFFICULTY.bossDamage*(1+Math.min(3,destroyedSystems)*.1);
  stage.classList.add("attacking");
  window.setTimeout(()=>stage.classList.remove("attacking"),1150);
  if(attack.zone==="leftFist"){
    const from=nodeCenter(attack.zone);
    for(const unit of attack.targets){
      lineEffect("ground-wave",from,unitCenter(unit),680);
      schedule(.48,()=>damageUnit(unit,36*multiplier));
    }
  }else if(attack.zone==="rightFist"){
    const from=nodeCenter(attack.zone);
    for(const unit of attack.targets){
      lineEffect("boss-beam",from,unitCenter(unit),760);
      schedule(.36,()=>damageUnit(unit,60*multiplier));
    }
  }else if(attack.zone==="spines"){
    const from=nodeCenter(attack.zone);
    for(const unit of attack.targets){
      missileEffect(from,unit);
      schedule(.74,()=>damageUnit(unit,27*multiplier));
    }
  }else if(attack.zone==="roar"){
    const wave=document.createElement("i");
    wave.className="roar-wave";
    effects.append(wave);
    window.setTimeout(()=>wave.remove(),1100);
    state.roarUntil=state.time+3;
    for(const tower of towers)if(tower.alive){
      tower.el.classList.add("weapon-offline");
      schedule(.62,()=>damageUnit(tower,10*multiplier));
    }
  }else{
    const from=nodeCenter("core");
    for(const unit of attack.targets){
      lineEffect("boss-beam",from,unitCenter(unit),820);
      schedule(.4,()=>damageUnit(unit,34*multiplier));
    }
  }
  state.lastBossAttack=attack.zone;
  state.attack=null;
  state.nextBossAttack=state.time+DIFFICULTY.interval;
}

function updateBoss(){
  if(state.attack&&state.time>=state.attack.executeAt)executeBossAttack();
  if(!state.attack&&state.time>=state.nextBossAttack)startBossTelegraph();
}

function activateShield(){
  const unit=state.selectedUnit;
  if(state.phase!=="playing"||!unit||!unit.alive||state.shieldUses<=0||state.time<state.shieldReadyAt)return;
  state.shieldUses--;
  state.shieldReadyAt=state.time+C.shieldCooldown;
  unit.shieldUntil=state.time+C.shieldDuration;
  let bubble=unit.el.querySelector(".shield-bubble");
  if(!bubble){
    bubble=document.createElement("i");
    bubble.className="shield-bubble";
    unit.el.append(bubble);
  }
  updateHud();
}

function updateShields(){
  for(const unit of livingUnits(true)){
    const bubble=unit.el.querySelector(".shield-bubble");
    if(bubble&&unit.shieldUntil<=state.time)bubble.remove();
  }
}

function specialsAvailable(){
  const lost=towers.filter(tower=>!tower.alive).length;
  return Math.max(0,Math.floor(lost/2)-state.specialUsed);
}

function updateSpecials(){
  updateHud();
}

function launchSpecial(){
  const charges=specialsAvailable();
  const zone=targetAvailable(state.currentZone)?state.currentZone:nextTarget();
  if(state.phase!=="playing"||charges<=0||!zone)return;
  state.specialUsed++;
  const art=document.createElement("img");
  art.className="special-fly";
  art.src=bossData.specialArt;
  art.alt="";
  effects.append(art);
  const target=nodeCenter(zone);
  const start={x:window.innerWidth*.93,y:window.innerHeight*.82};
  art.style.left=start.x+"px";
  art.style.top=start.y+"px";
  const animation=art.animate([
    {transform:"translate(-50%,-50%) scale(.2)",opacity:0},
    {transform:"translate(-50%,-50%) scale(.55)",opacity:1,offset:.18},
    {transform:"translate("+(target.x-start.x)+"px,"+(target.y-start.y)+"px) translate(-50%,-50%) scale(.42)",opacity:1,offset:.82},
    {transform:"translate("+(target.x-start.x)+"px,"+(target.y-start.y)+"px) translate(-50%,-50%) scale(.2)",opacity:0}
  ],{duration:1350,easing:"cubic-bezier(.2,.72,.25,1)"});
  animation.finished.then(()=>{
    art.remove();
    stage.classList.add("special-hit");
    window.setTimeout(()=>stage.classList.remove("special-hit"),900);
    const resolved=targetAvailable(zone)?zone:nextTarget();
    if(resolved)damageZone(resolved,zones[resolved].maxHp*.45);
  });
  updateHud();
}

function updateHud(){
  const alive=towers.filter(tower=>tower.alive).length;
  ui.count.textContent=String(alive);
  const current=zones[state.currentZone];
  ui.selectedLabel.textContent=current?"TARGET: "+bossData.labels[state.currentZone]:"NO TARGET";
  if(state.selectedUnit){
    const target=bossData.labels[state.selectedUnit.target]||"AUTO TARGET";
    ui.selectedState.textContent=state.selectedUnit.id+" selected - attacking "+target+".";
  }else if(state.pendingZone){
    ui.selectedState.textContent="Now tap one of your towers or soldiers.";
  }else{
    ui.selectedState.textContent="Select a tower and boss area in either order.";
  }
  const unit=state.selectedUnit;
  ui.deploy.disabled=state.phase!=="playing"||!unit||unit.kind!=="tower"||!unit.alive||Boolean(unit.soldierId);
  const charges=specialsAvailable();
  ui.special.disabled=state.phase!=="playing"||charges<=0||!targetAvailable(state.currentZone);
  ui.special.classList.toggle("ready",charges>0);
  ui.special.textContent=charges>0?"Deploy "+bossData.special+" ("+charges+")":bossData.special+" Locked";
  const shieldReady=state.phase==="playing"&&unit&&unit.alive&&state.shieldUses>0&&state.time>=state.shieldReadyAt;
  ui.shield.disabled=!shieldReady;
  ui.shield.classList.toggle("ready",Boolean(shieldReady));
  ui.shield.textContent=state.time<state.shieldReadyAt?"Shield "+Math.ceil(state.shieldReadyAt-state.time)+"s":"Shield "+state.shieldUses;
}

function startBattle(){
  state.phase="playing";
  state.lastFrame=performance.now();
  state.nextBossAttack=state.time+1.4;
  ui.briefing.classList.add("hidden");
  updateHud();
}

function pauseBattle(){
  if(state.phase!=="playing")return;
  state.phase="paused";
  ui.pauseMenu.classList.remove("hidden");
  updateHud();
}

function resumeBattle(){
  if(state.phase!=="paused")return;
  state.phase="playing";
  state.lastFrame=performance.now();
  ui.pauseMenu.classList.add("hidden");
  updateHud();
}

function endBattle(victory){
  if(state.phase==="result")return;
  state.phase="result";
  ui.result.classList.remove("hidden");
  ui.resultKicker.textContent=victory?"FINAL BOSS DEFEATED":"TOWER NETWORK LOST";
  ui.resultTitle.textContent=victory?"Victory":"Defeat";
  ui.resultDetail.textContent=victory?bossData.shortName+" has fallen. The final world is secure.":"Your towers were destroyed. Replay the final battle with a different targeting strategy.";
  updateHud();
}

function frame(now){
  const dt=Math.min(.05,Math.max(0,(now-state.lastFrame)/1000));
  state.lastFrame=now;
  if(state.phase==="playing"){
    state.time+=dt;
    updateTowers();
    updateEvents();
    updateSoldiers(dt);
    updateBoss();
    updateShields();
    updateHud();
  }
  requestAnimationFrame(frame);
}

for(const node of nodes)node.addEventListener("pointerdown",event=>{event.preventDefault();selectZone(node.dataset.zone)});
ui.deploy.addEventListener("click",deploySoldier);
ui.special.addEventListener("click",launchSpecial);
ui.shield.addEventListener("click",activateShield);
ui.start.addEventListener("click",startBattle);
ui.pause.addEventListener("click",pauseBattle);
ui.resume.addEventListener("click",resumeBattle);
ui.restart.addEventListener("click",()=>location.reload());
window.addEventListener("resize",placeBoss);
window.addEventListener("keydown",event=>{
  if(event.key==="Escape"){
    if(state.phase==="playing")pauseBattle();
    else if(state.phase==="paused")resumeBattle();
  }
});

configureFaction();
createTowers();
placeBoss();
renderBossHealth();
updateHud();
requestAnimationFrame(frame);
