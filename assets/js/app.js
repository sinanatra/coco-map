var n = 1;
var parseCsv = "index,link,coco\n";
var startCsv = "index,link,coco\n";

var hasKeypoints = false
var cocoUnique = []
var filename = "may2019"
var thiscategory = []

// loads my database (tsv) and filters the database
$(document).ready(function() {
    console.log('%c Im in love with the COCO', 'color:olive; font-size:14px; font-family: Fk Grotesk;width:100%');

    // show loader
    $("#images").html(`
    <div class="loader">Loading:
    <div class="loader__square"></div>
    <div class="loader__square1"></div>
    </div>
    `);
    // show loader
    $("#treemap").html(`
     <div class="loader loader_black">Loading:
     <div class="loader__square"></div>
     </div>
     `);

    d3.tsv("data/" + filename + ".tsv", function(parsedData) {
        $("#imgContainer").fadeIn(1);
        $("#infoContainer").fadeIn(1);

        var imagesToLoad = 1000

        // Load initial images and initial treemap
        async function startImages() {
            $("#images").html("");
            $("#treemap").html("");
            parsedData.filter(function(d, i) {
                if (i < imagesToLoad) {
                    try {
                        // $("#images").append("<a target='_blank' href=" + d.LINK + "><img id='imgCategories' src= " + d.COCOSTUFF + " </></a>");
                        if (d.COCOSTUFF.includes(".png")) {
                            d.COCOSTUFF.replace("coco_stuff", "coco_stuff_thumb")
                            $("#images").append("<img id='imgCategories' src= " + d.COCOSTUFF.replace("coco_stuff", "coco_stuff_thumb") + " </>");
                            startCsv += d.COUNTRY + "," + d.ORIGINAL + "," + d.COCOSTUFF + "\n"

                        }
                    } catch {
                        return;
                    }
                }

            })
            var startData = d3.csvParse(startCsv)
            $("#treeText").html("A <underline>treemap</underline> groups the pictures based on their location. Select a state.");
            buildTreemap(startData)
        }

        startImages()

        // when the input changes - load treemap
        $("input").change(async function() {
            cocoUnique = []
            thiscategory = $('input[type=checkbox]:checked').map(function() {
                return this.value;
            }).get();

            if (thiscategory.length > 0) {
                console.log("this", thiscategory, thiscategory.length);
                $("input[type=checkbox]:checked").css("background", "var(--background-color)");

                // show loader
                $("#images").html(`
                <div class="loader">Loading:
                <div class="loader__square"></div>
                </div>
                `);

                // show loader
                $("#treemap").html(`
                <div class="loader loader_black">Loading:
                <div class="loader__square"></div>
                </div>
                `);

                setTimeout(function() { parseDatabase(thiscategory); }, 500)

            } else {
                $("input").css("background", "var(--text-color)");
                // $("input").css("border-color", "var(--background-color)");
                $("input").next().css("background", "none");
                $("input").next().css("color", "var(--background-color)");
                $("input").css("pointer-events", "unset");
                $("#treeText").html("");
                $("#images").html("");

            }
        });



        // create a treemap from the category selected ( button )
        async function parseDatabase(thiscategory) {
            $("input").css("background", "var(--darker-fade)");
            // $("input").css("border-color", "var(--darker-fade)");
            $("input").next().css("background", "var(--darker-fade)");
            $("input").next().css("color", "var(--darker-fade)");
            $("input").css("pointer-events", "none");
            $("#treemap").html("");

            console.log("Parsing Database")
            parseCsv = "index,link,coco\n";
            $("#state").html("");
            $("#images").html("");
            $("#treeText").html("A <underline>treemap</underline> groups the pictures based on their location. Select a state.");

            $("#percentageImages").html("");
            n = 1;
            resetDivs()
            $("#slide").html("<p>" + "Photo taken" + "</p>");
            $("#image1").css("filter", "grayscale(0)");

            var cocoTags = []

            await parsedData.filter(function(d) {
                resetDivs()

                try {

                    var allIncluded = thiscategory.every(item => d.COCOTAGDESC.includes(item))
                    cocoTags = []
                    if (allIncluded) {

                        $("#images").append("<img id='imgCategories' src= " + d.COCOSTUFF.replace("coco_stuff", "coco_stuff_thumb") + " </>");
                        cocoTagsCLean = d.COCOTAGDESC.split("; ")
                        parseCsv += d.COUNTRY + "," + d.ORIGINAL + "," + d.COCOSTUFF + "\n"

                        cocoTags.push(cocoTagsCLean[0])
                            // cocoUnique = cocoTags.filter((item, index, array) => array.indexOf(item) === index)
                        cocoUnique = cocoTagsCLean

                        var inputValue = document.getElementsByTagName("input");

                        for (var i = 0; i < inputValue.length; i++) {

                            if (cocoUnique.includes(inputValue[i].value)) {
                                $(inputValue[i]).css("pointer-events", "unset");
                                $(inputValue[i]).css("background", "var(--text-color)");
                                // $(inputValue[i]).css("border-color", "var(--background-color)");
                                $("input[type=checkbox]:checked").css("background", "var(--background-color)");
                                $(inputValue[i]).next().css("background", "none");
                                $(inputValue[i]).next().css("color", "var(--background-color)");

                            }


                        }
                    }
                } catch {
                    return;
                }
            });

            var data = await d3.csvParse(parseCsv)
            try {
                await buildTreemap(data)
            } catch {
                $("#images").html("No Images found");
                return
            }


        }

        // parse images on top of eachother
        var nextimage = document.getElementById('nextimage');
        nextimage.addEventListener('click', parseImage);
    });

})

// on click handler on images
$(document).on('click', '#imgCategories', function() {
    resetDivs()
    var getImage = $(this).attr("src");
    d3.tsv("data/" + filename + ".tsv", async function(parsedData) {

        await parsedData.filter(function(d) {
            try {
                if (d.COCOSTUFF.replace("coco_stuff", "coco_stuff_thumb").includes(getImage)) {
                    console.log("Starting")
                    $("#image1").append("<img src='" + d.COCOSTUFF + "' />");
                    // if (d.COCOKEY !== "NULL") {
                    //     $("#image2").append("<img src='" + d.COCOKEY + "' />");
                    //     hasKeypoints = true;
                    // } else {
                    //     hasKeypoints = false;
                    // }

                    // $("#image3").append("<img src='" + d.COCOTAG + "' />");
                    $("#image4").append("<img src='" + d.ORIGINAL + "' />");
                    $("#info").html(


                        "<p class='captions'>  Original photo taken in " + d.CITY + ", " + d.COUNTRY + " and uploaded on Flickr by " + d.PHOTOGRAPHER + "</p>" +

                        "<p class='captions'>  Date: </p>" +
                        "<p> " + d.TAKEN + "</p>" +

                        "<p class='captions'>  Coordinates: </p>" +
                        "<p id='coord'> " + d.LATITUDE + "</p>" +
                        "<p id='coord'> " + d.LONGITUDE + "</p>" +

                        "<p class='captions'>  Title: </p>" +
                        "<p> " + d.TITLE + "</p>" +

                        "<p class='captions'>  Description: </p>" +
                        "<p> " + d.DESC + "</p>" +

                        "<a id='flickrLink' href=" + d.LINK + " target='_blank'><p>Original Flickr link: " + d.LINK + "</p>" + "</a>"

                        // "<div class='containDesc'><p class='captions'>MS Coco Description</p>"+
                        // "<p class='cocodesc'> " + d.COCODESC1 + "</p>" +
                        // "<p class='cocodesc'> " + d.COCODESC2 + "</p>" +
                        // "<p class='cocodesc'> " + d.COCODESC3 + "</p>" +
                        // "<p class='cocodesc'> " + d.COCODESC4 + "</p></div>" 

                    )
                    $("#imgContainer").toggleClass("out");
                    $("#infoContainer").removeClass("menuOut");

                    $("#imgContainer").css("display", "block");


                }
            } catch {
                return;
            }
        });
    })
});

$(document).on('click', 'info', function() {
    $("#infoContainer").toggleClass("menuOut");
});

// Closes the menu when click outside the div
$(document).on("click", function(e) {
    if (document.getElementById('immagini').contains(e.target) || document.getElementById('info').contains(e.target)) {
        return
    } else {
        $("#imgContainer").removeClass("out");
        n = 1;
        hasKeypoints = false;
    }
    // if (document.getElementById('#infoContainer').contains(e.target)) {
    //     return
    // }
    // else {
    //     $("#infoContainer").removeClass("menuOut");
    // }
});

// Cleans the div
function resetDivs() {
    $("#immagini>div").html("");
    $("#image1").css("display", "block");
    $("#imageFlickr").css("display", "block");
    $("#cocoData").css("display", "none");
    $("#taken").css("display", "block");
    $("#photographer").css("display", "none");
    $("#photoCountry").css("display", "block");
    $("#photoUploaded").css("display", "none");
    $("#photoDescription").css("display", "none");
    $("#photographerFrom").css("display", "none");
    $("#photoUploaded").css("display", "none");
    $("#photoTag").css("display", "none");
    $("#cocoTagDesc").css("display", "none");
    $("#cocoStuffDesc").css("display", "none");
    $("#cocoDesc").css("display", "none");
    $("#image2").css("display", "none");
    $("#cocoData").css("display", "none");
    $("#immagini>div:not(#image1)").css("display", "none");
    $("#image1").css("display", "block");
    $("#taken").css("display", "block");
    $("#photoCountry").css("display", "block");
    $("#slide").html("<p>" + "Photo taken" + "</p>");
    $("#image1").css("filter", "grayscale(0)");
};


// Flip images when menu is open
function parseImage() {
    n += 1;
    $(".imageFlickr").css("display", "block");
    $(".imageFlickr").css("filter", "grayscale(100%)");
    $(".imageFlickr > img").css("opacity", .1);

    $("#image" + n).css("display", "block");
    if (n == 1) {
        $("#image1").fadeIn(1);
    }

    if (n == 2 && hasKeypoints == false) {
        n = 1;
        $("#image1").fadeOut(1);
        $(".imageFlickr").css("filter", "grayscale(0)");
        $(".imageFlickr > img").css("opacity", 1);
    }

    // if (n >= 2) {
    //     $("#image" + (n - 1)).fadeOut(1);
    //     $("#image" + n).fadeIn(1);
    // }

    // if (n == 3) {
    //     $("#cocoData").css("display", "block");
    // }

    // if (n == 4) {
    //     $("#cocoDesc").css("display", "block");
    //     $(".imageFlickr").css("filter", "grayscale(0)");
    //     $(".imageFlickr > img").css("opacity", 1);
    // }
    // if (n != 4) {
    //     $("#cocoDesc").css("display", "none");
    // }

    // if (n >= 2) {
    //     n = 1;
    //     $("#image1").fadeIn(1);
    // }
}

// Read data - builds a d3 svg treemap
var buildTreemap = function(data) {
    resetDivs()
        // set the dimensions and margins of the graph
    if ($(window).width() < 900) {
        var margin = { top: 10, right: 0, bottom: 10, left: 0 },
            width = window.innerWidth - margin.left - (margin.right * 6),
            height = window.innerHeight / 2 - margin.top - (margin.bottom * 6);
    } else {
        var margin = { top: 10, right: 5, bottom: 10, left: 0 },
            width = window.innerWidth / 2.5 - margin.left - (margin.right * 6), //2.5 40%
            height = window.innerHeight / 2.2 - margin.top - (margin.bottom * 6);
    }


    // append the svg object to the body of the page
    var svg = d3.select("#treemap")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    var nest = d3.nest()
        .key(function(d) { return d.index })
        .entries(data)

    var hierarchy = d3.hierarchy({

            values: nest.map(item => {
                item.value = item.values.length
                return item
            })
        }, d => d.values)
        .sum(function(d) { return d.value })
        .sort(function(a, b) { return b.value - a.value })

    var imageArray = hierarchy.data.values.map(item => {
        return item.values.map(datum => {
            return datum.link
        })

    })
    padding = 5

    d3.treemap()
        .size([width, height])
        .padding(padding)
        (hierarchy)



    var group = svg
        .selectAll("g.rect")
        .data(hierarchy.children)
        .enter()
        .append("g") //image?
        .attr("class", "rect")
        .attr("transform", function(d) { return "translate(" + d.x0 + "," + d.y0 + ")" })


    group.append("rect")
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', function(d) { return d.x1 - d.x0; })
        .attr('height', function(d) { return d.y1 - d.y0; })
        // .style("stroke", "var(--background-color)")
        // .style("stroke-width", "1px")
        .style("fill", "var(--text-color)")
        .on("click", function() {
            d3.selectAll("rect").style("fill", "var(--text-color)");
            d3.selectAll("text").style("fill", "var(--background-color)");
            d3.select(this).style("fill", "var(--background-color)");
            d3.select(this.parentNode).selectAll("text").style("fill", "var(--text-color)");

        });


    group.append("text")
        .attr("xlink:href", function(d) { return d.data.key })
        .attr("x", 1) // +10 to adjust position (more right)
        .attr("y", 12) // +20 to adjust position (lower)
        .text(function(d) {
            for (state = 0; state < countries.length; state++) {
                if (countries[state].name == d.data.key) {
                    return countries[state].code
                }
            }
            // return d.data.key
        })
        // .attr("font-size", "12px")
        .attr("font-size", function() {
            // gets the area
            var element = d3.select(this.parentNode).node();
            var mainWidth = element.getBoundingClientRect().width
            var mainHeight = element.getBoundingClientRect().height
            var area = mainWidth * mainHeight;
            if (area <= 800) {
                return "0px";
            } else {
                return "12px";

            }
        })

    .style("fill", "var(--background-color)")


    group.on('click', function() {
        resetDivs()

        var stateName = d3.select(this).text();
        console.log(stateName)

        // qua lancia img
        $("#images").html("");

        // ho fatto un gran burdel per avere le abbreviazioni degli stati
        for (i = 0; i < hierarchy.data.values.length; i++) {
            var thisState = ""
            for (state = 0; state < countries.length; state++) {
                if (countries[state].code == stateName) {
                    thisState = (countries[state])
                }

            }

            if (hierarchy.data.values[i].key === thisState.name) {
                console.log("here", thisState.name.length)

                if (thiscategory.length > 0) {
                    $("#percentageImages").html("<p class='thiscategory'>" + thiscategory.toString().replace(/\,/g, '</p> <p class="thiscategory">') + "</p><p class='underline'> is " + Math.round(hierarchy.data.values[i].values.length * (100 / hierarchy.value)) + "%</p><p> from </p><p class='underline'>" + thisState.name + "</p><p>. </p><br>");
                } else {
                    $("#percentageImages").html("<p> The images in MS COCO are </p><p class='underline'>" + Math.round(hierarchy.data.values[i].values.length * (100 / hierarchy.value)) + "%</p><p> from </p><p class='underline'>" + thisState.name + "</p><p>. </p><br>");
                }
                for (j = 0; j < hierarchy.data.values[i].values.length; j++) {
                    split = hierarchy.data.values[i].values[j].link.split("/")
                    $("#images").append("<img id='imgCategories' src= " + hierarchy.data.values[i].values[j].coco.replace("coco_stuff", "coco_stuff_thumb") + "></a>");

                }
            }
        }

    });

}

var countries = [
    { "name": "Afghanistan", "code": "AF" },
    { "name": "land Islands", "code": "AX" },
    { "name": "Albania", "code": "AL" },
    { "name": "Algeria", "code": "DZ" },
    { "name": "American Samoa", "code": "AS" },
    { "name": "AndorrA", "code": "AD" },
    { "name": "Angola", "code": "AO" },
    { "name": "Anguilla", "code": "AI" },
    { "name": "Antarctica", "code": "AQ" },
    { "name": "Antigua and Barbuda", "code": "AG" },
    { "name": "Argentina", "code": "AR" },
    { "name": "Armenia", "code": "AM" },
    { "name": "Aruba", "code": "AW" },
    { "name": "Australia", "code": "AU" },
    { "name": "Austria", "code": "AT" },
    { "name": "Azerbaijan", "code": "AZ" },
    { "name": "Bahamas", "code": "BS" },
    { "name": "Bahrain", "code": "BH" },
    { "name": "Bangladesh", "code": "BD" },
    { "name": "Barbados", "code": "BB" },
    { "name": "Belarus", "code": "BY" },
    { "name": "Belgium", "code": "BE" },
    { "name": "Belize", "code": "BZ" },
    { "name": "Benin", "code": "BJ" },
    { "name": "Bermuda", "code": "BM" },
    { "name": "Bhutan", "code": "BT" },
    { "name": "Bolivia", "code": "BO" },
    { "name": "Bosnia and Herzegovina", "code": "BA" },
    { "name": "Botswana", "code": "BW" },
    { "name": "Bouvet Island", "code": "BV" },
    { "name": "Brazil", "code": "BR" },
    { "name": "British Indian Ocean Territory", "code": "IO" },
    { "name": "Brunei Darussalam", "code": "BN" },
    { "name": "Bulgaria", "code": "BG" },
    { "name": "Burkina Faso", "code": "BF" },
    { "name": "Burundi", "code": "BI" },
    { "name": "Cambodia", "code": "KH" },
    { "name": "Cameroon", "code": "CM" },
    { "name": "Canada", "code": "CA" },
    { "name": "Cape Verde", "code": "CV" },
    { "name": "Cayman Islands", "code": "KY" },
    { "name": "Central African Republic", "code": "CF" },
    { "name": "Chad", "code": "TD" },
    { "name": "Chile", "code": "CL" },
    { "name": "China", "code": "CN" },
    { "name": "Christmas Island", "code": "CX" },
    { "name": "Cocos (Keeling) Islands", "code": "CC" },
    { "name": "Colombia", "code": "CO" },
    { "name": "Comoros", "code": "KM" },
    { "name": "Congo", "code": "CG" },
    { "name": "Congo, The Democratic Republic of the", "code": "CD" },
    { "name": "Cook Islands", "code": "CK" },
    { "name": "Costa Rica", "code": "CR" },
    { "name": "Cote D'Ivoire", "code": "CI" },
    { "name": "Croatia", "code": "HR" },
    { "name": "Cuba", "code": "CU" },
    { "name": "Curacao", "code": "CW" },
    { "name": "Cyprus", "code": "CY" },
    { "name": "Czech Republic", "code": "CZ" },
    { "name": "Denmark", "code": "DK" },
    { "name": "Djibouti", "code": "DJ" },
    { "name": "Dominica", "code": "DM" },
    { "name": "Dominican Republic", "code": "DO" },
    { "name": "Ecuador", "code": "EC" },
    { "name": "Egypt", "code": "EG" },
    { "name": "El Salvador", "code": "SV" },
    { "name": "Equatorial Guinea", "code": "GQ" },
    { "name": "Eritrea", "code": "ER" },
    { "name": "Estonia", "code": "EE" },
    { "name": "Ethiopia", "code": "ET" },
    { "name": "Falkland Islands (Malvinas)", "code": "FK" },
    { "name": "Faroe Islands", "code": "FO" },
    { "name": "Fiji", "code": "FJ" },
    { "name": "Finland", "code": "FI" },
    { "name": "France", "code": "FR" },
    { "name": "French Guiana", "code": "GF" },
    { "name": "French Polynesia", "code": "PF" },
    { "name": "French Southern Territories", "code": "TF" },
    { "name": "Gabon", "code": "GA" },
    { "name": "Gambia", "code": "GM" },
    { "name": "Georgia", "code": "GE" },
    { "name": "Germany", "code": "DE" },
    { "name": "Ghana", "code": "GH" },
    { "name": "Gibraltar", "code": "GI" },
    { "name": "Greece", "code": "GR" },
    { "name": "Greenland", "code": "GL" },
    { "name": "Grenada", "code": "GD" },
    { "name": "Guadeloupe", "code": "GP" },
    { "name": "Guam", "code": "GU" },
    { "name": "Guatemala", "code": "GT" },
    { "name": "Guernsey", "code": "GG" },
    { "name": "Guinea", "code": "GN" },
    { "name": "Guinea-Bissau", "code": "GW" },
    { "name": "Guyana", "code": "GY" },
    { "name": "Haiti", "code": "HT" },
    { "name": "Heard Island and Mcdonald Islands", "code": "HM" },
    { "name": "Holy See (Vatican City State)", "code": "VA" },
    { "name": "Honduras", "code": "HN" },
    { "name": "Hong Kong", "code": "HK" },
    { "name": "Hungary", "code": "HU" },
    { "name": "Iceland", "code": "IS" },
    { "name": "India", "code": "IN" },
    { "name": "Indonesia", "code": "ID" },
    { "name": "Iran, Islamic Republic Of", "code": "IR" },
    { "name": "Iraq", "code": "IQ" },
    { "name": "Ireland", "code": "IE" },
    { "name": "Isle of Man", "code": "IM" },
    { "name": "Israel", "code": "IL" },
    { "name": "Italy", "code": "IT" },
    { "name": "Jamaica", "code": "JM" },
    { "name": "Japan", "code": "JP" },
    { "name": "Jersey", "code": "JE" },
    { "name": "Jordan", "code": "JO" },
    { "name": "Kazakhstan", "code": "KZ" },
    { "name": "Kenya", "code": "KE" },
    { "name": "Kiribati", "code": "KI" },
    { "name": "Korea, Democratic People'S Republic of", "code": "KP" },
    { "name": "South Korea", "code": "KR" },
    { "name": "Kuwait", "code": "KW" },
    { "name": "Kyrgyzstan", "code": "KG" },
    { "name": "Laos", "code": "LA" },
    { "name": "Latvia", "code": "LV" },
    { "name": "Lebanon", "code": "LB" },
    { "name": "Lesotho", "code": "LS" },
    { "name": "Liberia", "code": "LR" },
    { "name": "Libyan Arab Jamahiriya", "code": "LY" },
    { "name": "Liechtenstein", "code": "LI" },
    { "name": "Lithuania", "code": "LT" },
    { "name": "Luxembourg", "code": "LU" },
    { "name": "Macao", "code": "MO" },
    { "name": "Macedonia, The Former Yugoslav Republic of", "code": "MK" },
    { "name": "Madagascar", "code": "MG" },
    { "name": "Malawi", "code": "MW" },
    { "name": "Malaysia", "code": "MY" },
    { "name": "Maldives", "code": "MV" },
    { "name": "Mali", "code": "ML" },
    { "name": "Malta", "code": "MT" },
    { "name": "Marshall Islands", "code": "MH" },
    { "name": "Martinique", "code": "MQ" },
    { "name": "Mauritania", "code": "MR" },
    { "name": "Mauritius", "code": "MU" },
    { "name": "Mayotte", "code": "YT" },
    { "name": "Mexico", "code": "MX" },
    { "name": "Micronesia, Federated States of", "code": "FM" },
    { "name": "Moldova, Republic of", "code": "MD" },
    { "name": "Monaco", "code": "MC" },
    { "name": "Mongolia", "code": "MN" },
    { "name": "Montenegro", "code": "ME" },
    { "name": "Montserrat", "code": "MS" },
    { "name": "Morocco", "code": "MA" },
    { "name": "Mozambique", "code": "MZ" },
    { "name": "Myanmar", "code": "MM" },
    { "name": "Namibia", "code": "NA" },
    { "name": "Nauru", "code": "NR" },
    { "name": "Nepal", "code": "NP" },
    { "name": "Netherlands", "code": "NL" },
    { "name": "Netherlands Antilles", "code": "AN" },
    { "name": "New Caledonia", "code": "NC" },
    { "name": "New Zealand", "code": "NZ" },
    { "name": "Nicaragua", "code": "NI" },
    { "name": "Niger", "code": "NE" },
    { "name": "Nigeria", "code": "NG" },
    { "name": "Niue", "code": "NU" },
    { "name": "Norfolk Island", "code": "NF" },
    { "name": "Northern Mariana Islands", "code": "MP" },
    { "name": "Norway", "code": "NO" },
    { "name": "Oman", "code": "OM" },
    { "name": "Pakistan", "code": "PK" },
    { "name": "Palau", "code": "PW" },
    { "name": "Palestinian Territory, Occupied", "code": "PS" },
    { "name": "Panama", "code": "PA" },
    { "name": "Papua New Guinea", "code": "PG" },
    { "name": "Paraguay", "code": "PY" },
    { "name": "Peru", "code": "PE" },
    { "name": "Philippines", "code": "PH" },
    { "name": "Pitcairn", "code": "PN" },
    { "name": "Poland", "code": "PL" },
    { "name": "Portugal", "code": "PT" },
    { "name": "Puerto Rico", "code": "PR" },
    { "name": "Qatar", "code": "QA" },
    { "name": "Reunion", "code": "RE" },
    { "name": "Romania", "code": "RO" },
    { "name": "Russia", "code": "RU" },
    { "name": "RWANDA", "code": "RW" },
    { "name": "Saint Helena", "code": "SH" },
    { "name": "Saint Kitts and Nevis", "code": "KN" },
    { "name": "Saint Lucia", "code": "LC" },
    { "name": "Saint Pierre and Miquelon", "code": "PM" },
    { "name": "Saint Vincent and the Grenadines", "code": "VC" },
    { "name": "Samoa", "code": "WS" },
    { "name": "San Marino", "code": "SM" },
    { "name": "Sao Tome and Principe", "code": "ST" },
    { "name": "Saudi Arabia", "code": "SA" },
    { "name": "Senegal", "code": "SN" },
    { "name": "Serbia", "code": "RS" },
    { "name": "Seychelles", "code": "SC" },
    { "name": "Sierra Leone", "code": "SL" },
    { "name": "Singapore", "code": "SG" },
    { "name": "Slovakia", "code": "SK" },
    { "name": "Slovenia", "code": "SI" },
    { "name": "Saint-Martin", "code": "SXM" },
    { "name": "Solomon Islands", "code": "SB" },
    { "name": "Somalia", "code": "SO" },
    { "name": "South Africa", "code": "ZA" },
    { "name": "South Georgia and the South Sandwich Islands", "code": "GS" },
    { "name": "Spain", "code": "ES" },
    { "name": "Sri Lanka", "code": "LK" },
    { "name": "Sudan", "code": "SD" },
    { "name": "Suriname", "code": "SR" },
    { "name": "Svalbard and Jan Mayen", "code": "SJ" },
    { "name": "Swaziland", "code": "SZ" },
    { "name": "Sweden", "code": "SE" },
    { "name": "Switzerland", "code": "CH" },
    { "name": "Syrian Arab Republic", "code": "SY" },
    { "name": "Taiwan, Province of China", "code": "TW" },
    { "name": "Tajikistan", "code": "TJ" },
    { "name": "Tanzania", "code": "TZ" },
    { "name": "Thailand", "code": "TH" },
    { "name": "Timor-Leste", "code": "TL" },
    { "name": "Togo", "code": "TG" },
    { "name": "Tokelau", "code": "TK" },
    { "name": "Tonga", "code": "TO" },
    { "name": "Trinidad and Tobago", "code": "TT" },
    { "name": "Tunisia", "code": "TN" },
    { "name": "Turkey", "code": "TR" },
    { "name": "Turkmenistan", "code": "TM" },
    { "name": "Turks and Caicos Islands", "code": "TC" },
    { "name": "Tuvalu", "code": "TV" },
    { "name": "Uganda", "code": "UG" },
    { "name": "Ukraine", "code": "UA" },
    { "name": "United Arab Emirates", "code": "AE" },
    { "name": "United Kingdom", "code": "GB" },
    { "name": "United States", "code": "US" },
    { "name": "United States Minor Outlying Islands", "code": "UM" },
    { "name": "Uruguay", "code": "UY" },
    { "name": "Uzbekistan", "code": "UZ" },
    { "name": "Vanuatu", "code": "VU" },
    { "name": "Venezuela", "code": "VE" },
    { "name": "Vietnam", "code": "VN" },
    { "name": "Virgin Islands, British", "code": "VG" },
    { "name": "Virgin Islands, U.S.", "code": "VI" },
    { "name": "Wallis and Futuna", "code": "WF" },
    { "name": "Western Sahara", "code": "EH" },
    { "name": "Yemen", "code": "YE" },
    { "name": "Zambia", "code": "ZM" },
    { "name": "Zimbabwe", "code": "ZW" }
]