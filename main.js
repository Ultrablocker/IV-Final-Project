let margin = 100;
// let gap_between_views = 150;
let svg = d3.select('svg')
let width = svg.attr("width") - margin ;
let height = (svg.attr("height") - margin);
var parseDate = d3.timeParse("%Y-%m-%d");
let g1 = svg.append("g")
                    .attr("transform", "translate(" + 100 + "," + 100 + ")");
let g = svg.append("g")





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

  let projection = d3.geoMercator()
    .scale(600)
    .center([115,40])
    // .translate([0,500]);

  // let projection = d3.geoMercator();


  path = d3.geoPath()
				.projection(projection);

  g.selectAll("path")
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
  g.selectAll("circle")
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
      g1.selectAll("#"+cur_city).raise().transition().style("stroke","red").style('stroke-width','4').style('opacity',1);
      // console.log(cur_city)
      d3.select(this)
        .transition()
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
      g1.selectAll("#"+cur_city).transition().style("stroke","url(#line-gradient)").style('stroke-width','1.5').style('opacity',0.3);
    });
    
    
  
    draw_l(fqi,city,'hum')

    function draw_l(fqi,city,feature){
      var margin_l = {top: 20, right: 50, bottom: 500, left: 100},
        width_l = width - margin_l.left - margin_l.right,
        height_l = height - margin_l.top - margin_l.bottom;
        console.log(width_l)  
        
      // var xScale= d3.scaleTime()
      //     .domain(d3.extent(fqi, function(d) { return d.date; }))
      //     .range([ map_width, width_l ]);
      
      var xScale = d3.scaleTime()
      .domain(d3.extent(fqi, function(d) { return d.date; }))
      .range([ map_width, width_l ]);
      // var xScale = d3.scaleBand()
      //     .domain(data.map(function(d) { return d.Date; }))
      //     .rangeRound([0, width], .05).padding(0.5);
      xAxis = g1.append("g")
        .attr("transform", "translate(0," + height_l + ")")
        .call(d3.axisBottom(xScale));
      // Add Y axis
      var yScale = d3.scaleLinear()
        .domain([d3.min(fqi, function(d) { return d[feature]; }), d3.max(fqi, function(d) { return d[feature]; })])
        .range([ height_l, 0]),
        colorScale = yScale;
      yAxis = g1.append("g")
        .attr("transform", "translate("+map_width+"," + 0 + ")")
        .call(d3.axisLeft(yScale));

      // Set the gradient
      g1.append("linearGradient")
      .attr("id", "line-gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0)
      .attr("y1", colorScale(0))
      .attr("x2", 0)
      .attr("y2", colorScale(d3.max(fqi, function(d) { return d[feature]; })
      ))
      .selectAll("stop")
        .data([
          {offset: "0%", color: "lightgreen"},
          {offset: '50%', color: "orange"},
          {offset: "100%", color: "red"}
        ])
      .enter().append("stop")
        .attr("offset", function(d) { return d.offset; })
        .attr("stop-color", function(d) { return d.color; });


      // Add a clipPath: everything out of this area won't be drawn.
      var clip = g1.append("defs").append("svg:clipPath")
      .attr("id", "clip")
      .append("svg:rect")
      .attr("width", width_l-map_width )
      .attr("height", height_l+100 )
      .attr("x", map_width)
      .attr("y", 0);

      // Add brushing
      var brush = d3.brushX()                   // Add the brush feature using the d3.brush function
          .extent( [ [map_width,0], [width_l,height_l] ] )  // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
          .on("end", updateChart)               // Each time the brush selection changes, trigger the 'updateChart' function

      // Create the line variable: where both the line and the brush take place
      var line = g1.append('g')
        .attr("clip-path", "url(#clip)")

      
      //Add the line
      city.forEach(x => {
        
      
        line.append("path")
          .datum(fqi.filter((d)=>{return d.city === x.city;}))
          .attr("class", "line") 
          .attr("fill", "none")
          .attr("stroke", "url(#line-gradient)")
          .attr("stroke-width", 1.5)
          .style('opacity',0.5 )
          .attr('id', function(d){
            // console.log(d[0].city)
            return d[0].city})
          .attr("d", d3.line()
            .x(function(d) { return xScale(d.date) })
            .y(function(d) { return yScale(d[feature]) })
            
            
          )
          
          
        });
      line.selectAll('.line')
      .on("mouseover",function (event, d) {
        let cur_city = this.id
        g.selectAll("#"+cur_city).raise().transition().style("fill","white").style('r','5');
        // console.log(cur_city)
        d3.select(this).raise().transition()
          .style('stroke', "red")
          .style('stroke-width','4')
          .style("opacity",'1');
        
        // draw_l(fqi,cur_city)
      
          
        // console.log(i.properties);
      })
      .on("mouseout",function (event, d) {
        let cur_city = this.id
        g.selectAll("#"+cur_city).transition().style("fill","red").style('r','3');
        // console.log(cur_city)
        d3.select(this).lower().transition()
          .style('stroke', "url(#line-gradient)")
          .style('stroke-width','1.5')
          .style("opacity",'0.3')
        
        // draw_l(fqi,cur_city)
      
          
        // console.log(i.properties);
      })
      // Add the brushing
      g1
      .append("g")
        .attr("class", "brush")
        .call(brush).lower();

      // A function that set idleTimeOut to null
      var idleTimeout
      function idled() { idleTimeout = null; }

       // A function that update the chart for given boundaries
       function updateChart(event) {
       // What are the selected boundaries?
        extent = event.selection

        // If no selection, back to initial coordinate. Otherwise, update X axis domain
        if(!extent){
          if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
          xScale.domain([ 4,8])
        }else{
          console.log(extent)
          xScale.domain([ xScale.invert(extent[0]), xScale.invert(extent[1]) ])
          g1.selectAll(".brush").call(brush.move, null) // This remove the grey brush area as soon as the selection has been done
        }
        // Update axis and line position
        zoom()

        // If user double click, reinitialize the chart
        svg.on("dblclick",function(){
            
            xScale.domain([d3.min(fqi, function(d) { return d.date; }),d3.max(fqi, function(d) { return d.date; })]);
            zoom()
            });
    
      }

      function zoom(){
        var t = svg.transition().duration(750);
        xAxis.transition(t).call(d3.axisBottom(xScale))
        line.selectAll('.line')
              .transition(t)
              .attr("d", d3.line()
                .x(function(d) { return xScale(d.date) })
                .y(function(d) { return yScale(d[feature]) })
              )
      }

      
    }
        

});
