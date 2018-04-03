const fr = require('face-recognition');
const path = require('path');
const fs = require('fs');
const mainPath = 'images';

const recognizer = fr.FaceRecognizer();
const detector = fr.FaceDetector();

function trainNew() {
    const numJitters = 15;
    loadModel();
    fs.readdir(mainPath, function (err, files) {
        if (err) {
            console.error("Could not list the directory", err);
            process.exit(1);
        }
        files.forEach(function (file, index) {
            var eachFolder = path.join(mainPath, file);
            var nameList = eachFolder.split('/');
            var name = nameList[nameList.length - 1];
            var holder = [];
            fs.readdir(eachFolder, function (err, files) {
                if (err) {
                    console.error("Could not access directory", err);
                    process.exit(1);
                }
                files.forEach(function (image, innerIndex) {
                    var eachFile = path.join(eachFolder, image);
                    const targetSize = 200;
                    var faceImage = detector.detectFaces(fr.loadImage(eachFile), targetSize);
                    console.log('Analyzing ' + eachFile);
                    holder.push(...faceImage);
                });
                console.log('Training for ' + name);
                recognizer.addFaces(holder, name, numJitters);
                const modelState = recognizer.serialize();
                fs.writeFileSync('model.json', JSON.stringify(modelState));
            });
        });
    });
}

function loadModel() {
    const modelState = fs.readFileSync('model.json');
    const values = JSON.parse(modelState);
    recognizer.load(values);
}

function trainSingle(singleName) {
    const numJitters = 15;
    var set = [];
    //loadModel();
    var faceImage;
    fs.readdir("train", function (err, files) {
        var flag = false;
        files.forEach(function (image, innerIndex) {
            if (flag) { return; }
            var trainFile = path.join("train", image);
            const targetSize = 200;
            console.log(trainFile);
            faceImage = detector.detectFaces(fr.loadImage(trainFile), targetSize);
            if (faceImage.length === 0) {
                flag = true;
                return;
            }
            console.log('Analyzing ' + image);
            set.push(...faceImage);
        });
        console.log('Training for ' + singleName);
        try {
            recognizer.addFaces(set, singleName, numJitters);
            const modelState = recognizer.serialize();
            fs.writeFileSync(singleName + '.json', JSON.stringify(modelState));
        } catch (err) {
            dialog.showMessageBox({ title: "Error", message: "No face detected, ensure you are looking at the camera", buttons: ['OK'] });
        }
    });
    return faceImage;
}

function predictIndividual(image,modelPath) {
    const modelState = fs.readFileSync(modelPath);
    const values = JSON.parse(modelState);
    recognizer.load(values)
    const load = fr.loadImage(image);
    const targetSize = 200;
    var detectedFace = detector.detectFaces(load, targetSize);
    if (detectedFace.length < 1) {
        console.log('No face detected');
    } else {
        const bestPrediction = recognizer.predictBest(detectedFace[0]);
        console.log(bestPrediction);
        console.log('Detected: ' + bestPrediction.className);
        if (bestPrediction.distance < 0.3) {
            return bestPrediction.className;
        } else {
            return 'Not able to verify';
        }

    }

}

function predict(image) {
    loadModel();
    const load = fr.loadImage(image);
    const targetSize = 200;
    var detectedFace = detector.detectFaces(load, targetSize);
    if (detectedFace.length < 1) {
        console.log('No face detected');
    } else {
        const bestPrediction = recognizer.predictBest(detectedFace[0]);
        console.log(bestPrediction);
        console.log('Detected: ' + bestPrediction.className);
        if (bestPrediction.distance < 0.3) {
            return bestPrediction.className;
        } else {
            return 'Not able to verify';
        }

    }

}