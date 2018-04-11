document.onload = () => {
  let submitDocsBtn = document.getElementById("submitdocsbtn");

  submitDocsBtn.onclick = () => {
    window.location.href = "/user/facerec";
  };
}