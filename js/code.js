const API_BASE = ""; // if PHP files are in same folder as HTML

async function doLogin() {
  const login = document.getElementById("loginName").value.trim();
  const password = document.getElementById("loginPassword").value;

  if (!login || !password) {
    alert("Please enter both username and password.");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/login.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login, password })
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.error || "Login failed");
    }

    localStorage.setItem("user", JSON.stringify(data.data));
    alert(`Welcome, ${data.data.firstName}!`);
    // window.location.href = "home.html"; // change if you have a landing page
  } catch (err) {
    console.error(err);
    alert(err.message || "Network error");
  }
}

async function doRegister() {
  const firstName = document.getElementById("firstNameInput").value.trim();
  const lastName  = document.getElementById("lastNameInput").value.trim();
  const login     = document.getElementById("userNameInput").value.trim();
  const email     = document.getElementById("emailInput").value.trim(); // optional (not used in PHP yet)
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
    const res = await fetch(`${API_BASE}/register.php`, {
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
