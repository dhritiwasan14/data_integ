window.onload = () => {
    let video = document.getElementById('camdemo');
    let verifyBtn = document.getElementById('verify-btn face');
    let form = document.getElementById('loginform');

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
                    var input = document.getElementById("value");
                    input.value = reader.result;
                    console.log(input.value);
                    form.submit();
                };
                reader.readAsDataURL(blob);
            })
            .catch(err => {
                console.log(err);
            })
        $('.overlay').show();
    }
}
