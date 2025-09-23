const URL_BASE = "http://lampstack.fgxmt.com";
const API_BASE = "/LAMPAPI";

async function doLogin() {
  const login = document.getElementById("loginName").value.trim();
  const password = document.getElementById("loginPassword").value;

  if (!login || !password) {
    alert("Please enter both username and password.");
    return;
  }

  try {
    const res = await fetch(`LAMPAPI/Login.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login, password })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Login failed");
    }

    localStorage.setItem("userId", data.data.userId);
    
    alert(`Welcome, ${data.data.firstName}!`);
    window.location.href = "addContact.html"
  } catch (err) {
    console.error(err);
    alert(err.message || "Network error");
  }
}

async function doLogout()
{
    localStorage.setItem("userId", 0);
    window.location.href = "index.html";
}

async function doRegister() {
  const firstName = document.getElementById("firstNameInput").value.trim();
  const lastName  = document.getElementById("lastNameInput").value.trim();
  const login     = document.getElementById("userNameInput").value.trim();
  const password  = document.getElementById("passwordInput").value;
  const confirm   = document.getElementById("confirmPasswordInput").value;

  if (!firstName || !lastName || !login || !password) {
    alert("Please fill in all required fields.");
    return;
  }
  if (password !== confirm) {
    alert("Passwords do not match.");
    return;
  }

  try {
    const res = await fetch(`LAMPAPI/Register.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName,
        lastName,
        login,
        password
      })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Registration failed");
    }

    alert("Registration successful! You can now log in.");
    window.location.href = "index.html";
  } catch (err) {
    console.error(err);
    alert(err.message || "Network error");
  }
}

async function addContact() {
  const userId    = +localStorage.getItem("userId");
  const firstName = document.getElementById("firstName").value.trim();
  const lastName  = document.getElementById("lastName").value.trim();
  const phone  = document.getElementById("phoneNum").value.trim();
  const email = document.getElementById("emailInfo").value.trim();

  if (!firstName || !lastName) {
    alert("Please enter both first and last name.");
    return;
  }
  if (!phone && !email) {
    alert("Please enter at least one contact information.");
    return;
  }

  try {
    alert(JSON.stringify({
        userId,
        firstName,
        lastName,
        phone,
        email
      }));
    const res = await fetch(`LAMPAPI/addContact.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        firstName,
        lastName,
        phone,
        email
      })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Failed to add contact.");
    }

    alert("Contact added successfully!");
  } catch (err) {
    console.error(err);
    alert(err.message || "Network error");
  }
}

// Global variables
let allContacts = [];
let currentContact = null;
let isEditing = false;
let originalContactData = {};

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    loadContacts();
    setupEventListeners();
});

// Set up event listeners
function setupEventListeners() {
    const searchBar = document.getElementById('sBar');
    const editButton = document.getElementById('edit');
    const saveButton = document.getElementById('save');
    const cancelButton = document.getElementById('cancel');
    const deleteButton = document.getElementById('delete');
    
    // Real-time search
    searchBar.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        filterContacts(searchTerm);
    });
    
    // Edit button
    editButton.addEventListener('click', function() {
        enterEditMode();
    });
    
    // Save button
    saveButton.addEventListener('click', function() {
        saveContact();
    });
    
    // Cancel button
    cancelButton.addEventListener('click', function() {
        exitEditMode();
    });
    
    // Delete button
    deleteButton.addEventListener('click', function() {
        deleteContact();
    });
}

//Normalizer
function normalizeContact(c = {}) {
  return {
    id:        c.id ?? c.ID ?? null,
    firstName: c.firstName ?? c.FirstName ?? "",
    lastName:  c.lastName  ?? c.LastName  ?? "",
    phone:     c.phone     ?? c.Phone     ?? c.PhoneNumber ?? "",
    email:     c.email     ?? c.Email     ?? c.EmailAddress ?? ""
  };
}


// Load all contacts from the server
function loadContacts() {
  fetch('LAMPAPI/Search.php')
    .then(r => r.json())
    .then(data => {
      if (!data.success) throw new Error(data.error || 'Search failed');
      allContacts = (data.contacts || []).map(normalizeContact);
      displayContacts(allContacts);
    })
    .catch(err => showError('Network error: ' + err.message));
}


// Display contacts in the list
function displayContacts(contacts) {
  const container = document.getElementById('contactsContainer');

  if (!contacts.length) {
    container.innerHTML = '<div class="loading">No contacts found</div>';
    return;
  }

  container.innerHTML = contacts.map(c => `
    <div class="contact-item" data-contact-id="${c.id}">
      <div class="contact-name">${c.firstName} ${c.lastName}</div>
      <div class="contact-phone">${c.phone}</div>
    </div>
  `).join('');

  container.querySelectorAll('.contact-item').forEach(item => {
    item.addEventListener('click', function () {
      const contactId = this.getAttribute('data-contact-id');
      selectContact(contactId, this);
    });
  });
}

// Filter contacts based on search term
function filterContacts(searchTerm) {
  if (!searchTerm) { displayContacts(allContacts); return; }

  const s = String(searchTerm).toLowerCase();
  const filtered = allContacts.filter(c =>
    (c.firstName || "").toLowerCase().includes(s) ||
    (c.lastName  || "").toLowerCase().includes(s) ||
    (c.phone     || "").toLowerCase().includes(s) ||
    (c.email     || "").toLowerCase().includes(s)
  );

  displayContacts(filtered);
}


// Select a contact and display its details
function selectContact(contactId, element) {
  const c = allContacts.find(x => String(x.id) === String(contactId));
  if (!c) return;

  currentContact = c;

  document.querySelectorAll('.contact-item').forEach(i => i.classList.remove('selected'));
  if (element) element.classList.add('selected');

  displayContactDetails(c);
}


// Display contact details in the side panel
function displayContactDetails(c) {
  document.getElementById('firstName').value = c.firstName;
  document.getElementById('lastName').value  = c.lastName;
  document.getElementById('phoneNum').value  = c.phone;
  document.getElementById('emailInfo').value = c.email;

  document.getElementById('contactInfo').style.display = 'block';
  document.getElementById('noContactSelected').style.display = 'none';

  exitEditMode();
}


// Enter edit mode
function enterEditMode() {
  if (!currentContact) return;

  originalContactData = { ...currentContact };

  ['firstName','lastName','phoneNum','emailInfo'].forEach(id =>
    document.getElementById(id).removeAttribute('readonly')
  );

  document.getElementById('edit').style.display = 'none';
  document.getElementById('save').style.display = 'inline-block';
  document.getElementById('cancel').style.display = 'inline-block';

  isEditing = true;
  document.getElementById('firstName').focus();
}


// Exit edit mode
function exitEditMode() {
  if (isEditing && currentContact) {
    document.getElementById('firstName').value = originalContactData.firstName ?? "";
    document.getElementById('lastName').value  = originalContactData.lastName  ?? "";
    document.getElementById('phoneNum').value  = originalContactData.phone     ?? "";
    document.getElementById('emailInfo').value = originalContactData.email     ?? "";
  }

  ['firstName','lastName','phoneNum','emailInfo'].forEach(id =>
    document.getElementById(id).setAttribute('readonly','readonly')
  );

  document.getElementById('edit').style.display = 'inline-block';
  document.getElementById('save').style.display = 'none';
  document.getElementById('cancel').style.display = 'none';

  isEditing = false;
}


// Save contact changes
function saveContact() {
  if (!currentContact) return;

  const payload = {
    id:        currentContact.id,
    firstName: document.getElementById('firstName').value.trim(),
    lastName:  document.getElementById('lastName').value.trim(),
    phone:     document.getElementById('phoneNum').value.trim(),
    email:     document.getElementById('emailInfo').value.trim()
  };

  if (!payload.firstName || !payload.lastName || !payload.phone || !payload.email) {
    showError('All fields are required'); return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(payload.email)) { showError('Please enter a valid email'); return; }

  // Make sure the filename/case matches your server file exactly
  fetch('LAMPAPI/editContact.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  .then(r => r.json())
  .then(data => {
    if (!data.success) throw new Error(data.error || 'Update failed');

    const updated = normalizeContact(data.data);

    // update local list
    const idx = allContacts.findIndex(c => c.id === updated.id);
    if (idx !== -1) allContacts[idx] = updated;
    currentContact = updated;
    originalContactData = { ...updated };

    // re-render list using current search term
    const s = document.getElementById('sBar').value.trim().toLowerCase();
    filterContacts(s);

    showSuccess('Contact updated successfully!');
    exitEditMode();
  })
  .catch(err => showError('Network error: ' + err.message));
}


// Delete contact
function deleteContact() {
  if (!currentContact) return;
  if (!confirm(`Delete ${currentContact.firstName} ${currentContact.lastName}?`)) return;

  fetch('LAMPAPI/Delete.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: currentContact.id }) 
  })
  .then(r => r.json())
  .then(data => {
    if (!data.success) throw new Error(data.error || 'Delete failed');

    allContacts = allContacts.filter(c => c.id !== currentContact.id);
    currentContact = null;

    document.getElementById('contactInfo').style.display = 'none';
    document.getElementById('noContactSelected').style.display = 'block';

    const s = document.getElementById('sBar').value.trim().toLowerCase();
    filterContacts(s);

    showSuccess('Contact deleted successfully!');
  })
  .catch(err => showError('Network error: ' + err.message));
}


// Show error message
function showError(message) {
    // Remove existing messages
    clearMessages();
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.textContent = message;
    
    document.getElementById('detailsContent').insertBefore(
        errorDiv, 
        document.getElementById('detailsContent').firstChild
    );
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Show success message
function showSuccess(message) {
    // Remove existing messages
    clearMessages();
    
    const successDiv = document.createElement('div');
    successDiv.className = 'success';
    successDiv.textContent = message;
    
    document.getElementById('detailsContent').insertBefore(
        successDiv, 
        document.getElementById('detailsContent').firstChild
    );
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

// Clear existing messages
function clearMessages() {
    const existingMessages = document.querySelectorAll('.error, .success');
    existingMessages.forEach(msg => msg.remove());
}
