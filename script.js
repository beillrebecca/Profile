// =========================
// JS の最後にエラーハンドリング
// =========================
window.onerror = function(msg, url, line) {
  console.error("エラー発生", msg, url, line);
  alert("エラー発生👇\n" + msg + "\n行:" + line);
};

// =========================
// 🔴 データ本体
// =========================
let items = getDefaultItems();

let currentCommentIndex = null;
let activeCard = null;

// =========================
// デフォルトアイテム
// =========================
function getDefaultItems() {
  return [
    { id: 1, name: "アイテム1", price: "¥0", link: "", img: "", liked: false, saved: false, clicks: 0 },
    { id: 2, name: "アイテム2", price: "¥0", link: "", img: "", liked: false, saved: false, clicks: 0 },
    { id: 3, name: "アイテム3", price: "¥0", link: "", img: "", liked: false, saved: false, clicks: 0 },
    { id: 4, name: "アイテム4", price: "¥0", link: "", img: "", liked: false, saved: false, clicks: 0 }
  ];
}

// =========================
// SVG アイコン
// =========================
function heartIcon(item) {
  return `
    <div class="like-wrapper">
      <svg class="icon-heart ${item.liked ? 'liked' : ''}" viewBox="0 0 24 24">
        <path d="M20.8 4.6a5 5 0 0 0-7.1 0L12 6.3l-1.7-1.7
          a5 5 0 0 0-7.1 7.1L12 21l8.8-9.3
          a5 5 0 0 0 0-7.1z"/>
      </svg>
      <span class="like-count">${item.likes || ""}</span>
    </div>
  `;
}

function commentIcon() {
  return `<svg class="icon-comment" viewBox="0 0 24 24"><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7 a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/></svg>`;
}

function shareIcon() {
  return `<svg class="icon-share" viewBox="0 0 24 24"><path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4z"/></svg>`;
}

function saveIcon(item) {
  return `<svg class="icon-save ${item.saved ? 'saved' : ''}" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5 a2 2 0 0 1 2-2h10 a2 2 0 0 1 2 2z"/></svg>`;
}

function deleteIcon() {
  return `<svg class="icon-delete" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
}

// =========================
// カード作成
// =========================
function createCard(item, index) {
  const card = document.createElement("div");
  card.className = "card";

  card.innerHTML = `
    ${index >= 4 ? deleteIcon() : ""}
    <div class="image">
      <img src="${item.img || 'https://dummyimage.com/300x300/eeeeee/999999&text=📷'}">
      <span class="modern-clicks">${item.clicks || 0}</span>
    </div>

    <div class="card-name" contenteditable="true">${item.name}</div>

    <div class="price-link-wrapper">
      <div class="card-price">${item.price}</div>
      <div class="link-wrapper">
        <a class="link-display" href="${item.link || '#'}" target="_blank">
          ${item.link || "リンクを入力"}
        </a>
      </div>
    </div>

    <div class="card-actions">
      ${heartIcon(item)}
      ${commentIcon()}
      ${shareIcon()}
      ${saveIcon(item)}
    </div>
  `;
  return card;
}

// =========================
// プロフィール用ショーケース
// =========================
function renderShowcaseProfile() {
  const showcase = document.getElementById("showcase");
  if (!showcase) return;

  showcase.innerHTML = "";

  items.forEach((item, index) => {
    const card = createCard(item, index);
    showcase.appendChild(card);
  });
}

// =========================
// カード操作
// =========================
function initCardClicks() {
  const showcaseEl = document.getElementById("showcase");
  if (!showcaseEl) return;

  showcaseEl.addEventListener("click", e => {

    const cards = Array.from(showcaseEl.querySelectorAll(".card"));
    const card = e.target.closest(".card");
    if (!card) return; // ← これを追加

    const index = cards.indexOf(card);
    if (index === -1 || !items[index]) return;

    const item = items[index];

    // =========================
    // ❤️ いいね
    // =========================
    const heart = e.target.closest(".icon-heart");
    if (heart) {
      item.liked = !item.liked;

      if (item.liked) {
        item.likes = (item.likes || 0) + 1;
      } else {
        item.likes = Math.max((item.likes || 1) - 1, 0);
      }

      renderShowcaseProfile();
      return;
    }

    // =========================
    // 💬 コメント
    // =========================
    const comment = e.target.closest(".icon-comment");
    if (comment) {
    currentCommentIndex = index;

    // モーダル表示
    const modal = document.getElementById("commentModal");
    if (modal) modal.style.display = "flex";

    // コメント表示
    openComments(index);

    return;
    }

    // =========================
    // 🔁 シェア
    // =========================
    const share = e.target.closest(".icon-share");
    if (share) {
      const linkEl = card.querySelector(".link-display");
      const url = linkEl?.href;

      if (!url || url === "#") {
        alert("リンクが設定されていません");
        return;
      }

      const name = card.querySelector(".card-name")?.textContent || "おすすめアイテム";

      if (navigator.share) {
        navigator.share({
          title: name,
          text: name,
          url: url
        }).catch(() => {});
      } else {
        navigator.clipboard.writeText(url);
        alert("リンクをコピーしました！");
      }

      return;
    }

    // =========================
    // 🔖 保存
    // =========================
    const save = e.target.closest(".icon-save");
    if (save) {
      item.saved = !item.saved;
      renderShowcaseProfile();
      return;
    }

    // =========================
    // 🔗 リンク
    // =========================
    const linkEl = e.target.closest(".link-display");
    if (linkEl) {
      e.preventDefault();
      if (linkEl.href !== "#") window.open(linkEl.href, "_blank");
      return;
    }

  });
}

// =========================
// 初期化
// =========================
document.addEventListener("DOMContentLoaded", () => {
  items = getDefaultItems();        // ← 強制初期化
  renderShowcaseProfile();          // ← 初期描画
  initCardClicks();
  
  // =========================
// フォロー / フォロワーモーダル
// =========================
function initFollowModal() {
  const followingBtn = document.getElementById('followingBtn');
  const followersBtn = document.getElementById('followersBtn');
  const followModal = document.getElementById('followModal');
  const followerModal = document.getElementById('followerModal');

  if (!followingBtn || !followModal) {
    console.warn("フォローボタンまたはモーダルが見つからない");
    return;
  }

  // フォロー
  followingBtn.addEventListener('click', () => {
    followModal.style.display = "flex";
  });

  // フォロワー
  followersBtn?.addEventListener('click', () => {
    followerModal.style.display = "flex";
  });

  // 閉じる処理
  [followModal, followerModal].forEach(modal => {
    if (!modal) return;

    // 背景クリックで閉じる
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });

    // ×ボタン
    const closeBtn = modal.querySelector('.close-btn');
    closeBtn?.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  });
}

initFollowModal();
});