let video, detector, canvas, ctx;
let postureHistory = [];

async function setupCamera() {
  video = document.getElementById('video');
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: 640, height: 480 },
    audio: false
  });
  video.srcObject = stream;
  return new Promise(resolve => {
    video.onloadedmetadata = () => {
      video.play();
      resolve(video);
    };
  });
}

async function loadModel() {
  return await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet);
}

function drawKeypoints(pose) {
  for (let kp of pose.keypoints) {
    if (kp.score > 0.4) {
      ctx.beginPath();
      ctx.arc(kp.x, kp.y, 6, 0, 2 * Math.PI);
      ctx.fillStyle = "lime";
      ctx.fill();
    }
  }
}

function drawSkeleton(pose) {
  const adjacentPairs = poseDetection.util.getAdjacentPairs(poseDetection.SupportedModels.MoveNet);
  adjacentPairs.forEach(([i, j]) => {
    const kp1 = pose.keypoints[i];
    const kp2 = pose.keypoints[j];
    if (kp1.score > 0.4 && kp2.score > 0.4) {
      ctx.beginPath();
      ctx.moveTo(kp1.x, kp1.y);
      ctx.lineTo(kp2.x, kp2.y);
      ctx.strokeStyle = "aqua";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  });
}

function getAngle(p1, p2, p3) {
  const angle = Math.atan2(p3.y - p2.y, p3.x - p2.x) - Math.atan2(p1.y - p2.y, p1.x - p2.x);
  return Math.abs(angle * (180 / Math.PI));
}

function evaluatePosture(pose) {
  const keypoints = pose.keypoints.reduce((map, kp) => {
    map[kp.name] = kp;
    return map;
  }, {});

  const leftShoulder = keypoints["left_shoulder"];
  const rightShoulder = keypoints["right_shoulder"];
  const leftHip = keypoints["left_hip"];
  const rightHip = keypoints["right_hip"];
  const nose = keypoints["nose"];

  if (
    !leftShoulder || !rightShoulder || !leftHip || !rightHip || !nose ||
    leftShoulder.score < 0.4 || rightShoulder.score < 0.4 ||
    leftHip.score < 0.4 || rightHip.score < 0.4 || nose.score < 0.4
  ) {
    return { label: "❓ Unknown", score: 0 };
  }

  const midShoulder = {
    x: (leftShoulder.x + rightShoulder.x) / 2,
    y: (leftShoulder.y + rightShoulder.y) / 2
  };

  const midHip = {
    x: (leftHip.x + rightHip.x) / 2,
    y: (leftHip.y + rightHip.y) / 2
  };

  const verticalPoint = { x: midHip.x, y: midHip.y + 100 };
  const backAngle = getAngle(midShoulder, midHip, verticalPoint);
  const headOffset = Math.abs(nose.x - midShoulder.x);
  const shoulderTilt = Math.abs(leftShoulder.y - rightShoulder.y);

  // More lenient scoring
  let backScore = Math.max(0, 100 - backAngle * 3.5);
  let headScore = Math.max(0, 100 - headOffset * 0.7);
  let shoulderScore = Math.max(0, 100 - shoulderTilt * 2.5);

  backScore = Math.min(backScore, 100);
  headScore = Math.min(headScore, 100);
  shoulderScore = Math.min(shoulderScore, 100);

  const finalScore = Math.round((backScore * 0.4 + headScore * 0.3 + shoulderScore * 0.3));

  let label = "❓ Unknown";
  if (finalScore >= 65) label = "✅ Good";
  else if (finalScore >= 50) label = "⚠️ Average";
  else label = "❌ Bad";

  return {
    label,
    score: finalScore
  };
}

function drawPostureStatus(label, score, goodPercent) {
  const labelEl = document.getElementById("statusLabel");
  const displayText = `${label} (${score}%) • Good: ${goodPercent}%`;

  if (labelEl) {
    labelEl.textContent = displayText;
    labelEl.style.color =
      label.includes("Good") ? "lime" :
      label.includes("Average") ? "orange" : "red";
  }

  ctx.fillStyle = labelEl.style.color;
  ctx.font = "24px Arial";
  ctx.fillText(displayText, 20, 40);
}

async function detectPose() {
  const poses = await detector.estimatePoses(video);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  poses.forEach(pose => {
    drawKeypoints(pose);
    drawSkeleton(pose);

    const posture = evaluatePosture(pose);

    if (posture.label !== "❓ Unknown") {
      // ✅ Store only the label (string), not full object
      postureHistory.push(posture.label);
      if (postureHistory.length > 60) postureHistory.shift();

      // ✅ Count "✅ Good" strings in history
      const goodFrames = postureHistory.filter(label => label === "✅ Good").length;
      const totalFrames = postureHistory.length;
      const goodPercent = totalFrames > 0 ? Math.round((goodFrames / totalFrames) * 100) : 0;

      // ✅ Now pass everything correctly
      drawPostureStatus(posture.label, posture.score, goodPercent);

      console.log("Label:", posture.label, "Score:", posture.score, "Good%:", goodPercent);
    }
  });

  requestAnimationFrame(detectPose);
}


async function main() {
  await setupCamera();
  canvas = document.getElementById('output');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx = canvas.getContext('2d');

  detector = await loadModel();
  detectPose();
}

main();


