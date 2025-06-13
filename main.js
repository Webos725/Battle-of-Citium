// --- 都市カード定義 ---
const cityCards = [
  { name: "東京", ability: { type: "attack", value: 3, desc: "指定プレイヤーに3ダメージ" } },
  { name: "堺", ability: { type: "reach", value: 4, desc: "リーチ4" } },
  { name: "大阪", ability: { type: "heal", value: 4, desc: "自分のHPを4回復" } },
  { name: "名古屋", ability: { type: "lifesteal", value: 2, desc: "指定プレイヤーに2ダメージ。半分回復" } },
  { name: "札幌", ability: { type: "defense", value: 3, desc: "次のターンまで受けるダメージを3軽減" } },
  { name: "福岡", ability: { type: "attack", value: 2, desc: "指定プレイヤーに2ダメージ" } },
  { name: "仙台", ability: { type: "heal", value: 3, desc: "自分のHPを3回復" } },
  { name: "広島", ability: { type: "reach", value: 2, desc: "指定プレイヤーに2ダメージ。次のターンにさらに2ダメージ" } },
  { name: "京都", ability: { type: "defense", value: 2, desc: "次のターンまで受けるダメージを2軽減" } },
  { name: "神戸", ability: { type: "attack", value: 3, desc: "指定プレイヤーに3ダメージ" } },
  { name: "横浜", ability: { type: "heal", value: 2, desc: "自分のHPを2回復" } },
];

// --- プレイヤー初期状態 ---
const players = [
  { id: 1, hp: 75, hand: [], defense: 0, reachDamage: 0, alive: true },
  { id: 2, hp: 75, hand: [], defense: 0, reachDamage: 0, alive: true },
  { id: 3, hp: 75, hand: [], defense: 0, reachDamage: 0, alive: true },
  { id: 4, hp: 75, hand: [], defense: 0, reachDamage: 0, alive: true },
];

// --- ゲーム状態 ---
let deck = [];
let discardPile = [];
let currentPlayerIndex = 0;
let selectedCardIndex = null;
let selectedTargetIndex = null;

// --- DOM要素 ---
const infoEl = document.getElementById("info");
const handEl = document.getElementById("hand");
const playersEl = document.getElementById("players");
const endTurnBtn = document.getElementById("endTurn");
const drawBtn = document.getElementById("draw");
const discardBtn = document.getElementById("discard");

// --- 初期化 ---
function init() {
  deck = shuffle([...cityCards, ...cityCards]); // 20枚くらいの山札
  discardPile = [];
  players.forEach(p => {
    p.hp = 50;
    p.defense = 0;
    p.reachDamage = 0;
    p.alive = true;
    p.hand = [];
  });
  currentPlayerIndex = 0;
  selectedCardIndex = null;
  selectedTargetIndex = null;

  // 各プレイヤーに初期手札3枚配布
  for (let i = 0; i < 3; i++) {
    players.forEach(player => {
      if (deck.length > 0) {
        player.hand.push(deck.pop());
      }
    });
  }

  updateDisplay();
  infoEl.textContent = `プレイヤー${players[currentPlayerIndex].id}のターンです。`;
}

// --- シャッフル関数 ---
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// --- ターン開始処理 ---
function startTurn() {
  const player = players[currentPlayerIndex];
  player.defense = 0; // 防御リセット（防御は次のターンまで）

  // リーチダメージ処理
  if (player.reachDamage > 0) {
    let dmg = player.reachDamage;
    player.reachDamage = 0;

    // リーチ効果は自動的に指定のターゲットに当てるのが難しいため、今回は自分以外のランダム生存プレイヤーに当てる例
    const enemies = players.filter(p => p.id !== player.id && p.alive);
    if (enemies.length > 0) {
      const target = enemies[Math.floor(Math.random() * enemies.length)];
      applyDamage(target, dmg);
      infoEl.textContent = `プレイヤー${player.id}のリーチ効果がプレイヤー${target.id}に${dmg}ダメージを与えました。`;
    }
  }

  updateDisplay();
  infoEl.textContent += ` プレイヤー${player.id}のターンです。カードを引くか、行動してください。`;
}

// --- ダメージ適用処理 ---
function applyDamage(target, damage) {
  const reduced = Math.min(damage, target.defense);
  damage -= reduced;
  target.defense -= reduced;
  if (damage < 0) damage = 0;

  target.hp -= damage;
  if (target.hp <= 0) {
    target.hp = 0;
    target.alive = false;
    infoEl.textContent += ` プレイヤー${target.id}は倒れました！`;
  }
}

// --- カード使用処理 ---
function useCard(cardIndex, targetIndex) {
  const player = players[currentPlayerIndex];
  const card = player.hand[cardIndex];

  if (!card) return;

  let target = null;
  if (["attack", "lifesteal", "reach", "defense"].includes(card.ability.type)) {
    if (targetIndex === null) {
      infoEl.textContent = "ターゲットを選択してください。";
      return;
    }
    target = players[targetIndex];
    if (!target.alive) {
      infoEl.textContent = "ターゲットは既に倒れています。";
      return;
    }
  }

  switch(card.ability.type) {
    case "attack":
      applyDamage(target, card.ability.value);
      infoEl.textContent = `プレイヤー${player.id}が【${card.name}】でプレイヤー${target.id}に${card.ability.value}ダメージ！`;
      break;

    case "heal":
      player.hp += card.ability.value;
      if (player.hp > 50) player.hp = 50;
      infoEl.textContent = `プレイヤー${player.id}が【${card.name}】で${card.ability.value}回復！`;
      break;

    case "defense":
      player.defense += card.ability.value;
      infoEl.textContent = `プレイヤー${player.id}が【${card.name}】で${card.ability.value}分の防御を獲得！`;
      break;

    case "lifesteal":
      applyDamage(target, card.ability.value);
      const heal = Math.floor(card.ability.value / 2);
      player.hp += heal;
      if (player.hp > 50) player.hp = 50;
      infoEl.textContent = `プレイヤー${player.id}が【${card.name}】でプレイヤー${target.id}に${card.ability.value}ダメージ、${heal}回復！`;
      break;

    case "reach":
      applyDamage(target, card.ability.value);
      target.reachDamage += card.ability.value;
      infoEl.textContent = `プレイヤー${player.id}が【${card.name}】でプレイヤー${target.id}に${card.ability.value}ダメージ、次のターンに同じダメージの持続効果！`;
      break;
  }

  // カード使用後、手札から除去し捨て札へ
  const usedCard = player.hand.splice(cardIndex, 1)[0];
  discardPile.push(usedCard);

  selectedCardIndex = null;
  selectedTargetIndex = null;

  updateDisplay();
  checkWinCondition();
}

// --- 勝利判定 ---
function checkWinCondition() {
  const alivePlayers = players.filter(p => p.alive);
  if (alivePlayers.length === 1) {
    infoEl.textContent = `プレイヤー${alivePlayers[0].id}の勝利！ゲーム終了`;
    // 行動ボタン無効化
    endTurnBtn.disabled = true;
    drawBtn.disabled = true;
    discardBtn.disabled = true;
    return true;
  }
  return false;
}

// --- カードを引く ---
function drawCard() {
  const player = players[currentPlayerIndex];
  if (deck.length === 0) {
    infoEl.textContent = "山札がありません。";
    return;
  }
  const card = deck.pop();
  player.hand.push(card);
  infoEl.textContent = `プレイヤー${player.id}がカードを1枚引きました。`;
  updateDisplay();
}

// --- カードを捨てる ---
function discardCard() {
  const player = players[currentPlayerIndex];
  if (selectedCardIndex === null) {
    infoEl.textContent = "捨てるカードを選択してください。";
    return;
  }
  const card = player.hand.splice(selectedCardIndex,1)[0];
  discardPile.push(card);
  infoEl.textContent = `プレイヤー${player.id}が【${card.name}】を捨てました。`;
  selectedCardIndex = null;
  updateDisplay();
}

// --- ターン終了 ---
function endTurn() {
  if(checkWinCondition()) return;

  currentPlayerIndex = (currentPlayerIndex + 1) % players.length;

  // 生存者を探してターン割り当て
  while (!players[currentPlayerIndex].alive) {
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
  }

  startTurn();
}

// --- UI更新 ---
function updateDisplay() {
  const player = players[currentPlayerIndex];

  // プレイヤー情報表示
  playersEl.innerHTML = players.map(p => {
    return `<div class="player ${p.alive ? "" : "dead"} ${p.id === player.id ? "current" : ""}">
      <div>プレイヤー${p.id}</div>
      <div>HP: ${p.hp}</div>
      <div>防御: ${p.defense}</div>
      <div>持続ダメージ: ${p.reachDamage}</div>
    </div>`;
  }).join("");

  // 手札表示（自分の手札のみ）
  handEl.innerHTML = "";
  player.hand.forEach((card, idx) => {
    const cardDiv = document.createElement("div");
    cardDiv.className = "card";
    cardDiv.textContent = card.name;
    cardDiv.title = card.ability.desc;
    cardDiv.dataset.index = idx;

    if (selectedCardIndex === idx) cardDiv.classList.add("selected");

    cardDiv.onclick = () => {
      if (selectedCardIndex === idx) {
        selectedCardIndex = null;
        selectedTargetIndex = null;
      } else {
        selectedCardIndex = idx;
        selectedTargetIndex = null;
      }
      updateDisplay();
      infoEl.textContent = `カード「${card.name}」を選択しました。ターゲットを選択してください。`;
    };

    handEl.appendChild(cardDiv);
  });

  // ターゲット選択UI
  // 攻撃など対象が必要なカードの場合のみターゲット選択を可能にする
  if (selectedCardIndex !== null) {
    const selectedCard = player.hand[selectedCardIndex];
    if (["attack", "lifesteal", "reach", "defense"].includes(selectedCard.ability.type)) {
      // プレイヤー選択表示（自分以外で生存者）
      playersEl.querySelectorAll(".player").forEach((pDiv, i) => {
        if (players[i].alive && players[i].id !== player.id) {
          pDiv.style.cursor = "pointer";
          pDiv.onclick = () => {
            selectedTargetIndex = i;
            useCard(selectedCardIndex, selectedTargetIndex);
          };
          if (selectedTargetIndex === i) pDiv.classList.add("targeted");
        } else {
          pDiv.style.cursor = "default";
          pDiv.onclick = null;
          pDiv.classList.remove("targeted");
        }
      });
      infoEl.textContent = `カード「${selectedCard.name}」を選択中。ターゲットのプレイヤーをクリックしてください。`;
    } else {
      // 対象不要カードは即使用可能
      infoEl.textContent = `カード「${selectedCard.name}」を選択中。使用します。`;
      useCard(selectedCardIndex, null);
    }
  }

  // ボタン活性制御
  endTurnBtn.disabled = false;
  drawBtn.disabled = false;
  discardBtn.disabled = (selectedCardIndex === null);
}

// --- イベント ---
endTurnBtn.onclick = () => {
  endTurn();
};

drawBtn.onclick = () => {
  drawCard();
};

discardBtn.onclick = () => {
  discardCard();
};

// --- ゲーム開始 ---
init();
startTurn();
