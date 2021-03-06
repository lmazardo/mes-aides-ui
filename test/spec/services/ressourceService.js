'use strict';

describe('ResultatService', function () {
    var service,
    individu,
    dateDeValeur,
    ressource;

    beforeEach(function() {
        module('ddsApp');
        inject(function(RessourceService) {
            service = RessourceService;
        });
        individu = {
            ressources: []
        };
        dateDeValeur = Date();
    });

    describe('applyYearlyRessource', function() {
        it('should add a yearly ressource to individu model ', function() {
            ressource = {
                type: {
                    id: 'revenusAgricolesTns'
                },
                montantAnnuel: 12000,
                periode: 2014
            };
            service.applyYearlyRessource(individu, ressource, dateDeValeur);
            expect(individu.ressources).not.toEqual([]);
            expect(individu.ressources[0].type).toEqual('revenusAgricolesTns');
        });
    });
    describe('isRessourceOnMainScreen', function() {
        it('should filter pensions alimentaires versées and RNC resources', function() {
            var types = ['revenusSalarie', 'pensionsAlimentairesVersees', 'rncAutresRevenus'];
            var ressources = [
                {
                    'type': 'pensionsInvalidite',
                },
                {
                    'type': 'pensionsAlimentairesVersees',
                },
                {
                    'type': 'fraisReelsDeductibles',
                }
            ];
            var ressourcesTypes = [
                {
                    id: 'pensionsInvalidite',
                },
                {
                    id: 'pensionsAlimentairesVersees',
                }
            ];
            var filteredTypes = types.filter(service.isRessourceOnMainScreen);
            var filteredRessources = ressources.filter(service.isRessourceOnMainScreen);
            var filteredRessourcesTypes = ressourcesTypes.filter(service.isRessourceOnMainScreen);
            expect(filteredTypes).toEqual(['revenusSalarie']);
            expect(filteredRessources).toEqual([ { 'type': 'pensionsInvalidite' } ]);
            expect(filteredRessourcesTypes).toEqual([ { 'id': 'pensionsInvalidite' } ]);
        });
    });
});
