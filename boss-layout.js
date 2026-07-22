"use strict";

const STORAGE_KEY="towerBattleBossLayout";
const DEFAULT_LAYOUT={
  boss:{x:0.375092867756315,y:0.4197494033412888,scale:.33},
  towers:[[0.54322209653092,0.7563265752625438],[0.6132400075414781,0.7240008751458576],[0.6755161199095022,0.6953216161026837],[0.7355297888386124,0.6673351808634772],[0.8037330316742082,0.7334816219369895],[0.7372737556561086,0.7754886231038507],[0.6669966063348416,0.8121535880980163],[0.5902384992458521,0.8553274504084014]]
};
const stage=document.getElementById("layout-stage");
const bossPiece=document.getElementById("boss-piece");
const towerPieces=document.getElementById("tower-pieces");
const scaleInput=document.getElementById("boss-scale");
const scaleValue=document.getElementById("boss-scale-value");
const selectionName=document.getElementById("selection-name");
const message=document.getElementById("layout-message");
const resetButton=document.getElementById("reset-button");
const copyButton=document.getElementById("copy-button");
let layout=readLayout();
let drag=null;
let selectedPiece=bossPiece;

function cloneDefault(){
  return JSON.parse(JSON.stringify(DEFAULT_LAYOUT));
}

function validLayout(value){
  if(!value||!value.boss||!Array.isArray(value.towers)||value.towers.length!==8)return false;
  const boss=value.boss;
  const bossValid=[boss.x,boss.y,boss.scale].every(Number.isFinite)&&boss.x>=0&&boss.x<=1&&boss.y>=0&&boss.y<=1&&boss.scale>=.25&&boss.scale<=.7;
  return bossValid&&value.towers.every(point=>Array.isArray(point)&&point.length===2&&point.every(number=>Number.isFinite(number)&&number>=0&&number<=1));
}

function readLayout(){
  try{
    const saved=JSON.parse(localStorage.getItem(STORAGE_KEY));
    return validLayout(saved)?saved:cloneDefault();
  }catch{
    return cloneDefault();
  }
}

function saveLayout(){
  localStorage.setItem(STORAGE_KEY,JSON.stringify(layout));
}

function createTowers(){
  towerPieces.replaceChildren();
  layout.towers.forEach((_,index)=>{
    const piece=document.createElement("div");
    const tower=document.createElement("img");
    piece.className="place-piece place-tower";
    piece.dataset.kind="tower";
    piece.dataset.index=String(index);
    tower.src="assets/red-tower.png";
    tower.alt="";
    piece.append(tower);
    towerPieces.append(piece);
  });
}

function render(){
  bossPiece.style.left=layout.boss.x*100+"%";
  bossPiece.style.top=layout.boss.y*100+"%";
  bossPiece.style.setProperty("--boss-scale",layout.boss.scale);
  scaleInput.value=String(Math.round(layout.boss.scale*100));
  scaleValue.textContent=Math.round(layout.boss.scale*100)+"%";
  [...towerPieces.children].forEach((piece,index)=>{
    piece.style.left=layout.towers[index][0]*100+"%";
    piece.style.top=layout.towers[index][1]*100+"%";
  });
}

function selectPiece(piece){
  if(selectedPiece)selectedPiece.classList.remove("selected");
  selectedPiece=piece;
  piece.classList.add("selected");
  selectionName.textContent=piece.dataset.kind==="boss"?"BLUE GIANT":"RED TOWER "+(Number(piece.dataset.index)+1);
}

function startDrag(event){
  const piece=event.target.closest(".place-piece");
  if(!piece)return;
  event.preventDefault();
  selectPiece(piece);
  const rect=piece.getBoundingClientRect();
  drag={
    piece,
    kind:piece.dataset.kind,
    index:Number(piece.dataset.index),
    pointerId:event.pointerId,
    offsetX:rect.left+rect.width/2-event.clientX,
    offsetY:rect.bottom-event.clientY
  };
  stage.setPointerCapture(event.pointerId);
}

function moveDrag(event){
  if(!drag||drag.pointerId!==event.pointerId)return;
  event.preventDefault();
  const rect=stage.getBoundingClientRect();
  const x=Math.max(.025,Math.min(.975,(event.clientX+drag.offsetX-rect.left)/rect.width));
  const y=Math.max(drag.kind==="boss"?.16:.12,Math.min(.91,(event.clientY+drag.offsetY-rect.top)/rect.height));
  if(drag.kind==="boss"){
    layout.boss.x=x;
    layout.boss.y=y;
  }else{
    layout.towers[drag.index]=[x,y];
  }
  render();
}

function finishDrag(event){
  if(!drag||drag.pointerId!==event.pointerId)return;
  const name=drag.kind==="boss"?"Boss":"Tower "+(drag.index+1);
  drag=null;
  saveLayout();
  message.textContent=name+" placed. Layout saved.";
  if(stage.hasPointerCapture(event.pointerId))stage.releasePointerCapture(event.pointerId);
}

function changeScale(){
  layout.boss.scale=Number(scaleInput.value)/100;
  render();
  saveLayout();
  selectPiece(bossPiece);
  message.textContent="Boss size updated. Layout saved.";
}

function resetLayout(){
  layout=cloneDefault();
  createTowers();
  selectPiece(bossPiece);
  render();
  saveLayout();
  message.textContent="World 4 placement reset.";
}

async function copyLayout(){
  const text=JSON.stringify(layout,null,2);
  try{
    await navigator.clipboard.writeText(text);
    message.textContent="Boss layout copied.";
  }catch{
    message.textContent="Layout is saved and ready for Level 4.";
  }
}

stage.addEventListener("pointerdown",startDrag,{passive:false});
stage.addEventListener("pointermove",moveDrag,{passive:false});
stage.addEventListener("pointerup",finishDrag);
stage.addEventListener("pointercancel",finishDrag);
scaleInput.addEventListener("input",changeScale);
resetButton.addEventListener("click",resetLayout);
copyButton.addEventListener("click",copyLayout);
window.addEventListener("keydown",event=>{if(event.key==="Escape")location.href="index.html"});

createTowers();
selectPiece(bossPiece);
render();
