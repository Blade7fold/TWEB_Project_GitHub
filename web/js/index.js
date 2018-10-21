// $WIN = $(window);
try {
let entryPoint = 'http://localhost:8080'

function request(path, search_opt, opts = {}) {
  let url = `${entryPoint}/${path}?seed=123`;

  let options = {
    ...opts, 
    headers: {
      'Accept': 'application/json'
    }
  }
  alert(url)
  return fetch(url, options)
  .then(res => {
    return res.json()
    .then((data) => {
      if (!res.ok) {
        throw new ResponseError(res, data);
      }
      return data;
    })});
}

function getUserFollowers(seed) {
  request('follower', 'seed=' + seed)
  .then(datas => {
    document.getElementById("commit_button").innerHTML = JSON.stringify(datas[0]['login'])
  })
}

function changeFollowersInfo() {
  getUserFollowers(1234)

  var page = $(this).attr('href'); // Endroit ciblé
  var speed = 750; // Durée de l'animation (en ms)
  $('html, body').animate( { scrollTop: $(page).offset().top }, speed);
}

  
} catch(err) {
  alert(err);
}



// respond with "hello world" when a GET request is made to the homepage
// app.get('/follower?seed=100', function(req, res) {
//   console.log('wesh');
// });

// var clBackToTop = function() {
        
//   var pxShow  = 500,         // height on which the button will show
//   fadeInTime  = 400,         // how slow/fast you want the button to show
//   fadeOutTime = 400,         // how slow/fast you want the button to hide
//   scrollSpeed = 300,         // how slow/fast you want the button to scroll to top. can be a value, 'slow', 'normal' or 'fast'
//   goTopButton = $(".go-top")
  
//   // Show or hide the sticky footer button
//   $(window).on('scroll', function() {
//       if ($(window).scrollTop() >= pxShow) {
//           goTopButton.fadeIn(fadeInTime);
//       } else {
//           goTopButton.fadeOut(fadeOutTime);
//       }
//   });
// };

// (function ssInit() {
//   clSmoothScroll();
//   clBackToTop();
// })();

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