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
    const res = await fetch(`${URL_BASE}${API_BASE}/Login.php`, {
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
    const res = await fetch(`${URL_BASE}${API_BASE}/Register.php`, {
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
    const res = await fetch(`${URL_BASE}${API_BASE}/AddContact.php`, {
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

async function searchContact() {
  // todo
}