let margin = 50;
// let gap_between_views = 150;
let svg = d3.select('#svg_m');
let svg_h = d3.select('#svg_h');
let width = svg.attr("width") - margin ;
let height = (svg.attr("height") - margin);
var parseDate = d3.timeParse("%Y-%m-%d");
var timeFormat = d3.timeFormat("%B %d, %Y");
var parseDate2 = d3.timeParse("%d-%m-%Y");
var parseDate3 = d3.timeParse("%m-%d-%Y");
let g1 = svg.append("g")
                    .attr("transform", "translate(" + 100 + "," + 100 + ")");
let g = svg.append("g")

var defs = svg.append("defs");
var format = d3.timeFormat("%m-%d-%Y");
// Create point variable
var point = g1.append('g')
.attr("clip-path", "url(#clip)")
var map_color = '#BEB7A4';
var point_color = '#2EC0F9';


let date_beg_high = new Date(2020, 3, 1);
let date_end_high = new Date(2020, 9, 1);

Promise.all([d3.json("china.json"), d3.csv("city_data_with_province_utf.csv"),d3.csv("fqi_data.csv")
, d3.csv("province_mean.csv")
]).then((data)=> {
  // // console.log(data);
  data1 = data[0];
  city = data[1];
  fqi = data[2];
  province_mean = data[3];

  i = 0;
  parseDate = d3.timeParse("%m/%d/%Y");
  let cur_city = 'Shenyang';

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
        x.fqi_cum = parseInt(x.fqi_cum);
  });

  city.forEach(x => {
      i += 1;
      x.lat = +x.lat;
      x.lng = +x.lng;
      //unique id for each data point
      x.id = "i" + i;
      x.city = x.city;
      x.province = x.province;

  });

  let div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);


    ///////////////////////////////////////////////////////////////////////////
    //////////// Get continuous color scale for the Rainbow ///////////////////
    ///////////////////////////////////////////////////////////////////////////

  var coloursRainbow2 = ["#2c7bb6", "#00a6ca","#00ccbc","#90eb9d","#ffff00","#f9d057","#f29e2e","#e76818","#d7191c"];
  // var colourRangeRainbow2 = d3.range(0, 1, 1.0 / (coloursRainbow2.length - 1));
  var colourRangeRainbow2 = [0, 0.3, 0.4, 0.5, 0.6, 0.75, 0.8, 0.9];
  colourRangeRainbow2.push(1);

  //Create color gradient
  var colorScaleRainbow2 = d3.scaleLinear()
    .domain(colourRangeRainbow2)
    .range(coloursRainbow2)
    .interpolate(d3.interpolateHcl);

  //Needed to map the values of the dataset to the color scale
  var colorInterpolateRainbow2 = d3.scaleLinear()
    .domain(d3.extent(province_mean, function(d) { return d['fqi_cum']; }))
    .range([0, 1]);

  ///////////////////////////////////////////////////////////////////////////
  //////////////////// Create the Rainbow color gradient ////////////////////
  ///////////////////////////////////////////////////////////////////////////

  //Calculate the gradient
  defs.append("linearGradient2")
    .attr("id", "gradient-rainbow-colors2")
    .attr("x1", "0%").attr("y1", "0%")
    .attr("x2", "100%").attr("y2", "0%")
    .selectAll("stop")
    .data(coloursRainbow2)
    .enter().append("stop")
    .attr("offset", function(d,i) { return i/(coloursRainbow2.length-1); })
    .attr("stop-color", function(d) { return d; });





  let projection = d3.geoMercator()
    .scale(650)
    .center([115,40])
    // .translate([0,500]);

  // let projection = d3.geoMercator();


  path = d3.geoPath()
				.projection(projection);
  g.selectAll("path")
  				.data(data1.features)
  				.enter()
  				.append("path")
  				.attr("stroke", "white")
          .attr("transform", "translate(0, 0)")
  				.attr("stroke-width", 1)
  				.attr("fill", function(d, i) {
            name = d.properties.name;
            // console.log(name);
            fqi_pro = province_mean.filter(d => {return d.Province === name})[0]['fqi_cum'];
            console.log(fqi_pro);
            return colorScaleRainbow2(colorInterpolateRainbow2(fqi_pro))})
          .attr("d", path);


  let bounds = path.bounds(data1);
  // console.log(bounds);
  let map_width = bounds[1][0] - bounds[0][0];
  let map_height = bounds[1][1] - bounds[0][1];
  // console.log(map_width);
  g.selectAll("circle")
		.data(city).enter()
    .append("circle")
    .attr('id', function(d){
      // // console.log(d.city)
      return d.city})
		.attr("cx", d => {return projection([d.lng, d.lat])[0]; })
		.attr("cy", d => { return projection([d.lng, d.lat])[1]; })
		.attr("r", "3px")
    .style("fill", point_color)
    .style('stroke', 'black')
    .on("mouseover", function (event, d) {
      let cur_city = this.id
      g1.selectAll('.line').style('stroke','lightgrey')
      g1.selectAll("#"+cur_city).raise().style("stroke","url(#line-gradient)").style('stroke-width','4').style('opacity',1);
      // console.log(cur_city)

      g1.selectAll('.'+cur_city).style('opacity',1)

      d3.select(this)
        .style("fill", "white")
        .style('r', '5');

      div
        .style("opacity", .9);
      div.html(d.city)
              .style("left", (event.pageX) + "px")
              .style("top", (event.pageY -28) + "px");
    })
    .on("click", function (event, d) {
      cur_city = this.id;
      draw_h(fqi, city, cur_city ,d3.selectAll("input[name='var_radio']:checked").node().value)
    })
    .on("mouseout", function (d, i) {
      cur_city = this.id
      g1.selectAll('.line').style('stroke',"url(#line-gradient)");
      d3.select(this)
        .style("fill", point_color)
        .style("r", "3px");

      div
        .style("opacity", 0);

      g1.selectAll('.'+cur_city).style('opacity',0)
      g1.selectAll("#"+cur_city).style("stroke","url(#line-gradient)").style('stroke-width','4').style('opacity',0.2);
    });

    function update(id, cur_city){
      draw_h(fqi,city, cur_city, id);
      draw_l(fqi,city, id);
    };

    d3.selectAll("input[name='var_radio']").on("change", function(event, d){
      update(this.value, cur_city)
    });


    draw_h(fqi,city, 'Shenyang', 'fqi_cum', date_beg_high, date_end_high);
    draw_l(fqi,city,'fqi_cum');

    function draw_l(fqi,city,feature){
      g1.selectAll("*").remove();
      var margin_l = {top: 20, right: 50, bottom: 100, left: 100},
        width_l = width - margin_l.left - margin_l.right,
        height_l = height - margin_l.top - margin_l.bottom;
        // console.log(width_l)

      // var xScale= d3.scaleTime()
      //     .domain(d3.extent(fqi, function(d) { return d.date; }))
      //     .range([ map_width, width_l ]);

      var xScale = d3.scaleTime()
      .domain(d3.extent(fqi, function(d) { return d.date; }))
      .range([ map_width, width_l ])
      .nice()


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
          {offset: "10%", color: "#2c7bb6"},
          {offset: '20%', color: "#00a6ca"},
          {offset: "30%", color: "#00ccbc"},
          {offset: "40%", color: "#90eb9d"},
          {offset: '50%', color: "#ffff00"},
          {offset: "60%", color: "#f9d057"},
          {offset: "70%", color: "#f29e2e"},
          {offset: '80%', color: "#e76818"},
          {offset: "90%", color: "#d7191c"},
          {offset: '100%', color: "#d7191c"},
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

      // Create point variable
      var point = g1.append('g')
        .attr("clip-path", "url(#clip)")


      //Add the line
      city.forEach(x => {


        line.append("path")
          .datum(fqi.filter((d)=>{return d.city === x.city;}))
          .attr("class", "line")
          .attr("fill", "none")
          .attr("stroke", "url(#line-gradient)")
          .attr("stroke-width", 4)
          .style('opacity',0.2 )
          .attr('id', function(d){
            // // console.log(d[0].city)
            return d[0].city})
          .attr("d", d3.line()
            .x(function(d) { return xScale(d.date) })
            .y(function(d) { return yScale(d[feature]) })


          )


        });


      // add points
      point.selectAll('.point')
      .data(fqi)
      .enter()
      .append('circle')
      .attr('class', function(d) { return d.city })
      .attr('id', function(d){
        return d.date
      })
      .attr("cx", function(d) { return xScale(d.date) })
      .attr('cy', function(d) { return yScale(d[feature]) })
      .attr('r', '3')
      .style('opacity',0)
      .style('fill', 'steelblue')
      .style('stroke','white')



      line.selectAll('.line')
      .on("click", function (event, d) {
        cur_city = this.id;
        draw_h(fqi, city, cur_city ,d3.selectAll("input[name='var_radio']:checked").node().value)
      })
      .on("mouseover",function (event, d) {
        let cur_city = this.id
        g.selectAll("#"+cur_city).raise().style("fill","white").style('r','5');
        point.selectAll('.'+cur_city).style('opacity',1);

        g1.selectAll(".line").style("stroke",'lightgrey')

        d3.select(this).raise()
          .style('stroke', "url(#line-gradient)")
          .style('stroke-width','4')
          .style("opacity",'1');


        div
          .style("opacity", .9);
        div.html(this.id)
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY -28) + "px");

      })
      .on("mouseout",function (event, d) {
        let cur_city = this.id
        g.selectAll("#"+cur_city).transition().style("fill",point_color).style('r','3');

        // console.log(cur_city)
        g1.selectAll('.'+cur_city).style('opacity',0)
        d3.selectAll('.line')
          .style("opacity",'0.2')
          .style('stroke', "url(#line-gradient)")
          .style('stroke-width','4')
;

        div
          .style("opacity", 0);



        // draw_l(fqi,cur_city)


        // // console.log(i.properties);
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
          // console.log(extent)
          date_beg_high = xScale.invert(extent[0]);
          date_end_high = xScale.invert(extent[1]);
          xScale.domain([ xScale.invert(extent[0]), xScale.invert(extent[1]) ]);
          draw_h(fqi, city, cur_city, feature, date_beg_high, date_end_high);
          // console.log(xScale.invert(extent[0]), xScale.invert(extent[1]))
          g1.selectAll(".brush").call(brush.move, null) // This remove the grey brush area as soon as the selection has been done
        }
        // Update axis and line position



        zoom();

        // If user double click, reinitialize the chart
        svg.on("dblclick",function(){
            // draw_h(fqi, city, cur_city, feature, date_beg, date_end);
            xScale.domain([d3.min(fqi, function(d) { return d.date; }),d3.max(fqi, function(d) { return d.date; })]);
            draw_h(fqi, city, cur_city, feature);
            zoom()
            });

      }

      function zoom(){
        var t = svg.transition().duration(750);
        xAxis.transition(t).call(d3.axisBottom(xScale));
        b = point.selectAll('circle')
              .transition(t)
              .attr("cx", function(d) { return xScale(d.date) })
              .attr('cy', function(d) { return yScale(d[feature]) });
        a = line.selectAll('.line')
              .transition(t)
              .attr("d", d3.line()
                .x(function(d) { return xScale(d.date) })
                .y(function(d) { return yScale(d[feature]) })
              );


      }


    }

    function draw_h(fqi, city, cur_city, feature, date_beg_high=new Date(2020, 3, 1), date_end_high= new Date(2020, 9, 1)){
      const date_beg = new Date(2020, 3, 1);
      const date_end = new Date(2020, 9, 1);
      console.log(date_beg, date_end, date_beg_high, date_end_high);
      svg_h.selectAll("*").remove();
      ///////////////////////////////////////////////////////////////////////////
      //////////// Get continuous color scale for the Rainbow ///////////////////
      ///////////////////////////////////////////////////////////////////////////

      var coloursRainbow = ["#2c7bb6", "#00a6ca","#00ccbc","#90eb9d","#ffff00","#f9d057","#f29e2e","#e76818","#d7191c"];
      var colourRangeRainbow = d3.range(0, 1, 1.0 / (coloursRainbow.length - 1));
      // var colourRangeRainbow = [0, 0.05, 0.1, 0.15, 0.2, 0.3, 0.4, 0.8];
      colourRangeRainbow.push(1);

      //Create color gradient
      var colorScaleRainbow = d3.scaleLinear()
        .domain(colourRangeRainbow)
        .range(coloursRainbow)
        .interpolate(d3.interpolateHcl);

      //Needed to map the values of the dataset to the color scale
      var colorInterpolateRainbow = d3.scaleLinear()
        .domain(d3.extent(fqi, function(d) { return d[feature]; }))
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

      var title='Condition by Day in the Past Five Months';
      var units= cur_city;


      //general layout information
      var cellSize = 40;
      var xOffset=0;
      var yOffset=60;
      var calY=50;//offset of calendar in each group
      var calX=25;
      var width = 1500;
      var height = 163;
      var data = fqi.filter((d)=>{return d.city === cur_city});
      // format = d3.timeFormat("%d-%m-%Y");
      toolDate = d3.timeFormat("%d/%b/%y");

      var yearlyData = d3.group(data, d => d.year);
      svg_h
         .attr("transform", "translate(" + 100 + "," + 200 + ")")
         .attr("viewBox","0 0 "+(xOffset+width)+" 1000");

      svg_h.append("text")
        .attr("x",xOffset)
        .attr("y",0)
        .attr("dy","1.3em")
        .text(title);
      svg_h.append("text")
        .attr("x",xOffset)
        .attr("y",20)
        .attr("dy","1.3em")
        .text(cur_city);

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
      // console.log(cals);

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
             return d3.timeDay.range(date_beg, date_end); })
          .enter().append("rect")
          .attr("id",function(d) {
              // console.log(format(d));
              return "_"+format(d);
              //return toolDate(d.date)+":\n"+d[1]+" dead or missing";
          })
          .attr("class", "day")
          .attr("width", cellSize)
          .attr("height", cellSize)
          .attr("x", function(d) {
              return xOffset+calX+(d3.timeWeek.count(d3.timeYear(d), d) - 12) * cellSize;
          })
          .attr("y", function(d) { return calY+(d.getDay() * cellSize); })
          .datum(format)
          .style("fill", function (d,i) {
            // console.log(data[i]);
            return colorScaleRainbow(colorInterpolateRainbow(data[i][feature])) })
          .on('mouseover', function (d, i){
            g1.selectAll('.line').style('stroke','lightgrey')
            d3.select(this).style("opacity", "50%");
            g1.selectAll("#"+cur_city).raise().style("stroke","url(#line-gradient)").style('stroke-width','4').style('opacity',1);
            var info = data.filter((d)=>{return format(d.date) === i})[0][feature];

            a = g1.selectAll('.'+cur_city)
            .filter(function(d) {return this.id ==d3.timeParse("%d-%m-%Y")(i)})
            a.style('opacity','1')
            .style('r','5');
            div.transition()
              .duration(100)
              .style("opacity", .9);
            div.html(i + '\n' + info)
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY + 20) + "px");

          })
          .on('mouseout',function (d, i){
            g1.selectAll('.line').style('stroke','url(#line-gradient)')
            d3.select(this).style("opacity", "100%");
            g1.selectAll("#"+cur_city).style("stroke","url(#line-gradient)").style('stroke-width','1.5').style('opacity',0.2);
            a.style('r','3')
            .style('opacity','0')
            div.transition()
              .duration(100)
              .style("opacity", 0);
          })


      //create day labels
      var days = ['Su','Mo','Tu','We','Th','Fr','Sa'];
      var dayLabels=cals.append("g").attr("id","dayLabels")
      days.forEach(function(d,i)    {
          dayLabels.append("text")
          .attr("class","dayLabel")
          .attr("x",xOffset)
          .attr("y",function(d) { return calY+(i * cellSize); })
          .attr("dy","1.3em")
          .text(d);
      })


      //append a title element to give basic mouseover info

      //add montly outlines for calendar
      cals.append("g")
      .attr("id","monthOutlines")
      .selectAll(".month")
      .data(function(d) { // console.log(d3.timeMonths(new Date(parseInt(d[0]), 0, 1), new Date(parseInt(d[0]), 8, 1)));
        return d3.timeMonths(date_beg, date_end)})
      .enter().append("path")
      .attr("class", "month")
      .attr("transform","translate("+(xOffset+calX)+","+calY+")")
      .attr("d", monthPath);

      //retreive the bounding boxes of the outlines

      // // console.log(document.getElementById("monthOutlines"));
      var BB = new Array();
      var mp = d3.select('#monthOutlines').node();
      // console.log(mp.childElementCount);
      for (var i=0;i<mp.childElementCount;i++){
          BB.push(mp.children[i].getBBox());
      }
      // console.log(BB);
      var monthX = new Array();
      BB.forEach(function(d,i){
          boxCentre = d.width/2;
          monthX.push(xOffset+calX+d.x+boxCentre);
      })
      // console.log(monthX);
      //create centred month labels around the bounding box of each month path
      //create day labels
      // var months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
      var months = ['APR','MAY','JUN','JUL','AUG', 'SEP'];
      var monthLabels=cals.append("g").attr("id","monthLabels")
      months.forEach(function(d,i)    {
          monthLabels.append("text")
          .attr("class","monthLabel")
          .attr("x",monthX[i])
          .attr("y",calY/1.9)
          .attr("dy","1.5em")
          .text(d);
      })
      // console.log(rects);
      if ((date_beg.getDate() !== date_beg_high.getDate()) && (date_end.getDate() !== date_end_high.getDate())) {
        console.log(date_beg, date_beg_high);
        for (var i = date_beg; i <= date_beg_high; i.setDate(i.getDate() + 1)) {
          // console.log(d3.select('#_' + format(i)));
          d3.select('#_' + format(i))
          .style('fill', 'lightgrey')
        }
        for (var i = date_end_high; i <= date_end; i.setDate(i.getDate() + 1)) {
          // console.log(d3.select('#_' + format(i)));
          d3.select('#_' + format(i))
          .style('fill', 'lightgrey')
        }

      }

  //pure Bostock - compute and return monthly path data for any year
  function monthPath(t0) {
    var year = 2020;
    var month = d3.timeMonth.count(d3.timeYear(t0), t0);
    var t1 = new Date(year, month+1, 0);
    // console.log(t1);
    var d0 = d3.timeDay.count(d3.timeSunday(t0), t0);
    var w0 = d3.timeSunday.count(d3.timeYear(t0), t0) - 12;
    var d1 = d3.timeDay.count(d3.timeSunday(t1), t1);
    var w1 = d3.timeSunday.count(d3.timeYear(t1), t1) - 12;
    // // console.log((w0 + 1) * cellSize, d0 * cellSize, w0 * cellSize, 7 * cellSize, w1 * cellSize, (d1 + 1) * cellSize);
    return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize
          + "H" + w0 * cellSize + "V" + 7 * cellSize
          + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize
          + "H" + (w1 + 1) * cellSize + "V" + 0
          + "H" + (w0 + 1) * cellSize + "Z";
  }
}
});
