window.onload = () => {
    let video = document.getElementById('camdemo');

    let submitBtn = document.getElementById('submit-btn face');
    let imageCapture;

    navigator.mediaDevices.getUserMedia({ video: true, audio: false, fps: 15 })
        .then(function(stream) {
            video.srcObject = stream;
            video.play();
            let vs = stream.getVideoTracks()[0];
            imageCapture = new ImageCapture(vs);

            submitBtn.onclick = submit;
        })
        .catch(function(err) {
            console.log(err);
            alert('Failed to access webcam.');
        })

    function submit(event) {
        event.preventDefault();
        imageCapture.takePhoto()
            .then(blob => {
                let reader = new FileReader();
                reader.onloadend = (event) => {
                    let imageinput = document.getElementById('input');
                    imageinput.value = reader.result;
                    let form = document.getElementById('form');
                    form.submit();
                };
                reader.readAsDataURL(blob);
            })
            .catch(err => {
                console.log(err);
            });
    }

}
