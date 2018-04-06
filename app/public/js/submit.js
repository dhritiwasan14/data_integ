window.onload = () => {

  setTimeout(() => {
    alert("3 minutes elapsed. Please retry.");
    window.location.href = "/profile";
  }, 1000 * 175); // redirect after 2min 55ss
  
  let video = document.getElementById('input');
  let output = document.getElementById('output');

  let captureBtn = document.getElementById('captureBtn');
  let submitBtn = document.getElementById('submitBtn');
  let photoTaken = false;
  let imageCapture;
  
  navigator.mediaDevices.getUserMedia({ video: true, audio: false, fps: 15 })
  .then(function(stream) {
    video.srcObject = stream;
    video.play();
    output.height = video.height;
    

    let vs = stream.getVideoTracks()[0];
    imageCapture = new ImageCapture(vs);
    
    captureBtn.onclick = capture;
    submitBtn.onclick = submit;
  })
  .catch(function(err) {
    console.log(err);
    alert('Failed to access webcam.');
  });
  
  function capture(event) {
    event.preventDefault();

    imageCapture.takePhoto()
    .then(blob => {
      let img = new Image();
      img.onload = () => {
        let context = output.getContext('2d');
        context.scale(0.5, 0.5);
        context.clearRect(0, 0, output.width, output.height);
        output.height = img.height;
        output.width = img.width;
        context.scale(0.5, 0.5);
        context.drawImage(img, 0, 0);
        photoTaken = true;
      }
      img.src = URL.createObjectURL(blob);
    })
    .catch(err => {
      console.log(err);
    });
  }
  
  function submit(event) {
    event.preventDefault();
    if (!photoTaken) {
      alert("Please capture an image to submit");
    } else {
      let form = document.getElementById('form');
      let input = document.createElement('input');
      input.name = "value";
      input.hidden = true;
      input.value = output.toDataURL('image/jpeg', 1.0);
      form.appendChild(input);
      form.submit();

      /* let imageURL = output.toDataURL('image/jpeg', 1.0);
      console.log(imageURL.substr(0, 100));
      let xhttp = new XMLHttpRequest();
      xhttp.open('POST', '/documents', true);
      xhttp.setRequestHeader('Context-type', 'text/plain;charset=utf8'); */
    }
  }
}