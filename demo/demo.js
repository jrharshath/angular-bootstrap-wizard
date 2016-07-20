angular.module('wizard-demo', ['angular-bootstrap-wizard', 'ui.bootstrap']);

angular.module('wizard-demo')
	.controller('WizardDemoController', WizardDemoController)
	.controller('WizardDemoModalController', WizardDemoModalController);

WizardDemoController.$inject = ['$uibModal'];
function WizardDemoController ($uibModal)
{
    var vm = this;
    
    vm.showWizard = function ()
    {
		$uibModal.open(
		{
			templateUrl: 'wizard-form',
			controller: 'WizardDemoModalController',
			controllerAs: 'modalVm'
		});
    }
}

WizardDemoModalController.$inject = ['$uibModalInstance'];
function WizardDemoModalController ($uibModalInstance)
{
	var modalVm = this;

	modalVm.name = 'Test Name';
	modalVm.age = '100';
	modalVm.momname = 'Mommy';

	modalVm.onSubmit = function ()
	{
		console.log('submitted this:', 
		{
			name: modalVm.name,
			age: modalVm.age,
			momname: modalVm.momname
		});
	}
}
