/**
* forks Module
*
* Get forks data for a Github repository
*/
(function() {
// Self executing function to ensure that code is not declared
// in the global scope
var app = angular.module('forks', ['ngResource','ui.bootstrap']);

    // Add factory Forks
    app.factory('Forks', ['$resource', function($resource){
        return $resource('https://api.github.com/repos/:user/:repo/forks?page=:page&per_page=:perPage');
    }]);

    // Add factory Repository
    app.factory('Repository', ['$resource', function($resource){
        return $resource('https://api.github.com/repos/:user/:repo');
    }]);    

    // Implement Fork controller
    app.controller('ForksController', ['$scope', 'Repository', 'Forks', function($scope, Repository, Forks){
        $scope.forks = [];  // initialize forks because page will render before
        $scope.noRepo = false;
        $scope.noFork = false;
        $scope.user = 'angular';
        $scope.repo = 'angular';

        // Pagination
        $scope.perPage = '30';  // Set default choice to 30 (options: 30, 50, 100)
        $scope.currentPage = 1;
        $scope.maxSize = 5;

        var getForksCount = function() {
            Repository.get({user: $scope.user, repo: $scope.repo},
                function(data){  // get method expects an object data
                    $scope.forksCount = data.forks_count;
                },
                function(response) {
                    if(response.status === 404) {
                        $scope.noRepo = true;
                    }
                }
            );
        };

        // Resolve the issue of sending 2 requests when changing 'display per page' parameter
        var checkCurrentPage = function() {
            // Math.ceil() returns the smallest integer greater than or equal to a given number
            var numberOfPages = Math.ceil($scope.forksCount / $scope.perPage); 
            if (numberOfPages != 0) {
                if ($scope.currentPage > numberOfPages) {
                    $scope.currentPage = 1; 
                }
            }
        };

        $scope.getForks = function() {
            checkCurrentPage();
            Forks.query({user: $scope.user, repo: $scope.repo, page: $scope.currentPage, perPage: $scope.perPage},
                    function(data) {  // query method expects array data
                        $scope.forks = data;
                        $scope.noRepo = false;
                        $scope.noFork = false;
                        if (data.length == 0) {
                            $scope.noFork = true;
                        };
                    },
                    function(response) {
                        if(response.status === 404) {
                            $scope.forks = [];
                            $scope.noRepo = true;
                            $scope.noFork = false;
                        }
                    }
            );
        };

        $scope.submit = function() {
            $scope.currentPage = 1;  // Set current page to 1 after we search for a new repository
            getForksCount();
            $scope.getForks();
        }

        $scope.submit();  // Get forks for Angular
    }]);
})();