
const API = ""; 
const PIECES = [1,2,3,4,5,6,7,8];  
const JP = {1: "歩",2: "香",3: "桂",4: "銀",5: "金",6: "角",7: "飛",8: "王"};
const AXIS_X = ["９","８","７","６","５","４","３","２","１"]; 
const AXIS_Y = ["一","二","三","四","五","六","七","八","九"];
const paletteEl = document.getElementById("palette");
const boardEl   = document.getElementById("board");
const toastEl   = document.getElementById("toast");
const refreshEl = document.getElementById("refresh");
const resetEl   = document.getElementById("reset");
const handBEl   = document.getElementById("hand-black");
const handWEl   = document.getElementById("hand-white");
const axisXEl   = document.getElementById("axis-x");
const axisYEl   = document.getElementById("axis-y");
let selectedPiece = 1;
let lastMove = null; 
function showToast(msg){
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  setTimeout(()=>toastEl.classList.remove("show"), 1200);
}
function cellId(x,y){ return `cell-${x}-${y}`; }
function cellEl(x,y){ return document.getElementById(cellId(x,y)); }
function renderBoard(data){
  boardEl.innerHTML = "";
  for(let y=0; y<9; y++){
    for(let x=0; x<9; x++){
      const v = data.board[y][x];               
      const div = document.createElement("div");
      div.className = "cell";
      div.id = cellId(x,y);
      const n = Number(v);                    
      if (Number.isFinite(n) && n !== 0) {      
        const kind = Math.abs(n);                
        const label = JP[kind] ?? "?";           
        div.textContent = label;
        if (n < 0) div.classList.add("gote");    
        else       div.classList.remove("gote"); 
      } else {
        div.textContent = "";                    
        div.classList.remove("gote");            
      }
      if (lastMove && lastMove.x===x && lastMove.y===y) {
        div.classList.add("lastmove");
      }
      div.addEventListener("click", ()=> onClickCell(x,y));
      boardEl.appendChild(div);
    }
  }
  const toLabel = v => {
    const n = Number(v);
    if (Number.isFinite(n) && n !== 0) return JP[Math.abs(n)] ?? String(v);
    return String(v ?? "");
  };
  handBEl.textContent = (data.captured.black || []).map(toLabel).join(" ");
  handWEl.textContent = (data.captured.white || []).map(toLabel).join(" ");
}
function renderPalette(){
  paletteEl.innerHTML = "";
  for (const p of PIECES){
    const btn = document.createElement("button");
    btn.className = "piece-btn" + (p===selectedPiece ? " active" : "");
    btn.textContent = `${JP[p]} (${p})`;
    btn.addEventListener("click", ()=>{
      selectedPiece = p;
      document.querySelectorAll(".piece-btn").forEach(b=>b.classList.remove("active"));
      btn.classList.add("active");
      showToast(`${JP[p]} を選択`);
    });
    paletteEl.appendChild(btn);
  }
}
function renderAxes(){
  axisXEl.innerHTML = "";
  AXIS_X.forEach(lbl=>{
    const d = document.createElement("div");
    d.className = "lbl";
    d.textContent = lbl;
    axisXEl.appendChild(d);
  });
  axisYEl.innerHTML = "";
  AXIS_Y.forEach(lbl=>{
    const d = document.createElement("div");
    d.className = "lbl";
    d.textContent = lbl;
    axisYEl.appendChild(d);
  });
}
async function fetchBoard(){
  const res = await fetch(`${API}/board`);
  if(!res.ok) throw new Error("GET /board failed");
  const data = await res.json();
  renderBoard(data);
}
async function place(x,y,pieceID){
  const res = await fetch(`${API}/place`, {
    method:"POST",
    headers:{ "content-type":"application/json" },
    body: JSON.stringify({ x, y, piece:String(pieceID) })
  });
  if(!res.ok){
    const err = await res.json().catch(()=>({detail:""}));
    showToast(`× 配置失敗: ${err.detail || res.statusText}`);
    return;
  }
  lastMove = {x,y};
  showToast(`◯ ${JP[pieceID]??pieceID} を ${x},${y} に配置`);
  await fetchBoard();
}
async function resetBoard(){
  const res = await fetch(`${API}/reset`, { method:"DELETE" });
  if(res.ok){
    lastMove = null;
    showToast("盤をリセットしました");
    await fetchBoard();
  }else{
    showToast("× リセット失敗");
  }
}
// 攻守切替卍マジ卍
async function  chnside(){
const res = await fetch(`${API}/chnside`,{method:""})



}
function onClickCell(x,y){
  const cell = cellEl(x,y);
  cell.classList.add("selected");
  place(x,y,selectedPiece).finally(()=>{
      setTimeout(()=>cell.classList.remove("selected"), 200);
  });
}
renderPalette();
renderAxes();
refreshEl.addEventListener("click", fetchBoard);
resetEl.addEventListener("click", resetBoard);
fetchBoard().catch(e=>{
  console.error(e);
  showToast("サーバが起動しているか確認してください");
});
