const container  = document.getElementById("cards");
const resetBtn   = document.getElementById("reset");
const unlearnBtn = document.getElementById("unlearnedBtn");
const pageButtonsContainer = document.getElementById("pageButtons");

let currentPage   = 1;
let showUnlearned = false;
const totalPages = 6;

const getLS = key => JSON.parse(localStorage.getItem(key) || "[]");
const setLS = (key, val) => localStorage.setItem(key, JSON.stringify(val));

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function fetchPages(pages) {
  return Promise.all(
    pages.map(p => fetch(`data/page${p}.json`).then(r => r.json().then(data => data.map(item => ({ ...item, page: p }))))
  )).then(arrs => arrs.flat());
}

const pageButtons = [];
for (let i = 1; i <= totalPages; i++) {
  const btn = document.createElement("button");
  btn.textContent = `Sayfa ${i}`;
  btn.className = "pageBtn";
  btn.onclick = () => {
    currentPage = i;
    showUnlearned = false;
    renderWords();
  };
  pageButtons.push({ page: i, btn });
  pageButtonsContainer.appendChild(btn);
}

function updateStrike() {
  if (showUnlearned) return;

  const hidden  = getLS("hiddenWords");
  const unlearn = getLS("unlearnedWords");

  pageButtons.forEach(({ page, btn }) => {
    btn.style.textDecoration = "none";
    btn.classList.remove("completed");

    fetchPages([page]).then(words => {
      const visibleWords = words.filter(w => {
        const key = `${w.page}_${w.de}`;
        return !hidden.includes(key) && !unlearn.includes(key);
      });

      if (visibleWords.length === 0) {
        btn.style.textDecoration = "line-through";
        btn.classList.add("completed");
      }
    });
  });
}

function renderWords() {
  container.innerHTML = "";
  const hidden  = getLS("hiddenWords");
  const unlearn = getLS("unlearnedWords");
  const pagesToFetch = showUnlearned ? pageButtons.map(p => p.page) : [currentPage];

  fetchPages(pagesToFetch).then(words => {
    shuffle(words);

    words.forEach(({ de, tr, oku, page }) => {
      const key = `${page}_${de}`;
      if (!showUnlearned && (hidden.includes(key) || unlearn.includes(key))) return;
      if (showUnlearned && !unlearn.includes(key)) return;

      const card  = document.createElement("div");
      const inner = document.createElement("div");
      const front = document.createElement("div");
      const back  = document.createElement("div");
      const tick  = document.createElement("button");
      const xBtn  = document.createElement("button");

      card.className  = "card";
      inner.className = "inner";
      front.className = "side front";
      back.className  = "side back";
      tick.className  = "tick";
      xBtn.className  = "unlearn";

      front.textContent = de;
      back.innerHTML = `${tr}<br><span style="font-size:14px;color:#555">(${oku})</span>`;
      tick.textContent = "✔";
      xBtn.textContent = "✘";

      tick.onclick = e => {
        e.stopPropagation();
        card.remove();

        if (!hidden.includes(key)) {
          hidden.push(key);
          setLS("hiddenWords", hidden);
        }

        const unIndex = unlearn.indexOf(key);
        if (unIndex !== -1) {
          unlearn.splice(unIndex, 1);
          setLS("unlearnedWords", unlearn);
        }

        updateStrike();
      };

      xBtn.onclick = e => {
        e.stopPropagation();
        card.remove();

        if (!unlearn.includes(key)) {
          unlearn.push(key);
          setLS("unlearnedWords", unlearn);
        }

        updateStrike();
      };

      card.onclick = () => card.classList.toggle("flipped");

      inner.append(front, back);
      card.append(xBtn, tick, inner);
      container.append(card);
    });

    updateStrike();

    pageButtons.forEach(({ btn, page }) => btn.classList.toggle("active", !showUnlearned && page === currentPage));
    unlearnBtn.classList.toggle("active", showUnlearned);
  });
}

resetBtn.onclick = () => {
  localStorage.removeItem("hiddenWords");
  localStorage.removeItem("unlearnedWords");
  showUnlearned = false;
  pageButtons.forEach(({ btn }) => {
    btn.style.textDecoration = "none";
    btn.classList.remove("completed");
  });
  renderWords();
};

unlearnBtn.onclick = () => {
  showUnlearned = true;
  renderWords();
};

renderWords();
