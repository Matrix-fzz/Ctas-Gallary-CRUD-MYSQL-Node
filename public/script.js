const cardsContainer = document.getElementById('cardsContainer');
const addBtn = document.getElementById('addBtn');
const modal = document.getElementById('catModal');
const closeBtn = document.querySelector('.close');
const catForm = document.getElementById('catForm');
const modalTitle = document.getElementById('modalTitle');
const catIdInput = document.getElementById('catId');
const catNameInput = document.getElementById('catName');
const catDescriptionInput = document.getElementById('catDescription');
const catTagInput = document.getElementById('catTag');
const catImageInput = document.getElementById('catImage');
const searchInput = document.getElementById('searchInput');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const pageInfo = document.getElementById('pageInfo');

// Login/Signup Elements
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const loginModal = document.getElementById('loginModal');
const signupModal = document.getElementById('signupModal');
const loginCloseBtn = document.querySelector('.login-close');
const signupCloseBtn = document.querySelector('.signup-close');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');

// Pannier Elements
const pannierBtn = document.getElementById('pannierBtn');
const pannierSidebar = document.getElementById('pannierSidebar');
const closeSidebarBtn = document.querySelector('.close-sidebar');
const pannierContent = document.getElementById('pannierContent');

let pannierCats = [];

let allCats = [];
let currentPage = 1;
const itemsPerPage = 10;

// Fetch and display cat on load
document.addEventListener('DOMContentLoaded', fetchcat);

// Event Listeners
addBtn.addEventListener('click', () => openModal());
closeBtn.addEventListener('click', closeModal);
catForm.addEventListener('submit', saveCat);

// Pannier Event Listeners
pannierBtn.addEventListener('click', toggleSidebar);
closeSidebarBtn.addEventListener('click', toggleSidebar);

// Close sidebar when clicking outside
window.addEventListener('click', (e) => {
    if (e.target == modal) closeModal();
    if (e.target != pannierSidebar && e.target != pannierBtn && !pannierSidebar.contains(e.target) && !pannierBtn.contains(e.target)) {
       pannierSidebar.classList.remove('open');
    }
});
catForm.addEventListener('submit', saveCat);

// Event Delegation for Edit/Delete buttons
cardsContainer.addEventListener('click', (e) => {
    const editBtn = e.target.closest('.btn-edit');
    const deleteBtn = e.target.closest('.btn-delete');
    const addPannierBtn = e.target.closest('.btn-add-pannier');

    if (editBtn) {
        const id = editBtn.dataset.id;
        const cat = allCats.find(c => c.id == id);
        if (cat) {
            openModal(cat.id, cat.name, cat.description, cat.tag, cat.img);
        }
    } else if (deleteBtn) {
        const id = deleteBtn.dataset.id;
        deleteCat(id);
    } else if (addPannierBtn) {
        const id = addPannierBtn.dataset.id;
        const cat = allCats.find(c => c.id == id);
        if (cat) {
            addToPannier(cat);
        }
    }
});

searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredCats = allCats.filter(cat => 
        cat.name.toLowerCase().includes(searchTerm)
    );
    currentPage = 1; // Reset to first page on search
    rendercat(filteredCats);
});

prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        const searchTerm = searchInput.value.toLowerCase();
        const filteredCats = allCats.filter(cat => 
            cat.name.toLowerCase().includes(searchTerm)
        );
        rendercat(filteredCats);
    }
});

nextBtn.addEventListener('click', () => {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredCats = allCats.filter(cat => 
        cat.name.toLowerCase().includes(searchTerm)
    );
    const totalPages = Math.ceil(filteredCats.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        rendercat(filteredCats);
    }
});

async function fetchcat() {
    try {
        const response = await fetch('/cat');
        if (!response.ok) {
            const text = await response.text();
            console.error('Failed to fetch /cat:', response.status, text);
            cardsContainer.innerHTML = `<p class="error">Failed to load cats: ${response.status}</p>`;
            return;
        }
        allCats = await response.json();
        rendercat(allCats);
    } catch (error) {
        console.error('Error fetching cat:', error);
        cardsContainer.innerHTML = `<p class="error">Error loading cats. Check console for details.</p>`;
    }
}

function rendercat(cats) {
    cardsContainer.innerHTML = '';
    
    // Pagination Logic
    const totalPages = Math.ceil(cats.length / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedCats = cats.slice(startIndex, endIndex);

    // Update Controls
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;

    paginatedCats.forEach(cat => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <img src="${cat.img}" alt="${cat.name}" onerror="this.src='https://via.placeholder.com/300?text=No+Image'">
            <div class="card-content">
                <h2 >${cat.name}</h2>
                <p class="description">${cat.description || ''}</p>
                <span class="tag">${cat.tag || ''}</span>
                <div class="card-actions">
                    <button class="btn-add-pannier" data-id="${cat.id}"><i class="fas fa-plus"></i> Pannier</button>
                    <button class="btn-edit" data-id="${cat.id}"><i class="fas fa-edit"></i> Edit</button>
                    <button class="btn-delete" data-id="${cat.id}"><i class="fas fa-trash"></i> Delete</button>
                </div>
            </div>
        `;
        cardsContainer.appendChild(card);
    });
}

function openModal(id = null, name = '', description = '', tag = '', img = '') {
    modal.style.display = 'block';
    if (id) {
        modalTitle.textContent = 'Edit Cat';
        catIdInput.value = id;
        catNameInput.value = name;
        catDescriptionInput.value = description;
        catTagInput.value = tag;
        catImageInput.value = img;
    } else {
        modalTitle.textContent = 'Add New Cat';
        catForm.reset();
        catIdInput.value = '';
    }
}

function closeModal() {
    modal.style.display = 'none';
    catForm.reset();
}

async function saveCat(e) {
    e.preventDefault();
    const id = catIdInput.value;
    const name = catNameInput.value;
    const description = catDescriptionInput.value;
    const tag = catTagInput.value;
    const img = catImageInput.value;
    const method = id ? 'PUT' : 'POST';
    const url = id ? `/cat/${id}` : '/cat';

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, description, tag, img })
        });

        if (response.ok) {
            closeModal();
            fetchcat();
        } else {
            console.error('Error saving cat');
        }
    } catch (error) {
        console.error('Error saving cat:', error);
    }
}

async function deleteCat(id) {
    if (confirm('Are you sure you want to delete this cat?')) {
        try {
            const response = await fetch(`/cat/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                fetchcat();
            } else {
                console.error('Error deleting cat');
            }
        } catch (error) {
            console.error('Error deleting cat:', error);
        }
    }
}

// Login/Signup Logic
if (loginBtn) {
    loginBtn.addEventListener('click', () => loginModal.style.display = 'block');
}
if (signupBtn) {
    signupBtn.addEventListener('click', () => signupModal.style.display = 'block');
}
if (loginCloseBtn) {
    loginCloseBtn.addEventListener('click', () => loginModal.style.display = 'none');
}
if (signupCloseBtn) {
    signupCloseBtn.addEventListener('click', () => signupModal.style.display = 'none');
}

window.addEventListener('click', (e) => {
    if (e.target == loginModal) loginModal.style.display = 'none';
    if (e.target == signupModal) signupModal.style.display = 'none';
});

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        try {
            const res = await fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (res.ok) {
                alert('Login Successful');
                loginModal.style.display = 'none';
                loginForm.reset();
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error(err);
            alert('Login failed');
        }
    });
}

if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('signupUsername').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        try {
            const res = await fetch('/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });
            const data = await res.json();
            if (res.ok) {
                alert('Signup Successful');
                signupModal.style.display = 'none';
                signupForm.reset();
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error(err);
            alert('Signup failed');
        }
    });
}

// Pannier Functions
function toggleSidebar() {
    pannierSidebar.classList.toggle('open');
}

function addToPannier(cat) {
    if (!pannierCats.some(c => c.id === cat.id)) {
        pannierCats.push(cat);
        renderPannier();
        // Optional: Open sidebar to show added item
        pannierSidebar.classList.add('open');
    } else {
        alert('This cat is already in your pannier!');
    }
}

function removeFromPannier(id) {
    pannierCats = pannierCats.filter(c => c.id !== id);
    renderPannier();
}

function renderPannier() {
    pannierContent.innerHTML = '';

    if (pannierCats.length === 0) {
        pannierContent.innerHTML = '<p class="empty-pannier">Your pannier is empty.</p>';
        return;
    }

    pannierCats.forEach(cat => {
        const item = document.createElement('div');
        item.className = 'pannier-item';
        item.innerHTML = `
            <img src="${cat.img}" alt="${cat.name}" onerror="this.src='https://via.placeholder.com/50'">
            <div class="pannier-item-info">
                <h4>${cat.name}</h4>
            </div>
            <button class="remove-pannier-btn" onclick="removeFromPannier('${cat.id}')">
                <i class="fas fa-trash"></i>
            </button>
        `;
        pannierContent.appendChild(item);
    });
}
/*
import { createClient } from '@supabase/supabase-js'

export default {
  async fetch(request, env) {
    // 1. Initialize Supabase with your Secrets
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY)

    // 2. Query your 'cat' table
    const { data, error } = await supabase
      .from('cat')
      .select('*')

    // 3. Handle errors
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 4. Return the data
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" }
    });
  }
}
*/