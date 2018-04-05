window.onload = () => {
  
  let video = document.getElementById('input');
  let output = document.getElementById('output');
  let captureBtn = document.getElementById('capture');
  let submitBtn = document.getElementById('submit');
  let photoTaken = false;
  let imageCapture;
  
  navigator.mediaDevices.getUserMedia({ video: true, audio: false, fps: 15 })
  .then(function(stream) {
    video.srcObject = stream;
    video.play();
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
    imageCapture.takePhoto()
    .then(blob => {
      let img = new Image();
      img.onload = () => {
        let context = output.getContext('2d');
        context.clearRect(0, 0, output.width, output.height);
        output.width = img.width;
        output.height = img.height;
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
    if (!photoTaken) {
      alert("Please capture an image to submit");
    } else {
      let imageURL = output.toDataURL('image/jpeg', 1.0);
      console.log(imageURL.substr(0, 100));
      let xhttp = new XMLHttpRequest();
      xhttp.open('POST', '/documents', true);
      xhttp.setRequestHeader('Context-type', 'text/plain;charset=utf8');
      
      xhttp.onreadystatechange = () => {
        if (xhttp.readyState === XMLHttpRequest.DONE) {
          if (xhttp.status === 202) {
            alert("Exceeded time limit. Please try again.")
          } else if (xhttp.status === 200) {
            alert("Success!");
          } else {
            alert("Unknown state found");
          }
          
          document.location.href = 'profile';
        }
      }
      
      xhttp.send(imageURL);
    }
  }
}