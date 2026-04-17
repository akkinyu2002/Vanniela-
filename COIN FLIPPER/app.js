const coin = document.getElementById("coin");
const coinStage = document.querySelector(".coin-stage");
const flipButton = document.getElementById("flip-btn");
const resultText = document.getElementById("result");
const headsCount = document.getElementById("heads-count");
const tailsCount = document.getElementById("tails-count");
const totalCount = document.getElementById("total-count");
const historyList = document.getElementById("history-list");

const state = {
  heads: 0,
  tails: 0,
  total: 0,
  history: [],
  spinning: false,
  rotationX: 0,
  rotationY: 0,
};

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function pickOutcome() {
  return Math.random() < 0.5 ? "heads" : "tails";
}

function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function normalizeSignedAngle(angle) {
  return ((((angle + 180) % 360) + 360) % 360) - 180;
}

function setBusyState(isBusy) {
  state.spinning = isBusy;
  flipButton.disabled = isBusy;
  flipButton.textContent = isBusy ? "Flipping..." : "Flip Coin";
  coinStage.classList.toggle("is-flipping", isBusy);
}

function updateResult(outcome) {
  state[outcome] += 1;
  state.total += 1;
  state.history.unshift(outcome);
  state.history = state.history.slice(0, 6);

  headsCount.textContent = state.heads;
  tailsCount.textContent = state.tails;
  totalCount.textContent = state.total;

  resultText.dataset.result = outcome;
  resultText.textContent = outcome === "heads" ? "It's Heads!" : "It's Tails!";

  historyList.innerHTML = "";
  state.history.forEach((item, index) => {
    const entry = document.createElement("li");
    entry.className = item;
    entry.textContent = `#${state.total - index} ${item.toUpperCase()}`;
    historyList.appendChild(entry);
  });
}

function finishFlip(outcome, targetX, targetY) {
  state.rotationX = normalizeSignedAngle(targetX);
  state.rotationY = ((targetY % 360) + 360) % 360;
  coin.style.transform = `rotateX(${state.rotationX}deg) rotateY(${state.rotationY}deg)`;
  coin.dataset.side = outcome;
  setBusyState(false);
  updateResult(outcome);
}

function animateFlip(outcome) {
  const outcomeY = outcome === "heads" ? 0 : 180;
  const currentY = ((state.rotationY % 360) + 360) % 360;
  const currentTiltX = normalizeSignedAngle(state.rotationX);
  const deltaToOutcome = ((outcomeY - currentY) + 360) % 360;
  const spinX = randomInteger(6, 9) * 360;
  const spinY = randomInteger(3, 5) * 360;
  const targetTiltX = randomInteger(-16, 16);
  const targetX = state.rotationX + spinX + (targetTiltX - currentTiltX);
  const targetY = state.rotationY + spinY + deltaToOutcome;

  if (prefersReducedMotion || typeof coin.animate !== "function") {
    coin.style.transition = "transform 780ms cubic-bezier(0.2, 0.78, 0.23, 1)";
    requestAnimationFrame(() => {
      coin.style.transform = `rotateX(${targetX}deg) rotateY(${targetY}deg)`;
    });
    window.setTimeout(() => {
      coin.style.transition = "";
      finishFlip(outcome, targetX, targetY);
    }, 820);
    return;
  }

  const animation = coin.animate(
    [
      { transform: `rotateX(${state.rotationX}deg) rotateY(${state.rotationY}deg)` },
      { transform: `rotateX(${targetX}deg) rotateY(${targetY}deg)` },
    ],
    {
      duration: randomInteger(1850, 2300),
      easing: "cubic-bezier(0.16, 0.89, 0.34, 1)",
      fill: "forwards",
    }
  );

  animation.addEventListener("finish", () => {
    finishFlip(outcome, targetX, targetY);
  });

  animation.addEventListener("cancel", () => {
    setBusyState(false);
  });
}

flipButton.addEventListener("click", () => {
  if (state.spinning) {
    return;
  }

  setBusyState(true);
  animateFlip(pickOutcome());
});
