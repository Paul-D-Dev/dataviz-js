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
 
// const getData = fecthData('datas')
function pushValue(value, arrayProperty) {
    if (Array.isArray(value)) {
        value.map((item) => {
            arrayProperty.push(item);
        })
    } else {
        arrayProperty.push(value);
    }
}

async function getJsonFromResult() {
    let results = await fetchGet('results?surveyId=1');

    // regroup all Json results in jsons[]
    let jsons = [];
    for (const result of results) {
        jsons.push(result.json);
    }

    return jsons;
}

function setQuestionWithAnswers(JSONArray) {
    // Regroup each JsonResult by questions with thier answer into an object answers
    let answers = {};

    // This loop regroups the question and their answers in answersObject
    for (const json of JSONArray) {

        for (const question in json) {
            // answer = value of the property (question : "value");
            const answer = json[question];

            /*  Verify if the Object answers got the property then we create the property = an array
                then we use pushValue method's
                if not we directy => use the method pushValue;
            */
            if (!answers.hasOwnProperty(question)) {
                answers[question] = [];
                pushValue(answer, answers[question]);
            } else {
                pushValue(answer, answers[question]);
            }
        }
    }

    return answers;
}

// Count the results of answers
// And transform to array of object name, value
function find_duplicate_in_array(array){
    const total = array.length;
    const count = {}
    const result = []
    
    array.forEach(item => {
        if (count[item]) {
            count[item] +=1
            return
        }
        count[item] = 1
    })
    
    for (let prop in count){
        if (count[prop]){

            result.push({
                label : prop,
                value : count[prop],
                percent : (count[prop]/total*100).toFixed(0)
            })
        }
    }
    return result;
    
}


// Prepare the data to build camembert
// [ { question: 'Q1, answer : [ name : 'n1', value: 1]}]
function prepareData(data) {
    const datas = [];

    Object.entries(data).map((items) => {
        datas.push({question: items[0], answers: find_duplicate_in_array(items[1])})
    })

    return datas
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
        return d.value; 
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
    const fecthDatas = await getJsonFromResult();
    const answers = setQuestionWithAnswers(fecthDatas);
    console.log(answers);
    const data = prepareData(answers);
    console.log(data);
    
    for (let i = 0; i < data.length; i++) {
        const datum = data[i];
        
        createCamembert(datum);
    }

} 

renderPie()