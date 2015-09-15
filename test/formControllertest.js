describe('formController', function() {
	var controller;

	beforeEach(module('publicWorksApp'));
	
	beforeEach(inject(function($controller, $rootScope, _$httpBackend_) {
		scope = $rootScope.$new();
		controller = $controller('FormController', {$scope: scope});
		$httpBackend = _$httpBackend_;
	}));

	it('canary should sing', function(){
		expect(true).to.be.eql(true);
	});
	
	it('check clear label function correctly clears lable', function(){
		controller.errLabel = "stuff";
		
		controller.clearLabel();
		
		expect(controller.errLabel).to.be.eql('');
	})
	
	it('success function correctly saves position to latitude', function(){
		var position = {
			coords: {
				latitude: 10,
				altitude: 10,
				longitude: 10
			}
		}
		
		controller.success(position);
		expect(controller.latitude).to.be.eql(10);
	})
	
	it('success function correctly saves position to longitude', function(){
		var position = {
			coords: {
				latitude: 10,
				altitude: 8,
				longitude: 6
			}
		}
		
		controller.success(position);
		expect(controller.longitude).to.be.eql(6);
	})
	
	it('success function correctly saves position to altitude', function(){
		var position = {
			coords: {
				latitude: 10,
				altitude: 4,
				longitude: 6
			}
		}
		
		controller.success(position);
		expect(controller.altitude).to.be.eql(4);
	})
	
	it('success function correctly saves position of altitude as 0 in label if null', function(){
		var position = {
			coords: {
				latitude: 10,
				altitude: null,
				longitude: 6
			}
		}
		
		controller.success(position);
		expect(controller.altLabel).to.be.eql('Alt: 0');
	})
	
	it('error function correctly passes correct error', function(){
		var error = {
			code: 2
		}
		controller.OnError(error);
		expect(controller.getGeoLocationButton).to.be.eql("Err: Position unavailable");
	})
	
	it('controller.requestLocation makes call to navigator success', function(){
		navigator = {
			geolocation: {
				getCurrentPosition: function(success, error){
					success();
				}
			}
		}
		
		var tester = false;
		controller.success = function(){
			tester = true;
		}
		
		controller.requestLocation();
		expect(tester).to.be.eql(true);
		
	})
	
	it('controller.requestLocation makes call to navigator error', function(){
		navigator = {
			geolocation: {
				getCurrentPosition: function(success, error){
					error();
				}
			}
		}
		
		var tester = false;
		controller.OnError = function(){
			tester = true;
		}
		
		controller.requestLocation();
		expect(tester).to.be.eql(true);
		
	})
	
	it('on Works function pulls out all local storage', function() {
		var first = {
			first: 'hello'
		};
		var second = {
			first: 'ByeBye'
		}
		
		localStorage.setItem('workOrder1', JSON.stringify(first));
		localStorage.setItem('workOrder2', JSON.stringify(second));
		localStorage.workOrderNumber = 2;

		
		testerArray = [{first: 'hello'}, {first: 'ByeBye'}];
		
		controller.onWorks()
		
		localStorage.clear();
		
		
	})
	
	it('testConnection correctly gets successful connection', function() {
		
		var someData = '';
		controller.onWorks = function(data){
			someData = data;
		}
		
		
		var returnedData = 'im data';
		
		$httpBackend.expectGET('/test').respond(200, returnedData);
		
		controller.testConnection();
		
		$httpBackend.flush();
		
		
		expect(someData).to.be.eql(returnedData);
	})
	
	it('check that onFail correctly sets fail msg', function(){
		controller.clearLabel = function(){};
		controller.onFail();
		expect(controller.errLabel).to.have.length.of.at.least(1);
	})
	
	
	it('testConnection correctly gets fail connection', function() {
		
		var someData = '';
		controller.onFail = function(){
			someData = 'fail data';
		}

		
		$httpBackend.expectGET('/test').respond(404);

		controller.testConnection();
	
		$httpBackend.flush();
		
		expect(someData).to.be.eql('fail data');
	})
	
	it('clear fields function correctly clears fields', function(){
		controller.severity = 'VERY';
		controller.clearFields();
		expect(controller.severity).to.be.eql('');
	})
	
	it('pushToStorage store packageData is into local storage', function() {
		var testPackage = {
			firstName: "Joe",
		}
		
		controller.testConnection = function(){}
		controller.clearFields = function(){}
		
		controller.pushToStorage(testPackage);
		
		expect(JSON.parse(localStorage.getItem('workOrder1'))).to.be.eql(testPackage);
		
		localStorage.clear();
	})
	
	it('test pushToStorage calls test connection function', function(){
		var testPackage = {
			firstName: "Joe",
		}
		
		controller.clearFields = function(){}
		var tester = false;
		controller.testConnection = function(){
			tester = true;
		}
		
		controller.pushToStorage(testPackage);
		
		expect(tester).to.be.eql(true);
		
		localStorage.clear();
		
	})
	
	it('packageData function correctly packages form data into a JSON', function(){
		controller.firstName = 'Joe';
		controller.lastName = 'Dirt';    
		controller.workDescription = 'doing dirt stuff';
		controller.altitude = 38.4646;
		controller.latitude = 20000;
		controller.longitude = 30000;
		controller.parseDate = 'in a time long long ago';
		controller.severity = 'VERY';
		
		var testPackage = {
			firstName: 'Joe',
			lastName: 'Dirt',  
			workDescription: 'doing dirt stuff',
			altitude: 38.4646,
			latitude: 20000,
			longitude: 30000,
			date: 'in a time long long ago',
			severity: 'VERY'
		}
		
		controller.pushToStorage = function(data) {}
		controller.packageData();

		expect(controller.dataPackage).to.be.eql(testPackage);
	})
	
	it('packageData function calls pushToStorage when data is correct', function(){
		controller.firstName = 'Joe';
		controller.lastName = 'Dirt';    
		controller.workDescription = 'doing dirt stuff';
		controller.altitude = 10000;
		controller.latitude = 20000;
		controller.longitude = 30000;
		controller.parseDate = 'in a time long long ago';
		controller.severity = 'VERY';
		
		var tester = false;
		controller.pushToStorage = function(data) {
			tester = true;
		}
		
		controller.packageData();
		
		expect(tester).to.be.eql(true);
		
	})
	
	it('sendToServer correctly sends to server and returns boolean on result', function() {
		var data = {
			first: 'im data'
		};
		
		localStorage.setItem('workOrder' + 1, JSON.stringify(data));
		localStorage.workOrderNumber = 1;
		
		$httpBackend.expectPOST('/add').respond(200);
		
		controller.sendToServer(data, 1);
		
		$httpBackend.flush();
		
		expect(parseInt(localStorage.workOrderNumber)).to.be.eql(0);
		
		localStorage.clear();
	
	})

	it('check that verification verifies all data fields are correct', function() {
		controller.longitude = 1;
		controller.altitude = 1;
		controller.latitude = 1;
		controller.date = '09/18/4574';

		var tester = false;
		controller.packageData = function(){
			tester = true;
		}
		controller.verification();
		expect(tester).to.be.eql(true);
	
	})
	
	it('check that failedVerification correctly sets fail msg', function(){
		controller.clearLabel = function(){};
		controller.failedVerification();
		expect(controller.errLabel).to.have.length.of.at.least(1);
	})

	it('check that verification fails', function() {
		controller.longitude = '';
		controller.altitude = '';
		controller.latitude = '';

		var tester = false;
		controller.failedVerification = function(){
			tester = true;
		}
		controller.verification();
		expect(tester).to.be.eql(true);

	})
	
	it('check that verification catches null altitude', function(){
		controller.longitude = '';
		controller.altitude = null;
		controller.latitude = '';
		
		controller.failedVerification = function(){}
		controller.verification();
		expect(controller.altitude).to.be.eql(0);
	})
	
	it('check pending function sets pending label', function(){
		localStorage.workOrderNumber = 1;
		
		controller.checkPending();
		
		expect(controller.pendingSendLabel).to.be.eql("You have work orders pending. ");
	})
	


});
