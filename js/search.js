const URL_BASE = "http://lampstack.fgxmt.com";
const API_BASE = "/LAMPAPI";

let ContactId = null;

async function doSearch() {
    const resultA = document.getElementById("resultsA");
    const userText = document.getElementById("sBar").value.trim();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user.userId || 0;

    if (!userText) {
        resultA.innerHTML = "<p>Please enter a name above</p>";
        clearContacts();
        return;
    }

    resultA.innerHTML = "<p>Searching...</p>";

    try {
        const res = await fetch(`${URL_BASE}${API_BASE}/SearchContact.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ search: userText, userId })
        });

        const data = await res.json();

        if (!data.results || data.results.length === 0) {
            resultA.innerHTML = "<p>No contacts found</p>";
            clearContacts();
            return;
        }

        resultA.innerHTML = "";

        data.results.forEach((contact, index) => {
            const div = document.createElement("div");
            div.textContent = `${contact.firstName} ${contact.lastName}`;
            div.classList.add("contact-result");
            div.addEventListener("click", () => { 
                ContactId = contact.id; 
                displayContacts(contact);
            });
            resultA.appendChild(div);
            if (index < data.results.length - 1) {
                const line = document.createElement("hr");
                resultA.appendChild(line);
            }
        });

    } catch (err) {
        console.error(err);
        resultA.innerHTML = "<p>Network error</p>";
        clearContacts();
    }
}

//Put data into proper boxes
function displayContacts(contact) {
    document.getElementById("firstName").value = contact.firstName || "";
    document.getElementById("lastName").value = contact.lastName || "";
    document.getElementById("phoneNum").value = contact.phoneNumber || "";
    document.getElementById("emailInfo").value = contact.emailAddress || "";
}

function clearContacts() {
    document.getElementById("firstName").value = "";
    document.getElementById("lastName").value = "";
    document.getElementById("phoneNum").value = "";
    document.getElementById("emailInfo").value = "";
    ContactId = null;
}


async function edContact() {
    if (!ContactId) return;

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user.userId || 0;

    const contactData = { id: ContactId, firstName: document.getElementById("firstName").value.trim(), lastName: document.getElementById("lastName").value.trim(), phone: document.getElementById("phoneNum").value.trim(), email: document.getElementById("emailInfo").value.trim(), userId
    };

    try {
        const res = await fetch(`${URL_BASE}${API_BASE}/EdContact.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(contactData)
        });

        const data = await res.json();
        doSearch();

    } catch (err) {
        console.error(err);
        alert(err.message || "Network error");
    }
}

async function delContact() {
    if (!ContactId) return;

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user.userId || 0;

    try {
        const res = await fetch(`${URL_BASE}${API_BASE}/DelContact.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: ContactId, userId })
        });

        const data = await res.json();
        clearContacts();
        doSearch();

    } catch (err) {
        console.error(err);
        alert(err.message || "Network error");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const searchB = document.getElementById("sButton");
    if (searchB) searchB.addEventListener("click", doSearch);
    const editB = document.getElementById("edit");
    if (editB) editB.addEventListener("click", edContact);
    const deleteB = document.getElementById("delete");
    if (deleteB) deleteB.addEventListener("click", delContact);
});
