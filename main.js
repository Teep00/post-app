const form = document.querySelector('#postForm');
const titleText = document.querySelector('#title');
const bodyText = document.querySelector('#body');
const userIdText = document.querySelector('#userId');
const posts = document.querySelector('#posts');
const post = document.querySelector('.post');
const filter = document.querySelector('.filter');
const showAll = document.querySelector('.showAll');
const sortBtn = document.querySelector('.sortButton');
// 投稿要素を作成
function createPostElement({ id, title, body, userId }) {
  const postClone = post.cloneNode(true);
  postClone.classList.remove('template');
  postClone.classList.add('newPost');

  postClone.querySelector('h3').textContent = `タイトル: ${title}`;
  postClone.querySelector('p').textContent = `本文: ${body}`;
  postClone.querySelector('small').textContent = `ユーザーID: ${userId}`;

  const deleteBtn = postClone.querySelector('.deleteButton');
  const editBtn = postClone.querySelector('.editButton');
  const likeBtn = postClone.querySelector('.likeButton');
  const likesValue = postClone.querySelector('.likesValue');

  postClone.dataset.likes = '0';
  postClone.dataset.liked = 'false';
  likesValue.textContent = '0';

  deleteBtn.addEventListener('click', () =>
    handleDelete(postClone, deleteBtn, id)
  );
  editBtn.addEventListener('click', () =>
    handleEdit(postClone, { id, title, body, userId })
  );
  likeBtn.addEventListener('click', () => {
    handleLike(postClone, likesValue);
  });

  return postClone;
}

// 削除処理
function handleDelete(postElement, button, id) {
  button.textContent = '削除中...';
  fetch(`https://jsonplaceholder.typicode.com/posts/${id}`, {
    method: 'DELETE',
  })
    .then((res) => {
      if (!res.ok) throw new Error('削除に失敗しました');
      postElement.remove();
      console.log(`ID: ${id} を削除しました`);
    })
    .catch((err) => {
      alert(err.message);
      button.textContent = '削除';
    });
}

function overlay() {
  const overlay = document.createElement('div');
  overlay.classList.add('overlay');
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });
  document.body.appendChild(overlay);
  return overlay;
}

// 編集処理
function handleEdit(postElement, { id, title, body, userId }) {
  const overlayEl = overlay();
  const edit = document.createElement('div');
  edit.classList.add('editInput');
  edit.innerHTML = `
    <div>
      <p>タイトル</p>
      <input class="newTitle" placeholder="${title}">
    </div>
    <div>
      <p>本文</p>
      <input class="newBody" placeholder="${body}">
    </div>
    <button>保存</button>
  `;
  overlayEl.appendChild(edit);

  const saveButton = edit.querySelector('button');

  edit.querySelectorAll('input').forEach((input) => {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        saveButton.click();
      }
    });
  });

  saveButton.addEventListener('click', () => {
    const newTitle = edit.querySelector('.newTitle').value.trim() || title;
    const newBody = edit.querySelector('.newBody').value.trim() || body;

    postElement.querySelector('h3').textContent = `タイトル: ${newTitle}`;
    postElement.querySelector('p').textContent = `本文: ${newBody}`;

    fetch(`https://jsonplaceholder.typicode.com/posts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle, body: newBody, userId }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('編集に失敗しました');
      })
      .catch((err) => console.error(err.message));

    overlay.remove();
  });
}

// フォームから投稿
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = titleText.value.trim();
  const body = bodyText.value.trim();
  const userId = userIdText.value.trim();

  if (!title || !body || !userId) {
    alert('未入力の項目があります。');
    return;
  }

  fetch('https://jsonplaceholder.typicode.com/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, body, userId }),
  })
    .then((res) => res.json())
    .then((data) => {
      const postElement = createPostElement(data);
      posts.prepend(postElement);

      titleText.value = '';
      bodyText.value = '';
      userIdText.value = '';
    })
    .catch((err) => console.error(err.message));
});

function handleLike(postElement, likesValue) {
  let likes = parseInt(postElement.dataset.likes);
  const liked = postElement.dataset.liked === 'true';
  const heart = postElement.querySelector('.heart');

  if (liked) {
    likes--;
    postElement.dataset.liked = 'false';
    heart.style.fill = '';
  } else {
    likes++;
    postElement.dataset.liked = 'true';
    heart.style.fill = 'rgb(245, 51, 84)';
  }

  postElement.dataset.likes = likes.toString();
  likesValue.textContent = likes;
}

// 初期投稿を取得
window.addEventListener('DOMContentLoaded', () => {
  fetch('https://jsonplaceholder.typicode.com/posts')
    .then((res) => res.json())
    .then((data) => {
      data.forEach((item) => {
        const postElement = createPostElement(item);
        postElement.dataset.userid = parseInt(item.userId);
        posts.prepend(postElement);
      });
    })
    .catch((err) => console.error(err.message));
});

filter.addEventListener('click', () => {
  handleFilter();
});

function handleFilter() {
  const overlayEl = overlay();
  const filterArea = document.createElement('div');
  filterArea.innerHTML = `
  <input type="number" placeholder="ユーザーIDを入力" class="filterInput"></input>
  <button type="button" class="filterButton">絞り込む</button>
  `;
  overlayEl.appendChild(filterArea);
  const filterButton = filterArea.querySelector('.filterButton');

  filterButton.addEventListener('click', () => {
    const filterInput = filterArea.querySelector('.filterInput');
    const inputValue = parseInt(filterInput.value);
    if (isNaN(inputValue) || inputValue < 1 || inputValue > 10) {
      alert('入力されたユーザーIDが存在しません');
      filterInput.value = '';
      overlayEl.remove();
      return;
    }
    const postList = document.querySelectorAll('.newPost');
    postList.forEach((post) => {
      if (parseInt(filterInput.value) === parseInt(post.dataset.userid)) {
        post.style.display = 'block';
      } else {
        post.style.display = 'none';
      }
    });
    const postArr = Array.from(postList);
    const hiddenPosts = postArr.filter((post) => post.style.display === 'none');
    if (hiddenPosts.length > 0) {
      showAll.style.display = 'block';
    } else {
      showAll.style.display = 'none';
    }
    overlayEl.remove();
  });
}
showAll.addEventListener('click', () => {
  const postList = docuemnt.querySelectorAll('.newPost');
  postList.forEach((post) => {
    if (true) {
      post.style.display = 'block';
    }
  });
  showAll.style.display = 'none';
});

sortBtn.addEventListener('click', () => {
  handleSort();
});
function handleSort() {
  const overlayEl = overlay();
  const sortForm = document.createElement('div');
  sortForm.classList.add('sortFrom');
  sortForm.innerHTML = `
  <button type="button" class="ascendingOrder">昇順</button>
  <button type="button" class="descendingOrder">降順</button>
  `;
  overlayEl.appendChild(sortForm);
  const ascBtn = document.querySelector('.ascendingOrder');
  const descBtn = document.querySelector('.descendingOrder');

  ascBtn.addEventListener('click', () => {
    const postAsc = document.querySelectorAll('.newPost');
    // .sort((a,b)=>{
    // },0)
    overlayEl.remove();
  });
}
