# KYC IBM
![alt text](damocles.png)
A 50.003, IBM proposed project to implement a form of Know-your-customer(KYC). 
A Web application to allow company to verify the identification of a person with confidence.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

* Clone a copy of the repository
```
$ git clone https://github.com/dhritiwasan14/data_integ
```
* Install nodejs and npm on your terminal

To check if you have node and npm installed, run the following
```
$ node -v
$ npm -v
```

To install node.js on your terminal, run the following

```
$ curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
$ sudo apt-get install -y nodejs
```
Update your npm with
```
$ npm install npm@latest -g
```

* Install the following external libraries

**Linux and OSX**

cmake

libx11 (XQuartz on OSX) for the dlib GUI (sudo apt-get install libx11-dev)

libpng for reading images (sudo apt-get install libpng-dev)

**Windows**
cmake

VS2017 build tools (not Visual Studio 2017) -> https://www.visualstudio.com/de/downloads/

### Installation
Run the following on terminal

```
$ cd data_integ/app
$ npm install
```

## Deployment


After installation, run the following

```
$ npm start
```

The application will be running on

```
http://localhost:3000
```

## Running the tests

### Selenium Tests
In the testing folder, there are java programs (running Selenium) that test the site.

```
$ cd data_integ/testing
```

**DamoclesSTest.java** test links on the dashboard

**DamoclesRegistrationTest.java** inputs random values into the registration page to ensure that the registration does not go through with random values.

**DamoclesWrongPassTest.java** is similar to the one above, but test that on the login page instead

**DamoclesAdminTest.java** test links for the admin dashboard

Firstly, ensure you have the chromedriver in the testing folder, and ensure that the path to the driver is correct. (i.e. for windows, add .exe after chromedriver in each .java file)

Next, run the following in the testing folder
```
$ javac *.java
```

Once the java files are compiled, run the programs by using
```
$ java <file-you-want-to-run>
```

### Mocha Tests
For the facial recognition part, we used Mocha test framework to test the functions that we are using.

In order for these test to not interfere with our live database, we isolated and edited these test such that they run locally.

```
$ cd data_integ/testing/frtest
$ npm install
```

To run the test, run
```
$ npm test
```

It runs the following test base on the files that we feed into the functions

1) Predict with a valid face

2) Predict with no face input (which results in error)

3) Runs a test on training the model without any face (which results in error)

4) Runs a test on training the model with a valid face

## Built With

* [node.js](https://nodejs.org/en/)
* [Express](https://expressjs.com/)
* [face-recognition.js](https://github.com/justadudewhohacks/face-recognition.js?files=1) - facial recognition library used
* [opencv4nodejs](https://github.com/justadudewhohacks/opencv4nodejs) - additional facial recognition library to convert image files
* [bcrypt](https://www.npmjs.com/package/bcrypt) - hashing for data transfer
* [express-session](https://www.npmjs.com/package/express-sessions)
* [Nano](https://www.npmjs.com/package/nano) - Database functionality
* [Mocha](https://mochajs.org/) - Testing framework
* [Selenium](https://www.seleniumhq.org/) - Testing framework

## Authors

* **Dhriti Rangannagowda Wasan**
* **Lee Jimin Daniel**
* **Ronald Heng Seng Poo**
* **Chang Jun Qing**


## License

See the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments
* [justadudewhohacks](https://github.com/justadudewhohacks) for both repo of facial recognition
* [Cloudant](https://www.ibm.com/cloud/cloudant) was the database we stored our data on
