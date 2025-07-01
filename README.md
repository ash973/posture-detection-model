# 🧍‍♀️ Smart Posture Detection Web App

This is a real-time **posture monitoring web app** that uses your webcam and the MoveNet pose estimation model via TensorFlow.js. It evaluates posture using keypoint-based scoring and gives immediate visual feedback, helping users stay mindful of their sitting or standing posture.

Made with 💡 by **Aashi**.

---

## 🎯 Features

- ✅ Real-time webcam posture tracking
- 🧠 Pose estimation with MoveNet (TensorFlow.js)
- 📐 Posture scoring based on:
  - Back angle
  - Head alignment
  - Shoulder symmetry
- 📊 Live percentage of “Good” posture
- 🖥️ Lightweight browser-based app (no install needed)
- ✨ Modern UI with responsive layout

---

## 🚀 Getting Started

### 🛠️ 1. Clone the repository

```bash
git clone https://github.com/ash973/posture-detection-model.git
cd posture-detection-model
🌐 2. Open index.html
Just open the file in any modern browser (Chrome, Edge, Firefox).

Allow webcam access when prompted.

🧪 How It Works
The model evaluates posture in real time based on:

📏 Back Angle: Vertical alignment of shoulders and hips

🧍‍♀️ Head Offset: Forward leaning of head relative to shoulders

↕️ Shoulder Tilt: Horizontal balance of both shoulders

Each metric contributes to a weighted posture score, which is visualized as:

Score Range	Label
≥ 65	✅ Good
50–64	⚠️ Average
< 50	❌ Bad

A live Good Posture % tracker gives feedback based on recent frame history.

🧠 In Progress
🤖 Integrating a machine learning model to classify posture more accurately using labeled keypoint data

🎨 UI revamp using a custom design from Figma

📈 Tracking posture trends and logging session history

🔊 Optional alert if posture remains bad for a long time

🧰 Tech Stack
TensorFlow.js (MoveNet)

JavaScript (Vanilla)

HTML5 + CSS3

Canvas API + Webcam API

👩‍💻 Author
Aashi P Kumar
