import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getDatabase, ref, onValue, update, push, remove } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-database.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBkC75ZGm1iXXYdKR8lDNIP_l27RR5b8fM",
    authDomain: "mathswithmalindasirweb.firebaseapp.com",
    projectId: "mathswithmalindasirweb",
    databaseURL: "https://mathswithmalindasirweb-default-rtdb.asia-southeast1.firebasedatabase.app",
    storageBucket: "mathswithmalindasirweb.firebasestorage.app",
    messagingSenderId: "806771086827",
    appId: "1:806771086827:web:55978c72cac010a3d935ae"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let editModal;

// Modal & Events Initialize
document.addEventListener("DOMContentLoaded", () => {
    editModal = new bootstrap.Modal(document.getElementById('editModal'));

    document.getElementById("addNewBtn").addEventListener("click", openAddModal);
    document.getElementById("saveBtn").addEventListener("click", saveData);
    document.getElementById("gradeSelect").addEventListener("change", (e) => loadData(e.target.value));

    // Initial Load
    loadData("grade11");
});

// 1. Load Data
function loadData(grade) {
    const container = document.getElementById("adminLinksContainer");
    
    onValue(ref(db, `grades/${grade}`), (snapshot) => {
        const data = snapshot.val();
        container.innerHTML = "";
        
        if (!data) {
            container.innerHTML = `
                <div class='text-center p-5 text-muted'>
                    <h5>දැනට මෙම ශ්‍රේණිය සඳහා දත්ත නොමැත.</h5>
                    <p class='small'>අලුත් ලින්ක් එකක් එකතු කිරීමට '+ Add New Class' කියන එක Click කරන්න.</p>
                </div>`;
            return;
        }

        Object.keys(data).forEach(key => {
            const item = data[key];
            const col = document.createElement("div");
            col.className = "col-md-6 mb-3";

            const cat = item.category || 'both';
            let badgeColor = 'bg-success';
            if (cat === 'theory') badgeColor = 'bg-primary';
            if (cat === 'paper') badgeColor = 'bg-warning text-dark';

            col.innerHTML = `
                <div class="card p-4 h-100 border-0 shadow-sm rounded-4">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <h5 class="fw-bold mb-0">${item.title || ''}</h5>
                        <span class="badge ${badgeColor} rounded-pill">${cat.toUpperCase()}</span>
                    </div>
                    <p class="text-muted small text-truncate mb-2">${item.url || ''}</p>
                    <div class="d-flex gap-2 mb-3">
                        <span class="badge ${item.active ? 'bg-success' : 'bg-danger'} rounded-pill">
                            ${item.active ? 'Active' : 'Inactive'}
                        </span>
                        ${item.isLive ? '<span class="badge bg-danger rounded-pill">🔴 LIVE</span>' : ''}
                    </div>
                    <div class="d-flex gap-2">
                        <button class="btn btn-primary btn-sm rounded-pill flex-grow-1 edit-btn" 
                            data-grade="${grade}" 
                            data-key="${key}" 
                            data-title="${encodeURIComponent(item.title || '')}" 
                            data-url="${encodeURIComponent(item.url || '')}" 
                            data-active="${item.active}" 
                            data-category="${cat}" 
                            data-islive="${item.isLive || false}">
                            <i class="bi bi-pencil-square"></i> Edit
                        </button>
                        <button class="btn btn-outline-danger btn-sm rounded-pill px-3 delete-btn" data-grade="${grade}" data-key="${key}">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>`;
            container.appendChild(col);
        });

        // Dynamic Event Listeners for Edit and Delete
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget;
                openEdit(
                    target.dataset.grade,
                    target.dataset.key,
                    decodeURIComponent(target.dataset.title),
                    decodeURIComponent(target.dataset.url),
                    target.dataset.active === 'true',
                    target.dataset.category,
                    target.dataset.islive === 'true'
                );
            });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget;
                deleteLink(target.dataset.grade, target.dataset.key);
            });
        });

    }, (error) => {
        console.error("Firebase Read Error:", error);
        container.innerHTML = `<div class='text-center p-5 text-danger'>දත්ත ලෝඩ් කිරීමේදී දෝෂයක් සිදු විය: ${error.message}</div>`;
    });
}

// 2. Open Add Modal
function openAddModal() {
    document.getElementById("editKey").value = "NEW";
    document.getElementById("editTitle").value = "";
    document.getElementById("editUrl").value = "";
    document.getElementById("editCategory").value = "both";
    document.getElementById("editActive").checked = true;
    document.getElementById("editIsLive").checked = false;
    document.querySelector(".modal-title").innerText = "Add New Class Link";
    editModal.show();
}

// 3. Open Edit Modal
function openEdit(grade, key, title, url, active, category = 'both', isLive = false) {
    document.getElementById("editKey").value = `${grade}/${key}`;
    document.getElementById("editTitle").value = title;
    document.getElementById("editUrl").value = url;
    document.getElementById("editCategory").value = category;
    document.getElementById("editActive").checked = active;
    document.getElementById("editIsLive").checked = isLive;
    document.querySelector(".modal-title").innerText = "Update Class Details";
    editModal.show();
}

// 4. Delete Logic
async function deleteLink(grade, key) {
    if (confirm("මෙම ලින්ක් එක සම්පූර්ණයෙන්ම මකා දැමීමට ඔබට අවශ්‍යද?")) {
        try {
            await remove(ref(db, `grades/${grade}/${key}`));
            alert("සාර්ථකව මකා දැමුවා!");
        } catch (e) {
            alert("Error: " + e.message);
        }
    }
}

// 5. Save Logic
async function saveData() {
    const mode = document.getElementById("editKey").value;
    const currentGrade = document.getElementById("gradeSelect").value;
    
    const data = {
        title: document.getElementById("editTitle").value,
        url: document.getElementById("editUrl").value,
        category: document.getElementById("editCategory").value,
        active: document.getElementById("editActive").checked,
        isLive: document.getElementById("editIsLive").checked,
        teacher: "Malinda Sir"
    };

    if (!data.title || !data.url) {
        alert("කරුණාකර සියලු විස්තර ඇතුළත් කරන්න!");
        return;
    }

    try {
        if (mode === "NEW") {
            await push(ref(db, `grades/${currentGrade}`), data);
            alert("අලුත් පන්තිය සාර්ථකව ඇතුළත් කළා!");
        } else {
            await update(ref(db, `grades/${mode}`), data);
            alert("සාර්ථකව වෙනස් කළා!");
        }
        editModal.hide();
    } catch (e) {
        alert("Error: " + e.message);
    }
}
