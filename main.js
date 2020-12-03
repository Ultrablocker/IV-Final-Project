// let margin = 300;
// let gap_between_views = 150;
let svg = d3.select('svg');
let svg1 = d3.select('svg');
var parseDate = d3.timeParse("%Y-%m-%d");
let g1 = svg.append("g")
                    .attr("transform", "translate(" + 100 + "," + 100 + ")");





Promise.all([d3.json("china.json"), d3.csv("city_data.csv"),d3.csv("fqi_data.csv")
]).then((data)=> {
  // console.log(data);
  data1 = data[0];
  city = data[1];
  fqi = data[2]

  i = 0;
  parseDate = d3.timeParse("%Y/%m/%d");
  fqi.forEach(x => {
        i += 1;
        //unique id for each data point
        x.id = "i" + i;
        x.city = x.city;
        x.date = parseDate(x.date);
        x.ws = parseInt(x.ws);
        x.hum = parseInt(x.hum);
        x.dew = parseInt(x.dew);
        x.pm25 = parseInt(x.pm25);
        // console.log(x);
  });

  city.forEach(x => {
      i += 1;
      x.lat = +x.lat;
      x.lng = +x.lng;
      //unique id for each data point
      x.id = "i" + i;
      x.city = x.city;
  });

  console.log(fqi);
  let projection = d3.geoMercator()
    .scale(450)
    .center([130,35])
    // .translate([0,500]);

  // let projection = d3.geoMercator();


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
          .attr("d", path);


  let bounds = path.bounds(data1);
  console.log(bounds);
  let map_width = bounds[1][0] - bounds[0][0];
  let map_height = bounds[1][1] - bounds[0][1];
  console.log(map_width);
  svg.selectAll("circle")
		.data(city).enter()
    .append("circle")
    .attr('id', function(d){
      // console.log(d.city)
      return d.city})
		.attr("cx", d => {return projection([d.lng, d.lat])[0]; })
		.attr("cy", d => { return projection([d.lng, d.lat])[1]; })
		.attr("r", "3px")
    .style("fill", "red")
    .style('stroke', 'black')
    .on("mouseover", function (event, d) {
      let cur_city = this.id
      g1.selectAll("#"+cur_city).raise().style("stroke","red").style('opacity',1);
      // console.log(cur_city)
      d3.select(this)
        .style("fill", "white")
        .style('r', '5')
      
      // draw_l(fqi,cur_city)
    
        
      // console.log(i.properties);
    })
    .on("mouseout", function (d, i) {
      let cur_city = this.id
      d3.select(this)
        .style("fill", "red")
        .style("r", "3px");
      g1.selectAll("#"+cur_city).raise().style("stroke","steelblue").style('opacity',0.1);
    });
    
    var margin_l = {top: 20, right: 30, bottom: 30, left: 100},
        width_l = 1000 - margin_l.left - margin_l.right,
        height_l = 300 - margin_l.top - margin_l.bottom;
      
      var xScale= d3.scaleTime()
          .domain(d3.extent(fqi, function(d) { return d.date; }))
          .range([ map_width, width_l ]);
      // var xScale = d3.scaleBand()
      //     .domain(data.map(function(d) { return d.Date; }))
      //     .rangeRound([0, width], .05).padding(0.5);
      g1.append("g")
        .attr("transform", "translate(0," + height_l + ")")
        .call(d3.axisBottom(xScale));
      // Add Y axis
      var yScale = d3.scaleSqrt()
        .domain([0, d3.max(fqi, function(d) { return d.pm25; })])
        .range([ height_l, 0]);
      g1.append("g")
        .attr("transform", "translate("+map_width+"," + 0 + ")")
        .call(d3.axisLeft(yScale));
    
    city.forEach(x => {
      draw_l(fqi,x.city)
  });

    function draw_l(data,city){
      
      //Add the line
      g1.append("path")
        .datum(data.filter((d)=>{return d.city === city;}))
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .style('opacity',0.1 )
        .attr('id', function(d){
          console.log(d[0].city)
          return d[0].city})
        .attr("d", d3.line()
          .x(function(d) { return xScale(d.date) })
          .y(function(d) { return yScale(d.pm25) })
          )
      
      // g1.selectAll("bar")
      //     .data(data)
      //   .enter().append("rect")
      //     .style("fill", 'steelblue')
      //     .attr("x", function(d) { return xScale(d.Date); })
      //     .attr("width", xScale.bandwidth())
      //     .attr("y", function(d) { return yScale(d.pm25); })
      //     .attr("height", function(d) { return height - yScale(d.pm25); });
    }

});
