// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBAxcU18-Jw_G6yR2VV3SXgGcxHJtMq5WQ",
  authDomain: "titancountdown.firebaseapp.com",
  projectId: "titancountdown",
  storageBucket: "titancountdown.firebaseapp.com",
  messagingSenderId: "23611468937",
  appId: "1:23611468937:web:96aadf6a4b34684d362a58",
  measurementId: "G-FTDLEPLDEQ",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();

let countdowns = [];
let intervalMap = {};
let editId = null;
let currentUser = null;

// Register User
function registerUser(email, password, username) {
  auth
    .createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const uid = userCredential.user.uid;
      db.ref("users/" + uid).set({ email, username });
      document.getElementById("authSection").style.display = "none";
      document.getElementById("appSection").style.display = "block";
      document.getElementById("typedUsername").innerHTML = "";
      typeWriter(username, "typedUsername");

      currentUser = uid;
      loadCountdowns(uid);
    })
    .catch((err) => alert(err.message));
}

// Login User
function loginUser(email, password) {
  auth
    .signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const uid = userCredential.user.uid;
      currentUser = uid;

      db.ref("users/" + uid)
        .once("value")
        .then((snapshot) => {
          const userData = snapshot.val();
          if (!userData || !userData.username) {
            alert("Username not found in database.");
            return;
          }
          const username = userData.username;
          document.getElementById("typedUsername").innerHTML = "";
          typeWriter(username, "typedUsername");

          document.getElementById("authSection").style.display = "none";
          document.getElementById("appSection").style.display = "block";
          loadCountdowns(uid);
        });
    })
    .catch((err) => alert(err.message));
}

// Stay logged in
auth.onAuthStateChanged((user) => {
  if (user) {
    const uid = user.uid;
    currentUser = uid;

    db.ref("users/" + uid)
      .once("value")
      .then((snapshot) => {
        const username = snapshot.val()?.username || "User";
        document.getElementById("authSection").style.display = "none";
        document.getElementById("appSection").style.display = "block";
        loadCountdowns(uid);
      });
  }
});

// Logout
function logout() {
  auth.signOut().then(() => {
    location.reload();
  });
}

// Toggle login/register
function toggleForms(type) {
  document.getElementById("registerSection").style.display =
    type === "login" ? "none" : "block";
  document.getElementById("loginSection").style.display =
    type === "login" ? "block" : "none";
}

// Load countdowns
function loadCountdowns(uid) {
  db.ref("countdowns/" + uid).once("value", (snapshot) => {
    const data = snapshot.val();
    countdowns = data ? Object.values(data) : [];
    renderCountdowns();
  });
}

// Add countdown
document
  .getElementById("countdownForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    const name = document.getElementById("eventName").value;
    const date = new Date(document.getElementById("eventDate").value).getTime();
    const email = document.getElementById("eventEmail").value;
    const id = Date.now();
    const newCountdown = { id, name, date, email, emailSent: false };

    countdowns.push(newCountdown);
    db.ref("countdowns/" + currentUser + "/" + id).set(newCountdown);
    renderCountdowns();
    this.reset();
  });

// Render countdowns
function renderCountdowns() {
  const container = document.getElementById("countdownList");
  container.innerHTML = "";
  countdowns.sort((a, b) => a.date - b.date);

  countdowns.forEach((countdown) => {
    const card = document.createElement("div");
    card.className = "countdown-card";
    card.id = `card-${countdown.id}`;

    const title = document.createElement("strong");
    title.textContent = `${countdown.name}:`;
    card.appendChild(title);

    const timer = document.createElement("div");
    timer.className = "timer";
    timer.id = `timer-${countdown.id}`;
    card.appendChild(timer);

    const progressContainer = document.createElement("div");
    progressContainer.className = "progress-bar-container";

    const progressBar = document.createElement("div");
    progressBar.className = "progress-bar";
    progressBar.id = `bar-${countdown.id}`;
    progressContainer.appendChild(progressBar);
    card.appendChild(progressContainer);

    const btns = document.createElement("div");
    btns.className = "actions";

    const edit = document.createElement("button");
    edit.className = "edit-btn";
    edit.innerText = "Edit";
    edit.onclick = () => openModal(countdown);

    const del = document.createElement("button");
    del.className = "delete-btn";
    del.innerText = "Delete";
    del.onclick = () => {
      countdowns = countdowns.filter((c) => c.id !== countdown.id);
      clearInterval(intervalMap[countdown.id]);
      db.ref("countdowns/" + currentUser + "/" + countdown.id).remove();
      renderCountdowns();
    };

    btns.appendChild(edit);
    btns.appendChild(del);
    card.appendChild(btns);
    container.appendChild(card);

    startCountdown(countdown);
  });
}

// Start Countdown
function startCountdown(countdown) {
  const start = Date.now();
  const total = countdown.date - start;

  function update() {
    const now = Date.now();
    const left = countdown.date - now;
    const timer = document.getElementById(`timer-${countdown.id}`);
    const card = document.getElementById(`card-${countdown.id}`);

    if (left <= 0) {
      clearInterval(intervalMap[countdown.id]);
      timer.innerText = "Expired";
      card.classList.add("expired");
      card.classList.remove("pulse");

      const bar = document.getElementById(`bar-${countdown.id}`);
      if (bar) bar.style.width = "100%";

      if (!countdown.emailSent) {
        sendEmail(countdown);
        countdown.emailSent = true;
        db.ref("countdowns/" + currentUser + "/" + countdown.id).update({
          emailSent: true,
        });

        const label = document.createElement("span");
        label.innerText = " ✔️ Sent";
        label.style.color = "limegreen";
        label.style.marginLeft = "10px";
        card.querySelector("strong").appendChild(label);
      }

      return;
    }

    if (left < 5 * 60 * 1000) {
      card.classList.add("pulse");
    } else {
      card.classList.remove("pulse");
    }

    const percent = ((now - start) / total) * 100;
    const d = Math.floor(left / (1000 * 60 * 60 * 24));
    const h = Math.floor((left % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((left % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((left % (1000 * 60)) / 1000);
    timer.innerText = `${d}d ${h}h ${m}m ${s}s`;

    const bar = document.getElementById(`bar-${countdown.id}`);
    if (bar) bar.style.width = `${percent}%`;
  }

  update();
  intervalMap[countdown.id] = setInterval(update, 1000);
}

// Email Notification
function sendEmail(countdown) {
  emailjs
    .send("service_dcahueh", "template_tnqbcbj", {
      email: countdown.email,
      event_name: countdown.name,
    })
    .then(() => console.log("Email sent"))
    .catch((err) => console.error("Email failed:", err));
}

// Edit Modal
function openModal(countdown) {
  editId = countdown.id;
  document.getElementById("editName").value = countdown.name;
  document.getElementById("editDate").value = new Date(countdown.date)
    .toISOString()
    .slice(0, 16);
  document.getElementById("modalOverlay").style.display = "flex";
}

function closeModal(event) {
  if (!event || event.target === document.getElementById("modalOverlay")) {
    document.getElementById("modalOverlay").style.display = "none";
    editId = null;
  }
}

function updateCountdown() {
  const name = document.getElementById("editName").value;
  const date = new Date(document.getElementById("editDate").value).getTime();
  const index = countdowns.findIndex((c) => c.id === editId);

  if (index !== -1) {
    countdowns[index].name = name;
    countdowns[index].date = date;

    db.ref("countdowns/" + currentUser + "/" + countdowns[index].id).update({
      name,
      date,
    });
    clearInterval(intervalMap[editId]);
    closeModal();
    renderCountdowns();
  }
}

// Register/Login listeners
document.getElementById("registerForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("regEmail").value;
  const pass = document.getElementById("regPassword").value;
  const username = document.getElementById("username").value;
  registerUser(email, pass, username);
});

document.getElementById("loginForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const pass = document.getElementById("loginPassword").value;
  loginUser(email, pass);
});

// Typing animation
function typeWriter(text, elementId, speed = 120) {
  const element = document.getElementById(elementId);
  let i = 0;

  function typingLoop() {
    if (i === 0) element.innerHTML = ""; // Clear only at start of each loop

    if (i < text.length) {
      element.innerHTML += text.charAt(i);
      i++;
      setTimeout(typingLoop, speed);
    } else {
      // Wait 2.5 seconds, then restart typing
      setTimeout(() => {
        i = 0;
        typingLoop();
      }, 2500);
    }
  }

  typingLoop();
}

function switchParticles(light) {
  // Remove existing canvas from #particles-js
  const particlesContainer = document.getElementById("particles-js");
  const oldCanvas = particlesContainer.querySelector("canvas");
  if (oldCanvas) particlesContainer.removeChild(oldCanvas);

  // Now re-initialize particles.js with new theme colors
  particlesJS("particles-js", {
    particles: {
      number: { value: 60, density: { enable: true, value_area: 800 } },
      color: { value: light ? "#111" : "#00ffb3" },
      shape: { type: "circle" },
      opacity: { value: 0.4 },
      size: { value: 3, random: true },
      line_linked: {
        enable: true,
        distance: 150,
        color: light ? "#888" : "#00ffb3",
        opacity: 0.3,
        width: 1,
      },
      move: { enable: true, speed: 2, out_mode: "out" },
    },
    interactivity: {
      detect_on: "canvas",
      events: {
        onhover: { enable: true, mode: "grab" },
        onclick: { enable: true, mode: "push" },
      },
      modes: {
        grab: { distance: 140, line_linked: { opacity: 0.5 } },
        push: { particles_nb: 4 },
      },
    },
    retina_detect: true,
  });
}

// Call once on load (defaults to dark)
switchParticles(false);

//toggle theme
// Theme Toggle
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("themeToggle");
  const label = document.getElementById("themeLabel");

  toggle.addEventListener("change", () => {
    const isLight = toggle.checked;
    document.body.classList.toggle("light-mode", isLight);
    label.textContent = isLight ? "Bright Mode" : "Dark Mode";
    switchParticles(isLight); // 🔁 Update particles with new theme
  });
});
