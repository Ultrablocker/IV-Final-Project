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

Promise.all([d3.json("china.json"), d3.csv("cn.csv")
]).then((data)=> {
  console.log(data);
  data1 = data[0];
  data2 = data[1];
  i = 0;
  data2.forEach(x => {
        i += 1;
        x.city = x.city;
        x.lat = +x.lat;
        x.lng = +x.lng;
        //unique id for each data point
        x.id = "i" + i;
        // console.log(x);
    });

  let projection = d3.geoMercator()
    .scale(600)
    .center([110,40])
    // .translate([0,500]);
  let svg = d3.select('svg');
  let width = svg.attr("width");
  let height = svg.attr("height");
  // let projection = d3.geoMercator();
  let g = svg.append("g")
    .attr("transform", "translate(0,0)");
  aa = [121.4667, 31.1667];
  bb = [116.3914, 39.9050];
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
    svg.selectAll("circle")
  		.data(data2).enter()
  		.append("circle")
  		.attr("cx", d => { console.log(d.lng); return projection([d.lng, d.lat])[0]; })
  		.attr("cy", d => { return projection([d.lng, d.lat])[1]; })
  		.attr("r", "2px")
  		.attr("fill", "red")
      .on("mouseover", function (d, i) {
        d3.select(this)
          .attr("fill", "green")
          .attr("r", "5px");
        // console.log(i.properties);
      })
      .on("mouseout", function (d, i) {
        d3.select(this)
          .attr("fill", "red")
          .attr("r", "2px");
      });

});
