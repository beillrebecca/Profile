// JS の最後にエラーハンドリング
window.onerror = function(msg, url, line) {
  alert("エラー発生👇\n" + msg + "\n行:" + line);
};

// ========================
// 🔴 データ本体（超重要）
// =========================
let items = [
  { id: 1, name: "アイテム1", price: "¥0", link: "", img: "", liked: false, saved: false, clicks: 0 },
  { id: 2, name: "アイテム2", price: "¥0", link: "", img: "", liked: false, saved: false, clicks: 0 },
  { id: 3, name: "アイテム3", price: "¥0", link: "", img: "", liked: false, saved: false, clicks: 0 },
  { id: 4, name: "アイテム4", price: "¥0", link: "", img: "", liked: false, saved: false, clicks: 0 }
];

let currentCommentIndex = null;

// 🔴 グローバルで state を保持する
let appState = {};

// =========================
// SVG アイコン生成（状態反映版）
// =========================
function heartIcon(item) {
  return `
    <div class="like-wrapper">
      <svg class="icon-heart ${item.liked ? 'liked' : ''}" viewBox="0 0 24 24" stroke-width="1.3"
        stroke-linecap="round" stroke-linejoin="round">
        <path d="M20.8 4.6a5 5 0 0 0-7.1 0L12 6.3l-1.7-1.7
          a5 5 0 0 0-7.1 7.1L12 21l8.8-9.3
          a5 5 0 0 0 0-7.1z"/>
      </svg>
      <span class="like-count">${item.likes || ""}</span>
    </div>
  `;
}

function commentIcon() {
  return `
    <svg class="icon-comment" viewBox="0 0 24 24" stroke-width="1.3"
      stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7
        a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/>
    </svg>
  `;
}

function shareIcon() {
  return `
    <svg class="icon-share" viewBox="0 0 24 24" stroke-width="1.3"
      stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 2L11 13"/>
      <path d="M22 2L15 22l-4-9-9-4z"/>
    </svg>
  `;
}

function saveIcon(item) {
  return `
    <svg class="icon-save ${item.saved ? 'saved' : ''}" viewBox="0 0 24 24" stroke-width="1.3"
      stroke-linecap="round" stroke-linejoin="round">
      <path d="M19 21l-7-5-7 5V5
        a2 2 0 0 1 2-2h10
        a2 2 0 0 1 2 2z"/>
    </svg>
  `;
}

function deleteIcon() {
  return `
    <svg class="icon-delete" viewBox="0 0 24 24" stroke-width="2"
      stroke-linecap="round" stroke-linejoin="round" fill="none">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  `;
}

// =========================
// カード作成
// =========================
function createCard(item, index) {
  const card = document.createElement("div"); // ←これも必要！
  card.className = "card";

  card.innerHTML = `
    ${index >= 4 ? deleteIcon() : ""}

    <div class="image">
      <img src="${item.img || 'https://dummyimage.com/300x300/eeeeee/999999&text=📷'}" alt="">
      <span class="modern-clicks">${item.clicks || 0}</span>
    </div>

    <div class="card-name" contenteditable="true">
      ${item.name || "アイテム名"}
    </div>

    <div class="price-link-wrapper">
      <div class="card-price">${item.price || "¥0"}</div>

      <div class="link-wrapper">
        <a class="link-display" href="${item.link || '#'}" target="_blank">
         ${item.link || "リンクを入力"}
        </a>
        <button class="edit-link-btn">編集</button>
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
// ショーケース描画
// =========================
function renderShowcaseLight() {
  alert("① render入った");

  const showcase = document.getElementById("showcase");
  if (!showcase) {
    alert("❌ showcaseが取得できてない");
    return;
  }

  alert("② showcase取得OK");

  showcase.innerHTML = "";

  items.forEach((item, index) => {
    try {
      alert("③ カード作成開始 index=" + index);

      const card = createCard(item, index);

      if (!card) {
        alert("❌ cardが作られてない index=" + index);
        return;
      }

      showcase.appendChild(card);

      const nameEl = card.querySelector(".card-name");
      const priceEl = card.querySelector(".card-price");

      if (nameEl && typeof item.fontColorName === "string") {
        nameEl.style.color = item.fontColorName;
      }

      if (priceEl && item.fontColorPrice) {
        priceEl.style.color = item.fontColorPrice;
      }

    } catch (err) {
      alert("💥 カード描画エラー index=" + index + "\n" + err.message);
    }
  });

  alert("④ 全カード描画完了");
}

// =========================
// カードクリック操作
// =========================
let activeCard = null;

function initCardClicks() {
  const showcaseEl = document.getElementById("showcase");
  if (!showcaseEl) return;

  const itemImgInput = document.getElementById("itemImgInput");
  if (!itemImgInput) return;

  // =========================
  // 画像アップロード
  // =========================
  if (!itemImgInput.dataset.init) {
    itemImgInput.addEventListener('change', event => {
      const file = event.target.files[0];
      if (!file || !activeCard) {
        alert("画像を貼りたいカードを先にクリックしてください");
        itemImgInput.value = "";
        return;
      }

      const imgTag = activeCard.querySelector("img");
      if (!imgTag) return;

      const reader = new FileReader();
      reader.onload = ev => {
        imgTag.src = ev.target.result;
      };
      reader.readAsDataURL(file);

      itemImgInput.value = "";
      activeCard = null;
    });

    itemImgInput.dataset.init = 'true';
  }

  // =========================
  // クリック処理
  // =========================
  showcaseEl.addEventListener("click", e => {

    if (e.target.closest('.pcr-app')) return;

    const card = e.target.closest(".card");
    if (!card) return;

    const cards = Array.from(showcaseEl.querySelectorAll(".card"));
    const index = cards.indexOf(card);
    const item = items[index];

    // 🖼 画像
    if (e.target.closest(".image")) {
      e.stopPropagation();
      activeCard = card;
      itemImgInput.click();
      return;
    }

    // ❤️ いいね
    if (e.target.closest(".icon-heart")) {
      if (!item) return;

      item.liked = !item.liked;
      item.likes = item.liked
        ? (item.likes || 0) + 1
        : Math.max((item.likes || 1) - 1, 0);

      renderShowcaseLight();
      return;
    }

    // 💾 保存（見た目だけ）
    if (e.target.closest(".icon-save")) {
      const save = e.target.closest(".icon-save");
      save.classList.toggle("saved");
      return;
    }

    // 🔗 シェア
    if (e.target.closest(".icon-share")) {
      const linkEl = card.querySelector(".link-display");
      const url = linkEl?.href;

      if (!url || url === "#") {
        alert("リンクが設定されていません");
        return;
      }

      const name = card.querySelector(".card-name")?.textContent || "おすすめアイテム";

      if (navigator.share) {
        navigator.share({ title: name, text: name, url });
      } else {
        navigator.clipboard.writeText(url);
        alert("リンクをコピーしました！");
      }
      return;
    }

    // 💬 コメント
    if (e.target.closest(".icon-comment")) {
      currentCommentIndex = index;
      openComments(index);
      return;
    }

    // 💰 価格
    if (e.target.closest(".card-price")) {
      const priceEl = card.querySelector(".card-price");
      const newPrice = prompt("価格を入力してね", priceEl.textContent);
      if (newPrice !== null) priceEl.textContent = newPrice;
      return;
    }

    // 🔗 リンククリック
    if (e.target.closest(".link-display")) {
      e.preventDefault();

      const linkEl = card.querySelector(".link-display");
      const clicksEl = card.querySelector(".modern-clicks");

      let current = parseInt(clicksEl.textContent) || 0;
      current++;
      clicksEl.textContent = current;

      if (item) item.clicks = current;

      const url = linkEl.href;
      if (url && url !== "#") {
        setTimeout(() => window.open(url, "_blank"), 150);
      }
      return;
    }

    // ✏️ 名前
    if (e.target.closest(".card-name")) {
      card.querySelector(".card-name").focus();
      return;
    }

  });
}

// =========================
// コメント表示
// =========================
function openComments(index) {
  const modal = document.getElementById("commentModal");
  const list = document.getElementById("commentList");

  modal.style.display = "flex";
  list.innerHTML = "";

  const item = items[index];
  if (!item.comments) item.comments = [];

  item.comments.forEach((c, i) => {
    const div = document.createElement("div");

    div.innerHTML = `
  <strong>${c.user}</strong> ${c.text}
  <span class="comment-like ${c.liked ? 'liked' : ''}" data-i="${i}">
    <svg viewBox="0 0 24 24" class="comment-heart">
      <path d="M20.8 4.6a5 5 0 0 0-7.1 0L12 6.3l-1.7-1.7
        a5 5 0 0 0-7.1 7.1L12 21l8.8-9.3
        a5 5 0 0 0 0-7.1z"/>
    </svg>
    ${c.likes ? `<span class="like-count">${c.likes}</span>` : ""}
  </span>
`;

    list.appendChild(div);
  });
}



// =========================
// 画像アップロード共通関数
// =========================
function setupImageUpload(imgEl, inputEl) {
  if (!imgEl || !inputEl) return;

  inputEl.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ev => {
      imgEl.src = ev.target.result;
    };
    reader.readAsDataURL(file);

    // 入力をリセット
    inputEl.value = "";
  });

  // 画像クリックでファイル選択を開く
  imgEl.addEventListener('click', () => inputEl.click());
}

// =========================
// DOMContentLoaded 初期化
// =========================
document.addEventListener("DOMContentLoaded", () => {
  alert("① DOM読み込みOK");

  renderShowcaseLight();
  alert("② render実行OK");

  setupImageUpload(document.getElementById('headerImg'), document.getElementById('headerImgInput'));
  alert("③ header画像OK");

  setupImageUpload(document.getElementById('avatarImg'), document.getElementById('avatarImgInput'));
  alert("④ avatar画像OK");

  initCardClicks();
  alert("⑤ クリック初期化OK");
});
  



 // 🔴 コメント閉じる処理
  const commentModal = document.getElementById("commentModal");
const commentClose = document.getElementById("commentClose");

if (commentClose && commentModal) {
  commentClose.addEventListener("click", (e) => {
    e.stopPropagation(); // ← これ超重要
    commentModal.style.display = "none";
  });
}

// 背景クリックでも閉じる
if (commentModal) {
  commentModal.addEventListener("click", (e) => {
    if (e.target === commentModal) {
      commentModal.style.display = "none";
    }
  });
}


  
  // =========================
// フォロー / フォロワーモーダル制御
// =========================
function initFollowModal() {
  const followingBtn = document.getElementById('followingBtn');
  const followersBtn = document.getElementById('followersBtn');
  const followModal = document.getElementById('followModal');
  const followerModal = document.getElementById('followerModal');

  console.log('followingBtn:', followingBtn, 'followModal:', followModal);

  if (!followingBtn || !followModal) {
    console.warn('フォローボタンまたはモーダルが取得できません');
    return;
  }

  followingBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    followModal.style.display = "flex";
  });

  followersBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    followerModal.style.display = "flex";
  });

  [followModal, followerModal].forEach(modal => {
    if (!modal) return;
    const closeBtn = modal.querySelector('.close-btn');
    closeBtn?.addEventListener('click', () => modal.style.display = 'none');

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });
  });
}

  initFollowModal();

// =========================
  // コメント送信
  // =========================
  document.getElementById("commentSendBtn")?.addEventListener("click", () => {
    const input = document.getElementById("commentInput");
    const text = input.value.trim();
    if (!text) return;

    const user = document.getElementById("profileName")?.textContent || "ユーザー";

    if (!items[currentCommentIndex].comments) {
      items[currentCommentIndex].comments = [];
    }

    items[currentCommentIndex].comments.push({
      user: user,
      text: text,
      likes: 0
    });

    input.value = "";
    openComments(currentCommentIndex);
  });

  // =========================
  // コメントいいね
  // =========================
  document.getElementById("commentList")?.addEventListener("click", e => {
    const like = e.target.closest(".comment-like");
    if (!like) return;

    const i = like.dataset.i;
    const comment = items[currentCommentIndex].comments[i];

    comment.liked = !comment.liked;
    comment.likes = comment.liked ? (comment.likes || 0) + 1 : Math.max((comment.likes || 1) - 1, 0);

    openComments(currentCommentIndex);
  });


