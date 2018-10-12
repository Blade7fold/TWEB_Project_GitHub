
$WIN = $(window);

buttonArray = ['.commit_btn', '.git_race_btn', '.twinder_btn', '.back_btn']

for(let i = 0; i < buttonArray.length; i++) {
  $(document).ready(function() {
    $(buttonArray[i]).on('click', function() { // Au clic sur un bouton
      var page = $(this).attr('href'); // Endroit ciblé
      var speed = 750; // Durée de l'animation (en ms)
      $('html, body').animate( { scrollTop: $(page).offset().top }, speed);
    });
  });
}

var clBackToTop = function() {
        
  var pxShow  = 500,         // height on which the button will show
  fadeInTime  = 400,         // how slow/fast you want the button to show
  fadeOutTime = 400,         // how slow/fast you want the button to hide
  scrollSpeed = 300,         // how slow/fast you want the button to scroll to top. can be a value, 'slow', 'normal' or 'fast'
  goTopButton = $(".go-top")
  
  // Show or hide the sticky footer button
  $(window).on('scroll', function() {
      if ($(window).scrollTop() >= pxShow) {
          goTopButton.fadeIn(fadeInTime);
      } else {
          goTopButton.fadeOut(fadeOutTime);
      }
  });
};

(function ssInit() {
  clSmoothScroll();
  clBackToTop();
})();

// let i = 0;
// 
// function followUp() {
//   i = parseInt(document.getElementById("followers").innerText);
//   i = i + 1;
//   document.getElementById("followers").innerHTML = i;
// }
// 
// function pushed() {
//   alert('Pushed the button!');
// }