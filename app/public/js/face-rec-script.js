document.getElementById("verify").addEventListener('click', function () {
    WebCamera.snap(function (data_uri) {
        // Save the image in a variable
        var imageBuffer = processBase64Image(data_uri);
        // using filesystem writeFile function
        fs.writeFile("testFiles/image.jpg", imageBuffer.data, function (err) {
            if (err) {
                console.log("Cannot save the file");
            } else {
                dialog.showMessageBox({ title: "Confirmation", message: "Verified: " + predict("testFiles/image.jpg"), buttons: ['OK'] });
            }
        });

    });
}, false);
// trainNew();

document.getElementById("submit").addEventListener('click', function () {
    const inputName = document.querySelector('#name').value;
    console.log(inputName);
    if (!(/\S/.test(inputName))) {
        dialog.showMessageBox({ title: "Error", message: "Please Enter Name", buttons: ['OK'] });
    } else {
        WebCamera.snap(function (data_uri) {
            // Save the image in a variable
            var imageBuffer = processBase64Image(data_uri);
            // using filesystem writeFile function
            fs.writeFile("train/image1.jpg", imageBuffer.data, function (err) {
                if (err) {
                    console.log("Cannot save the file");
                } else {
                    console.log("1st image saved");
                }
            });
            fs.writeFile("train/image2.jpg", imageBuffer.data, function (err) {
                if (err) {
                    console.log("Cannot save the file");
                } else {
                    console.log("2nd image saved");
                }
            });
            fs.writeFile("train/image3.jpg", imageBuffer.data, function (err) {
                if (err) {
                    console.log("Cannot save the file");
                } else {
                    console.log("3rd image saved");
                    trainSingle(inputName, function () {
                        dialog.showMessageBox({ title: "Trained", message: name + " has been added to the database", buttons: ['OK'] });
                    });
                }
            });
        });
    }
}, false);