$(document).ready(() => {

  let webcam = $('#webcam').get(0);

  setTimeout(() => {
      alert('3 minutes elapsed. Please retry.');
      window.location = '/user';
  }, 1000 * 175); // redirect after 2min 55ss

  navigator.mediaDevices.getUserMedia({video: true, audio: false})
      .then(stream => {
          webcam.srcObject = stream;
      })
      .catch(error => {
          // TODO: to handle this appropriately.
          console.log('Unable to access any form of camera.');
      });

  $('#capture').click(event => {
      webcam.pause();
  });

  $('#retake').click(event => {
      webcam.play();
  });

  $('#submit').click(event => {
      if (!webcam.paused) {
          alert('No photo has been captured!');
          return;
      }

      let canvas = document.createElement('canvas');
      canvas.height = webcam.videoHeight;
      canvas.width = webcam.videoWidth;
      canvas.getContext('2d').drawImage(webcam, 0, 0, canvas.width, canvas.height);

      $('input').val(canvas.toDataURL('image/jpeg', 1.0));
      $('form').submit();
  });
})
