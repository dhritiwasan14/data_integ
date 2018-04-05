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
* Install nodejs and npm on your terminal - refer to installation for help

### Installation

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

## Deployment

Run the following on terminal

```
$ cd data_integ/app
$ npm install
```

After installation, run the following

```
$ npm start
```

The application will be running on

```
http://localhost:3000
```
## Built With

* [node.js](https://nodejs.org/en/)
* [Express](https://expressjs.com/)
* [face-recognition.js](https://github.com/justadudewhohacks/face-recognition.js?files=1) - facial recognition library used
* [opencv4nodejs](https://github.com/justadudewhohacks/opencv4nodejs) - additional facial recognition library to convert image files
* [bcrypt](https://www.npmjs.com/package/bcrypt) - hashing for data transfer
* [express-session](https://www.npmjs.com/package/express-sessions)

## Authors

* **Dhriti Rangannagowda Wasan**
* **Lee Jimin Daniel**
* **Ronald Heng Seng Poo**
* **Chang Jun Qing**


## License

See the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments
* [justadudewhohacks](https://github.com/justadudewhohacks) for both repo of facial recognition
