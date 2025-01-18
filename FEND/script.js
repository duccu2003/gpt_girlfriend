// setup
// innerW sửa lại các cái này để chỉnh lại độ rộng của phần chứa model
var innerW = window.innerWidth / 2;
const screenWidth = window.matchMedia("(max-width: 765px)");
var talktime = false;


const websocket = new WebSocket("ws://localhost:2607");

let lastSender = ""; // Lưu trữ thông tin về người gửi tin nhắn cuối cùng

websocket.onmessage = function (event) {
  const data = JSON.parse(event.data);
  const text = data.text;
  const audio = data.audio;


  const messageDiv = document.getElementById('messages');

  let avatarHTML = '';
  let nameHTML = '';
  if (lastSender !== "AI") {
    avatarHTML = `<img src="https://i.pinimg.com/originals/65/24/ea/6524ea64b47aae4825b3a0419e9b099c.jpg" class="avt-pr-chat" alt="">`;
    nameHTML = `<p class="name-pr-chat">AI</p>`
  }

  messageDiv.innerHTML += `
            <div id="chatBot" class="d-flex messages toBot" style="gap:10px">
                <div class="avt-pr">
                    ${avatarHTML}
                </div>
                <div class="items-chat">
                    ${nameHTML}
                    <pre class="text-chat">${text}</pre>
                </div>
            </div>
            `;

  lastSender = "AI";

  console.log("Received text:", text);
  console.log("Received audio:", audio ? "Audio data received" : "No audio");
  talktime = true;

  // Xử lý audio
  // if (audio) {
  //     const audioBlob = base64ToBlob(audio, 'audio/mp3');
  //     const audioUrl = URL.createObjectURL(audioBlob);
  //     const audioElement = new Audio(audioUrl);
  //     audioElement.play();

  // }
  if (audio) {
    talktime = true;
    const audioBlob = base64ToBlob(audio, 'audio/mp3');
    const reader = new FileReader();

    reader.onload = function (event) {
      const arrayBuffer = event.target.result;

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContext.decodeAudioData(arrayBuffer, function (audioBuffer) {
        // Đưa AudioBuffer vào hàm processAudioBuffer
        processAudioBuffer(audioBuffer);
      }, function (error) {
        console.error("Error decoding audio data:", error);
      });
    };

    reader.readAsArrayBuffer(audioBlob);
    // Giải phóng URL Blob sau khi âm thanh phát xong
    URL.revokeObjectURL(audioUrl);

  }
  else talktime = false;

};

function sendText() {
  const textInput = document.getElementById("textInput").value;
  const messageDiv = document.getElementById('messages');

  let avatarHTML = '';
  let nameHTML = '';
  if (lastSender !== "User") {
    avatarHTML = `<img src="https://pbs.twimg.com/media/FwxSEWLaMAESzuw.jpg" class="avt-pr-chat" alt="">`;
    nameHTML = `<p class="name-pr-chat">User</p>`
  }

  messageDiv.innerHTML += `
            <div id="chatUser" class="d-flex messages toUser" style="gap:10px">          
                <div class="items-chat">
                    ${nameHTML}
                    <pre class="text-chat">${textInput}</pre>
                </div>
                <div class="avt-pr">
                ${avatarHTML}
                </div> 
            </div>
            `;

  document.getElementById("textInput").value = null;
  document.getElementById("textInput").innerText = null;
  document.getElementById("textInput").innerHTML = null;
  websocket.send(textInput);
  lastSender = "User";
}

document.addEventListener('keydown', function (event) {
  const textInput = document.getElementById("textInput").value;
  const inputValue = document.getElementById("textInput").value.trim();

  if (event.key === 'Enter') {
    // Thực hiện hành động khi nhấn Enter
    if (event.shiftKey) {
      textInput += "\n";
    } else {
      if (inputValue !== (null || "")) {
        sendText(); // Gửi văn bản
      }
    }
    event.preventDefault();

  }
});

function handleScreenChange(e) {
  if (e.matches) {
    // Màn hình có chiều rộng nhỏ hơn hoặc bằng 765px
    innerW = window.innerWidth;
  } else {
    // Màn hình có chiều rộng lớn hơn 765px
    innerW = window.innerWidth / 2;

  }
}
screenWidth.addEventListener('change', handleScreenChange);
handleScreenChange(screenWidth);

//expression setup
var expressionyay = 0;
var expressionoof = 0;
var expressionlimityay = 0.5;
var expressionlimitoof = 0.5;
var expressionease = 100;
var expressionintensity = 0.75;

//interface values
if (localStorage.localvalues) {
  var initvalues = true;
  var mouththreshold = Number(localStorage.mouththreshold);
  var mouthboost = Number(localStorage.mouthboost);
  var bodythreshold = Number(localStorage.bodythreshold);
  var bodymotion = Number(localStorage.bodymotion);
  var expression = Number(localStorage.expression);
} else {
  var mouththreshold = 10;
  var mouthboost = 10;
  var bodythreshold = 10;
  var bodymotion = 10;
  var expression = 80;
}
// Handling MP3 file upload
function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const arrayBuffer = e.target.result;
    audioContext.decodeAudioData(arrayBuffer, function (buffer) {
      processAudioBuffer(buffer);
    });
  };
  reader.readAsArrayBuffer(file);
}

// Process the decoded audio buffer
function processAudioBuffer(buffer) {
  const source = audioContext.createBufferSource();
  source.buffer = buffer;

  analyser = audioContext.createAnalyser();
  analyser.smoothingTimeConstant = 0.5;
  analyser.fftSize = 1024;

  source.connect(analyser);
  analyser.connect(audioContext.destination);

  source.start(0);

  source.onended = function () {
    console.log("Audio playback finished.");
  };

  processAudio(analyser);
}

function detectPhoneme(audioArray) {
  const lowFreq = audioArray.slice(0, 20).reduce((a, b) => a + b, 0) / 20;
  const midFreq = audioArray.slice(20, 60).reduce((a, b) => a + b, 0) / 40;
  const highFreq = audioArray.slice(60, 100).reduce((a, b) => a + b, 0) / 40;

  // Điều chỉnh ngưỡng và logic để cải thiện phân loại phoneme
  if (highFreq > 130 && midFreq > 100) {
    return 'I';
  } else if (midFreq > 110 && lowFreq > 90) {
    return 'A';
  } else if (lowFreq > 100 && midFreq < 90) {
    return 'U';
  } else if (midFreq > 100 && highFreq < 110) {
    return 'E';
  } else if (lowFreq > 90 && highFreq < 100) {
    return 'O';
  }
  return 'A'; // Default to 'A' instead of 'O'

}
// function detectPhoneme(audioArray) {
//   // Sử dụng các dải tần số hợp lý để cải thiện khả năng nhận diện phoneme
//   const lowFreq = audioArray.slice(0, 20).reduce((a, b) => a + b, 0) / 20;
//   const midFreq = audioArray.slice(20, 60).reduce((a, b) => a + b, 0) / 40;
//   const highFreq = audioArray.slice(60, 100).reduce((a, b) => a + b, 0) / 40;
//   // A,I,U,E,O
//   // Điều chỉnh ngưỡng để cải thiện phân loại phoneme
//   if (highFreq > 150 && midFreq > 120) {
//       return 'I';
//   } else if (midFreq > 130 && lowFreq > 110) {
//       return 'A';
//   } else if (lowFreq > 120 && midFreq < 100) {
//       return 'U';
//   } else if (midFreq > 110 && highFreq < 120) {
//       return 'E';
//   } else if (lowFreq > 110 && highFreq < 110) {
//       return 'O';
//   }
//   else return 'O';

// }


// function detectPhoneme(audioArray) {
//   // Calculate the average of different frequency ranges
//   const lowFreq = audioArray.slice(0, 10).reduce((a, b) => a + b, 0) / 10;
//   const midFreq = audioArray.slice(10, 30).reduce((a, b) => a + b, 0) / 20;
//   const highFreq = audioArray.slice(30, 50).reduce((a, b) => a + b, 0) / 20;

//   // More sophisticated phoneme detection based on frequency characteristics
//   if (highFreq > 150 && midFreq > 100) {
//     return 'I';
//   } else if (midFreq > 120 && lowFreq > 100) {
//     return 'A';
//   } else if (lowFreq > 120 && midFreq < 100) {
//     return 'U';
//   } else if (midFreq > 100 && highFreq < 120) {
//     return 'E';
//   } else if (lowFreq > 100 && highFreq < 100) {
//     return 'O';
//   }
//   return null;
// }



// This function is similar to the one you used for live audio input
function processAudio(analyser) {
  javascriptNode = audioContext.createScriptProcessor(256, 1, 1);
  javascriptNode.connect(audioContext.destination);
  analyser.connect(javascriptNode);

  javascriptNode.onaudioprocess = function () {
    var array = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(array);
    var values = 0;
    talktime = true;
    for (var i = 0; i < array.length; i++) {
      values += array[i];
    }

    var average = values / array.length;
    var inputvolume = average;

    // Update the interface slider
    document.getElementById("inputlevel").value = inputvolume;

    if (currentVrm != undefined) {
      const detectedPhoneme = detectPhoneme(array);
      let blendShapeName = null;
      switch (detectedPhoneme) {
        case 'A':
          blendShapeName = THREE.VRMSchema.BlendShapePresetName.A;
          break;
        case 'I':
          blendShapeName = THREE.VRMSchema.BlendShapePresetName.I;
          break;
        case 'U':
          blendShapeName = THREE.VRMSchema.BlendShapePresetName.U;
          break;
        case 'E':
          blendShapeName = THREE.VRMSchema.BlendShapePresetName.E;
          break;
        case 'O':
          blendShapeName = THREE.VRMSchema.BlendShapePresetName.O;
          break;
        // case 'C':
        //     blendShapeName = THREE.VRMSchema.BlendShapePresetName.C; // Nếu bạn đã định nghĩa trước đó hoặc dùng một preset khác
        //     break;
        // Add more cases as needed for other phonemes
      }
      // Process talking animation
      if (talktime == true) {
        var voweldamp = 53;
        // var vowelmin = 12;
        var vowelmin = 0;
        if (inputvolume > (mouththreshold * 2)) { //inputvolume > (mouththreshold * 1.5 )
          // if(blendShapeName && inputvolume > (mouththreshold * 2)){
          //   currentVrm.blendShapeProxy.setValue(blendShapeName, 
          //   // ((average - vowelmin) / voweldamp) * (mouthboost / 10)
          //   // (((average - vowelmin) / voweldamp) / average) * (mouthboost / 10)
          //   (((average - vowelmin) / voweldamp) / (average/2)) * (mouthboost / 10)
          // );
          // }

          if (blendShapeName && inputvolume > (mouththreshold * 1.5)) {
            currentVrm.blendShapeProxy.setValue(blendShapeName,
              Math.min(1, (((average - vowelmin) / voweldamp) / (average / 2)) * (mouthboost / 10))
            );
          }
          else if (!blendShapeName) {
            // currentVrm.blendShapeProxy.setValue(blendShapeName, 0);
            currentVrm.blendShapeProxy.setValue(
              THREE.VRMSchema.BlendShapePresetName.A,
              ((average - vowelmin) / voweldamp) * (mouthboost / 10)
            );
            currentVrm.blendShapeProxy.setValue(
              THREE.VRMSchema.BlendShapePresetName.O,
              ((average - vowelmin) / voweldamp) * (mouthboost / 10)
            );

          }

          else {
            currentVrm.blendShapeProxy.setValue(blendShapeName,
              // ((average - vowelmin) / voweldamp) * (mouthboost / 10)
              // (((average - vowelmin) / voweldamp) / average) * (mouthboost / 10)
              ((average + vowelmin) / voweldamp) * (mouthboost / 25)
            );
          }
          // currentVrm.blendShapeProxy.setValue(
          //   THREE.VRMSchema.BlendShapePresetName.A,
          //   ((average - vowelmin) / voweldamp) * (mouthboost / 10)
          // );

          // currentVrm.blendShapeProxy.setValue(
          //   THREE.VRMSchema.BlendShapePresetName.O,
          //   ((average - vowelmin) / voweldamp) * (mouthboost / 10)
          // );         
          talktime = false;
        }
        // if(blendShapeName!=null){
        //   currentVrm.blendShapeProxy.setValue(blendShapeName, 
        //     // ((average - vowelmin) / voweldamp) * (mouthboost / 10)
        //     // (((average - vowelmin) / voweldamp) / average) * (mouthboost / 10)
        //     ((average + vowelmin) / voweldamp) * (mouthboost / 25)
        //   );
        // }
        // else{
        //   currentVrm.blendShapeProxy.setValue(
        //     THREE.VRMSchema.BlendShapePresetName.A,
        //     ((average - vowelmin) / voweldamp) * (mouthboost / 10)
        //   );
        // }
        currentVrm.blendShapeProxy.setValue(
          THREE.VRMSchema.BlendShapePresetName.O,
          ((average - vowelmin) / voweldamp) * (mouthboost / 10)
        );
        // currentVrm.blendShapeProxy.setValue(blendShapeName, 0);
        // currentVrm.blendShapeProxy.setValue(THREE.VRMSchema.BlendShapePresetName.A, 0);
        // currentVrm.blendShapeProxy.setValue(THREE.VRMSchema.BlendShapePresetName.O, 0);

        // currentVrm.blendShapeProxy.setValue(THREE.VRMSchema.BlendShapePresetName.A, 0);
        // currentVrm.blendShapeProxy.setValue(THREE.VRMSchema.BlendShapePresetName.I, 0);
        // currentVrm.blendShapeProxy.setValue(THREE.VRMSchema.BlendShapePresetName.U, 0);
        // currentVrm.blendShapeProxy.setValue(THREE.VRMSchema.BlendShapePresetName.E, 0);
        // currentVrm.blendShapeProxy.setValue(THREE.VRMSchema.BlendShapePresetName.O, 0);
        // currentVrm.blendShapeProxy.setValue(
        //     THREE.VRMSchema.BlendShapePresetName.A, 0
        // );



      }
      else {
        if (talktime == false) {
          currentVrm.blendShapeProxy.setValue(blendShapeName, 0);
          // currentVrm.blendShapeProxy.setValue(THREE.VRMSchema.BlendShapePresetName.A, 0);
          // currentVrm.blendShapeProxy.setValue(THREE.VRMSchema.BlendShapePresetName.O, 0);
          currentVrm.blendShapeProxy.setValue(THREE.VRMSchema.BlendShapePresetName.A, 0);
          currentVrm.blendShapeProxy.setValue(THREE.VRMSchema.BlendShapePresetName.I, 0);
          currentVrm.blendShapeProxy.setValue(THREE.VRMSchema.BlendShapePresetName.U, 0);
          currentVrm.blendShapeProxy.setValue(THREE.VRMSchema.BlendShapePresetName.E, 0);
          currentVrm.blendShapeProxy.setValue(THREE.VRMSchema.BlendShapePresetName.O, 0);
          currentVrm.blendShapeProxy.setValue(
            THREE.VRMSchema.BlendShapePresetName.A, 0
          );
        }

      }
      currentVrm.blendShapeProxy.setValue(
        THREE.VRMSchema.BlendShapePresetName.Neutral, 1
      );

      // Process body motion
      var damping = 750 / (bodymotion / 10);
      var springback = 1.001;

      if (average > (1 * bodythreshold)) {
        // Body movement code remains the same
        var bones = [
          THREE.VRMSchema.HumanoidBoneName.Head,
          THREE.VRMSchema.HumanoidBoneName.Neck,
          THREE.VRMSchema.HumanoidBoneName.UpperChest,
          THREE.VRMSchema.HumanoidBoneName.RightShoulder,
          THREE.VRMSchema.HumanoidBoneName.LeftShoulder
        ];
        bones.forEach(function (bone) {
          currentVrm.humanoid.getBoneNode(bone).rotation.x += (Math.random() - 0.5) / damping;
          currentVrm.humanoid.getBoneNode(bone).rotation.x /= springback;
          currentVrm.humanoid.getBoneNode(bone).rotation.y += (Math.random() - 0.5) / damping;
          currentVrm.humanoid.getBoneNode(bone).rotation.y /= springback;
          currentVrm.humanoid.getBoneNode(bone).rotation.z += (Math.random() - 0.5) / damping;
          currentVrm.humanoid.getBoneNode(bone).rotation.z /= springback;
        });
      }

      // Handle expressions
      expressionyay += (Math.random() - 0.5) / expressionease;
      if (expressionyay > expressionlimityay) { expressionyay = expressionlimityay; }
      if (expressionyay < 0) { expressionyay = 0; }
      currentVrm.blendShapeProxy.setValue(THREE.VRMSchema.BlendShapePresetName.Fun, expressionyay);

      expressionoof += (Math.random() - 0.5) / expressionease;
      if (expressionoof > expressionlimitoof) { expressionoof = expressionlimitoof; }
      if (expressionoof < 0) { expressionoof = 0; }
      currentVrm.blendShapeProxy.setValue(THREE.VRMSchema.BlendShapePresetName.Angry, expressionoof);
    }

    // Update the look-at target
    lookAtTarget.position.x = camera.position.x;
    lookAtTarget.position.y = ((camera.position.y - camera.position.y - camera.position.y) / 2) + 0.5;

  };
}

// Initializing the AudioContext when loading an MP3 file
let audioContext = new (window.AudioContext || window.webkitAudioContext)();

// setup three-vrm

// renderer
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
renderer.setSize(innerW, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// camera
const camera = new THREE.PerspectiveCamera(30.0, (innerW) / window.innerHeight, 0.1, 20.0);
camera.position.set(0.0, 1.45, 1.75);


// camera controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.screenSpacePanning = true;
// controls.target.set(0.0, 1.45, 0.0);
controls.target.set(0.0, 1.25, 0.0);

controls.update();

// scene
const scene = new THREE.Scene();

// chỉnh màu nền phần model 3D
// scene.background = new THREE.Color(0x000000); // Thay đổi màu nền ở đây


// light
const light = new THREE.DirectionalLight(0xffffff);
light.position.set(1.0, 1.0, 1.0).normalize();
scene.add(light);

// lookat target
const lookAtTarget = new THREE.Object3D();
camera.add(lookAtTarget);

// gltf and vrm
let currentVrm = undefined;
const loader = new THREE.GLTFLoader();

function load(url) {

  loader.crossOrigin = 'anonymous';
  loader.load(

    url,

    (gltf) => {

      //THREE.VRMUtils.removeUnnecessaryVertices( gltf.scene ); Vroid VRM can't handle this for some reason
      THREE.VRMUtils.removeUnnecessaryJoints(gltf.scene);

      THREE.VRM.from(gltf).then((vrm) => {

        if (currentVrm) {

          scene.remove(currentVrm.scene);
          currentVrm.dispose();

        }

        currentVrm = vrm;
        scene.add(vrm.scene);

        vrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.Hips).rotation.y = Math.PI;

        vrm.springBoneManager.reset();

        // un-T-pose

        // vrm.humanoid.getBoneNode(
        //   THREE.VRMSchema.HumanoidBoneName.RightUpperArm
        // ).rotation.z = 250;

        //         vrm.humanoid.getBoneNode(
        //   THREE.VRMSchema.HumanoidBoneName.RightLowerArm
        // ).rotation.z = -0.2;

        // vrm.humanoid.getBoneNode(
        //   THREE.VRMSchema.HumanoidBoneName.LeftUpperArm
        // ).rotation.z = -250;

        // vrm.humanoid.getBoneNode(
        //   THREE.VRMSchema.HumanoidBoneName.LeftLowerArm
        // ).rotation.z = 0.2;

        vrm.humanoid.getBoneNode(
          THREE.VRMSchema.HumanoidBoneName.RightUpperArm
        ).rotation.z = 250;

        vrm.humanoid.getBoneNode(
          THREE.VRMSchema.HumanoidBoneName.RightLowerArm
        ).rotation.z = 0.1;
        vrm.humanoid.getBoneNode(
          THREE.VRMSchema.HumanoidBoneName.RightLowerArm
        ).rotation.y = 0.3;

        vrm.humanoid.getBoneNode(
          THREE.VRMSchema.HumanoidBoneName.LeftUpperArm
        ).rotation.z = -250;

        vrm.humanoid.getBoneNode(
          THREE.VRMSchema.HumanoidBoneName.LeftLowerArm
        ).rotation.z = -0.1;
        vrm.humanoid.getBoneNode(
          THREE.VRMSchema.HumanoidBoneName.LeftLowerArm
        ).rotation.y = -0.3;
        // randomise init positions

        function randomsomesuch() {
          return (Math.random() - 0.5) / 10;
        }

        // Tư thế đầu
        // Head
        // vrm.humanoid.getBoneNode(
        //   THREE.VRMSchema.HumanoidBoneName.Head
        // ).rotation.x = randomsomesuch();
        // vrm.humanoid.getBoneNode(
        //   THREE.VRMSchema.HumanoidBoneName.Head
        // ).rotation.y = randomsomesuch();
        // vrm.humanoid.getBoneNode(
        //   THREE.VRMSchema.HumanoidBoneName.Head
        // ).rotation.z = randomsomesuch();

        // Neck
        // vrm.humanoid.getBoneNode(
        //   THREE.VRMSchema.HumanoidBoneName.Neck
        // ).rotation.x = randomsomesuch();
        // vrm.humanoid.getBoneNode(
        //   THREE.VRMSchema.HumanoidBoneName.Neck
        // ).rotation.y = randomsomesuch();
        // vrm.humanoid.getBoneNode(
        //   THREE.VRMSchema.HumanoidBoneName.Neck
        // ).rotation.z = randomsomesuch();

        //Spine
        // vrm.humanoid.getBoneNode(
        //   THREE.VRMSchema.HumanoidBoneName.Spine
        // ).rotation.x = randomsomesuch();
        // vrm.humanoid.getBoneNode(
        //   THREE.VRMSchema.HumanoidBoneName.Spine
        // ).rotation.y = randomsomesuch();
        // vrm.humanoid.getBoneNode(
        //   THREE.VRMSchema.HumanoidBoneName.Spine
        // ).rotation.z = randomsomesuch();

        vrm.lookAt.target = lookAtTarget;
        vrm.springBoneManager.reset();

        console.log(vrm);
      });

    },

    (progress) => console.log('Loading model...', 100.0 * (progress.loaded / progress.total), '%'),

    (error) => console.error(error)

  );

}

// beware of CORS errors when using this locally. If you can't https, import the required libraries.
// load( './assets/model/Model-GWPH-V001.vrm' );
load('./assets/model/Fe-W-01.vrm');
// grid / axis helpers
//			const gridHelper = new THREE.GridHelper( 10, 10 );
//			scene.add( gridHelper );
//			const axesHelper = new THREE.AxesHelper( 5 );
//			scene.add( axesHelper );

// animate

const clock = new THREE.Clock();
const updateInterval = 1000 / 30; // Cập nhật 30 lần mỗi giây
let lastUpdate = 0;
let hadModelCharacter = false;
function animate() {
  requestAnimationFrame(animate);

  const deltaTime = clock.getDelta();
  const currentTime = performance.now();

  if (currentVrm) {
    // update vrm
    if (!hadModelCharacter) {
      hadModelCharacter = true;
      smoothUpdateVRM(currentVrm, deltaTime);
    }
    else {
      currentVrm.update(deltaTime);
    }
    // currentVrm.update(deltaTime);
    // smoothUpdateVRM(currentVrm, deltaTime);
  }

  renderer.render(scene, camera);
}
function smoothUpdateVRM(vrm, deltaTime) {
  const lerpFactor = 1 - Math.pow(0.001, deltaTime);

  // Nội suy cho các chuyển động đầu và cổ
  smoothRotation(vrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.Head), lerpFactor);
  smoothRotation(vrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.Neck), lerpFactor);
  smoothRotation(vrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.UpperChest), lerpFactor);

  // Cập nhật VRM
  vrm.update(deltaTime);
}

// Hàm hỗ trợ nội suy cho rotation
function smoothRotation(bone, lerpFactor) {
  if (bone && bone.rotation) {
    bone.rotation.x = THREE.MathUtils.lerp(bone.rotation.x, bone.rotation.x * 0.95, lerpFactor);
    bone.rotation.y = THREE.MathUtils.lerp(bone.rotation.y, bone.rotation.y * 0.95, lerpFactor);
    bone.rotation.z = THREE.MathUtils.lerp(bone.rotation.z, bone.rotation.z * 0.95, lerpFactor);
  }
}
animate();

// mic listener - get a value
navigator.mediaDevices
  .getUserMedia({
    audio: true
  })
  .then(
    function (stream) {
      audioContext = new AudioContext();
      analyser = audioContext.createAnalyser();
      microphone = audioContext.createMediaStreamSource(stream);
      javascriptNode = audioContext.createScriptProcessor(256, 1, 1);

      analyser.smoothingTimeConstant = 0.5;
      analyser.fftSize = 1024;

      microphone.connect(analyser);
      analyser.connect(javascriptNode);
      javascriptNode.connect(audioContext.destination);

      javascriptNode.onaudioprocess = function () {
        var array = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(array);
        var values = 0;

        var length = array.length;
        for (var i = 0; i < length; i++) {
          values += array[i];
        }

        // audio in expressed as one number
        var average = values / length;
        var inputvolume = average;

        // audio in spectrum expressed as array
        // console.log(array.toString());
        // useful for mouth shape variance

        // move the interface slider
        document.getElementById("inputlevel").value = inputvolume;



        // mic based / endless animations (do stuff)

        if (currentVrm != undefined) { //best to be sure

          // talk

          if (talktime == true) {
            // todo: more vowelshapes
            var voweldamp = 53;
            var vowelmin = 0;
            if (inputvolume > (mouththreshold * 2)) {
              currentVrm.blendShapeProxy.setValue(
                THREE.VRMSchema.BlendShapePresetName.O,
                (
                  (average - vowelmin) / voweldamp) * (mouthboost / 10)
              ); talktime = false;

            } else {
              talktime = false;
              currentVrm.blendShapeProxy.setValue(
                THREE.VRMSchema.BlendShapePresetName.O, 0
              );
            }
          }


          // move body

          // todo: replace with ease-to-target behaviour 
          var damping = 750 / (bodymotion / 10);
          var springback = 1.001;

          if (average > (1 * bodythreshold)) {
            currentVrm.humanoid.getBoneNode(
              THREE.VRMSchema.HumanoidBoneName.Head
            ).rotation.x += (Math.random() - 0.5) / damping;
            currentVrm.humanoid.getBoneNode(
              THREE.VRMSchema.HumanoidBoneName.Head
            ).rotation.x /= springback;
            currentVrm.humanoid.getBoneNode(
              THREE.VRMSchema.HumanoidBoneName.Head
            ).rotation.y += (Math.random() - 0.5) / damping;
            currentVrm.humanoid.getBoneNode(
              THREE.VRMSchema.HumanoidBoneName.Head
            ).rotation.y /= springback;
            currentVrm.humanoid.getBoneNode(
              THREE.VRMSchema.HumanoidBoneName.Head
            ).rotation.z += (Math.random() - 0.5) / damping;
            currentVrm.humanoid.getBoneNode(
              THREE.VRMSchema.HumanoidBoneName.Head
            ).rotation.z /= springback;

            currentVrm.humanoid.getBoneNode(
              THREE.VRMSchema.HumanoidBoneName.Neck
            ).rotation.x += (Math.random() - 0.5) / damping;
            currentVrm.humanoid.getBoneNode(
              THREE.VRMSchema.HumanoidBoneName.Neck
            ).rotation.x /= springback;
            currentVrm.humanoid.getBoneNode(
              THREE.VRMSchema.HumanoidBoneName.Neck
            ).rotation.y += (Math.random() - 0.5) / damping;
            currentVrm.humanoid.getBoneNode(
              THREE.VRMSchema.HumanoidBoneName.Neck
            ).rotation.y /= springback;
            currentVrm.humanoid.getBoneNode(
              THREE.VRMSchema.HumanoidBoneName.Neck
            ).rotation.z += (Math.random() - 0.5) / damping;
            currentVrm.humanoid.getBoneNode(
              THREE.VRMSchema.HumanoidBoneName.Neck
            ).rotation.z /= springback;

            currentVrm.humanoid.getBoneNode(
              THREE.VRMSchema.HumanoidBoneName.UpperChest
            ).rotation.x += (Math.random() - 0.5) / damping;
            currentVrm.humanoid.getBoneNode(
              THREE.VRMSchema.HumanoidBoneName.UpperChest
            ).rotation.x /= springback;
            currentVrm.humanoid.getBoneNode(
              THREE.VRMSchema.HumanoidBoneName.UpperChest
            ).rotation.y += (Math.random() - 0.5) / damping;
            currentVrm.humanoid.getBoneNode(
              THREE.VRMSchema.HumanoidBoneName.UpperChest
            ).rotation.y /= springback;
            currentVrm.humanoid.getBoneNode(
              THREE.VRMSchema.HumanoidBoneName.UpperChest
            ).rotation.z += (Math.random() - 0.5) / damping;
            currentVrm.humanoid.getBoneNode(
              THREE.VRMSchema.HumanoidBoneName.UpperChest
            ).rotation.z /= springback;

            currentVrm.humanoid.getBoneNode(
              THREE.VRMSchema.HumanoidBoneName.RightShoulder
            ).rotation.x += (Math.random() - 0.5) / damping;
            currentVrm.humanoid.getBoneNode(
              THREE.VRMSchema.HumanoidBoneName.RightShoulder
            ).rotation.x /= springback;
            currentVrm.humanoid.getBoneNode(
              THREE.VRMSchema.HumanoidBoneName.RightShoulder
            ).rotation.y += (Math.random() - 0.5) / damping;
            currentVrm.humanoid.getBoneNode(
              THREE.VRMSchema.HumanoidBoneName.RightShoulder
            ).rotation.y /= springback;
            currentVrm.humanoid.getBoneNode(
              THREE.VRMSchema.HumanoidBoneName.RightShoulder
            ).rotation.z += (Math.random() - 0.5) / damping;
            currentVrm.humanoid.getBoneNode(
              THREE.VRMSchema.HumanoidBoneName.RightShoulder
            ).rotation.z /= springback;

            currentVrm.humanoid.getBoneNode(
              THREE.VRMSchema.HumanoidBoneName.LeftShoulder
            ).rotation.x += (Math.random() - 0.5) / damping;
            currentVrm.humanoid.getBoneNode(
              THREE.VRMSchema.HumanoidBoneName.LeftShoulder
            ).rotation.x /= springback;
            currentVrm.humanoid.getBoneNode(
              THREE.VRMSchema.HumanoidBoneName.LeftShoulder
            ).rotation.y += (Math.random() - 0.5) / damping;
            currentVrm.humanoid.getBoneNode(
              THREE.VRMSchema.HumanoidBoneName.LeftShoulder
            ).rotation.y /= springback;
            currentVrm.humanoid.getBoneNode(
              THREE.VRMSchema.HumanoidBoneName.LeftShoulder
            ).rotation.z += (Math.random() - 0.5) / damping;
            currentVrm.humanoid.getBoneNode(
              THREE.VRMSchema.HumanoidBoneName.LeftShoulder
            ).rotation.z /= springback;


          }

          // yay/oof expression drift
          expressionyay += (Math.random() - 0.5) / expressionease;
          if (expressionyay > expressionlimityay) { expressionyay = expressionlimityay };
          if (expressionyay < 0) { expressionyay = 0 };
          currentVrm.blendShapeProxy.setValue(THREE.VRMSchema.BlendShapePresetName.Fun, expressionyay);
          expressionoof += (Math.random() - 0.5) / expressionease;
          if (expressionoof > expressionlimitoof) { expressionoof = expressionlimitoof };
          if (expressionoof < 0) { expressionoof = 0 };
          currentVrm.blendShapeProxy.setValue(THREE.VRMSchema.BlendShapePresetName.Angry, expressionoof);

        }





        //look at camera is more efficient on blink
        lookAtTarget.position.x = camera.position.x;
        lookAtTarget.position.y = ((camera.position.y - camera.position.y - camera.position.y) / 2) + 0.5;

      }; // end fn stream
    },
    function (err) {
      console.log("The following error occured: " + err.name);
    }
  );


// blink

function blink() {
  var blinktimeout = Math.floor(Math.random() * 250) + 50;
  lookAtTarget.position.y =
    camera.position.y - camera.position.y * 2 + 1.25;

  setTimeout(() => {
    currentVrm.blendShapeProxy.setValue(
      THREE.VRMSchema.BlendShapePresetName.BlinkL,
      0
    );
    currentVrm.blendShapeProxy.setValue(
      THREE.VRMSchema.BlendShapePresetName.BlinkR,
      0
    );
  }, blinktimeout);

  currentVrm.blendShapeProxy.setValue(
    THREE.VRMSchema.BlendShapePresetName.BlinkL,
    1
  );
  currentVrm.blendShapeProxy.setValue(
    THREE.VRMSchema.BlendShapePresetName.BlinkR,
    1
  );
}



// loop blink timing
(function loop() {
  var rand = Math.round(Math.random() * 10000) + 1000;
  setTimeout(function () {
    blink();
    loop();
  }, rand);
})();

// drag and drop + file handler
window.addEventListener('dragover', function (event) {
  event.preventDefault();
});

window.addEventListener('drop', function (event) {
  event.preventDefault();

  // read given file then convert it to blob url
  const files = event.dataTransfer.files;
  if (!files) { return; }
  const file = files[0];
  if (!file) { return; }
  const blob = new Blob([file], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  load(url);
});


// handle window resizes


window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {

  camera.aspect = (innerW) / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize((innerW), window.innerHeight);

}

// Hàm chuyển đổi base64 thành Blob
function base64ToBlob(base64, mimeType) {
  const byteCharacters = atob(base64);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: mimeType });
}
// interface handling


function interface() {

  if (initvalues == true) {
    if (localStorage.localvalues) {
      initvalues = false;
      document.getElementById("mouththreshold").value = mouththreshold;
      document.getElementById("mouthboost").value = mouthboost;
      document.getElementById("bodythreshold").value = bodythreshold;
      document.getElementById("bodymotion").value = bodymotion;
      document.getElementById("expression").value = expression;
    }
  }

  mouththreshold = document.getElementById("mouththreshold").value;
  mouthboost = document.getElementById("mouthboost").value;
  bodythreshold = document.getElementById("bodythreshold").value;
  bodymotion = document.getElementById("bodymotion").value;

  expression = document.getElementById("expression").value;
  expressionlimityay = (expression);
  expressionlimitoof = (100 - expression);
  expressionlimityay = expressionlimityay / 100;
  expressionlimitoof = expressionlimitoof / 100;
  expressionlimityay = expressionlimityay * expressionintensity;
  expressionlimitoof = expressionlimitoof * expressionintensity;

  console.log("Expression " + expressionyay + " yay / " + expressionoof + " oof");
  console.log("Expression mix " + expressionlimityay + " yay / " + expressionlimitoof + " oof");

  // store it too
  localStorage.localvalues = 1;
  localStorage.mouththreshold = mouththreshold;
  localStorage.mouthboost = mouthboost;
  localStorage.bodythreshold = bodythreshold;
  localStorage.bodymotion = bodymotion;
  localStorage.expression = expression;

}

// click to dismiss non-vrm divs
function hideinterface() {

  var a = document.getElementById("backplate");
  var b = document.getElementById("interface");
  var x = document.getElementById("infobar");
  var y = document.getElementById("credits");
  a.style.display = "none";
  b.style.display = "none";
  x.style.display = "none";
  y.style.display = "none";

}

// click to dismiss non-interface divs
function hideinfo() {

  var a = document.getElementById("backplate");
  var x = document.getElementById("infobar");
  var y = document.getElementById("credits");
  a.style.display = "none";
  x.style.display = "none";
  y.style.display = "none";

}

// load file from user picker
function dofile() {
  var file = document.querySelector('input[type=file]').files[0];
  if (!file) { return; }
  const blob = new Blob([file], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  load(url);
}
// end

// wait to trigger interface and load init values

setTimeout(() => { interface(); }, 500);

//ok

