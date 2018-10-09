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