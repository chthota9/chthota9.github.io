/* File: DenmarkPop.js 
By: Charishma Thota
*/

/*eslint-env es6*/
/*eslint-env browser*/
/*eslint no-console: 0*/
/*global d3 */

//I used D3 V4 because in V5 I had a lot of trouble parsing JSON Data and combining my CSV Data with the JSOn Data


//Sources and Citation
//Interacitve Data Visualization by Scott Murray -Geomapping Chapter - general logistics
//https://bost.ocks.org/mike/map/ -- borderes, displaying map logic
//https://bl.ocks.org/JulienAssouline/1ae3480c5277e2eecd34b71515783d6f - for color schemes and csv combining with json knowledge
//https://www.d3-graph-gallery.com/graph/custom_legend.html - for legend
//Population Data acquired from https://www.statbank.dk/FOLK1A
//SHP acquired from https://gadm.org/download_country_v3.html
//Conversion from mapshaper.org

//DEFINE WHERE WE WANT TO DISPLAY OUR DENMARK MAP
var width = 960, 
    height = 1160;


//We want to now project our map on to the display, it will translate our long and latitude values into x,y coordinates using geoAlbers
//ensure that our projection fit our bounds
var projection = d3.geoAlbers()
    .center([15, 56]) // how centered in our box
    .rotate([4.4, 0]) // how much should the point be rotated relative to original position
    .parallels([50, 60]) // parallel to our original positon
    .scale(1000 * 13) //how big we want the display to be
    .translate([width / 2, height / 2]); //transalted across our box

//this builds our path from the coordinates generated to be used as our "d" attritbutee
var path = d3.geoPath().projection(projection); // 

//DEFINE SVG ELEMENT THAT WILL BE DRAWN, our d attribute will be appendded to this SVG element
var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height); 

//DEFINE OUR COLOR RANGE - i used five different green ranges with the darker one corresponding to more epopulation
//given the domain it will ouput within this range
var color = d3.scaleQuantile()
    .range(["rgb(237, 248, 233)", "rgb(186, 228, 179)", "rgb(116,196,118)", "rgb(49,163,84)", "rgb(0,109,44)"]);

//GET OUR DATA FROM CSV AND JSON/ COMBINE DATA
d3.csv("denmarkpop.csv", function(data) { // parse csv file to get population, index that corresponds to our geoJSOn file, region

    data.forEach(function(d) {
        d.Population = +d.Population;
        d.Region = d.Region;
        d.Index= d.Index;    
    })
    
  color.domain([ d3.min(data, function(d){ return d.Population; }), //our domain should be min population to max
          d3.max(data, function(d){ return d.Population; })
          ]);    
    
    d3.json("Denmark.json", function(error, dk) { //parse JSON file to maniuplate and add population values
        var file = topojson.feature(dk, dk.objects.gadm36_DNK_1).features; //establish topojson feature into a variable to be easily called, this basically returns the geometries of the five regions
           for(var i = 0; i < data.length; i++){ //loop through csv and store index and population
               var idx = data[i].Index;
               var pop = data[i].Population;
               
              for(var n = 0; n < dk.objects.gadm36_DNK_1.geometries.length; n++){ //loop through json and find the region with the same index attribute from csv
                  if(idx == n){
                      file[n].properties.value = pop; //set the population of that region in a new value object 
                      break; //once found break and start a new interation
                  }
           }
        }
    //population check
        console.log(file[0].properties.value);
        console.log(file[1].properties.value);
        console.log(file[2].properties.value);
        console.log(file[3].properties.value);
        console.log(file[4].properties.value);
        
 //DRAW OUR MAP       
      svg.selectAll("path") 
          .data(file) //data being used
        .enter().append("path") //entered into our path
        .attr("d", path) //path coordinates established with projection
        .attr('stroke', '#000') //color for the borders between regions
        .style("fill", function(d){ //create function that goes through each property and its value
          var value = d.properties.value; //store the value
          if(value){ 
               return color(value); //apply color scheme to value, we supply a domain it will output a range - in this case a specfic color
          }
        });    
});
    
//CREAETE LEGENED
//create a circle for each color scheme
//darker circle at the end, lighter at the start
svg.append("circle").attr("cy",200).attr("cx",130).attr("r", 6).style("fill", "rgb(237, 248, 233)")
svg.append("circle").attr("cy",200).attr("cx",160).attr("r", 6).style("fill", "rgb(186, 228, 179)")        
svg.append("circle").attr("cy",200).attr("cx",190).attr("r", 6).style("fill", "rgb(116,196,118)")
svg.append("circle").attr("cy",200).attr("cx",210).attr("r", 6).style("fill", "rgb(49,163,84)")
svg.append("circle").attr("cy",200).attr("cx",240).attr("r", 6).style("fill", "rgb(0,109,44)")
//showing the lighter ---> dark as increasing population
svg.append("text").attr("y", 180).attr("x", 100).text("Increasing Population ----->").style("font-size", "15px").attr("alignment-baseline","middle")
    
});
