$(function($) {
  var curPos = 1;

  setInterval(function() {
    if(curPos > 4) curPos = 1;
    $(".slideshow img").removeClass("active");
    $(".slideshow img:nth-child("+ curPos + ")").addClass("active");
    curPos++;
  }, 5000);
});
