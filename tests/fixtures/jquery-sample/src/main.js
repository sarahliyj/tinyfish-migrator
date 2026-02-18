$(document).ready(function() {
  // DOM selection
  var users = $('.user-list');
  var form = $('#login-form');

  // AJAX calls
  $.ajax({
    url: '/api/users',
    method: 'GET',
    success: function(data) {
      $.each(data, function(index, user) {
        users.append('<li>' + user.name + '</li>');
      });
    }
  });

  $.get('/api/status', function(data) {
    console.log(data);
  });

  $.post('/api/login', { username: 'admin' });

  // Event binding
  form.on('submit', function(e) {
    e.preventDefault();
    var username = $('#username').val();
    var password = $('#password').val();

    $.post('/api/login', { username: username, password: password });
  });

  // DOM manipulation
  users.append('<li>New User</li>');
  users.prepend('<li>First User</li>');

  // Styling and visibility
  $('.error-message').css('color', 'red');
  $('.loading').hide();
  $('.content').show();
  $('.sidebar').toggle();

  // Animation
  $('.notification').animate({
    opacity: 0,
    height: 0
  }, 500);

  // Attributes and data
  var link = $('a.external');
  link.attr('target', '_blank');
  link.prop('disabled', true);
  link.data('tooltip', 'External link');

  // Utilities
  var config = $.extend({}, defaults, options);
});
