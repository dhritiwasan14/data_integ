var username = document.getElementsByClassName('username')[0].innerHTML;
console.log(username);
function accept() {
    console.log('here');
    let xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/admin/showUser/"+username, true);
    xhttp.setRequestHeader("Content-type", "text/plain;charset=utf8");
    xhttp.send("accept");
    window.location.href = '/admin/adminprofile';
}

function reject() {
    let xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/admin/showUser/"+username, true);
    xhttp.setRequestHeader("Content-type", "text/plain;charset=utf8");
    xhttp.send("reject");
    window.location.href = '/admin/adminprofile';
}
