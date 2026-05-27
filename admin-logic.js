import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getDatabase, ref, onValue, update } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-database.js";

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

const gradeSelect = document.getElementById("gradeSelect");
const container = document.getElementById("adminLinksContainer");
const replaceModal = new bootstrap.Modal(document.getElementById('replaceModal'));

// Grade එක මාරු කරනකොට දත්ත Load කිරීම
gradeSelect.addEventListener("change", loadData);
window.onload = loadData;

function loadData() {
    const selectedGrade = gradeSelect.value;
    const dbRef = ref(db, `grades/${selectedGrade}`);

    onValue(dbRef, (snapshot) => {
        const data = snapshot.val();
        container.innerHTML = "";

        if (!data) {
            container.innerHTML = "<div class='alert alert-warning text-center'>No links found for this grade. Please add some in Firebase.</div>";
            return;
        }

        Object.keys(data).forEach((key) => {
            const item = data[key];
            const col = document.createElement("div");
            col.className = "col-md-6 mb-3";
            col.innerHTML = `
                <div class="card border shadow-sm rounded-4">
                    <div class="card-body">
                        <h5 class="fw-bold">${item.title}</h5>
                        <p class="text-truncate small">${item.url}</p>
                        <span class="badge ${item.active ? 'bg-success' : 'bg-danger'} mb-3">${item.active ? 'Active' : 'Inactive'}</span>
                        <br>
                        <button class="btn btn-primary btn-sm w-100 rounded-pill" onclick="openEditModal('${selectedGrade}', '${key}', '${item.title}', '${item.url}', '${item.expiresAt}', ${item.active})">
                            Replace Link
                        </button>
                    </div>
                </div>
            `;
            container.appendChild(col);
        });
    });
}

// Modal එක open කරලා දත්ත පුරවන්න
window.openEditModal = (grade, key, title, url, expiry, active) => {
    document.getElementById("editKey").value = `${grade}/${key}`;
    document.getElementById("editTitle").value = title;
    document.getElementById("editUrl").value = url;
    document.getElementById("editExpiry").value = expiry || "";
    document.getElementById("editActive").checked = active;
    replaceModal.show();
};

// දත්ත Update කිරීම
document.getElementById("saveChangesBtn").onclick = async () => {
    const path = document.getElementById("editKey").value;
    const updatedData = {
        title: document.getElementById("editTitle").value,
        url: document.getElementById("editUrl").value,
        expiresAt: document.getElementById("editExpiry").value,
        active: document.getElementById("editActive").checked
    };

    try {
        await update(ref(db, `grades/${path}`), updatedData);
        alert("Success! Link updated.");
        replaceModal.hide();
    } catch (error) {
        alert("Error updating link: " + error.message);
    }
};