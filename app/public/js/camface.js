window.onload = () => {
    let video = document.getElementById('camdemo');
    let verifyBtn = document.getElementById('verify');
    let imageCapture;
    
    navigator.mediaDevices.getUserMedia({ video: true, audio: false, fps: 15 })
    .then(function(stream) {
        video.srcObject = stream;
        video.play();
        let vs = stream.getVideoTracks()[0];
        imageCapture = new ImageCapture(vs);
        
        verifyBtn.onsubmit = verify;
    })
    .catch(function(err) {
        console.log(err);
        alert('Failed to access webcam.');
    })

    function verify(event) {
        
        console.log('i do come here');
        imageCapture.takePhoto()
        .then(blob => {
            let reader = new FileReader();
            reader.onloadend = (event) => {
                let input = document.createElement('input');
                input.value = reader.result;
                let form = document.getElementById('form');
                form.appendChild(input);
                /* let xhttp = new XMLHttpRequest();
                xhttp.open("POST", "facerec", true);
                xhttp.setRequestHeader("Content-type", "text/plain;charset=utf8");
                xhttp.send(reader.result); */
            };
            reader.readAsDataURL(blob);
        })
        .catch(err => {
            console.log(err);
        })
    }
}