$(function() {
  $('.form-check-input').change(function(event) {
    if($('.form-check-input').is(':checked')) {
      $('.price').show();
    } else {
      $('.price').hide();
    }
  });
});
