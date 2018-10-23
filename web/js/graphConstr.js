// set the dimensions and margins of the graph
var margin = {top: 20, right: 20, bottom: 30, left: -50},
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
var svg = d3.select("#service1").append("svg")
   .attr("width", width + margin.left + margin.right)
   .attr("height", height + margin.top + margin.bottom)
   .append("g").attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");

// Get the data
// let myJSON = [{
//        year: 1,
//        population: 2
//    },
//    {
//        year: 3,
//        population: 4
//    },
//    {
//        year: 5,
//        population: 6
//    },
//    {
//        year: 7,
//        population: 8
//    },
//    {
//        year: 9,
//        population: 10
//    },
//    {
//        year: 11,
//        population: 12
//    },
//    {
//        year: 13,
//        population: 14
//    }];
// JSON.stringify(myJSON);
// fs.readFile('dataF.json', 'utf8', function readFileCallback(err, data){
//    if (err){
//        console.log(err);
//    } else {
//        obj = JSON.parse(data); //now it an object
//        obj.table.push({id: 2, square:3}); //add some data
//        json = JSON.stringify(obj); //convert it back to json
//        fs.writeFile('dataF.json', json, 'utf8', callback); // write it back 
//    }
// });
function getJson() {
    return fetch('http://192.168.0.108:8080/dataF.json')
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

// d3.json("dataF.json", function(error, data) {
//    console.log(data[0]);
//    console.log(data[1]);
//    console.log(data[2]);
//    console.log(data[3]);
//    if (error){
//        console.log(data);
//        alert('Error bitch ' + error);
//        throw error;
//    }
//    // format the data
//    data.forEach(function(d) {
//       d.year = d.year;
//       d.population = +d.population;
//    });
   
//    // Scale the range of the data
//    x.domain(d3.extent(data, function(d) { return d.year; }));
//    y.domain([0, d3.max(data, function(d) { return d.population; })]);

//    // Add the valueline path.
//    svg.append("path")
//       .data([data])
//       .attr("class", "line")
//       .attr("d", valueline);

//    // Add the X Axis
//    svg.append("g")
//       .attr("transform", "translate(0," + height + ")")
//       .call(d3.axisBottom(x));

//    // Add the Y Axis
//    svg.append("g")
//       .call(d3.axisLeft(y));
// });