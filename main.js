// let margin = 300;
// let gap_between_views = 150;
//Two functions used to pop elements on top or move to the back.
d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};
d3.selection.prototype.moveToBack = function() {
    return this.each(function() {
        var firstChild = this.parentNode.firstChild;
        if (firstChild) {
            this.parentNode.insertBefore(this, firstChild);
        }
    });
};
var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"];

Promise.all([d3.json("china.json"), d3.csv("fqi_data.csv")
]).then((data)=> {
  console.log(data);
  data1 = data[0];
  data2 = data[1];
  i = 0;
  parseDate = d3.timeParse("%Y-%m-%d");
  data2.forEach(x => {
        i += 1;
        x.lat = +x.lat;
        x.lng = +x.lng;
        //unique id for each data point
        x.id = "i" + i;
        x.City = x.City;
        x.Date = parseDate(x.Date);
        x.ws = parseInt(x.ws);
        x.hum = parseInt(x.hum);
        x.dew = parseInt(x.dew);
        x.pm25 = parseInt(x.pm25);
        // console.log(x);
    });
  console.log(data2);
  let projection = d3.geoMercator()
    .scale(450)
    .center([130,35])
    // .translate([0,500]);
  let svg = d3.select('svg');
  let width = svg.attr("width");
  let height = svg.attr("height");
  // let projection = d3.geoMercator();
  let g = svg.append("g")
    .attr("transform", "translate(0,0)");

  path = d3.geoPath()
				.projection(projection);

  svg.selectAll("path")
  				.data(data1.features)
  				.enter()
  				.append("path")
  				.attr("stroke", "#000")
          .attr("transform", "translate(0, 0)")
  				.attr("stroke-width", 1)
  				.attr("fill", function (d, i) {
  					return "steelblue";
  				})
  				.attr("d", path)
  				.on("mouseover", function (d, i) {
  					d3.select(this)
  						.attr("fill", "yellow");
            console.log(i.properties);
  				})
  				.on("mouseout", function (d, i) {
  					d3.select(this)
  						.attr("fill", "steelblue");
  				});
   let bounds = path.bounds(data1);
  console.log(bounds);
  let map_width = bounds[1][0] - bounds[0][0];
  let map_height = bounds[1][1] - bounds[0][1];
  console.log(map_width);
  svg.selectAll("circle")
		.data(data2).enter()
		.append("circle")
		.attr("cx", d => {return projection([d.lng, d.lat])[0]; })
		.attr("cy", d => { return projection([d.lng, d.lat])[1]; })
		.attr("r", "5px")
		.attr("fill", "red")
    .on("mouseover", function (d, i) {
      d3.select(this)
        .attr("fill", "white")
        .attr("r", "10px");
      // console.log(i.properties);
    })
    .on("mouseout", function (d, i) {
      d3.select(this)
        .attr("fill", "red")
        .attr("r", "5px");
    });

    let g2 = svg.append("g")
            .attr("transform", "translate(" + map_width + "," + 100 + ")");
    let xScale = d3.scaleBand()
          .range([0, width])
          // .padding(0.4)
          .domain(data2.map(function(d) { return d.station; }));

    let yScale = d3.scaleLinear()
            .range([height, 0])
            .domain([0, d3.max(data, (d)=> d.start_from)]);

    yScale.nice();


    let xAxis = d3.axisBottom(xScale);
    let yAxis = d3.axisLeft(yScale)
                .ticks(5);

});
