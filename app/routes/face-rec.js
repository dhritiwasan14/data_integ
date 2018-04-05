
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
    console.log('trying to load model');
    
    
    const modelState = fs.readFileSync(__dirname+'/model.json');
    

    console.log('have not failed miserably');
    try {
    const values = JSON.parse(modelState);
    recognizer.load(values);
    } catch (err) {
        console.log(err);
    }
    
    console.log('loaded model');
}

function loadBase64(base64encoded){
    console.log('error has occurred');
    console.log(base64encoded.substring(0, 100));
    const base64data = base64encoded.replace('data:image/jpeg;base64','')
                                    .replace('data:image/png;base64','');
    const buffer = Buffer.from(base64data, 'base64');
    const image = cv.imdecode(buffer);
    console.log(image);
    const cvImage = fr.CvImage(image);
    
    console.log('error has not occurred');
    return fr.cvImageToImageRGB(cvImage);
}

function trainSingle(singleName, image) {
    console.log('starting training');
    const numJitters = 15;
    var set = [];
    loadModel();
    var faceImage;
    try {
        var cvImage = loadBase64(image);
        console.log(cvImage);
        faceImage = detector.detectFaces(cvImage, 200);
        console.log(typeof faceImage);
        if (faceImage.length === 0) {
            flag = true;
            return;
        }
        
        console.log('Analyzing');
        set.push(... faceImage);
        console.log('Training for ' + singleName);
        recognizer.addFaces(faceImage, singleName, numJitters);
        console.log("finished adding faces");
        const modelState = recognizer.serialize();
        fs.writeFileSync(singleName + '.json', JSON.stringify(modelState));
        console.log(modelState);

        return JSON.stringify(modelState);
    } catch (err) {
        console.log(err);
    } 
}

function predictIndividual(image) {
    const modelState = fs.readFileSync(__dirname + "/model.json");
    const values = JSON.parse(modelState);
    recognizer.load(values)
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

module.exports = {predictIndividual, predict, trainSingle, loadBase64, loadModel, trainNew, fs, fr, recognizer, detector, cv};