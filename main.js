let margin = 300;
let gap_between_views = 150;
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

d3.json("china.json").then((data)=>{
  let projection = d3.geoMercator();
  let svg = d3.select('svg');
  let width = svg.attr("width") - margin;
  let height = (svg.attr("height") - margin);
  let g = svg.append("g")
    .attr("transform", "translate(0,0)");

  // const countries = topojson.feature(data, data.objects.countries);


  // console.log(pathGenerator({type:'Sphere'}));
  // const paths = svg.selectAll('path')
  //   .data(countries.features);
  // paths.enter().append('path')
  //   .attr("class", "countries")
  //   .attr('d', d => pathGenerator(d));
  path = d3.geoPath()
				.projection(projection);

  svg.selectAll("path")
  				.data(data.features)
  				.enter()
  				.append("path")
  				.attr("stroke", "#000")
  				.attr("stroke-width", 1)
  				.attr("fill", function (d, i) {
  					return "green";
  				})
  				.attr("d", path)
  				.on("mouseover", function (d, i) {
  					d3.select(this)
  						.attr("fill", "yellow");
            console.log(i.properties);
  				})
  				.on("mouseout", function (d, i) {
  					d3.select(this)
  						.attr("fill", "red");
  				});

});
// var slider = document.getElementById("slider");



// d3.csv('citi_bike_2020.csv').then(function(data){
//   let i = 0;
//   data.forEach(x => {
//         i += 1;
//         x.station = x.station;
//         x.start_from = +x.start_from;
//         x.end_in = +x.end_in;
//         x.trip_duration_start_from = +x.trip_duration_start_from;
//         x.trip_duration_end_in = +x.trip_duration_end_in;
//         x.month = x.month;
//         //unique id for each data point
//         x.id = "i" + i;
//         // console.log(x);
//     });
//     i = 0;
//     let svg = d3.select('svg');
//     let width = svg.attr("width") - margin;
//     let height = (svg.attr("height") - margin - gap_between_views)/2;
//
//
//     slider.oninput = function() {
//       // console.log(this.value);
//       var date = new Date(2020, this.value - 1, 01);
//       monthName = months[date.getMonth()];
//       // console.log(monthName);
//       slidertext.value = monthName;
//       var slider_d3 = d3.select('#slidertext');
//       slider_d3.on("input", update1(monthName));
//       slider_d3.on("input", update2(monthName));
//     }
//     update1(slidertext.value);
//     update2(slidertext.value);
//
//
//
//     function update1(month) {
//       d3.selectAll("svg > *").remove();
//
//       let g = svg.append("g")
//               .attr("transform", "translate(" + 100 + "," + 100 + ")");
//
//       // console.log(typeof(month));
//       let xScale = d3.scaleLinear()
//                       .range([0, width])
//                       .domain([0, d3.max(data, (d)=> d.trip_duration_start_from)]);
//
//       let yScale = d3.scaleLinear()
//               .range([height, 0])
//               .domain([0, d3.max(data, (d)=> d.trip_duration_end_in)]);
//
//       xScale.nice();
//       yScale.nice();
//
//
//       let xAxis = d3.axisBottom(xScale);
//       let yAxis = d3.axisLeft(yScale)
//                   .ticks(5);
//
//
//
//
//
//       g.append('g')
//       .attr("transform", "translate(0," + (height) + ")")
//       .attr('class', 'x-axis')
//       .call(xAxis);
//
//       g.append('g')
//       .attr('class', 'y-axis')
//       .call(yAxis);
//
//       g.append("rect")
//           .attr("class", "background")
//           .attr("x", 0)
//           .attr("y", 0)
//           .attr("width", width)
//           .attr("height", height)
//           .style('fill', '#fce703')
//           .style("opacity", 0);
//
//       svg.append("text")      // text label for the x axis
//       .attr("x", 500)
//       .attr("y", height + 90)
//       .style("text-anchor", "middle")
//       .text("trip duration start from");
//
//
//       svg.append("text")
//       .attr("y", 120)
//       .attr("x", -110)
//       .attr("transform", "rotate(-90)")
//       // .attr("dy", "1em")
//       .style("text-anchor", "end")
//       .text("trip duration end in");
//
//       g.selectAll('.point')
//       .data(data.filter(function(d){return d.month == month;}))
//       .enter().append('circle')
//       .attr('class', "point")
//       .attr("cx", d => xScale(d.trip_duration_start_from))
//       .attr('cy', d =>yScale(d.trip_duration_end_in))
//       .attr('r', '5')
//       .attr('id', d => d.id)
//       .style('fill', 'steelblue')
//       .attr("stroke-width", 2)
//       .attr("stroke", "black")
//       .on("mousemove", function(d, i){
//
//           let id = "#" + i.id;
//           console.log(id);
//           d3.select(this).moveToFront().transition().duration(100).attr("r", '10')
//           .style("fill", "red");
//           d3.selectAll(id).style("fill", "red");
//           div.transition()
//               .duration(100)
//               .style("opacity", .9);
//           g.selectAll('.background').moveToFront().style('opacity', '0.7');
//           d3.select(this).moveToFront();
//           div	.html(i.station)
//               .style("left", (event.pageX) + "px")
//               .style("top", (event.pageY - 28) + "px");
//       })
//       .on("mouseout", function(d, i){
//           let id = "#" + i.id;
//           // console.log(id);
//           d3.selectAll(id).transition().duration(100).style("fill", "steelblue");
//           d3.select(this).transition().style("fill", "steelblue").attr("r", "5");
//           g.selectAll('.background').moveToBack().style('opacity', '0');
//           div.transition()
//               .duration(100)
//               .style("opacity", 0);
//       });
//     }
//     // d3.select('#slidertext').on("change", update2(this.value));
//
//     function update2(month) {
//       //sort the data and change the xscale with the new data
//       dat = data.filter(function(d){return d.month == month;}).sort(function(a, b) {
//         return d3.descending(a.start_from, b.start_from)
//       })
//
//       let xScale = d3.scaleBand()
//           .range([0, width])
//           // .padding(0.4)
//           .domain(dat.map(function(d) { return d.station; }));
//
//       let yScale = d3.scaleLinear()
//               .range([height, 0])
//               .domain([0, d3.max(data, (d)=> d.start_from)]);
//
//       yScale.nice();
//
//       let g = svg.append("g")
//               .attr("transform", "translate(" + 100 + "," + 100 + ")");
//
//       let xAxis = d3.axisBottom(xScale);
//       let yAxis = d3.axisLeft(yScale)
//                   .ticks(5);
//
//
//       g.append('g')
//       .attr("transform", "translate(0," + (2 * height + gap_between_views) + ")")
//       .attr('class', 'x-axis')
//       .call(xAxis)
//       .selectAll("text")
//         .attr("transform", "translate(-10,5)rotate(-70)")
//         .style("text-anchor", "end");
//
//       g.append('g')
//       .attr("transform", "translate(0," + (height + gap_between_views) + ")")
//       .attr('class', 'y-axis')
//       .call(yAxis);
//
//       g.selectAll('.bar')
//       .data(data.filter(function(d){return d.month == month;}))
//       .enter().append('rect')
//       .attr('class', "bar")
//       .attr('id', d => d.id)
//       .attr("transform", "translate(0," + ( height + gap_between_views) + ")")
//       .attr("x", function(d) { return xScale(d.station); })
//       .attr('y', function(d) { return yScale(d.start_from); })
//       .attr('width', xScale.bandwidth())
//       .attr('height', d => {return height - yScale(d.start_from)})
//       .style('fill', 'steelblue')
//       .attr("stroke-width", 2)
//       .attr("stroke", "black")
//       .on("mousemove", function(d, i){
//           // console.log(i)
//           d3.selectAll('.background').moveToFront().style('opacity', '0.7');
//           let id = "#" + i.id;
//           console.log(i.start_from);
//           d3.selectAll(id).moveToFront().style("fill", "red").transition().duration(100)
//           .attr("r", 10);
//
//       })
//       .on("mouseout", function(d, i){
//           let id = "#" + i.id;
//           console.log(id);
//           d3.selectAll(id).style("fill", "steelblue").transition().duration(100).attr("r", 5);
//           d3.selectAll('.background').moveToBack().style('opacity', '0');
//       });
//       // Add X axis label:
//
//       svg.append("text")      // text label for the x axis
//       .attr("x", 200 )
//       .attr("y", (gap_between_views + height) + 100 )
//       .style("text-anchor", "middle")
//       .text("bikers start from");
//
//
//
//       }
//
//   }
// )
