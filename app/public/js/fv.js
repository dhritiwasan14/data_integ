window.onload = () => {
  let video = document.getElementById('input');
  let verifyBtn = document.getElementById('verify');
  let imageCapture;
  
  navigator.mediaDevices.getUserMedia({ video: true, audio: false, fps: 15 })
  .then(function(stream) {
    video.srcObject = stream;
    video.play();
    let vs = stream.getVideoTracks()[0];
    imageCapture = new ImageCapture(vs);
    
    verifyBtn.onclick = verify;
  })
  .catch(function(err) {
    console.log(err);
    alert('Failed to access webcam.');
  })
  
  function verify(event) {
    imageCapture.takePhoto()
    .then(blob => {
      let reader = new FileReader();
      reader.onloadend = (event) => {
        let xhttp = new XMLHttpRequest();
        xhttp.open('POST', '/receivedImage', true);
        xhttp.setRequestHeader('Content-type', 'text/plain;charset=utf8');
        
        xhttp.onreadystatechange = () => {
          if (xhttp.readyState === XMLHttpRequest.DONE) {
            if (xhttp.status === 202) {
              alert(xhttp.responseText);
            } else if (xhttp.status === 200) {
              let res = JSON.parse(xhttp.response);
              document.location.href = res.redirect;
            }
          }
        }
        
        xhttp.send(reader.result);
      };
      reader.readAsDataURL(blob);
    })
    .catch(err => {
      console.log(err);
    });
  }
}
