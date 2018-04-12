
const path = require('path');
const fs = require('fs');
const mainPath = 'images';
const cv = require('opencv4nodejs');
const fr = require('face-recognition').withCv(cv);
const recognizer = fr.FaceRecognizer();
const detector = fr.FaceDetector();

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
    var faceImage;
    try {
        var cvImage = loadBase64(image);
        faceImage = detector.detectFaces(cvImage, 200);
        if (faceImage.length === 0 || faceImage.length > 1) {
            flag = true;
            return {};
        }

        set.push(...faceImage);
        recognizer.addFaces(faceImage, singleName, numJitters);
        const modelState = recognizer.serialize();
        //fs.writeFileSync(__dirname + '/model.json', JSON.stringify(modelState));

        return JSON.stringify(modelState);
    } catch (err) {
        console.log(err);
    }
}

function predictIndividual(image, model) {
    try {
        const values = JSON.parse(model);
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
            if (bestPrediction.distance < 0.25) {
                return bestPrediction.className;
            } else {
                return null;
            }

        }
    } catch (err) {
        console.log(err);
    }

}

module.exports = { predictIndividual, trainSingle, loadBase64, fr, recognizer, detector, cv };