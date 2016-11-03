'use strict';

angular.module('ddsApp').controller('ResultatCtrl', function($scope, $rootScope, $window, $http, $state, $stateParams, $timeout, SituationService, ResultatService, ImpactStudyService, droitsDescription) {

    $scope.error = false;
    $scope.awaitingResults = true;

    SituationService.save($scope.situation)
    .then(function() {
        return SituationService.restoreRemote($scope.situation._id);
    })
    .then(function() {
        return ResultatService.simulate($scope.situation);
    })
    .then(function(droits) {
        $scope.droits = droits.droitsEligibles;
        $scope.droitsInjectes = droits.droitsInjectes;
        $scope.noDroits = _.isEmpty($scope.droits.prestationsNationales) && _.isEmpty($scope.droits.partenairesLocaux);
        ImpactStudyService.sendResults($scope.situation, droits.raw);
    })
    .catch(function() {
        $scope.error = true;
    })
    .finally(function() {
        $scope.awaitingResults = false;
    });

    $scope.yearMoins2 = moment($scope.situation.dateDeValeur).subtract('years', 2).format('YYYY');
    $scope.debutPeriode = moment($scope.situation.dateDeValeur).startOf('month').subtract('years', 1).format('MMMM YYYY');
    $scope.finPeriode = moment($scope.situation.dateDeValeur).startOf('month').subtract('months', 1).format('MMMM YYYY');
    $scope.ressourcesYearMoins2Captured = SituationService.ressourcesYearMoins2Captured($scope.situation);

    $scope.getPartenaireLocalLabel = function(partenaireId) {
        var partenaire = droitsDescription.partenairesLocaux[partenaireId];
        return partenaire.prefix + ' <strong>' + partenaire.label + '</strong>';
    };

    $scope.shouldDisplayImpactInfo = function(partenaireId) {
        return ! droitsDescription.partenairesLocaux[partenaireId].interactionWithNationalPrestationCalculated;
    };

    $scope.createTest = function() {
        // Merge national and local prestations into a flat object compatible with ludwig.
        var flatPrestations = _.merge.apply(
            null,
            _.values($scope.droits.partenairesLocaux).concat($scope.droits.prestationsNationales)
        );

        var expectedResults = _.map(flatPrestations, function(droit, id) {
            return {
                code: id,
                expectedValue: droit.montant
            };
        });

        $http.post('api/public/acceptance-tests', {
            expectedResults: expectedResults,
            scenario: { situationId: $scope.situation._id }
        }).success(function(data) {
            $window.location.href = '/tests/' + data._id + '/edit';
        }).error(function(data) {
            $window.alert(data.error.apiError);
        });
    };
});
