// $WIN = $(window);
let entryPoint = 'http://localhost:8080'

function request(path, search_opt, opts = {}) {
  let url = `${entryPoint}/${path}?seed=${search_opt.seed}`;

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

$('#seed1').keyup(function (){
  $('#seed2').val($(this).val());
});
$('#seed2').keyup(function (){
  $('#seed1').val($(this).val());
});

function getUserFollowers(seed) {
  console.log("SEARCH: " + seed)
  return request('follower', {'seed': seed})
}

let newSeed = 0;
console.log("Before " + newSeed);
function changeFollowersInfo() {
  let infosTwinder;
  getUserFollowers(document.getElementById("seed2").value).then(twinder => {
    console.log('First ' + twinder);
    infosTwinder = twinder;
    newSeed = parseInt(document.getElementById("seed2").value);
    selectUsers(infosTwinder);
  })
}

function selectUsers(infoUsers) {
  console.log('(?)NbFollowers ' + infoUsers[0]['nb_followers'] + ' Seed out: ' + newSeed);
  let i = 0;
  let find = true;
  while(i < infoUsers.length && infoUsers[i]['nb_followers'] >= 10) {
    console.log('(Nope)NbFollowers ' + infoUsers[i]['nb_followers'] + ' ' + i + ' Seed in: ' + newSeed);
    ++i;
    ++newSeed;
    if(i === infoUsers.length){
      find = false;
      console.log('Again')
      console.log('New seed: ' + newSeed + ' Find: ' + find);
      getUserFollowers(newSeed).then(newTwinder => {
        console.log('New again ' + newTwinder);
        selectUsers(newTwinder);
      });
    }
  }
  if(find) {
    showTwinderUsers(infoUsers, i);
  }
  find = true;
}

function nextUser(action) {
  if(action) {
    console.log("Followed :D")
  }else {
    console.log("Not Followed D:")
  }

  ++newSeed;
  getUserFollowers(newSeed).then(newTwinder => {
    console.log('Next user ' + newTwinder);
    selectUsers(newTwinder);
  });
}

function showTwinderUsers(showUsers, noUser) {
  console.log('Found: ' + showUsers[noUser]['login'] + ' follower: ' + showUsers[noUser]['nb_followers'] + ' Seed: ' + newSeed);
  document.getElementById("usernamePic").innerHTML = showUsers[noUser]['login']
  if(showUsers[noUser]['avatar_url'] !== null) {
    console.log("Found avatar");
    document.getElementById("profilePic1").href = showUsers[noUser]['avatar_url'];
    document.getElementById("profilePic2").src = showUsers[noUser]['avatar_url'];
    document.getElementById("profilePic3").href = showUsers[noUser]['avatar_url'];
    document.getElementsByClassName("pswp__img").src = showUsers[noUser]['avatar_url'];
    // document.getElementById("profilePic").innerHTML = showUsers[noUser]['avatar_url']
  }else {
    console.log("Couldn't find avatar");
  }
  document.getElementById("nbFollowers").innerHTML = showUsers[noUser]['nb_followers'] + " followers"//Seed 123412 - 1232
}

$('#username1').keyup(function (){
  $('#username2').val($(this).val());
});
$('#username2').keyup(function (){
  $('#username1').val($(this).val());
});

function getUserCommits(username) {
  return request('commit', {'user': username})
}

function changeCommitsInfo() {

  //let username = document.getElementById("commit_username").value
  console.log('Username:' + document.getElementById("username2").value)
  document.getElementById("usernameSelected").textContent = document.getElementById("username2").value
  getUserCommits(document.getElementById("username2").value).then(commits => {
    for (let i = 0, j = 1; i < Object.keys(commits).length; ++i, ++j) {
      let positionTag = document.createElement("div")
      positionTag.setAttribute("class", "col-block commit-item")
      positionTag.setAttribute("data-aos", "fade-up")
      let tag = document.createElement("div")
      positionTag.setAttribute("class", "commit-text")
      positionTag.appendChild(tag)
      let commitTitle = document.createElement("h3")
      commitTitle.setAttribute("id", "title" + j)
      
      let commitText = document.createElement("p")
      commitText


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
    console.log(stats)
    let label = [];
    let nbLines = [];
    let nbCommits = [];
    let nbRepos = [];
    for(let i = 0; i < stats.length; ++i) {
      label.push(stats[i]['username']);
      nbLines.push(stats[i]['nb_lines']);
      nbCommits.push(stats[i]['nb_commit']);
      nbRepos.push(stats[i]['nb_repos']);
    }

    let serie = []
    let serie1 = {
      label: "Nb lignes",
      values: nbLines
    }
    let serie2 = {
      label: "Nb commits",
      values: nbCommits
    }
    let serie3 = {
      label: "Nb repos",
      values: nbRepos
    }
    serie.push(serie1)
    serie.push(serie2)
    serie.push(serie3)

    let data = {
      labels: label,
      series: serie
    }
    console.log(data)

    // Zip the series data together (first values, second values, etc.)
    let zippedData = [];
    for (let i=0; i<data.labels.length; i++) {
      for (let j=0; j<data.series.length; j++) {
        zippedData.push(data.series[j].values[i]);
      }
    }

    let chartWidth   = 450,
    barHeight        = 20,
    groupHeight      = barHeight * data.series.length,
    gapBetweenGroups = 100,
    spaceForLabels   = 80,
    spaceForLegend   = 150;

    // Color scale
    let color = d3.scaleOrdinal(d3.schemeCategory20);
    let chartHeight = barHeight * zippedData.length + gapBetweenGroups * data.labels.length;

    let x = d3.scaleLinear()
        .domain([0, d3.max(zippedData)])
        .range([0, chartWidth]);
    let x2 = d3.scaleLinear()
        .domain([0, d3.max(serie2)])
        .range([0, chartWidth]);
    let x3 = d3.scaleLinear()
        .domain([0, d3.max(serie3)])
        .range([0, chartWidth]);

    let y = d3.scaleOrdinal()
        .range([chartHeight + gapBetweenGroups, 0]);

    let yAxis = d3.axisLeft()
        .scale(y)
        .tickFormat('')
        .tickSize(0);

    // Specify the chart area and dimensions
    let chart = d3.select("#service1").append("svg")
        .attr("width", spaceForLabels + chartWidth + spaceForLegend)
        .attr("height", chartHeight);

    // Create bars
    let bar = chart.selectAll("g")
        .data(zippedData)
        .enter().append("g")
        .attr("transform", function(d, i) {
          return "translate(" + spaceForLabels + "," + (i * barHeight + gapBetweenGroups * (0.5 + Math.floor(i/data.series.length))) + ")";
        });

    // Create rectangles of the correct width
    bar.append("rect")
        .attr("fill", function(d,i) { return color(i % data.series.length); })
        .attr("class", "bar")
        .attr("width", x)
        .attr("height", barHeight - 1);

    // Add text label in bar
    bar.append("text")
        .attr("x", 5)
        .attr("y", barHeight / 2)
        .attr("fill", "red")
        .attr("dy", ".35em")
        .text(function(d) { return d; });

    // Draw labels
    bar.append("text")
        .attr("class", "label")
        .attr("x", 5)
        .attr("y", groupHeight / 2 - barHeight * 2)
        .attr("dy", ".35em")
        .text(function(d,i) {
          if (i % data.series.length === 0)
            return data.labels[Math.floor(i/data.series.length)];
          else
            return ""});

    chart.append("g")
          .attr("class", "y axis")
          .attr("transform", "translate(" + spaceForLabels + ", " + -gapBetweenGroups/2 + ")")
          .call(yAxis);

    // Draw legend
    let legendRectSize = 18,
        legendSpacing  = 4;

    let legend = chart.selectAll('.legend')
        .data(data.series)
        .enter()
        .append('g')
        .attr('transform', function (d, i) {
            let height = legendRectSize + legendSpacing;
            let offset = -gapBetweenGroups/2;
            let horz = spaceForLabels + chartWidth + 40 - legendRectSize;
            let vert = i * height - offset;
            return 'translate(' + horz + ',' + vert + ')';
        });

    legend.append('rect')
        .attr('width', legendRectSize)
        .attr('height', legendRectSize)
        .style('fill', function (d, i) { return color(i); })
        .style('stroke', function (d, i) { return color(i); });

    legend.append('text')
        .attr('class', 'legend')
        .attr('x', legendRectSize + legendSpacing)
        .attr('y', legendRectSize - legendSpacing)
        .text(function (d) { return d.label; });
      })
}