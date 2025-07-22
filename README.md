# ⏳ Titan Countdown

**Titan Countdown** is a futuristic, animated countdown timer web app with user login/registration, real-time countdown tracking, email notifications, and theme toggling — all built using Firebase and pure frontend technologies.

## 🚀 Live Demo

👉 [Try the Live App on Netlify](https://apnatimer.netlify.app/)

## ✨ Features

* 🔐 **User Authentication** (Firebase Auth)

* 📆 **Add Countdown Events** with name, date/time, and email

* 📩 **Email Notification** when countdown ends

* 🎨 **Dark / Bright Mode** toggle

* 🧠 **Animated UI** with particle effects and typing animation

* 🖼️ **Edit/Delete Countdown** events

* 📱 **Responsive Design** for mobile and desktop

* ⏱️ **Progress Bar** and Expiry Indicator

* ✅ **"Sent ✔️"** badge for completed email alerts

* 🎉 Friendly welcome message with animated typing effect

## 📸 Screenshots

| Login Page | Main Dashboard (Dark Mode) |
| :---: | :---: |
| ![Login Page](/login.png) | ![Main Dashboard](/dashboard-dark.png) |

| Add Countdown | Bright Mode |
| :---: | :---: |
| ![Add Countdown](/add-countdown.png) | ![Bright Mode](/dashboard-light.png) |

## 🔧 Technologies Used

* **HTML, CSS, JavaScript**

* **Firebase (Auth + Realtime Database)**

* **EmailJS** for email notifications

* **Particles.js** for visual effects

* **Google Fonts (Orbitron + Poppins)**

## 🛠️ Installation and Setup

To run this project locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/apna-timer.git](https://github.com/your-username/apna-timer.git)
    cd apna-timer
    ```

2.  **Configure Firebase:**
    Open `script.js` and replace the placeholder Firebase configuration with your own project's credentials.

    ```javascript
    // script.js

    const firebaseConfig = {
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_AUTH_DOMAIN",
      projectId: "YOUR_PROJECT_ID",
      storageBucket: "YOUR_STORAGE_BUCKET",
      messagingSenderId: "YOUR_SENDER_ID",
      appId: "YOUR_APP_ID",
      measurementId: "YOUR_MEASUREMENT_ID"
    };

    firebase.initializeApp(firebaseConfig);
    ```

3.  **Configure EmailJS:**
    Similarly, in `script.js`, you'll need to initialize EmailJS with your own User ID. You can get one from the [EmailJS website](https://www.emailjs.com/).

    ```javascript
    // script.js

    (function () {
        emailjs.init("YOUR_USER_ID");
      })();
    ```
4.  **Open in browser:**
    Simply open the `index.html` file in your web browser to run the application.
