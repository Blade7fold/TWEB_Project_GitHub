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
    console.log(stats)
    // document.getElementById("service1").innerHTML = stats[0]['username']
    // document.getElementById("service2").innerHTML = stats[0]['avatar_url']
    // document.getElementById("service3").innerHTML = stats[0]['nb_lines']
    // document.getElementById("service4").innerHTML = stats[0]['nb_commit']
    // document.getElementById("service5").innerHTML = stats[0]['nb_repos']

    // console.log(stats[0]['nb_repos'])
    // var data = [stats[0]['nb_commit'], stats[0]['nb_repos'], stats[0]['nb_lines']];

    var label = [];
    var nbLines = [];
    var nbCommits = [];
    var nbRepos = [];
    for(var i = 0; i < stats.length; ++i) {
      label.push(stats[i]['username']);
      nbLines.push(stats[i]['nb_lines']);
      nbCommits.push(stats[i]['nb_commit']);
      nbRepos.push(stats[i]['nb_repos']);
    }

    var serie = []
    var serie1 = {
      label: "Nombre de lignes",
      values: nbLines
    }
    var serie2 = {
      label: "Nombre de commits",
      values: nbCommits
    }
    var serie3 = {
      label: "Nombre de repos",
      values: nbRepos
    }
    serie.push(serie1)
    serie.push(serie2)
    serie.push(serie3)

    var data = {
      labels: label,
      series: serie
    }
    console.log(data)

    // Zip the series data together (first values, second values, etc.)
    var zippedData = [];
    for (var i=0; i<data.labels.length; i++) {
      for (var j=0; j<data.series.length; j++) {
        zippedData.push(data.series[j].values[i]);
      }
    }

    var chartWidth   = 450,
    barHeight        = 20,
    groupHeight      = barHeight * data.series.length,
    gapBetweenGroups = 100,
    spaceForLabels   = 150,
    spaceForLegend   = 150;

    // Color scale
    var color = d3.scaleOrdinal(d3.schemeCategory20);
    var chartHeight = barHeight * zippedData.length + gapBetweenGroups * data.labels.length;

    var x = d3.scaleOrdinal()
        .domain([0, d3.max(zippedData)])
        .range([0, chartWidth]);
    var x2 = d3.scaleOrdinal()
        .domain([0, d3.max(serie2)])
        .range([0, chartWidth]);
    var x3 = d3.scaleOrdinal()
        .domain([0, d3.max(serie3)])
        .range([0, chartWidth]);

// var x = d3.scale.linear()
//     .domain([0, d3.max(zippedData)])
//     .range([0, chartWidth]);

    var y = d3.scaleOrdinal()
        .range([chartHeight + gapBetweenGroups, 0]);

    var yAxis = d3.axisLeft()
        .scale(y)
        .tickFormat('')
        .tickSize(0);

    // Specify the chart area and dimensions
    var chart = d3.select("#service1")
        .attr("width", spaceForLabels + chartWidth + spaceForLegend)
        .attr("height", chartHeight);

    // Create bars
    var bar = chart.selectAll("g")
        .data(zippedData)
        .enter().append("g")
        .attr("transform", function(d, i) {
          return "translate(" + spaceForLabels + "," + (i * barHeight + gapBetweenGroups * (0.5 + Math.floor(i/data.series.length))) + ")";
        });

    // Create rectangles of the correct width
    bar.append("rect")
        .attr("fill", function(d,i) { return color(i % data.series.length); })
        .attr("class", "bar")
        .attr("x", 16)
        .attr("y", 12)
        .attr("width", x)
        .attr("height", barHeight - 1);

    // Add text label in bar
    bar.append("text")
        .attr("x", function(d) { return x(d) - 3; })
        .attr("y", barHeight / 2)
        .attr("fill", "red")
        .attr("dy", ".35em")
        .text(function(d) { return d; });

    // Draw labels
    bar.append("text")
        .attr("class", "label")
        .attr("x", function(d) { return - 10; })
        .attr("y", groupHeight / 2)
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
    var legendRectSize = 18,
        legendSpacing  = 4;

    var legend = chart.selectAll('.legend')
        .data(data.series)
        .enter()
        .append('g')
        .attr('transform', function (d, i) {
            var height = legendRectSize + legendSpacing;
            var offset = -gapBetweenGroups/2;
            var horz = spaceForLabels + chartWidth + 40 - legendRectSize;
            var vert = i * height - offset;
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