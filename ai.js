function aiTurn(aiPlayer) {
  const idx = players.indexOf(aiPlayer);
  currentPlayerIndex = idx;
  const p = aiPlayer;

  if (p.role === "aiEa") {
    drawPointCard();
    setTimeout(summonCard, 500);

  } else if (p.role === "aiNo") {
    if(p.hp < 60 && Math.random() < 0.5) {
      drawSkillCard();
    } else {
      drawPointCard();
    }
    setTimeout(summonCard, 500);

  } else if (p.role === "aiHa") {
    if (p.points > 95) {
      drawSkillCard();
    } else if (p.hp < 50) {
      drawSkillCard();
    } else {
      drawPointCard();
    }
    setTimeout(summonCard, 500);
  }
}
