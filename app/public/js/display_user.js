function accept() {
    let xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/showUser/:id", true);
    xhttp.setRequestHeader("Content-type", "text/plain;charset=utf8");
    xhttp.send("accept");
}

function reject() {
    let xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/showUser/:id", true);
    xhttp.setRequestHeader("Content-type", "text/plain;charset=utf8");
    xhttp.send("reject");
}

