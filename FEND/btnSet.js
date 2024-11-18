// Biến để lưu trữ trạng thái của mic và camera
let micEnabled = false;
let cameraEnabled = false;
let stream;

// Hàm để toggle mic
function toggleMic() {
  micEnabled = !micEnabled;
  if (stream) {
    stream.getAudioTracks().forEach(track => track.enabled = micEnabled);
    document.getElementById('mic-btn').style.color = micEnabled ? '#0f0' : '#f00'; // Thay đổi màu sắc biểu tượng
  } else {
    console.warn('No stream available to toggle mic.');
  }
}

// Hàm để toggle camera
function toggleCamera() {
  cameraEnabled = !cameraEnabled;
  if (stream) {
    stream.getVideoTracks().forEach(track => track.enabled = cameraEnabled);
    document.getElementById('camera-btn').style.color = cameraEnabled ? '#0f0' : '#f00'; // Thay đổi màu sắc biểu tượng
  } else {
    console.warn('No stream available to toggle camera.');
  }
}

// Khởi tạo stream và gán cho biến toàn cục
async function initStream() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    // Có thể thêm mã để hiển thị video vào một thẻ <video> nếu cần
  } catch (error) {
    console.error('Error accessing media devices.', error);
  }
}

// Gán sự kiện click cho các nút
document.getElementById('mic-btn').addEventListener('click', toggleMic);
document.getElementById('camera-btn').addEventListener('click', toggleCamera);

// Khởi tạo stream khi trang được tải
window.addEventListener('load', initStream);
