const APIURL = "http://localhost:1337/";


// Fetch the data 
async function fetchGet(url) {
    try {
        let response = await fetch(APIURL + url);
        let data = await response.json();
        return data;
    } catch (error) {
        console.log(error);
    }
}
 


/**
 * 
 * @param {{question: string, answers: [{name:string, value:number]}} datum 
 */
function createCamembert(datum) {
    const title = datum.question;
    const values = datum.answers
    const svgWidth = 960, svgHeight = 450, radius =  Math.min(svgWidth, svgHeight) / 2 ;

    // Set color
    const color = d3.scaleOrdinal(['#4daf4a','#377eb8','#ff7f00','#984ea3','#e41a1c']);

    // Method pie to set value;
    const pie = d3.pie().value(function(d) { 
        return d.count; 
    });

    // Define arc
    const arc = d3.arc()
        .outerRadius(radius * 0.8)
        .innerRadius(radius * 0.4);

    const outerArc = d3.arc()
        .outerRadius(radius*0.9)
        .innerRadius(radius*0.9)


    const svg = d3.select('main')
        .append('svg')
        .attr("width", svgWidth).attr("height", svgHeight)
        .append('g')
        .attr('class', 'pie')
        .attr("transform", "translate(" + svgWidth / 2 + "," + svgHeight / 2 + ")");

    svg.append('g')
        .attr("class", "pie__slice");
    svg.append("g")
        .attr("class", "pie__label");
    svg.append("g")
        .attr("class", "pie__line");
    svg.append("text")
        .attr("class", "pie__title")
        .attr("x", 50)
        .attr("y", 50)
        .text(title);


    /* --------- SLICE --------- */
    const slice = svg.select('.pie__slice').selectAll('path.slice')
        .data(pie(values))

    slice.enter()
        .insert('path')
        .attr('class', 'pie__slice-form')
        .style('fill', d => color(d.index))
        .attr("d", arc)

	slice.exit()
		.remove();


    /* --------- TEXT LABELS --------*/

    function midAngle(d) {
        return d.startAngle + (d.endAngle - d.startAngle)/2;
    };

    function outLabel(d) {
        const pos = outerArc.centroid(d);
        pos[0] = radius * (midAngle(d) < Math.PI ? 1 : -1);
        return "translate(" + pos + ")";
    } 
  

    const text = svg.select('.pie__label').selectAll('text')
        .data(pie(values));

    text.enter()
        .append('text')
        .attr('dy', '.35em')
        .text((d) => `${d.data.label} (${d.value} : ${d.data.percent}%)`)
        .attr('transform', (d) => outLabel(d))
        .style('text-anchor', (d) => midAngle(d) < Math.PI ? 'start' : 'end');
    text.exit()
        .remove();

    /* --------- SLICE TO TEXT POLYLINES --------*/    

    function lines(d) {
        const pos = outerArc.centroid(d);
        pos[0] = radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
        return [arc.centroid(d), outerArc.centroid(d), pos];
    }

    const polyline = svg.select('.pie__line').selectAll()
        .data(pie(values));
    
    polyline.enter()
        .append("polyline")
        .attr('points', (d) => lines(d));
    polyline.exit()
        .remove();
        
    


}

async function renderPie() {
    const data = await fetchGet('responses/surveys/1');
    
    for (let i = 0; i < data.length; i++) {
        const datum = data[i];
        
        createCamembert(datum);
    }

} 

renderPie()