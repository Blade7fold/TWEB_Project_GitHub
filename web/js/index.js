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



function drawVerticalGraph(data, idHTML) {
  console.log(data)
  function getHeight(d, i) {
    let height = chartHeight - spaceForLabels
        for (let j = 0; j < data.series.length; j++) {
          if ((i - j) % data.series.length == 0) {
            height -= (data.series[j].values[Math.floor(i/data.series.length)] / allMaxes[j]) * (chartHeight) / 3
            return  height;
          } else {
            height -= (data.series[j].values[Math.floor(i/data.series.length)] / allMaxes[j]) * (chartHeight) / 3;
          }
        }
  }

  let levelClassification = ["goku", "god", "spartian", "knight", "goblin", "slime"]
  let level = []

  let allMaxes = []
  for (let k = 0; k < data.series.length; k++) {
    allMaxes.push(d3.max(data.series[k].values))
  }
  let maxOfMaxes = d3.max(allMaxes)

  var zippedData = [];
  for (var i=0; i<data.series[0].values.length; i++) {
    for (var j=0; j<data.series.length; j++) {
      zippedData.push(data.series[j].values[i]);
    }
  }

  console.log(level)

  let chartHeight  = 450,
  barWidth         = 20,
  groupWidth      = barWidth,
  gapBetweenGroups = 200,
  spaceForLabels   = 30,
  spaceForLegend   = 150;

  var color = d3.scaleOrdinal(d3.schemeCategory20);
  var chartWidth = barWidth * zippedData.length + gapBetweenGroups * data.series[0].values.length;

  for (let i = 0; i < data.labels.length; i++) {
    let index = (i + 1) * data.series.length - 1
    level.push(levelClassification[Math.floor((getHeight(1, index) / chartHeight) * levelClassification.length)])
  }

  var y = d3.scaleLinear()
      .domain([0, d3.max(zippedData) * 3])
      .range([chartHeight, 0]);

  var x = d3.scaleLinear()
      .range([0, chartWidth]);

  var xAxis = d3.axisBottom()
      .scale(x)
      .tickFormat('')
      .tickSize(0);

  // Specify the chart area and dimensions
  var chart = d3.select(idHTML).append("svg")
      .attr("width", chartWidth)
      .attr("height", spaceForLabels + chartHeight);

  // Create bars
  var bar = chart.selectAll("g")
      .data(zippedData)
      .enter().append("g")
      .attr("transform", function(d, i) {
        let x = gapBetweenGroups * (0.5 + Math.floor(i/data.series.length)) - Math.floor(i/(data.series.length)) * barWidth
        return "translate(" + x + "," + spaceForLabels + ")";
      });

  // Create rectangles of the correct width
  bar.append("rect")
      .attr("fill", function(d,i) { return color(i % data.series.length); })
      .attr("class", "bar")
      .attr("width", barWidth)
      .attr("y", function(d,i) {
        return getHeight(d, i)
        })
      .attr("height", function(d, i) {
        for (let j = 0; j < data.series.length; j++) {
          if ((i - j) % data.series.length == 0) {
            return (d / allMaxes[j]) * (chartHeight) / 3;
          }
        }
      });
      
  // Draw labels
  bar.append("text")
      .attr("class", "label")
      .attr("x", -20)
      .attr("y", chartHeight - 10)
      .attr("dy", ".35em")
      .text(function(d,i) {
        if (i % data.series.length === 0)
          return data.labels[Math.floor(i/data.series.length)];
        else
          return ""});

  chart.append("g")
        .attr("class", "x axis")
        .attr("transform", function(d, i) {
          let y = chartHeight
          return "translate(" + gapBetweenGroups/2 + ", " + y + ")"
        })
        .call(xAxis);

  // Draw legend
  var legendRectSize = 18,
      legendSpacing  = 4;

  var legend = chart.selectAll('.legend')
      .data(data.series)
      .enter()
      .append('g')
      .attr('transform', function (d, i) {
          var width = legendRectSize + legendSpacing;
          var offset = -gapBetweenGroups/2;
          var vert = spaceForLabels + chartHeight + 40 - legendRectSize;
          var horz = i * width - offset;
          return 'translate(' + horz + ',' + vert + ')';
      });

  var classification = chart.selectAll('.classification')
      .data(level)
      .enter()
      .append('g');

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

  classification.append('text')
      .attr('class', 'classification')
      .attr('x', function(d, i) {
        return gapBetweenGroups * (0.5 + i) - i * barWidth + legendRectSize + 5})
      .attr('y', function(d, i) {
        return getHeight(d, (i + 1) * data.series.length - 1) + 2 * legendRectSize})
      .text(function (d) { return d; });
}

function drawHorizontalGraph(data, idHTML) {

  let allMaxes = []
  for (let k = 0; k < data.series.length; k++) {
    allMaxes.push(d3.max(data.series[k].values))
  }
  let maxOfMaxes = d3.max(allMaxes)

  var zippedData = [];
  for (var i=0; i<data.labels.length; i++) {
    for (var j=0; j<data.series.length; j++) {
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
  var color = d3.scaleOrdinal(d3.schemeCategory20);
  var chartHeight = barHeight * zippedData.length + gapBetweenGroups * data.labels.length;

  var x = d3.scaleLinear()
      .domain([0, d3.max(zippedData)])
      .range([0, chartWidth]);

  var y = d3.scaleOrdinal()
      .range([chartHeight + gapBetweenGroups, 0]);

  var yAxis = d3.axisLeft()
      .scale(y)
      .tickFormat('')
      .tickSize(0);

  // Specify the chart area and dimensions
  var chart = d3.select(idHTML).append("svg")
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
      .attr("width", function(d,i) {
        for (let j = 0; j < data.series.length; j++) {
          if ((i - j) % data.series.length == 0) {
            return (d / allMaxes[j]) * chartWidth;
          }
        }
      })
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
}

function changeStatsInfo() {
  getUserStats(123).then(stats => {

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
    drawHorizontalGraph(data, "#service1")
    drawVerticalGraph(data, "#service2")
  })
}

