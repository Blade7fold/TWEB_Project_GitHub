let i = 0;

function followUp() {
  i = parseInt(document.getElementById("followers").innerText);
  i = i + 1;
  document.getElementById("followers").innerHTML = i;
  alert('Thanks for the follow!');
}