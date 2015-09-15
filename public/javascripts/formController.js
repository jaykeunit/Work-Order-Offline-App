var formController = function($http, $document, $scope, $timeout) {
	var controller = this;
	
	
	var verification = function() {
		controller.errLabel =' ';
		var dateCheck = new Date(controller.date).toString();
		
		if(controller.altitude === null){
			controller.altitude = 0;
		}
		
		if(controller.latitude.toString.length > 0 && controller.altitude.toString.length > 0 && 
			controller.longitude.toString.length > 0 && dateCheck != "Invalid Date") {
			controller.parseDate = dateCheck;
			controller.packageData();
		}
		else
			controller.failedVerification();
	}
	
	var failedVerification = function() {
		controller.errLabel ="Error: please make sure to get your location and enter a valid date";
		$timeout(controller.clearLabel, 5000);  
	}

	var packageData = function(){
		controller.dataPackage = {
			firstName: controller.firstName,
			lastName: controller.lastName,
			workDescription: controller.workDescription,
			altitude:  Math.round(controller.altitude*10000)/10000,
			latitude: controller.latitude,
			longitude: controller.longitude,
			date: controller.parseDate,
			severity: controller.severity
		};
		
		controller.pushToStorage(controller.dataPackage);
	}
	
	var pushToStorage = function(data){
		var workOrderNumber = parseInt(localStorage.workOrderNumber) + 1 || 1;
	
		localStorage.setItem('workOrder' + workOrderNumber, JSON.stringify(data));
		localStorage.workOrderNumber = workOrderNumber;
		
		controller.clearFields();
		controller.testConnection();
	}
	
	var clearFields = function(){   
		controller.workDescription = '';
		controller.altitude = '';
		controller.latitude = '';
		controller.longitude = '';
		controller.parseDate = '';
		controller.severity = '';
		controller.date = controller.date = (currentDate.getMonth() + 1) + '/' + currentDate.getDate() + '/' + currentDate.getFullYear();
		controller.altitude = '';
		controller.longitude = '';
		controller.latitude = '';
		controller.latLabel = '';
		controller.altLabel = '';
		controller.longLabel = '';
	}
	
	var testConnection = function(){
		$http.get('/test').success(controller.onWorks).error(controller.onFail);
	}
	
	var onWorks = function(){
		for(var x = 1; x <= localStorage.workOrderNumber; x++){
			controller.sendToServer(JSON.parse(localStorage.getItem('workOrder' + x)), x);
		}
		controller.errLabel ="Success: Work order sent";
		$timeout(controller.clearLabel, 5000);  
	}
	
	var onFail = function(){
		controller.errLabel ="Error: No connection to server. Your work order will be stored locally and sent on the next submit";
		$timeout(controller.clearLabel, 5000);  
		controller.checkPending();
	}
	
	var sendToServer = function(workOrder, workOrderNumber){
		var worked = function(){
			localStorage.removeItem('workOrder' + workOrderNumber)
			localStorage.workOrderNumber = localStorage.workOrderNumber - 1;
			controller.checkPending();
		}
		$http.post('/add', workOrder).success(worked);
	}
	
	var requestLocation = function(){
		controller.getGeoLocationButton = "fetching";
		navigator.geolocation.getCurrentPosition(controller.success, controller.OnError);
	}
	
	var success = function(position){
		$scope.$apply(function(){
			controller.latLabel = 'Lat: ' + position.coords.latitude;
			controller.latitude = position.coords.latitude;
			
			if(position.coords.altitude === null){
				controller.altLabel = 'Alt: 0' ;
			}
			else{
				controller.altLabel = 'Alt: ' + position.coords.altitude;
			}
			controller.altitude = position.coords.altitude;
			
			controller.longLabel = 'Long: ' + position.coords.longitude;
			controller.longitude = position.coords.longitude;

			controller.getGeoLocationButton = "Get location";
		})
	}
	
	var onError = function(error){
		var errorMessage = ['', 'Permission denied', 'Position unavailable', 'timeout'];
		$scope.$apply(function(){
			controller.getGeoLocationButton = "Err: " + errorMessage[error.code];
		})
	}
	
	var checkPending = function(){
		if(localStorage.workOrderNumber > 0){
			controller.pendingSendButton = 'send';
			controller.pendingSendLabel = "You have work orders pending. ";
			controller.showPendingButton = true;
		}
		else{
			controller.pendingSendLabel = '';
			controller.pendingSendButton = '';
			controller.showPendingButton = false;
		}
	}
	
	var clearLabel = function(){
		controller.errLabel = '';
	}
	
	controller.clearLabel = clearLabel;
	controller.showPendingButton = false;
	controller.checkPending = checkPending;
	controller.checkPending();
	var currentDate = new Date();
	controller.date = (currentDate.getMonth() + 1) + '/' + currentDate.getDate() + '/' + currentDate.getFullYear();
	controller.altitude = '';
	controller.longitude = '';
	controller.latitude = '';
	controller.errLabel = ' ';
	controller.parseDate = '';
	controller.clearFields = clearFields
	controller.failedVerification = failedVerification;
	controller.verification = verification;
	controller.sendToServer = sendToServer;
	controller.onWorks = onWorks;
	controller.onFail = onFail;
	controller.testConnection = testConnection;
	controller.dataPackage = '';
	controller.pushToStorage = pushToStorage;
	controller.packageData = packageData;
	controller.success = success;
	controller.OnError = onError;
	controller.getGeoLocationButton = "Get location";
	controller.requestLocation = requestLocation;

}
angular.module('publicWorksApp', [])
       .controller('FormController', formController);
	   