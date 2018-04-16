var chai = require('chai');
var chaiHttp = require('chai-http');
var qs = require("querystring");
var expect = chai.expect;
var assert = chai.assert;
chai.use(chaiHttp);


describe('App', function() {

    describe('Test Get Requests', function() { // Testing all pages/routes.

      it('login-get-200', function(done) { // check get request for /login
        chai.request("http://localhost:3000")
          .get('/')
          .end(function(err, res) {
            expect(res).to.have.status(200);
            done();
          });

      });
      
      it('logout-get-200', function(done) { // check get request for /login
        chai.request("http://localhost:3000")
          .get('/user/logout')
          .end(function(err, res) {
            expect(res).to.have.status(200);
            done();
          });

      });

      it('register-get-200', function(done) { // check get request for /register
        chai.request("http://localhost:3000")
          .get('/user/signup')
          .end(function(err, res) {
            expect(res).to.have.status(200);
            done();
          });

      });

      it('profile-get-200', function(done) { // check get request for /register
        chai.request("http://localhost:3000")
          .get('/user/profile')
          .end(function(err, res) {
            expect(res).to.have.status(200);
            done();
          });

      });

    });
    
    describe('Testing Post Requests', function() {
        it('register-post-200', function(done) { // generally don't test
            let register_details = {
                username: 'iamtiredhelpme',
                password: 'password',
                confirmPassword: 'password'  
            };
            chai.request("http://localhost:3000")
            .post('/user/signup')
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .send('username='+register_details.username)
            .send('password='+register_details.password)
            .send('confirmPassword='+register_details.confirmPassword)
            .end(function(error, response, body) { // gives 302 - temp redirect code. 
                console.log(response['redirects'][0]);
                if (error) {
                    done(error);
                } else {
                    done();
                }
            });
        });

        it('login-post-200-correct-cred', function(done) { // correct login
            let register_details = {
                username: 'test1',
                password: 'password',
                code: '600370'  
            };
            chai.request("http://localhost:3000")
            .post('/')
            .set('Content-type', 'application/x-www-form-urlencoded')
            .type('form')
            .send(register_details)
            .end(function(error, response, body) { // gives 302 - temp redirect code. 
                assert(response['redirects'][0].includes('user'));
                if (error) {
                    done(error);
                } else {         
                    done();
                }
            });
        });

        it('login-post-200-incorrect-cred', function(done) { // incorrect login
            let register_details = {
                username: 'monkeyman65',
                password: 'hollowperson',
                code: '263157'  
            };
            chai.request("http://localhost:3000")
            .post('/')
            .set('Content-type', 'application/x-www-form-urlencoded')
            .type('form')
            .send(register_details)
            .end(function(error, response, body) { // gives 302 - temp redirect code. 
                assert(!response['redirects'][0].includes('user'));
                if (error) {
                    done(error);
                } else {
                    done();
                }
            });
    
        });

    });  

});