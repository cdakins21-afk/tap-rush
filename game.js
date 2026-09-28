(() => {
  const arena = document.getElementById("arena");
  const startPanel = document.getElementById("startPanel");
  const endPanel = document.getElementById("endPanel");
  const countdown = document.getElementById("countdown");
  const scoreEl = document.getElementById("score");
  const timeEl = document.getElementById("time");
  const streakEl = document.getElementById("streak");
  const bestEl = document.getElementById("best");
  const finalScoreEl = document.getElementById("finalScore");
  const resultMessage = document.getElementById("resultMessage");
  let score = 0, streak = 0, timeLeft = 30, playing = false;
  let tickTimer = null, spawnTimer = null, targetTimer = null, countdownTimer = null;
  let target = null, best = Number(localStorage.getItem("tapRushBest") || 0);
  bestEl.textContent = best;

  function clearTimers() {
    [tickTimer, spawnTimer, targetTimer, countdownTimer].forEach(clearInterval);
    [tickTimer, spawnTimer, targetTimer, countdownTimer].forEach(clearTimeout);
  }
  function removeTarget() {
    if (target) target.remove();
    target = null;
    clearTimeout(targetTimer);
  }
  function updateStats() {
    scoreEl.textContent = score;
    timeEl.innerHTML = `${timeLeft}<span>s</span>`;
    streakEl.textContent = `×${streak}`;
  }
  function spawnTarget() {
    if (!playing) return;
    removeTarget();
    const size = Math.max(34, 62 - Math.floor(score / 5) * 2);
    const maxX = Math.max(0, arena.clientWidth - size - 18);
    const maxY = Math.max(0, arena.clientHeight - size - 18);
    const x = 9 + Math.random() * maxX;
    const y = 9 + Math.random() * maxY;
    const bonus = Math.random() < 0.14;
    target = document.createElement("button");
    target.className = "target" + (bonus ? " bonus" : "");
    target.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px`;
    target.setAttribute("aria-label", bonus ? "Bonus target" : "Target");
    target.textContent = bonus ? "✦" : "•";
    target.addEventListener("pointerdown", e => {
      e.preventDefault();
      if (!playing || !target) return;
      score += bonus ? 3 : 1;
      streak += 1;
      updateStats();
      spawnTarget();
    }, { once: true });
    arena.appendChild(target);
    const lifespan = Math.max(450, 1250 - score * 12);
    targetTimer = setTimeout(() => {
      if (playing && target) {
        streak = 0;
        updateStats();
        spawnTarget();
      }
    }, lifespan);
  }
  function finish() {
    playing = false;
    clearTimers();
    removeTarget();
    finalScoreEl.textContent = score;
    if (score > best) {
      best = score;
      localStorage.setItem("tapRushBest", String(best));
      bestEl.textContent = best;
      resultMessage.textContent = "NEW PERSONAL BEST! Can you top that?";
    } else {
      resultMessage.textContent = score >= 25 ? "Fantastic reflexes. One more round?" : "Good run. Think you can beat it?";
    }
    endPanel.classList.remove("hidden");
  }
  function startGame() {
    clearTimers(); removeTarget();
    score = 0; streak = 0; timeLeft = 30; playing = false;
    updateStats();
    startPanel.classList.add("hidden");
    endPanel.classList.add("hidden");
    let n = 3;
    countdown.textContent = n;
    countdown.classList.remove("hidden");
    countdownTimer = setInterval(() => {
      n -= 1;
      if (n > 0) countdown.textContent = n;
      else {
        clearInterval(countdownTimer);
        countdown.classList.add("hidden");
        playing = true;
        spawnTarget();
        tickTimer = setInterval(() => {
          timeLeft -= 1;
          updateStats();
          if (timeLeft <= 0) finish();
        }, 1000);
      }
    }, 650);
  }
  document.getElementById("startBtn").addEventListener("click", startGame);
  document.getElementById("againBtn").addEventListener("click", startGame);
  updateStats();
})();
