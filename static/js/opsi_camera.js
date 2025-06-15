// Pastikan di halaman ada elemen <video id="video"></video> untuk menampilkan kamera
// dan <div id="cameraSelectContainer"></div> sebagai tempat dropdown kamera

(async () => {
  const video = document.getElementById('video');
  const container = document.getElementById('cameraSelectContainer');

  if (!video || !container) {
    console.error('Video element or cameraSelectContainer not found!');
    return;
  }

  let currentStream = null;

  // Fungsi untuk hentikan stream kamera saat ini
  function stopCurrentStream() {
    if (currentStream) {
      currentStream.getTracks().forEach(track => track.stop());
      currentStream = null;
    }
  }

  // Fungsi untuk mulai kamera berdasarkan deviceId
  async function startCamera(deviceId) {
    try {
      stopCurrentStream();
      const constraints = {
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined
        }
      };
      currentStream = await navigator.mediaDevices.getUserMedia(constraints);
      video.srcObject = currentStream;
    } catch (err) {
      alert('Error accessing camera: ' + err.message);
    }
  }

  // Dapatkan daftar kamera yang terdeteksi
  async function getCameras() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter(device => device.kind === 'videoinput');
    } catch (err) {
      alert('Error enumerating devices: ' + err.message);
      return [];
    }
  }

  // Buat dropdown kamera
  async function setupCameraSelect() {
    const cameras = await getCameras();

    if (cameras.length === 0) {
      container.innerHTML = '<p>Tidak ada kamera terdeteksi.</p>';
      return;
    }

    const select = document.createElement('select');
    select.id = 'cameraSelect';
    select.style.padding = '8px';
    select.style.fontSize = '1rem';

    cameras.forEach((camera, index) => {
      const option = document.createElement('option');
      option.value = camera.deviceId;
      option.text = camera.label || `Camera ${index + 1}`;
      select.appendChild(option);
    });

    container.appendChild(select);

    // Mulai kamera default (kamera pertama)
    await startCamera(select.value);

    // Event ketika ganti pilihan kamera
    select.addEventListener('change', async () => {
      await startCamera(select.value);
    });
  }

  // Jalankan setup
  await setupCameraSelect();
})();
