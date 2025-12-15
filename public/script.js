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

// Fetch and display cat on load
document.addEventListener('DOMContentLoaded', fetchcat);

// Event Listeners
addBtn.addEventListener('click', () => openModal());
closeBtn.addEventListener('click', closeModal);
window.addEventListener('click', (e) => {
    if (e.target == modal) closeModal();
});
catForm.addEventListener('submit', saveCat);

async function fetchcat() {
    try {
        const response = await fetch('/cat');
        const cat = await response.json();
        rendercat(cat);
    } catch (error) {
        console.error('Error fetching cat:', error);
    }
}

function rendercat(cat) {
    cardsContainer.innerHTML = '';
    cat.forEach(cat => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <img src="${cat.img}" alt="${cat.name}" onerror="this.src='https://via.placeholder.com/300?text=No+Image'">
            <div class="card-content">
                <h2 >${cat.name}</h2>
                <p class="description">${cat.description || ''}</p>
                <span class="tag">${cat.tag || ''}</span>
                <div class="card-actions">
                    <button class="btn-edit" onclick="openModal(${cat.id}, '${cat.name.replace(/'/g, "\\'")}', '${(cat.description || '').replace(/'/g, "\\'")}', '${(cat.tag || '').replace(/'/g, "\\'")}', '${cat.img.replace(/'/g, "\\'")}')"><i class="fas fa-edit"></i> Edit</button>
                    <button class="btn-delete" onclick="deleteCat(${cat.id})"><i class="fas fa-trash"></i> Delete</button>
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

// Expose functions to global scope for inline onclick handlers
window.openModal = openModal;
window.deleteCat = deleteCat;
