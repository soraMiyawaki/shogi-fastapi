// ==== 設定 ====
const API = ""; // 同一オリジンなので空でOK（例: fetch("/board")）
const PIECES = ["P","L","N","S","G","B","R","K"];
const JP = { P:"歩", L:"香", N:"桂", S:"銀", G:"金", B:"角", R:"飛", K:"王" };
const AXIS_X = ["９","８","７","６","５","４","３","２","１"]; // 将棋表記っぽく
const AXIS_Y = ["一","二","三","四","五","六","七","八","九"];

// ==== 要素参照 ====
const paletteEl = document.getElementById("palette");
const boardEl   = document.getElementById("board");
const toastEl   = document.getElementById("toast");
const refreshEl = document.getElementById("refresh");
const resetEl   = document.getElementById("reset");
const handBEl   = document.getElementById("hand-black");
const handWEl   = document.getElementById("hand-white");
const axisXEl   = document.getElementById("axis-x");
const axisYEl   = document.getElementById("axis-y");

// ==== 状態 ====
let selectedPiece = "P";
let lastMove = null; // {x,y}

// ==== ユーティリティ ====
function showToast(msg){
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  setTimeout(()=>toastEl.classList.remove("show"), 1200);
}

function cellId(x,y){ return `cell-${x}-${y}`; }
function cellEl(x,y){ return document.getElementById(cellId(x,y)); }

// ==== パレット作成 ====
function renderPalette(){
  paletteEl.innerHTML = "";
  for(const p of PIECES){
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

// ==== 盤面（座標ラベル） ====
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

// ==== 盤面描画 ====
function renderBoard(data){
  boardEl.innerHTML = "";
  for(let y=0; y<9; y++){
    for(let x=0; x<9; x++){
      const v = data.board[y][x];
      const div = document.createElement("div");
      div.className = "cell";
      div.id = cellId(x,y);
      // 駒表示
      if(v){ div.textContent = JP[v] ?? v; } else { div.textContent = ""; }
      // 最後の手のハイライト
      if(lastMove && lastMove.x===x && lastMove.y===y){
        div.classList.add("lastmove");
      }
      // クリック
      div.addEventListener("click", ()=> onClickCell(x,y));
      boardEl.appendChild(div);
    }
  }
  // 持ち駒
  handBEl.textContent = (data.captured.black || []).map(p=>JP[p]??p).join(" ");
  handWEl.textContent = (data.captured.white || []).map(p=>JP[p]??p).join(" ");
}

// ==== API ====
async function fetchBoard(){
  const res = await fetch(`${API}/board`);
  if(!res.ok) throw new Error("GET /board failed");
  const data = await res.json();
  renderBoard(data);
}

async function place(x,y,piece){
  const res = await fetch(`${API}/place`, {
    method:"POST",
    headers:{ "content-type":"application/json" },
    body: JSON.stringify({ x, y, piece })
  });
  if(!res.ok){
    const err = await res.json().catch(()=>({detail:""}));
    showToast(`× 配置失敗: ${err.detail || res.statusText}`);
    return;
  }
  lastMove = {x,y};
  showToast(`◯ ${JP[piece]??piece} を ${x},${y} に配置`);
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

// ==== ハンドラ ====
function onClickCell(x,y){
  const cell = cellEl(x,y);
  cell.classList.add("selected");
  place(x,y,selectedPiece).finally(()=>{
    // 軽い選択演出
    setTimeout(()=>cell.classList.remove("selected"), 200);
  });
}

// ==== 起動処理 ====
renderPalette();
renderAxes();
refreshEl.addEventListener("click", fetchBoard);
resetEl.addEventListener("click", resetBoard);
fetchBoard().catch(e=>{
  console.error(e);
  showToast("サーバが起動しているか確認してください");
});
