buttonArray = ['.commit', '.git_race', '.twinder', '.back']

for(let i = 0; i < buttonArray.length; i++) {
  $(document).ready(function() {
    $(buttonArray[i]).on('click', function() { // Au clic sur un bouton
      var page = $(this).attr('href'); // Endroit ciblé
      var speed = 750; // Durée de l'animation (en ms)
      $('html, body').animate( { scrollTop: $(page).offset().top }, speed);
    });
  });
}

// let i = 0;
// 
// function followUp() {
//   i = parseInt(document.getElementById("followers").innerText);
//   i = i + 1;
//   document.getElementById("followers").innerHTML = i;
//   alert('Thanks for the follow!');
// }
// 
// function pushed() {
//   alert('Pushed the button!');
// }