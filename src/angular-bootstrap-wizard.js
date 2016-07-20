angular.module('angular-bootstrap-wizard', []);

angular.module('angular-bootstrap-wizard')
    .directive('abwWizard', wizardDirective)
    .directive('abwWizardStep', wizardStepDirective);

function wizardDirective ()
{
    return {
        restrict: 'E',
        replace: true,
        transclude: true,
        templateUrl: '../src/wizard-template.html', // todo fix this
        controller: WizardDirectiveController,
        controllerAs: 'vm',
        link: function ($scope, $el, attrs)
        {
            console.log('attrs.abwSubmit = ', attrs.abwSubmit);
            $scope.abwSubmit = attrs.abwSubmit;
        }
    };
}

WizardDirectiveController.$inject = ['$scope'];
function WizardDirectiveController ($scope)
{
    var vm = this;
    vm.steps = [];
    vm.currStepIndex = -1;
    
    vm.addStep = function (title, stepCtrl)
    {
        vm.steps.push({
            title: title,
            stepCtrl: stepCtrl
        });
        
        if (vm.currStepIndex == -1)
        {
            goToStep(0);
        }
    }
    
    vm.prev = function ()
    {
        if (!vm.isFirstStep()) goToStep(vm.currStepIndex - 1);
    }
    
    vm.next = function ()
    {
        if (!vm.isLastStep()) goToStep(vm.currStepIndex + 1);
    }
    
    function goToStep(stepIndex)
    {
        if (!indexIsSane(stepIndex)) return;

        if (indexIsSane(vm.currStepIndex))
        {
            dirtyCurrentStep();
            vm.steps[vm.currStepIndex].stepCtrl.hideStep();
        }
        
        vm.currStepIndex = stepIndex;
        vm.steps[vm.currStepIndex].stepCtrl.activateStep();
        vm.steps[vm.currStepIndex].stepCtrl.showStep();
    }

    vm.stepLinkClicked = function (stepIndex, $event)
    {
        if (vm.stepIsActivated(stepIndex)) { goToStep(stepIndex); }
        $event.preventDefault();
        return false;
    }

    function dirtyCurrentStep()
    {
        if (!indexIsSane(vm.currStepIndex)) return;

        vm.steps[vm.currStepIndex].stepCtrl.setStepDirty();
    }

    function indexIsSane(i) { return i >= 0 && i < vm.steps.length; }

    vm.submit = function ()
    {
        if (vm.anyStepHasError())
        {
            vm.steps.forEach(function (step)
            {
                step.stepCtrl.setStepDirty();
            });
            return;
        }

        console.log('wizard is submitted, abw-submit is', $scope.abwSubmit);

        if ($scope.abwSubmit)
        {
            console.log('evaluating submit expression');
            $scope.$eval($scope.abwSubmit);
        }
    }

    vm.isFirstStep = function () { return vm.currStepIndex == 0; }

    vm.isLastStep = function () { return vm.currStepIndex == vm.steps.length - 1; }

    vm.stepHasError = function (stepIndex)
    {
        if (stepIndex < 0 || stepIndex > vm.steps.length) return false;

        return vm.steps[stepIndex].stepCtrl.stepHasError();
    }

    vm.stepIsPristine = function (stepIndex)
    {
        if (stepIndex < 0 || stepIndex > vm.steps.length) return true;

        return vm.steps[stepIndex].stepCtrl.stepIsPristine();
    }

    vm.anyStepHasError = function ()
    {
        return vm.steps.some(function (step)
        {
            return step.stepCtrl.stepHasError();
        });
    }

    vm.noStepIsPristine = function ()
    {
        return !vm.steps.some(function (step)
        {
            return step.stepCtrl.stepIsPristine();
        })
    }

    vm.stepIsActivated = function (stepIndex)
    {
        if (!indexIsSane(stepIndex)) return;

        return vm.steps[stepIndex].stepCtrl.stepIsActivated();
    }
}

function wizardStepDirective()
{
    return {
        restrict: 'E',
        replace: true,
        transclude: true,
        templateUrl: '../src/wizard-step-template.html', // todo fix this
        require: '^wizard',
        scope:
        {
            title: '@'  
        },
        controller: WizardStepController,
        controllerAs: 'vm',
        bindToController: true
    }
}

WizardStepController.$inject = ['$element', '$scope', '$timeout'];
function WizardStepController($el, $scope, $timeout)
{
    var vm = this;
    vm.isStepActive = false;
    vm.isActivated = false;
    
    vm.showStep = function ()
    {
        vm.isStepActive = true;
    }
    
    vm.hideStep = function ()
    {
        vm.isStepActive = false;
    }

    vm.stepHasError = function () { return !$scope.abwWizardStepForm.$valid; }

    vm.stepIsPristine = function () { return $scope.abwWizardStepForm.$pristine; }

    vm.setStepDirty = function () { $scope.abwWizardStepForm.$setDirty(); }

    vm.activateStep = function () { vm.isActivated = true; }

    vm.stepIsActivated = function () { return vm.isActivated; }
    
    $el.controller('abwWizard').addStep(vm.title, vm);
}
