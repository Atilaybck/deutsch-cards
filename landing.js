// DOM referansları
const container   = document.getElementById("cards");
const resetBtn    = document.getElementById("reset");
const unlearnBtn  = document.getElementById("unlearnedBtn");
const page1Btn    = document.getElementById("page1Btn");
const page2Btn    = document.getElementById("page2Btn");
const page3Btn    = document.getElementById("page3Btn");
const page4Btn    = document.getElementById("page4Btn");
const page5Btn    = document.getElementById("page5Btn");

let currentPage   = 1;
let showUnlearned = false;

// localStorage yardımcıları
const getLS = key => JSON.parse(localStorage.getItem(key) || "[]");
const setLS = (key, val) => localStorage.setItem(key, JSON.stringify(val));

// diziyi karıştır
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// JSON dosyalarını yükle
function fetchPages(pages) {
  return Promise.all(
    pages.map(p => fetch(`data/page${p}.json`).then(r => r.json()))
  ).then(arrs => arrs.flat());
}

// sayfa boşsa üstünü çiz, mor yap
function updateStrike() {
  if (showUnlearned) return;

  const hidden = getLS("hiddenWords");
  const unlearn = getLS("unlearnedWords");

  const pageButtons = [
    { page: 1, btn: page1Btn },
    { page: 2, btn: page2Btn },
    { page: 3, btn: page3Btn },
    { page: 4, btn: page4Btn },
    { page: 5, btn: page5Btn }
  ];

  pageButtons.forEach(({ page, btn }) => {
    btn.style.textDecoration = "none";
    btn.classList.remove("completed");

    fetchPages([page]).then(words => {
      const visibleWords = words.filter(w => {
        const isHidden = hidden.includes(w.de);
        const isUnlearn = unlearn.includes(w.de);
        return !isHidden && !isUnlearn;
      });

      if (visibleWords.length === 0) {
        btn.style.textDecoration = "line-through";
        btn.classList.add("completed");
      }
    });
  });
}

// kartları oluştur
function renderWords() {
  container.innerHTML = "";
  const hidden   = getLS("hiddenWords");
  const unlearn  = getLS("unlearnedWords");
  const pagesToFetch = showUnlearned ? [1, 2, 3, 4, 5] : [currentPage];

  fetchPages(pagesToFetch).then(words => {
    shuffle(words);

    words.forEach(({ de, tr, oku }) => {
      if (!showUnlearned && (hidden.includes(de) || unlearn.includes(de))) return;
      if (showUnlearned && !unlearn.includes(de)) return;

      const card  = document.createElement("div");
      const inner = document.createElement("div");
      const front = document.createElement("div");
      const back  = document.createElement("div");
      const tick  = document.createElement("button");
      const xBtn  = document.createElement("button");

      card.className = "card";
      inner.className = "inner";
      front.className = "side front";
      back.className = "side back";
      tick.className = "tick";
      xBtn.className = "unlearn";

      front.textContent = de;
      back.innerHTML = `${tr}<br><span style="font-size:14px;color:#555">(${oku})</span>`;
      tick.textContent = "✔";
      xBtn.textContent = "✘";

      // ✔ Tik'e tıklandığında
      tick.onclick = e => {
        e.stopPropagation();
        card.remove();

        if (!hidden.includes(de)) {
          hidden.push(de);
          setLS("hiddenWords", hidden);
        }

        const unIndex = unlearn.indexOf(de);
        if (unIndex !== -1) {
          unlearn.splice(unIndex, 1);
          setLS("unlearnedWords", unlearn);
        }

        updateStrike();
      };

      // ✘ Butonuna tıklandığında
      xBtn.onclick = e => {
        e.stopPropagation();
        card.remove();

        if (!unlearn.includes(de)) {
          unlearn.push(de);
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

    // aktif buton stilini güncelle
    [page1Btn, page2Btn, page3Btn, page4Btn, page5Btn, unlearnBtn].forEach(btn => btn.classList.remove("active"));
    if (showUnlearned) {
      unlearnBtn.classList.add("active");
    } else {
      if (currentPage === 1) page1Btn.classList.add("active");
      if (currentPage === 2) page2Btn.classList.add("active");
      if (currentPage === 3) page3Btn.classList.add("active");
      if (currentPage === 4) page4Btn.classList.add("active");
      if (currentPage === 5) page5Btn.classList.add("active");
    }
  });
}

// butonlar
resetBtn.onclick = () => {
  localStorage.removeItem("hiddenWords");
  localStorage.removeItem("unlearnedWords");
  showUnlearned = false;
  [page1Btn, page2Btn, page3Btn, page4Btn, page5Btn].forEach(b => {
    b.style.textDecoration = "none";
    b.classList.remove("completed");
  });
  renderWords();
};

unlearnBtn.onclick = () => {
  showUnlearned = true;
  renderWords();
};

page1Btn.onclick = () => {
  currentPage = 1;
  showUnlearned = false;
  renderWords();
};

page2Btn.onclick = () => {
  currentPage = 2;
  showUnlearned = false;
  renderWords();
};

page3Btn.onclick = () => {
  currentPage = 3;
  showUnlearned = false;
  renderWords();
};

page4Btn.onclick = () => {
  currentPage = 4;
  showUnlearned = false;
  renderWords();
};

page5Btn.onclick = () => {
  currentPage = 5;
  showUnlearned = false;
  renderWords();
};

// ilk yükleme
renderWords();
