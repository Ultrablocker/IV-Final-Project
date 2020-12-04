let margin = 100;
// let gap_between_views = 150;
let svg = d3.select('svg')
let width = svg.attr("width") - margin ;
let height = (svg.attr("height") - margin);
var parseDate = d3.timeParse("%Y-%m-%d");
let g1 = svg.append("g")
                    .attr("transform", "translate(" + 100 + "," + 100 + ")");

var defs = svg.append("defs");



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
        x.year=x.date.getFullYear();
  });

  city.forEach(x => {
      i += 1;
      x.lat = +x.lat;
      x.lng = +x.lng;
      //unique id for each data point
      x.id = "i" + i;
      x.city = x.city;
  });


  ///////////////////////////////////////////////////////////////////////////
  //////// Get continuous color scale for the Yellow-Green-Blue fill ////////
  ///////////////////////////////////////////////////////////////////////////

  var coloursYGB = ["#FFFFDD","#AAF191","#80D385","#61B385","#3E9583","#217681","#285285","#1F2D86","#000086"];
  var colourRangeYGB = d3.range(0, 1, 1.0 / (coloursYGB.length - 1));
  colourRangeYGB.push(1);

  //Create color gradient
  var colorScaleYGB = d3.scaleLinear()
  	.domain(colourRangeYGB)
  	.range(coloursYGB)
  	.interpolate(d3.interpolateHcl);
  //Needed to map the values of the dataset to the color scale
  var colorInterpolateYGB = d3.scaleLinear()
  	.domain(0, 400)
  	.range([0,1]);

  ///////////////////////////////////////////////////////////////////////////
  ///////////////////// Create the YGB color gradient ///////////////////////
  ///////////////////////////////////////////////////////////////////////////

  //Calculate the gradient
  defs.append("linearGradient")
  	.attr("id", "gradient-ygb-colors")
  	.attr("x1", "0%").attr("y1", "0%")
  	.attr("x2", "100%").attr("y2", "0%")
  	.selectAll("stop")
  	.data(coloursYGB)
  	.enter().append("stop")
  	.attr("offset", function(d,i) { return i/(coloursYGB.length-1); })
  	.attr("stop-color", function(d) { return d; });

  ///////////////////////////////////////////////////////////////////////////
  //////////// Get continuous color scale for the Rainbow ///////////////////
  ///////////////////////////////////////////////////////////////////////////

  var coloursRainbow = ["#2c7bb6", "#00a6ca","#00ccbc","#90eb9d","#ffff8c","#f9d057","#f29e2e","#e76818","#d7191c"];
  var colourRangeRainbow = d3.range(0, 1, 1.0 / (coloursRainbow.length - 1));
  colourRangeRainbow.push(1);

  //Create color gradient
  var colorScaleRainbow = d3.scaleLinear()
  	.domain(colourRangeRainbow)
  	.range(coloursRainbow)
  	.interpolate(d3.interpolateHcl);

  //Needed to map the values of the dataset to the color scale
  var colorInterpolateRainbow = d3.scaleLinear()
  	.domain(d3.extent(fqi, function(d) { return d.pm25; }))
  	.range([0, 1]);

  ///////////////////////////////////////////////////////////////////////////
  //////////////////// Create the Rainbow color gradient ////////////////////
  ///////////////////////////////////////////////////////////////////////////

  //Calculate the gradient
  defs.append("linearGradient")
  	.attr("id", "gradient-rainbow-colors")
  	.attr("x1", "0%").attr("y1", "0%")
  	.attr("x2", "100%").attr("y2", "0%")
  	.selectAll("stop")
  	.data(coloursRainbow)
  	.enter().append("stop")
  	.attr("offset", function(d,i) { return i/(coloursRainbow.length-1); })
  	.attr("stop-color", function(d) { return d; });

  console.log(fqi);
  let projection = d3.geoMercator()
    .scale(600)
    .center([115,40])
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
      .domain([0, d3.max(fqi, function(d) { return d.pm25; })])
      .range([ height_l, 0]);
    yAxis = g1.append("g")
      .attr("transform", "translate("+map_width+"," + 0 + ")")
      .call(d3.axisLeft(yScale));

    draw_l(fqi,city);
    draw_h(fqi,city, 'Harbin');

    function draw_l(fqi,city){



      // Add a clipPath: everything out of this area won't be drawn.
      var clip = g1.append("defs").append("svg:clipPath")
      .attr("id", "clip")
      .append("svg:rect")
      .attr("width", width_l-map_width )
      .attr("height", height_l )
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
          .attr("stroke", "steelblue")
          .attr("stroke-width", 1.5)
          .style('opacity',0.1 )
          .attr('id', function(d){
            // console.log(d[0].city)
            return d[0].city})
          .attr("d", d3.line()
            .x(function(d) { return xScale(d.date) })
            .y(function(d) { return yScale(d.pm25) })
            )
        });

      // Add the brushing
      line
      .append("g")
        .attr("class", "brush")
        .call(brush);

      // A function that set idleTimeOut to null
      var idleTimeout
      function idled() { idleTimeout = null; }

       // A function that update the chart for given boundaries
       function updateChart(event) {
       // What are the selected boundaries?
        extent = event.selection

        // If no selection, back to initial coordinate. Otherwise, update X axis domain
        if(!event.selection){
          if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
          xScale.domain([ 4,8])
        }else{
          xScale.domain([ xScale.invert(extent[0]), xScale.invert(extent[1]) ])
          line.selectAll(".brush").call(brush.move, null) // This remove the grey brush area as soon as the selection has been done
        }
        // Update axis and line position
      xAxis.transition().duration(1000).call(d3.axisBottom(xScale))
      line
          .selectAll('.line')
          .transition()
          .duration(1000)
          .attr("d", d3.line()
            .x(function(d) { return xScale(d.date) })
            .y(function(d) { return yScale(d.pm25) })
          )

      }

      // If user double click, reinitialize the chart
      svg.on("dblclick",function(){
      xScale.domain(d3.extent(fqi, function(d) { return d.date; }))
      xAxis.transition().duration(1000).call(d3.axisBottom(xScale))
      line
        .selectAll('.line')
        .transition()
        .duration(1000)
        .attr("d", d3.line()
          .x(function(d) { return xScale(d.date) })
          .y(function(d) { return yScale(d.pm25) })
        )
      });
    }

    function draw_h(fqi, city, cur_city){
      var title="FQI";
      var units= cur_city;
      var breaks=[10,25,50,100];
      var colours=["#ffffd4","#fed98e","#fe9929","#d95f0e","#993404"];

      //general layout information
      var cellSize = 17;
      var xOffset=20;
      var yOffset=60;
      var calY=50;//offset of calendar in each group
      var calX=25;
      var width = 960;
      var height = 163;
      var data = fqi.filter((d)=>{return d.city === cur_city});
      format = d3.timeFormat("%d-%m-%Y");
      toolDate = d3.timeFormat("%d/%b/%y");

      var yearlyData = d3.group(data, d => d.year);

      var svg_h = d3.select("body").append("svg")
         .attr("width","1000", 'height', '500')
         .attr("transform", "translate(" + 100 + "," + 100 + ")")
         .attr("viewBox","0 0 "+(xOffset+width)+" 540");

      svg_h.append("text")
        .attr("x",xOffset)
        .attr("y",20)
        .text(title);

      var cals = svg_h.selectAll("g")
        .data(yearlyData)
        .enter()
        .append("g")
        .attr("id",function(d){
            return d[0];
        })
        .attr("transform",function(d,i){
            return "translate(0,"+(yOffset+(i*(height+calY)))+")";
        })
      console.log(cals);
      var labels = cals.append("text")
          .attr("class","yearLabel")
          .attr("x",xOffset)
          .attr("y",15)
          .text(function(d){return d[0]});
      //create a daily rectangle for each year
      var rects = cals.append("g")
          .attr("id","alldays")
          .selectAll(".day")
          .data(function(d) {
             console.log(d);
             return d3.timeDay.range(new Date(parseInt(d[0]), 3, 1), new Date(parseInt(d[0]), 8, 1)); })
          .enter().append("rect")
          .attr("id",function(d) {
              return "_"+format(d);
              //return toolDate(d.date)+":\n"+d[1]+" dead or missing";
          })
          .attr("class", "day")
          .attr("width", cellSize)
          .attr("height", cellSize)
          .attr("x", function(d) {
              return xOffset+calX+(d3.timeWeek.count(d3.timeYear(d), d) * cellSize);
          })
          .attr("y", function(d) { return calY+(d.getDay() * cellSize); })
          .datum(format)
          .style("fill", function (d,i) {
            return colorScaleRainbow(colorInterpolateRainbow(data[i]['pm25'])) });

      //create day labels
      var days = ['Su','Mo','Tu','We','Th','Fr','Sa'];
      var dayLabels=cals.append("g").attr("id","dayLabels")
      days.forEach(function(d,i)    {
          dayLabels.append("text")
          .attr("class","dayLabel")
          .attr("x",xOffset)
          .attr("y",function(d) { return calY+(i * cellSize); })
          .attr("dy","0.9em")
          .text(d);
      })

      //let's draw the data on
      // var dataRects = cals.append("g")
      //     .attr("id","dataDays")
      //     .selectAll(".dataday")
      //     .data(function(d){
      //         console.log(d);
      //         return d.pm25;
      //     })
      //     .enter()
      //     .append("rect")
      //     .attr("id",function(d) {
      //         return format(d.date)+":"+d[1];
      //     })
      //     .attr("stroke","#ccc")
      //     .attr("width",cellSize)
      //     .attr("height",cellSize)
      //     .attr("x", function(d){return xOffset+calX+(d3.timeWeek.count(d.date) * cellSize);})
      //     .attr("y", function(d) { return calY+(d.date.getDay() * cellSize); })
      //     .attr("fill", function(d) {
      //         if (d[1]<breaks[0]) {
      //             return colours[0];
      //         }
      //         for (i=0;i<breaks.length+1;i++){
      //             if (d[1]>=breaks[i]&&d[1]<breaks[i+1]){
      //                 return colours[i];
      //             }
      //         }
      //         if (d[1]>breaks.length-1){
      //             return colours[breaks.length]
      //         }
      //     })

      //append a title element to give basic mouseover info
      rects.append("title")
          .text(function(d, i) { return i.date + ' ' + i.pm25; });

      //add montly outlines for calendar
      cals.append("g")
      .attr("id","monthOutlines")
      .selectAll(".month")
      .data(function(d) { console.log(d3.timeMonths(new Date(parseInt(d[0]), 0, 1), new Date(parseInt(d[0]), 8, 1)));
        return d3.timeMonths(new Date(parseInt(d[0]), 3, 1), new Date(parseInt(d[0]), 8, 1))})
      .enter().append("path")
      .attr("class", "month")
      .attr("transform","translate("+(xOffset+calX)+","+calY+")")
      .attr("d", monthPath);

      //retreive the bounding boxes of the outlines

      // console.log(document.getElementById("monthOutlines"));
      var BB = new Array();
      var mp = d3.select('#monthOutlines').node();
      console.log(mp);
      for (var i=0;i<mp.length;i++){
          BB.push(mp[i].getBBox());
      }

      var monthX = new Array();
      BB.forEach(function(d,i){
          boxCentre = d.width/2;
          monthX.push(xOffset+calX+d.x+boxCentre);
      })
      console.log(monthX);
      //create centred month labels around the bounding box of each month path
      //create day labels
      var months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
      var monthLabels=cals.append("g").attr("id","monthLabels")
      months.forEach(function(d,i)    {
          monthLabels.append("text")
          .attr("class","monthLabel")
          .attr("x",monthX[i])
          .attr("y",calY/1.2)
          .text(d);
      })

       //create key
      var key = svg.append("g")
          .attr("id","key")
          .attr("class","key")
          .attr("transform",function(d){
              return "translate("+xOffset+","+(yOffset-(cellSize*1.5))+")";
          });

      key.selectAll("rect")
          .data(colours)
          .enter()
          .append("rect")
          .attr("width",cellSize)
          .attr("height",cellSize)
          .attr("x",function(d,i){
              return i*130;
          })
          .attr("fill",function(d){
              return d;
          });

      key.selectAll("text")
          .data(colours)
          .enter()
          .append("text")
          .attr("x",function(d,i){
              return cellSize+5+(i*130);
          })
          .attr("y","1em")
          .text(function(d,i){
              if (i<colours.length-1){
                  return "up to "+breaks[i];
              }   else    {
                  return "over "+breaks[i-1];
              }
          });


  //pure Bostock - compute and return monthly path data for any year
  function monthPath(t0) {
    var year = 2020;
    var month = d3.timeMonth.count(d3.timeYear(t0), t0);
    var t1 = new Date(year, month+1, 0);
    console.log(t1);
    var d0 = d3.timeDay.count(d3.timeSunday(t0), t0);
    var w0 = d3.timeSunday.count(d3.timeYear(t0), t0);
    var d1 = d3.timeDay.count(d3.timeSunday(t1), t1);
    var w1 = d3.timeSunday.count(d3.timeYear(t1), t1);
    console.log((w0 + 1) * cellSize, d0 * cellSize, w0 * cellSize, 7 * cellSize, w1 * cellSize, (d1 + 1) * cellSize);
    return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize
          + "H" + w0 * cellSize + "V" + 7 * cellSize
          + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize
          + "H" + (w1 + 1) * cellSize + "V" + 0
          + "H" + (w0 + 1) * cellSize + "Z";
  }
}
});
