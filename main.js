// 各要素取得
const titleText = document.querySelector('#title');
const bodyText = document.querySelector('#body');
const userIdText = document.querySelector('#userId');
const posts = document.querySelector('#posts');
const postTemplate = document.querySelector('.post');
const newPostCreate = document.querySelector('.newPostCreate');
const filter = document.querySelector('.filter');
const showAll = document.querySelector('.showAll');
const sortBtn = document.querySelector('.sortButton');

// 初期投稿取得
window.addEventListener('DOMContentLoaded', fetchInitialPosts);

// API呼び出し
function fetchInitialPosts() {
  fetch('https://jsonplaceholder.typicode.com/posts')
    .then((res) => res.json())
    .then((data) => {
      data.forEach((item) => {
        const postElement = createPostElement(item);
        posts.prepend(postElement);
      });
    })
    .catch((err) => console.error(err.message));
}

// 投稿の操作
function createPostElement({ id, title, body, userId }) {
  const postClone = postTemplate.cloneNode(true);
  postClone.classList.remove('template');
  postClone.classList.add('newPost');
  postClone.dataset.userid = userId;
  postClone.dataset.likes = '0';
  postClone.dataset.liked = 'false';

  postClone.querySelector('h3').textContent = `タイトル: ${title}`;
  postClone.querySelector('p').textContent = `本文: ${body}`;
  postClone.querySelector('small').textContent = `ユーザーID: ${userId}`;
  postClone.querySelector('.likesValue').textContent = '0';

  postClone
    .querySelector('.deleteButton')
    .addEventListener('click', () => handleDelete(postClone, id));
  postClone
    .querySelector('.editButton')
    .addEventListener('click', () =>
      handleEdit(postClone, { id, title, body, userId })
    );
  postClone
    .querySelector('.likeButton')
    .addEventListener('click', () => handleLike(postClone));

  return postClone;
}

// 全ての投稿をまとめて配列化
function getAllPosts() {
  return Array.from(document.querySelectorAll('.newPost'));
}

// オーバーレイ作成
function overlay() {
  const overlay = document.createElement('div');
  overlay.classList.add('overlay');
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });
  document.body.appendChild(overlay);
  return overlay;
}

// オーバーレイにコンテンツを付与
function createOverlayWithContent(contentElement) {
  const overlayEl = overlay();
  overlayEl.appendChild(contentElement);
  return overlayEl;
}

// 新規投稿作成
newPostCreate.addEventListener('click', () => {
  const newPost = document.createElement('div');
  newPost.classList.add('newPost');
  newPost.innerHTML = `
    <input type="text" placeholder="タイトル" class="newTitle" />
    <textarea placeholder="本文" class="newBody"></textarea>
    <input type="number" placeholder="ユーザーID" class="newUserId" />
    <button type="submit">送信</button>
  `;

  const overlayElement = createOverlayWithContent(newPost);

  newPost.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = newPost.querySelector('.newTitle').value.trim();
    const body = newPost.querySelector('.newBody').value.trim();
    const userId = newPost.querySelector('.newUserId').value.trim();

    if (!title || !body || !userId) return alert('未入力の項目があります。');

    fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body, userId }),
    })
      .then((res) => res.json())
      .then((data) => {
        const postElement = createPostElement(data);
        posts.prepend(postElement);
        overlayElement.remove();
      })
      .catch((err) => console.error(err.message));
  });
});

// フィルター
filter.addEventListener('click', () => handleFilter());

function handleFilter() {
  const filterArea = document.createElement('div');
  filterArea.innerHTML = `
    <input type="number" placeholder="ユーザーIDを入力" class="filterInput" />
    <button type="button" class="filterButton">絞り込む</button>
  `;

  const overlayElement = createOverlayWithContent(filterArea);
  const filterButton = filterArea.querySelector('.filterButton');

  filterButton.addEventListener('click', () => {
    const inputValue = parseInt(filterArea.querySelector('.filterInput').value);
    const allPosts = getAllPosts();
    const validUserIds = [
      ...new Set(allPosts.map((post) => parseInt(post.dataset.userid))),
    ];

    if (!validUserIds.includes(inputValue)) {
      alert('入力されたユーザーIDが存在しません');
      return;
    }

    allPosts.forEach((post) => {
      post.style.display =
        parseInt(post.dataset.userid) === inputValue ? 'block' : 'none';
    });

    showAll.style.display = 'block';
    overlayElement.remove();
  });
}

showAll.addEventListener('click', () => {
  getAllPosts().forEach((post) => (post.style.display = 'block'));
  showAll.style.display = 'none';
});

// 並び替え
sortBtn.addEventListener('click', () => handleSort());

function handleSort() {
  const sortForm = document.createElement('div');
  sortForm.classList.add('sortForm');
  sortForm.innerHTML = `
    <button type="button" class="ascendingOrder">昇順</button>
    <button type="button" class="descendingOrder">降順</button>
  `;

  const overlayElement = createOverlayWithContent(sortForm);

  sortForm
    .querySelector('.ascendingOrder')
    .addEventListener('click', () => sortPosts('asc', overlayElement));
  sortForm
    .querySelector('.descendingOrder')
    .addEventListener('click', () => sortPosts('desc', overlayElement));
}

function sortPosts(order, overlayElement) {
  const sorted = getAllPosts().sort((a, b) => {
    const idA = parseInt(a.dataset.userid);
    const idB = parseInt(b.dataset.userid);
    return order === 'asc' ? idA - idB : idB - idA;
  });
  sorted.forEach((el) => posts.appendChild(el));
  overlayElement.remove();
}

// いいねボタン
function handleLike(postElement) {
  let likes = parseInt(postElement.dataset.likes);
  const liked = postElement.dataset.liked === 'true';
  const heart = postElement.querySelector('.heart');

  likes += liked ? -1 : 1;
  postElement.dataset.liked = (!liked).toString();
  postElement.dataset.likes = likes.toString();
  postElement.querySelector('.likesValue').textContent = likes;
  heart.style.fill = liked ? '' : 'rgb(245, 51, 84)';
}

// 削除ボタン
function handleDelete(postElement, id) {
  const deleteBtn = postElement.querySelector('.deleteButton');
  deleteBtn.textContent = '削除中...';
  fetch(`https://jsonplaceholder.typicode.com/posts/${id}`, {
    method: 'DELETE',
  })
    .then((res) => {
      if (!res.ok) throw new Error('削除に失敗しました');
      postElement.remove();
    })
    .catch((err) => {
      alert(err.message);
      deleteBtn.textContent = '削除';
    });
}

// 編集ボタン
function handleEdit(postElement, { id, title, body, userId }) {
  const editForm = document.createElement('div');
  editForm.classList.add('editInput');
  editForm.innerHTML = `
    <div><p>タイトル</p><input class="newTitle" placeholder="${title}"></div>
    <div><p>本文</p><input class="newBody" placeholder="${body}"></div>
    <button>保存</button>
  `;

  const overlayElement = createOverlayWithContent(editForm);
  const saveButton = editForm.querySelector('button');

  editForm.querySelectorAll('input').forEach((input) => {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        saveButton.click();
      }
    });
  });

  saveButton.addEventListener('click', () => {
    const newTitle = editForm.querySelector('.newTitle').value.trim() || title;
    const newBody = editForm.querySelector('.newBody').value.trim() || body;

    postElement.querySelector('h3').textContent = `タイトル: ${newTitle}`;
    postElement.querySelector('p').textContent = `本文: ${newBody}`;

    fetch(`https://jsonplaceholder.typicode.com/posts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle, body: newBody, userId }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('編集に失敗しました');
        overlayElement.remove();
      })
      .catch((err) => console.error(err.message));
  });
}
