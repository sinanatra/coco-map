var n = 1;
var parseCsv = "index,link\n";

// loads my database (tsv) and filters the database
$(document).ready(function () {
    var category = document.getElementById("category").value;
    var thiscategory = [];

    $("#category").change(function () {
        thiscategory.length = 0;
        thiscategory.push(this.value);
        $("#contentbrutto").html("");
        $("#country").html("");
        $("#imagehere").html("");

        const cleanCountries = [];
        const filteredCountry = [];

        d3.tsv("data/aio.tsv", function (data) {
            data.filter(function (d) {
                try {
                    if (d.COCOTAGDESC.includes(thiscategory)) {
                        //remove repeated country
                        cleanCountries.push(d.COUNTRY);
                        for (var i = 0; i < cleanCountries.length; i++) {
                            if (filteredCountry.indexOf(cleanCountries[i]) === -1) {
                                filteredCountry.push(cleanCountries[i]);
                                $("#country").append("<option>" + cleanCountries[i] + "</option>");
                                //$("#contentbrutto").append("<p>" + "<option>" + cleanCountries[i] + "</option>" + " </p>");
                            }
                        }
                    }
                }
                catch{
                    return;
                }
            });
        });
    });

    // create a treemap from the category selected ( button )
    function parseDatabase() {
        parseCsv = "index,link\n";
        $("#state").html("");
        $("#treemap").html("");

        n = 1;
        var shufflelist = [];
        console.log("category: ", thiscategory);
        d3.tsv("data/aio.tsv", function (parsedData) {
            parsedData.filter(function (d) {
                try {
                    if (d.COCOTAGDESC.includes(thiscategory)) {
                        parseCsv += d.COUNTRY + "," + d.ORIGINAL + "\n"
                        //$("#state").append("<p id='elem'> " + parseCsv + " </p>");        
                    }
                }
                catch{
                    return;
                }
            });
            var data = d3.csvParse(parseCsv)
            buildTreemap(data)
        });

    }

    var button = document.getElementById('parsedata');
    button.addEventListener('click', parseDatabase);
});



// Read data - builds a d3 svg treemap
var buildTreemap = function (data) {

    var color = d3.scaleOrdinal(d3.schemeCategory20);

    // set the dimensions and margins of the graph
    var margin = { top: 10, right: 10, bottom: 10, left: 10 },
        width = window.innerWidth - margin.left - margin.right,
        height = window.innerHeight - margin.top - (margin.bottom * 6);

    // append the svg object to the body of the page
    var svg = d3.select("#treemap")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    var nest = d3.nest()
        .key(function (d) { return d.index })
        .entries(data)

    var hierarchy = d3.hierarchy({
        values: nest.map(item => {
            item.value = item.values.length
            return item
        })
    }, d => d.values)
        .sum(function (d) { return d.value })
        .sort(function (a, b) { return b.value - a.value })

    var imageArray = hierarchy.data.values.map(item => {
        return item.values.map(datum => {
            return datum.link
        })
    })

    d3.treemap()
        .size([width, height])
        .padding(5)
        (hierarchy)

    steps = 25
    padding = 10

    // when the width of the images is bigger than the container - new line
    hierarchy.children.forEach(element => {
        // console.log(element)

        var globalIndex = 0
        var width = element.x1 - element.x0 - (padding * 2)
        var height = element.y1 - element.y0 - (padding * 2)
        
        // single element height 
        var grid = Math.ceil(Math.sqrt(element.children.length))
        var imageWidth = width / grid - (padding * 2)
        var imageHeight = height / grid
        
        if (element.children.length === 1) {
            imageWidth = width
            imageHeight = height
        }
       
        var y = 0

        element.children.forEach((child, index) => {
            if (globalIndex >= grid) {
                globalIndex = 0
                y += imageHeight
            }
            var x = globalIndex * (imageWidth + padding) + padding
            child.x = x
            child.y = y
            child.width = imageWidth
            child.height = imageHeight

            globalIndex++
        })
    });


    var group = svg
        .selectAll("g.rect")
        .data(hierarchy.children)
        .enter()
        .append("g") //image?
        .attr("class", "rect")
        .attr("transform", function (d) { return "translate(" + d.x0 + "," + d.y0 + ")" })

    group.append("rect")
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', function (d) { return d.x1 - d.x0; })
        .attr('height', function (d) { return d.y1 - d.y0; })
        .style("stroke", "black")
        .style("stroke-width", ".5px")
        .style("fill", "none")
        .attr("xlink:href", function (d) { return d.data.link; });

    group.selectAll("g.rect")
        .data(d => d.children)
        .enter()
        .append("image")
        .attr("class", d => d.data.index)
        .attr('x', d => d.x)
        .attr('y', d => d.y)
        .attr('width', d => d.width)
        .attr('height', d => d.height)
        .attr("xlink:href", function (d) { return d.data.link; });

    svg
        .selectAll("text")
        .data(hierarchy.children)
        .enter()
        .append("text")
        .attr("x", function (d) { return d.x0 + 10 })    // +10 to adjust position (more right)
        .attr("y", function (d) { return d.y0 + 20 })    // +20 to adjust position (lower)
        .text(function (d) { return d.data.key })
        .attr("font-size", "9px")
        .style("fill", "black")
}



