document.onload = () => {
  let submitDocsBtn = document.getElementById("submitdocsbtn");

  submitDocsBtn.onclick = () => {
    console.log("trying");
    window.location.href = "/user/facerec";
  };
}