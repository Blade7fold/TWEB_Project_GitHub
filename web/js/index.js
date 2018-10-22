// $WIN = $(window);
let entryPoint = 'http://localhost:8080'

function request(path, search_opt, opts = {}) {
  let url = `${entryPoint}/${path}?seed=123`;

  let options = {
    ...opts, 
    headers: {
      'Accept': 'application/json'
    }
  }
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
  return request('follower', 'seed=' + seed)
}

function changeFollowersInfo() {
  getUserFollowers(1234).then(followers => {
    document.getElementById("userName").innerHTML = followers[0]['login']
    document.getElementById("git_race_button").innerHTML = followers[0]['avatar_url']
    if(parseInt(followers[0]['nb_followers']) < 10) {
      document.getElementById("twinder_button").innerHTML = followers[0]['nb_followers']
    }
  })
}

function getUserCommits(username) {
  return request('commit', 'user=' + username)
}

function changeCommitsInfo() {

  //let username =  document.getElementById("commit_username").value

  getUserCommits('jimmyVerdasca').then(commits => {
    for (let i = 0; i < Object.keys(commits).length; i++) {
      textNode = document.getElementById("commit_text" + i)
      if (textNode == undefined) {
        textNode = document.createElement('p');
        textNode.setAttribute("id", "commit_text" + i);
        document.getElementById("patata").appendChild(textNode); 
      }
      textNode.innerHTML = commits[i]
    }
  })
}

function getUserStats(seed) {
  return request('stat', 'seed=' + seed)
}

function changeStatsInfo() {
  getUserStats(123).then(stats => {
    document.getElementById("commit_button").innerHTML = stats[0]['username']
    document.getElementById("git_race_button").innerHTML = stats[0]['avatar_url']
    document.getElementById("commit_button").innerHTML = stats[0]['nb_lines']
    document.getElementById("git_race_button").innerHTML = stats[0]['nb_commit']
    document.getElementById("twinder_button").innerHTML = stats[0]['nb_repos']
  })
}

function graphCreation() {
  // set the dimensions and margins of the graph
  var margin = {top: 20, right: 20, bottom: 30, left: 50},
  width = 960 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

  // set the ranges
  var x = d3.scaleTime().range([0, width]);
  var y = d3.scaleLinear().range([height, 0]);

  // define the line
  var valueline = d3.line()
    .x(function(d) { return x(d.year); })
    .y(function(d) { return y(d.population); });

  // append the svg obgect to the body of the page
  // appends a 'group' element to 'svg'
  // moves the 'group' element to the top left margin
  var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g").attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

  // Get the data
  function getJson() {
      return fetch('http://192.168.0.108:8081/dataF.json')
          .then(response => {
              if (!response.ok) 
                  throw new Error('Not found!');
              return response.json();
          })
          .then(data => {
              console.log(JSON.stringify(data));
              data.forEach(function(d) {
                  d.year = d.year;
                  d.population = +d.population;
              });
              
              // Scale the range of the data
              x.domain(d3.extent(data, function(d) { return d.year; }));
              y.domain([0, d3.max(data, function(d) { return d.population; })]);

              // Add the valueline path.
              svg.append("path")
                  .data([data])
                  .attr("class", "line")
                  .attr("d", valueline);

              // Add the X Axis
              svg.append("g")
                  .attr("transform", "translate(0," + height + ")")
                  .call(d3.axisBottom(x));

              // Add the Y Axis
              svg.append("g")
                  .call(d3.axisLeft(y));
          }, error => {
            if (error){
                alert('Error bitch ' + error);
                throw error;
            }
        });
  }
    
  getJson();
}