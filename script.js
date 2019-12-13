const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const text = document.getElementById("expr");
const debugON = false;

const args = {
  angry: "https://image.flaticon.com/icons/png/128/260/260228.png",
  happy: "https://image.flaticon.com/icons/png/128/187/187142.png",
  disgusted: "https://image.flaticon.com/icons/png/128/637/637523.png",
  fearful: "https://image.flaticon.com/icons/png/128/166/166524.png",
  neutral: "https://image.flaticon.com/icons/png/128/2164/2164188.png",
  sad: "https://image.flaticon.com/icons/png/128/187/187150.png",
  surprised: "https://image.flaticon.com/icons/png/128/166/166534.png"
};

let url = "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/";

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri(url + 'tiny_face_detector_model-weights_manifest.json'),
  faceapi.nets.faceLandmark68Net.loadFromUri(url + 'face_landmark_68_model-weights_manifest.json'),
  faceapi.nets.faceRecognitionNet.loadFromUri(url + 'face_recognition_model-weights_manifest.json'),
  faceapi.nets.faceExpressionNet.loadFromUri(url + 'face_expression_model-weights_manifest.json')
]).then(startVideo);

function objToString(obj) {
  let mostPredict = "neutral";
  let maxVal = 0;
  var str = "<img class='icon' src='" + args[mostPredict] + "'></img> " + mostPredict;

  if (!obj) return str;

  obj = obj.expressions;
  for (var p in obj) {
    if (obj.hasOwnProperty(p)) {
      if (obj[p] > maxVal) {
        maxVal = obj[p];
        mostPredict = p;
      }
    }
  }

  if (debugON == true) console.log(mostPredict, maxVal);

  return "<img class='icon' src='" + args[mostPredict] + "'></img> " + mostPredict;
}

function startVideo() {
  
  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
	
	
  /*navigator.getUserMedia(
    { video: {} },
    stream => (video.srcObject = stream),
    err => {
      console.error(err);
    }
  );*/
  
  if (navigator.getUserMedia) {
   navigator.getUserMedia({ audio: true, video: { width: 1280, height: 720 } },
      function(stream) {
         var video = document.querySelector('video');
         video.srcObject = stream;
         video.onloadedmetadata = function(e) {
           video.play();
         };
      },
      function(err) {
         console.log("The following error occurred: " + err.name);
      }
   );
} else {
   document.body.innerText ="getUserMedia not supported";
   console.log("getUserMedia not supported");
}
}

video.addEventListener("play", () => {
  let visitedMsg = true;

  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();

    if (visitedMsg) {
      text.innerText = "Your expression";
      visitedMsg = false;
    }

    text.innerHTML = objToString(detections[0]);
  }, 100);
});
