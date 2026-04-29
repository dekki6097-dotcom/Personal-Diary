// Configuration
const ADMIN_PASSWORD = "6578904321de";

// State Management
const initialPosts = [
    {
        id: "mock-1",
        title: "Welcome to my Diary",
        media: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&q=80&w=800",
        type: "image",
        desc: "This is the first entry in my new digital diary. I wanted to create a place where I can share my thoughts and experiences in a style that reminds me of my favorite indie games.\n\nEverything here is built with care. Feel free to leave comments!",
        date: new Date().toLocaleDateString(),
        comments: [
            { id: "c1", author: "Visitor", text: "Wow, the design looks amazing!", date: new Date().toLocaleString() }
        ]
    }
];

let state = {
    isAdmin: false,
    posts: JSON.parse(localStorage.getItem('diary_posts')) || initialPosts,
    currentPostId: null
};

// DOM Elements
const adminLoginBtn = document.getElementById('admin-login-btn');
const logoutBtn = document.getElementById('logout-btn');
const adminPanel = document.getElementById('admin-panel');
const loginModal = document.getElementById('login-modal');
const loginForm = document.getElementById('login-form');
const adminPasswordInput = document.getElementById('admin-password');
const closeLoginBtn = document.querySelector('.close-login');

const newPostForm = document.getElementById('new-post-form');
const postsGrid = document.getElementById('posts-grid');

const postModal = document.getElementById('post-modal');
const modalBody = document.getElementById('modal-body');
const closeModalBtn = document.querySelector('.close-modal');
const commentForm = document.getElementById('comment-form');
const commentsList = document.getElementById('comments-list');

// Initialize
function init() {
    renderPosts();
    setupEventListeners();
}

// Event Listeners
function setupEventListeners() {
    // Auth
    adminLoginBtn.addEventListener('click', () => loginModal.classList.remove('hidden'));
    closeLoginBtn.addEventListener('click', () => loginModal.classList.add('hidden'));
    logoutBtn.addEventListener('click', logout);
    
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (adminPasswordInput.value === ADMIN_PASSWORD) {
            login();
            loginModal.classList.add('hidden');
            adminPasswordInput.value = '';
        } else {
            alert('Incorrect password!');
        }
    });

    // Post Creation
    newPostForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('post-title').value;
        const media = document.getElementById('post-media').value;
        const type = document.getElementById('post-media-type').value;
        const desc = document.getElementById('post-desc').value;

        const newPost = {
            id: Date.now().toString(),
            title,
            media,
            type,
            desc,
            date: new Date().toLocaleDateString(),
            comments: []
        };

        state.posts.unshift(newPost);
        saveState();
        renderPosts();
        newPostForm.reset();
    });

    // Modal
    closeModalBtn.addEventListener('click', () => postModal.classList.add('hidden'));
    window.addEventListener('click', (e) => {
        if (e.target === postModal) postModal.classList.add('hidden');
        if (e.target === loginModal) loginModal.classList.add('hidden');
    });

    // Comments
    commentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = document.getElementById('comment-text').value;
        if (!state.currentPostId) return;

        const postIndex = state.posts.findIndex(p => p.id === state.currentPostId);
        if (postIndex === -1) return;

        state.posts[postIndex].comments.push({
            id: Date.now().toString(),
            author: state.isAdmin ? 'Admin' : 'User ' + Math.floor(Math.random() * 1000),
            text: text,
            date: new Date().toLocaleString()
        });

        saveState();
        renderComments(state.posts[postIndex].comments);
        commentForm.reset();
    });
}

// Actions
function login() {
    state.isAdmin = true;
    adminLoginBtn.classList.add('hidden');
    logoutBtn.classList.remove('hidden');
    adminPanel.classList.remove('hidden');
    renderPosts(); // Re-render to show admin controls on cards
}

function logout() {
    state.isAdmin = false;
    adminLoginBtn.classList.remove('hidden');
    logoutBtn.classList.add('hidden');
    adminPanel.classList.add('hidden');
    renderPosts();
}

function saveState() {
    localStorage.setItem('diary_posts', JSON.stringify(state.posts));
}

function deletePost(id) {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    state.posts = state.posts.filter(p => p.id !== id);
    saveState();
    renderPosts();
}

function openPost(id) {
    const post = state.posts.find(p => p.id === id);
    if (!post) return;

    state.currentPostId = id;
    
    modalBody.innerHTML = `
        <div class="modal-media">
            ${post.type === 'video' 
                ? `<video src="${post.media}" controls autoplay style="width:100%; border-radius:4px;"></video>` 
                : `<img src="${post.media}" style="width:100%; border-radius:4px;">`
            }
        </div>
        <h1 style="margin-top:20px; color:white;">${post.title}</h1>
        <p style="color:#858585; margin-bottom:20px;">Posted on ${post.date}</p>
        <div class="post-full-desc" style="white-space: pre-wrap;">${post.desc}</div>
    `;

    renderComments(post.comments);
    
    // Add delete button in modal for admin
    if (state.isAdmin) {
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-outline';
        deleteBtn.style.marginTop = '20px';
        deleteBtn.style.borderColor = '#ff4b4b';
        deleteBtn.style.color = '#ff4b4b';
        deleteBtn.textContent = 'Delete Entry';
        deleteBtn.onclick = () => {
            deletePost(id);
            postModal.classList.add('hidden');
        };
        modalBody.appendChild(deleteBtn);
    }

    postModal.classList.remove('hidden');
}

// Rendering
function renderPosts() {
    if (state.posts.length === 0) {
        postsGrid.innerHTML = '<div class="loading">No entries yet. Start writing your diary!</div>';
        return;
    }

    postsGrid.innerHTML = state.posts.map(post => `
        <div class="card" onclick="openPost('${post.id}')">
            <div class="card-media">
                ${post.type === 'video' 
                    ? `<div class="video-placeholder" style="color:var(--primary)">[ VIDEO ]</div>` 
                    : `<img src="${post.media}" alt="${post.title}" onerror="this.src='https://via.placeholder.com/400x225?text=Invalid+Image'">`
                }
            </div>
            <div class="card-content">
                <h3>${post.title}</h3>
                <p>${post.desc}</p>
            </div>
            <div class="card-footer">
                <span>${post.date}</span>
                <span>${post.comments.length} comments</span>
                ${state.isAdmin ? `<button class="btn btn-sm btn-outline btn-danger" onclick="event.stopPropagation(); deletePost('${post.id}')">Delete</button>` : ''}
            </div>
        </div>
    `).join('');
}

function renderComments(comments) {
    if (comments.length === 0) {
        commentsList.innerHTML = '<p style="color:#858585;">No comments yet. Be the first to comment!</p>';
        return;
    }

    commentsList.innerHTML = comments.map(c => `
        <div class="comment">
            <div class="comment-author">${c.author} • ${c.date}</div>
            <div class="comment-text">${c.text}</div>
        </div>
    `).join('');
}

// Global scope access for onclick
window.openPost = openPost;
window.deletePost = deletePost;

// Start the app
init();
