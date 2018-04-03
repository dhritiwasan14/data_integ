var QRCode = require('qrcode');
var qr = "global";
QRCode.toDataURL('bagle', function(err, image_data) {
    console.log(image_data); // A data URI for the QR code image
    global.qr = image_data;
    console.log(global.qr);
});

console.log(global.qr);

var myname = "global"; // global variable
function func() {
    console.log(myname); // "undefined"
    global.myname = "local";
    console.log(global.myname); // "local"
}
func();
console.log(global.myname);