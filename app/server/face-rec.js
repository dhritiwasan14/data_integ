
const path = require('path');
const fs = require('fs');
const mainPath = 'images';
const cv = require('opencv4nodejs');
const fr = require('face-recognition').withCv(cv);
const recognizer = fr.FaceRecognizer();
const detector = fr.FaceDetector();
// const classifier = new cv.CascadeClassifier(cv.HAAR_FRONTALFACE_ALT2);

function trainNew() {
    const numJitters = 15;
    loadModel();
    try {
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
                    console.log('finished adding');
                });
            });

        });
    } catch (err) {
        console.log(err);
    }
}

function loadModel() {


    const modelState = fs.readFileSync(__dirname + '/model.json');

    try {
        const values = JSON.parse(modelState);
        recognizer.load(values);
    } catch (err) {
        console.log(err);
    }

}

function loadBase64(base64encoded) {
    const base64data = base64encoded.replace('data:image/jpeg;base64', '')
        .replace('data:image/png;base64', '');
    const buffer = Buffer.from(base64data, 'base64');
    const image = cv.imdecode(buffer);
    const cvImage = fr.CvImage(image);

    return fr.cvImageToImageRGB(cvImage);
}

function trainSingle(singleName, image) {
    const numJitters = 15;
    var set = [];
    loadModel();
    var faceImage;
    try {
        var cvImage = loadBase64(image);
        faceImage = detector.detectFaces(cvImage, 200);
        console.log(faceImage);
        if (faceImage.length === 0 || faceImage.length > 1) {
            flag = true;
            return {};
        }

        set.push(...faceImage);
        recognizer.addFaces(faceImage, singleName, numJitters);
        const modelState = recognizer.serialize();
        fs.writeFileSync(__dirname + '/model.json', JSON.stringify(modelState));

        return JSON.stringify(modelState);
    } catch (err) {
        console.log(err);
    }
}

function predictIndividual(image) {
    try {
        const modelState = fs.readFileSync(__dirname + "/model.json");
        const values = JSON.parse(modelState);
        recognizer.load(values)
        const load = loadBase64(image);

        var detectedFace = detector.detectFaces(load, 200);
        if (detectedFace.length < 1 || detectedFace.length > 1) {
            console.log('No face detected/Multiple face detected');
            return null;
        } else {
            const bestPrediction = recognizer.predictBest(detectedFace[0]);
            console.log(bestPrediction);
            console.log('Detected: ' + bestPrediction.className);
            if (bestPrediction.distance < 0.3) {
                return bestPrediction.className;
            } else {
                return null;
            }

        }
    } catch (err) {
        console.log(err);
    }

}

function predict(image) {
    loadModel();
    const load = fr.loadImage(image);

    var detectedFace = detector.detectFaces(load, 200);
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

module.exports = { predictIndividual, predict, trainSingle, loadBase64, loadModel, trainNew, fs, fr, recognizer, detector, cv };