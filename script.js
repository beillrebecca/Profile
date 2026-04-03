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
  const showcase = document.getElementById("showcase");
  if (!showcase) return;

  showcase.innerHTML = ""; // まずリセット

  // 🔹 安全にカード描画
  items.forEach((item, index) => {
    try {
      const card = createCard(item, index);
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
      console.error("カード描画失敗", item, err);
    }
  });

  // 🔹 「新しいアイテム追加」ボタン
  const addWrapper = document.createElement("div");
  addWrapper.className = "showcase-add-card-wrapper";

  const addBtn = document.createElement("button");
  addBtn.id = "addCardBtn";
  addBtn.className = "showcase-add-card-btn";
  addBtn.textContent = "＋ 新しいアイテムを追加";

  addWrapper.appendChild(addBtn);
  showcase.appendChild(addWrapper);

  addBtn.addEventListener("click", () => {
  const newItem = {
    id: Date.now(),
    name: `アイテム${items.length + 1}`,
    price: "¥0",
    link: "",
    img: "",
    liked: false,
    saved: false,
    clicks: 0,
    fontColorName: "#000",
    fontColorPrice: "#000",
    comments: [],
    likes: 0
  };

  items.push(newItem);

  // 🔥 ここが超重要
  renderShowcaseLight();
});

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

  // 画像アップロードイベントの初期化
  if (!itemImgInput.dataset.init) {
    itemImgInput.addEventListener('change', event => {
      const file = event.target.files[0];
      if (!file) return;

      if (!activeCard) {
        alert("画像を貼りたいカードを先にクリックしてください");
        itemImgInput.value = "";
        return;
      }

      const imgTag = activeCard.querySelector("img");
      if (!imgTag) {
        alert("カードに画像タグが見つかりません");
        itemImgInput.value = "";
        activeCard = null;
        return;
      }

      const reader = new FileReader();
      reader.onload = ev => {
        imgTag.src = ev.target.result;
      };
      reader.readAsDataURL(file);

      // リセット
      itemImgInput.value = "";
      activeCard = null;
    });
    itemImgInput.dataset.init = 'true';
  }

  // ショーケース内クリック処理
  showcaseEl.addEventListener("click", e => {
    
    if (e.target.closest('.pcr-app')) return;

    // 🖼 画像クリック
    const imageEl = e.target.closest(".image");
    if (imageEl) {
      e.stopPropagation();
      const card = imageEl.closest(".card");
      if (!card) return; // 念のため null チェック
      activeCard = card;

      // input ファイル選択を発火
      if (itemImgInput) itemImgInput.click();
      return;
    }


  // ❤️ ハート
  const heart = e.target.closest(".icon-heart");
if (heart) {
  const card = e.target.closest(".card");

  const showcaseEl = document.getElementById("showcase");
  const cards = Array.from(showcaseEl.querySelectorAll(".card"));
  const index = cards.indexOf(card);

  if (!items[index]) return;

  const item = items[index];

  // トグル
  item.liked = !item.liked;

  // 数字処理
  if (item.liked) {
    item.likes = (item.likes || 0) + 1;
  } else {
    item.likes = Math.max((item.likes || 1) - 1, 0);
  }

  // 再描画（これが一番確実）
  renderShowcaseLight();

  return;
}

  // 💾 保存
  const save = e.target.closest(".icon-save");
  if (save) {
    const path = save.querySelector("path");

    save.classList.toggle("saved");

    if (path) {
      path.setAttribute("fill", save.classList.contains("saved") ? "#000" : "none");
    }
    return;
  }
  
  // 🗑 削除 ←ここに追加！！
const deleteBtn = e.target.closest(".icon-delete");
if (deleteBtn) {
  const card = e.target.closest(".card");
  if (!card) return;

  const confirmDelete = confirm("このアイテムを削除する？");
  if (!confirmDelete) return;

  const showcaseEl = document.getElementById("showcase");
  const cards = Array.from(showcaseEl.querySelectorAll(".card"));
  const index = cards.indexOf(card);

  if (index > -1) {
    items.splice(index, 1);
  }

  card.remove();
  return;
}
  
  // 🔗 シェア
const share = e.target.closest(".icon-share");
if (share) {
  const card = e.target.closest(".card");
  if (!card) return;

  const linkEl = card.querySelector(".link-display");
  const url = linkEl?.href;

  if (!url || url === "#") {
    alert("リンクが設定されていません");
    return;
  }

  // 🔴 カード名取得
  const name = card.querySelector(".card-name")?.textContent || "おすすめアイテム";

  // 🔴 ネイティブ共有
  if (navigator.share) {
    navigator.share({
      title: name,
      text: name,
      url: url
    }).catch(err => console.log("共有キャンセル", err));
  } else {
    // fallback（コピー）
    navigator.clipboard.writeText(url);
    alert("リンクをコピーしました！");
  }

  return;
}
  
  // 💬 コメント
const commentBtn = e.target.closest(".icon-comment");
if (commentBtn) {
  const card = e.target.closest(".card");

  const showcaseEl = document.getElementById("showcase");
  const cards = Array.from(showcaseEl.querySelectorAll(".card"));
  const index = cards.indexOf(card);

  currentCommentIndex = index;

  openComments(index);
  return;
  }

  // 💰 価格
  const priceEl = e.target.closest(".card-price");
  if (priceEl) {
    const newPrice = prompt("価格を入力してね", priceEl.textContent);
    if (newPrice !== null) priceEl.textContent = newPrice;
    return;
  }
  
  // 🔗 リンククリック（カウント＋遷移）
const linkEl = e.target.closest(".link-display");
if (linkEl) {
  e.preventDefault();

  const card = e.target.closest(".card");
  if (!card) return;

  // 🔴 クリック数取得＆更新
  const clicksEl = card.querySelector(".modern-clicks");
  let current = parseInt(clicksEl.textContent) || 0;
  current++;
  clicksEl.textContent = current;

  // 🔴 itemsにも反映
  const showcaseEl = document.getElementById("showcase");
  const cards = Array.from(showcaseEl.querySelectorAll(".card"));
  const index = cards.indexOf(card);
  if (items[index]) {
    items[index].clicks = current;
  }

  // 🔴 リンクへ遷移
  const url = linkEl.href;
  if (url && url !== "#") {
    setTimeout(() => {
      window.open(url, "_blank");
    }, 150);
  }

  return;
  }


  // ✏️ 名前
  const nameEl = e.target.closest(".card-name");
  if (nameEl) {
    nameEl.focus();
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
// ポップアップリンク編集（カードDOM版）
// =========================
function showLinkEditPopup(card) {
  const popup = document.getElementById("linkModal"); // ←ここを修正
  if (!popup) {
    console.error("linkModal が存在しません");
    return;
  }

  const input = document.getElementById("linkModalInput"); // input もID指定に変更
  const btn = document.getElementById("linkModalSaveBtn"); // button もID指定

  if (!input || !btn) {
    console.error("popup 内の input または button が見つかりません");
    return;
  }

  const linkDisplay = card.querySelector(".link-display");
  input.value = linkDisplay ? linkDisplay.textContent : "";

  popup.classList.add('active');
  input.focus();

  btn.onclick = () => {
    let newLink = input.value.trim();
    if (newLink && !newLink.startsWith("http")) newLink = "https://" + newLink;

    if (linkDisplay) {
      linkDisplay.textContent = newLink || "リンクを入力";
      linkDisplay.href = newLink || "#"; 
    }

    const showcaseEl = document.getElementById("showcase");
    const cards = Array.from(showcaseEl.querySelectorAll(".card"));
    const index = cards.indexOf(card);
    if (items[index]) items[index].link = newLink;

    popup.classList.remove('active'); // 非表示
  };
}

// =========================
// 保存（アプリ全体）
// =========================
function saveAppState_FULL() {
  try {
    const showcase = document.getElementById("showcase");
    const cards = showcase.querySelectorAll(".card");

    items = Array.from(cards).map((card, index) => {
  const nameEl = card.querySelector(".card-name");
  const priceEl = card.querySelector(".card-price");

  return {
    id: items[index]?.id || Date.now() + index,
    name: nameEl?.textContent.trim() || "アイテム名",
    price: priceEl?.textContent.trim() || "¥0",
    link: card.querySelector(".link-display")?.textContent || "",
    img: card.querySelector("img")?.src || "",
    liked: card.querySelector(".icon-heart")?.classList.contains("liked") || false,
    saved: card.querySelector(".icon-save")?.classList.contains("saved") || false,
    clicks: parseInt(card.querySelector(".modern-clicks")?.textContent || "0"),
    fontColorName: nameEl ? getComputedStyle(nameEl).color : "",
    fontColorPrice: priceEl ? getComputedStyle(priceEl).color : ""
  };
});

    const state = {
      // 🔴 アイテム系
      items,

      // 🔴 プロフィール系
      headerImg: document.getElementById("headerImg")?.src || null,
      avatarImg: document.getElementById("avatarImg")?.src || null,
      profileName: document.getElementById("profileName")?.textContent || "",
      profileBio: document.getElementById("profileBio")?.textContent || "",

      // 🔴 テーマ
      theme: document.querySelector('input[name="theme"]:checked')?.value || "natural",

      // 🔴 スタイル
      showcaseBg: document.getElementById("showcase")?.style.backgroundColor || "",
      fontFamily: document.documentElement.style.getPropertyValue('--font-family') || "",
      fontColor: (() => {
      const profile = document.getElementById("profileName");
      if (profile) return getComputedStyle(profile).color;

      const card = document.querySelector(".card-name");
      if (card) return getComputedStyle(card).color;

      return "";
     })(),
     fontColorVar: (() => {
     const stats = document.querySelector(".profile-stats");
     if (stats) return getComputedStyle(stats).getPropertyValue('--font-color').trim();
     return "";
     })(),
  
     profileBg: getComputedStyle(document.getElementById('profileSection'))?.backgroundColor || "#ffffff",

      // 🔴 アナウンスバー
      announcementVisible: document.getElementById("announcementToggle")?.checked || false,
      announcementText: document.querySelector('#announcementBar .banner-text')?.textContent || "",
      announcementBg: document.getElementById("announcementBar")?.style.backgroundColor || "",
      announcementFontColor: document.querySelector('#announcementBar .banner-text')?.style.color || ""
    };

    localStorage.setItem("recomenState", JSON.stringify(state));
    alert("保存しました");
  } catch (e) {
    alert("保存に失敗しました");
    console.error(e);
  }
}

// =========================
// 保存データ読み込み（軽量版対応）
// =========================
function getDefaultItems() {
  return [
    { id: 1, name: "アイテム1", price: "¥0", link: "", img: "", liked: false, saved: false, clicks: 0 },
    { id: 2, name: "アイテム2", price: "¥0", link: "", img: "", liked: false, saved: false, clicks: 0 },
    { id: 3, name: "アイテム3", price: "¥0", link: "", img: "", liked: false, saved: false, clicks: 0 },
    { id: 4, name: "アイテム4", price: "¥0", link: "", img: "", liked: false, saved: false, clicks: 0 }
  ];
}

function loadAppState() {
  alert("① loadAppState 開始");

  let state = null;

  try {
    const saved = localStorage.getItem("recomenState");
    alert("② localStorage取得: " + (saved ? "あり" : "なし"));

    state = saved ? JSON.parse(saved) : null;
  } catch (e) {
    alert("❌ JSONパース失敗");
    state = null;
  }

  // 初期化
  if (!state) {
    alert("③ state 初期化");
    state = {
      items: getDefaultItems(),
      profileName: "プロフィール名",
      profileBio: "プロフィール紹介",
      theme: "natural",
      fontFamily: "'Source Han Sans JP', sans-serif",
      fontColor: "#000",
      profileBg: "#fff",
      announcementVisible: true,
      announcementText: "アナウンスバーのテキスト",
      announcementBg: "#f0f0f0",
      announcementFontColor: "#000",
      showcaseBg: "#fff"
    };
  }

  // アイテム
  alert("④ itemsセット前");
  items = (state.items && state.items.length > 0)
    ? state.items
    : getDefaultItems();
  alert("⑤ itemsセット後: " + items.length);

  // プロフィール
  const headerImgEl = document.getElementById("headerImg");
  if (headerImgEl) headerImgEl.src = state.headerImg || headerImgEl.src;

  const avatarImgEl = document.getElementById("avatarImg");
  if (avatarImgEl) avatarImgEl.src = state.avatarImg || avatarImgEl.src;

  const profileNameEl = document.getElementById("profileName");
  if (profileNameEl) profileNameEl.textContent = state.profileName || "プロフィール名";

  const profileBioEl = document.getElementById("profileBio");
  if (profileBioEl) profileBioEl.textContent = state.profileBio || "プロフィール紹介";

  alert("⑥ プロフィールOK");

  // テーマ
  if (state.theme) {
    document.body.classList.remove('theme-natural', 'theme-modern');
    document.body.classList.add(`theme-${state.theme}`);
  }

  // ショーケース背景
  const showcase = document.getElementById("showcase");
  if (showcase && state.showcaseBg) {
    showcase.style.backgroundColor = state.showcaseBg;
  }

  // フォント
  if (state.fontFamily) {
    document.documentElement.style.setProperty('--font-family', state.fontFamily);
  }

  // フォントカラー
  if (state.fontColor) {
    const profileName = document.getElementById('profileName');
    const profileBio = document.getElementById('profileBio');

    if (profileName) profileName.style.color = state.fontColor;
    if (profileBio) profileBio.style.color = state.fontColor;
  }

  // プロフィール背景
  if (state.profileBg) {
    const profile = document.getElementById('profileSection');
    if (profile) profile.style.backgroundColor = state.profileBg;
  }

  // アナウンスバー
  const bar = document.getElementById("announcementBar");
  const bannerText = document.querySelector('#announcementBar .banner-text');

  if (bannerText) {
    bannerText.textContent = state.announcementText || "";
  }

  if (bar && state.announcementBg) {
    bar.style.backgroundColor = state.announcementBg;
  }

  if (bannerText && state.announcementFontColor) {
    bannerText.style.color = state.announcementFontColor;
  }

  alert("⑦ スタイル系OK");

  // 最低4枚確保
  while (items.length < 4) {
    items.push({
      id: Date.now() + items.length,
      name: `アイテム${items.length + 1}`,
      price: "¥0",
      link: "",
      img: "",
      liked: false,
      saved: false,
      clicks: 0
    });
  }

  alert("⑧ カード数最終: " + items.length);

  // 🔴 ここが超重要
  renderShowcaseLight();
  alert("⑨ renderShowcaseLight 実行完了");
}

// =========================
// 共通関数（画像アップロード・カラーピッカー）
// =========================
function initPickr() {
  const pickrConfigs = [
    { 
      el: '#bgPickerBox',
      apply: color => {
        const hex = color.toHEXA().toString();
        const showcase = document.getElementById('showcase');
        if(showcase) showcase.style.backgroundColor = hex;
      }
    },
    {
    el: '#fontColorPickerBox',
    apply: color => {
    const hex = color.toHEXA().toString();

    // プロフィール
    const profileName = document.getElementById('profileName');
    const profileBio = document.getElementById('profileBio');
    if(profileName) profileName.style.setProperty('color', hex);
    if(profileBio) profileBio.style.setProperty('color', hex);

    // カード
    document.querySelectorAll('.card-name, .card-price').forEach(el => {
      el.style.setProperty('color', hex);
    });

    // フォロー/フォロワー表示（CSS変数を更新）
    document.querySelectorAll('.profile-stats').forEach(el => {
      el.style.setProperty('--font-color', hex);
    });
    }
    },
    {
      el: '#announcementFontColorPickerBox',
      apply: color => {
        const hex = color.toHEXA().toString();
        const bannerText = document.querySelector('#announcementBar .banner-text');
        if (bannerText) bannerText.style.color = hex;
      }
    },
    {
      el: '#announcementBgPickerBox',
      apply: color => {
        const hex = color.toHEXA().toString();
        const banner = document.getElementById('announcementBar');
        if (banner) banner.style.backgroundColor = hex;
      }
    },
    {
  el: '#profileBgPickerBox',
  apply: color => {
    const hex = color.toHEXA().toString();
    const profile = document.getElementById('profileSection');
    if (profile) {
      profile.style.setProperty('background-color', hex, 'important');
      // 🔹 state → appState に変更
      appState.profileBg = hex; 
    }
  }
}
  ];

  pickrConfigs.forEach(cfg => {
    const el = document.querySelector(cfg.el);
    if (!el) return;

    const pickr = Pickr.create({
      el: el,
      theme: 'nano',
      default: '#ffffff',
      position: 'top',
      closeOnScroll: false,
      appendTo: document.body,
      components: {
        preview: true,
        opacity: true,
        hue: true,
        interaction: {
          hex: true,
          rgba: true,
          input: true,
          save: true
        }
      }
    });

    // 保存
    pickr.on('save', color => {
      cfg.apply(color);
      pickr.hide();
    });

    // 👇 これを中に入れるのがポイント！！
    pickr.on('show', () => {
  const app = pickr.getRoot().app;
  if (!app) return;

  app.style.position = 'fixed';

  const rect = app.getBoundingClientRect();

  let top = rect.top;
  let left = rect.left;

  // 下にはみ出たら上へ
  if (rect.bottom > window.innerHeight) {
    top = window.innerHeight - rect.height - 8;
  }

  // 上にはみ出たら下へ
  if (top < 8) {
    top = 8;
  }

  // 左右も制御（←これ重要）
  if (left < 8) left = 8;
  if (left + rect.width > window.innerWidth) {
    left = window.innerWidth - rect.width - 8;
  }

  app.style.top = `${top}px`;
  app.style.left = `${left}px`;
});

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
  console.log("JS読み込まれた");
  



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


  const fontSelect = document.getElementById('fontSelect');
  if (fontSelect) fontSelect.addEventListener('change', e => document.documentElement.style.setProperty('--font-family', e.target.value));

  setupImageUpload(document.getElementById('headerImg'), document.getElementById('headerImgInput'));
  setupImageUpload(document.getElementById('avatarImg'), document.getElementById('avatarImgInput'));

  loadAppState();
  initCardClicks();
  
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
// リンク編集モーダル：背景クリックで閉じる
// =========================
const linkModal = document.getElementById("linkModal");
if (linkModal) {
  linkModal.addEventListener("click", e => {
    if (e.target.id === "linkModal") {
      linkModal.classList.remove("active");
    }
  });
}
  
// =========================
// カスタムバー編集開閉
// =========================
const editToggle = document.getElementById('editToggle');
const editItems = document.getElementById('editItems');

if (editToggle && editItems) {
  editToggle.addEventListener('click', e => {
    e.stopPropagation();

    // ポップアップ閉じる
    document.querySelectorAll('.popup').forEach(p => p.classList.remove('active'));

    if (editItems.classList.contains('active')) {
      editItems.classList.remove('active');
      editItems.style.maxHeight = '0';
    } else {
      editItems.classList.add('active');
      editItems.style.maxHeight = editItems.scrollHeight + 'px';
    }
  });
}

// 共通関数：ボタンの真上にポップアップ表示
function showPopupAboveButton(popupEl, buttonEl) {
  popupEl.style.visibility = 'hidden';
  popupEl.classList.add('active');

  const rect = buttonEl.getBoundingClientRect();
  let top = rect.top - popupEl.offsetHeight - 8; // ボタンの上に8px余白
  let left = rect.left + rect.width / 2 - popupEl.offsetWidth / 2;
  
  // 👇 これ追加（超重要）
  if (top < 8) {
    top = rect.bottom + 8; // 下に出す
  }


  // 画面端に収める
  const minLeft = 8; // 左端の余白
  const maxLeft = window.innerWidth - popupEl.offsetWidth - 8; // 右端の余白
  if (left < minLeft) left = minLeft;
  if (left > maxLeft) left = maxLeft;

  popupEl.style.position = 'fixed';
  popupEl.style.top = `${top}px`;
  popupEl.style.left = `${left}px`;
  popupEl.style.visibility = 'visible';
}

// ポップアップ開閉処理（テーマ・スタイル・アナウンス）
const popups = {
  themeButton: 'themePopup',
  styleButton: 'stylePopup',
  announcementButton: 'announcementPopup'
};

Object.keys(popups).forEach(btnId => {
  const btn = document.getElementById(btnId);
  const popup = document.getElementById(popups[btnId]);
  if (!btn || !popup) return;

  btn.addEventListener('click', e => {
    e.stopPropagation();

    // 他のポップアップを閉じる
    document.querySelectorAll('.popup').forEach(p => {
      if (p !== popup) p.classList.remove('active');
    });

    // 今クリックしたボタンの真上に表示
    showPopupAboveButton(popup, btn);

    // ❌ この部分を削除
    // if (editItems.classList.contains('active')) {
    //   editItems.classList.remove('active');
    //   editItems.style.maxHeight = '0';
    // }
  });
});

// ※ 外クリックで閉じる処理は削除！
// ショーケースや他の部分を触ってもポップアップは閉じない


  // アナウンスバー入力反映
const bannerInput = document.getElementById('bannerTextInput');
const bannerSpan = document.querySelector('#announcementBar .banner-text');
if (bannerInput && bannerSpan) {
  const updateBannerAnimation = () => {
    const bar = document.getElementById('announcementBar');
    if (!bar) return;

    const textWidth = bannerSpan.offsetWidth;
    const barWidth = bar.offsetWidth;

    const speed = 50; // px/秒
    const duration = (barWidth + textWidth) / speed;

    bannerSpan.style.animation = `bannerScroll ${duration}s linear infinite`;
  };

  // 初回アニメーション設定
  updateBannerAnimation();

  // テキスト更新時も再計算
  bannerInput.addEventListener('input', e => {
    bannerSpan.textContent = e.target.value;
    // テキスト幅が変わったのでアニメーション再設定
    updateBannerAnimation();
  });
}
  
  // =========================
// テーマ切替
// =========================
document.querySelectorAll('input[name="theme"]').forEach(radio => {
  radio.addEventListener('change', e => {
    const theme = e.target.value;

    // 一旦リセット
    document.body.classList.remove('theme-natural', 'theme-modern');

    // 適用
    document.body.classList.add(`theme-${theme}`);
  });
});

// 初期テーマ（まだ何も付いてない時だけ）
if (!document.body.classList.contains('theme-natural') &&
    !document.body.classList.contains('theme-modern')) {
  document.body.classList.add('theme-natural');
}

// =========================
  // コメント送信
  // =========================
  document.getElementById("commentSendBtn").addEventListener("click", () => {
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
  document.getElementById("commentList").addEventListener("click", e => {
    const like = e.target.closest(".comment-like");
    if (!like) return;

    const i = like.dataset.i;
    const comment = items[currentCommentIndex].comments[i];

    comment.liked = !comment.liked;
    comment.likes = comment.liked ? (comment.likes || 0) + 1 : Math.max((comment.likes || 1) - 1, 0);

    openComments(currentCommentIndex);
  });

  // =========================
// 保存ボタンイベント
// =========================
const saveBtn = document.getElementById("saveBtn");
if (saveBtn) {
  saveBtn.addEventListener("click", () => {
    saveAppState_FULL();
  });
}

initPickr();  // カラーピッカーを初期化

window.addEventListener('scroll', () => {
  document.querySelectorAll('.popup.active').forEach(popup => {

    // 👇 これ追加！！（Pickr開いてる時は何もしない）
    if (document.querySelector('.pcr-app')) return;

    const btnId = Object.keys(popups).find(key => popups[key] === popup.id);
    if (!btnId) return;

    const btn = document.getElementById(btnId);
    if (!btn) return;
    

    showPopupAboveButton(popup, btn);
  });
});


});
