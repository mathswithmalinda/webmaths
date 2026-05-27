// 1. Admin Login Password
//const pwd = prompt("කරුණාකර Admin මුරපදය ඇතුළත් කරන්න:");
//if (pwd !== "2026") {
   // alert("මුරපදය වැරදියි!");
   // window.location.href = "index.html"; 
//}

// 2. Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getDatabase, ref, onValue, update, push, remove } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-database.js";

// 3. Firebase Config
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
const editModal = new bootstrap.Modal(document.getElementById('editModal'));

// 4. දත්ත පෙන්වන Function එක (Load Data)
function loadData(grade) {
    const container = document.getElementById("adminLinksContainer");
    onValue(ref(db, `grades/${grade}`), (snapshot) => {
        const data = snapshot.val();
        container.innerHTML = "";
        
        if (!data) {
            container.innerHTML = "<div class='text-center p-5'>දැනට දත්ත කිසිවක් නොමැත.</div>";
            return;
        }

        Object.keys(data).forEach(key => {
            const item = data[key];
            const col = document.createElement("div");
            col.className = "col-md-6 mb-3";
            col.innerHTML = `
                <div class="card p-4 h-100 border-0 shadow-sm rounded-4">
                    <h5 class="fw-bold mb-1">${item.title}</h5>
                    <p class="text-muted small text-truncate mb-3">${item.url}</p>
                    <div class="mb-3">
                        <span class="badge ${item.active ? 'bg-success' : 'bg-danger'} rounded-pill">${item.active ? 'Active' : 'Inactive'}</span>
                    </div>
                    <div class="d-flex gap-2">
                        <button class="btn btn-primary btn-sm rounded-pill flex-grow-1" onclick="openEdit('${grade}', '${key}', '${item.title}', '${item.url}', ${item.active})">
                            <i class="bi bi-pencil-square"></i> Edit
                        </button>
                        <button class="btn btn-outline-danger btn-sm rounded-pill px-3" onclick="deleteLink('${grade}', '${key}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>`;
            container.appendChild(col);
        });
    });
}

// 5. Add New Modal Open
window.openAddModal = () => {
    document.getElementById("editKey").value = "NEW";
    document.getElementById("editTitle").value = "";
    document.getElementById("editUrl").value = "";
    document.getElementById("editActive").checked = true;
    document.querySelector(".modal-title").innerText = "Add New Class Link";
    editModal.show();
};

// 6. Edit Modal Open
window.openEdit = (grade, key, title, url, active) => {
    document.getElementById("editKey").value = `${grade}/${key}`;
    document.getElementById("editTitle").value = title;
    document.getElementById("editUrl").value = url;
    document.getElementById("editActive").checked = active;
    document.querySelector(".modal-title").innerText = "Update Class Details";
    editModal.show();
};

// 7. Delete Logic
window.deleteLink = async (grade, key) => {
    if (confirm("මෙම ලින්ක් එක සම්පූර්ණයෙන්ම මකා දැමීමට ඔබට අවශ්‍යද?")) {
        try {
            await remove(ref(db, `grades/${grade}/${key}`));
            alert("සාර්ථකව මකා දැමුවා!");
        } catch (e) {
            alert("Error: " + e.message);
        }
    }
};

// 8. Save Button Logic (Add සහ Update දෙකම මෙතැනින්)
document.getElementById("saveBtn").onclick = async () => {
    const mode = document.getElementById("editKey").value;
    const currentGrade = document.getElementById("gradeSelect").value;
    
    const data = {
        title: document.getElementById("editTitle").value,
        url: document.getElementById("editUrl").value,
        active: document.getElementById("editActive").checked,
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
};

// 9. Initial Actions
document.getElementById("gradeSelect").onchange = (e) => loadData(e.target.value);
window.onload = () => loadData("grade11");