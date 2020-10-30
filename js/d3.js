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
    const svgWidth = 500, svgHeight = 300, radius =  Math.min(svgWidth, svgHeight) / 2 ;

    const svg = d3.select('main')
        .append('svg')
        .attr("width", svgWidth).attr("height", svgHeight);

    // Add Title of the Cam
    svg.append("text")
        .attr("class", "pie-title")
        .attr("x", 50)
        .attr("y", 50)
        .text(title);


    //Create group element to hold pie chart    
    const g = svg.append("g")
        .attr("transform", "translate(" + svgWidth / 2 + "," + svgHeight / 2 + ")");


    const color = d3.scaleOrdinal(['#4daf4a','#377eb8','#ff7f00','#984ea3','#e41a1c']);

    // Method pie to set value;
    const pie = d3.pie().value(function(d) { 
        return d.value; 
    });

    const path = d3.arc()
        .outerRadius(radius)
        .innerRadius(0);
    
    // Create x arcs = nb i of []values
    const arc = g.selectAll("arc")
        .data(pie(values))
        .enter()
        .append("g")
        .attr('class', 'pie__slice')

    arc.append("path")
        .attr("d", path)
        .attr("fill", (d) => color(d.index))
        .attr('class', 'pie__slice-form')

    const label = d3.arc()
        .outerRadius(radius)
        .innerRadius(0);

    /* --------- TEXT LABELS --------*/

    arc.append("text")
        .attr("transform", (d) => "translate(" + label.centroid(d) + ")")
        .attr('class', 'pie__slice-legend')
        .text(function(d) { return `${d.data.label} (${d.value} - ${d.data.percent}%)`})


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