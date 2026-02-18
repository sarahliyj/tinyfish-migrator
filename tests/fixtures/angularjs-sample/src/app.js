var app = angular.module('myApp', ['ngRoute']);

app.factory('UserService', function($http, $rootScope) {
  return {
    getUsers: function() {
      return $http.get('/api/users');
    }
  };
});

app.service('AuthService', function($http) {
  this.login = function(credentials) {
    return $http.post('/api/login', credentials);
  };
});

app.filter('capitalize', function() {
  return function(input) {
    return input.charAt(0).toUpperCase() + input.slice(1);
  };
});

app.directive('userCard', function() {
  return {
    restrict: 'E',
    scope: {
      user: '='
    },
    template: '<div class="user-card">{{ user.name }}</div>'
  };
});

app.controller('MainController', ['$scope', '$http', function($scope, $http) {
  $scope.users = [];
  $scope.loading = true;

  $scope.$watch('searchQuery', function(newVal) {
    if (newVal) {
      $scope.filteredUsers = $scope.users.filter(function(u) {
        return u.name.includes(newVal);
      });
    }
  });

  $scope.$on('userUpdated', function(event, data) {
    $scope.users = data;
  });

  $rootScope.$broadcast('appReady', { timestamp: Date.now() });

  $http.get('/api/users').then(function(response) {
    $scope.users = response.data;
    $scope.loading = false;
  });
}]);

MainController.$inject = ['$scope', '$http'];
