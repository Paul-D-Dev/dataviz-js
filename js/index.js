const APIURL = "http://localhost:1337/";

/** Type params
 * 
 * @param {string} url "/params"
 */
async function fetchGet(url) {
    try {
        let response = await fetch(APIURL + url);
        let data = await response.json();
        return data;
    } catch (error) {
        console.log(error);
    }
}

async function renderSurvey() {
    let surveys = await fetchGet('surveys?status=isOnline');
    let jsonSurveyOnline = surveys[0].json;
    window.survey = new Survey.Model(jsonSurveyOnline);

    survey.onComplete.add(function (sender, options) {
        const body = {
            json: sender.data,
            surveyId: surveys[0].id
        }
        save('results', body);
    });

    survey.render("surveyElement");
}

/** pushValue description
* @param {string} value is the value of the property email : "value"
* @param {[]} arrayProperty is the question name's property like email = []
* if the value is an array['value'] we map the array to push item
* if not we directly push the value into the property
*/
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
                name : prop,
                value : count[prop]
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

    console.log(datas);
    return datas
}

function setObjectToSend(allAnswersFromSurvey) {
    for (const question in allAnswersFromSurvey) {
        if (allAnswersFromSurvey.hasOwnProperty(question)) {
            const answer = allAnswersFromSurvey[question];
            const group = {
                question,
                answer
            }
            console.log(group);
            // Send to API DATA table

            // save('datas', group)
        }
    }
}

async function saveDataSurvey() {
    const jsons = await getJsonFromResult();
    const answers = setQuestionWithAnswers(jsons);
    // setObjectToSend(answers);

    prepareData(answers)

    // Extract each question with their answer in an object
    // for (const question in answers) {
    //     if (answers.hasOwnProperty(question)) {
    //         const answer = answers[question];
            
    //         const body = {
    //             question,
    //             answer
    //         }
    //         console.log(body);


    //         // Send to API DATA table

    //         // save('datas', group)
    //     }
    // }
}

async function sortOfQuestions() {



    // // regroup all result by answers
    // let answers = {};

    // // This loop regroups the question and their answers in answersObject
    // for (const json of jsons) {

    //     for (const question in json) {
    //         // answer = value of the property (question : "value");
    //         const answer = json[question];

    //         /*  Verify if the Object answers got the property then we create the property = an array
    //             then we use pushValue method's
    //             if not we directy => use the method pushValue;
    //         */
    //         if (!answers.hasOwnProperty(question)) {
    //             answers[question] = [];
    //             pushValue(answer, answers[question]);
    //         } else {
    //             pushValue(answer, answers[question]);
    //         }
    //     }
    // }
    // console.log(answers);

    for (const question in answers) {
        if (answers.hasOwnProperty(question)) {
            const answer = answers[question];
            const group = {
                question,
                answer
            }
            console.log(group);
            // Send to API DATA table

            // save('datas', group)
        }
    }

}

const dataButton = document.querySelector('#data');
dataButton.addEventListener('click', () => {
    saveDataSurvey();
})

/**
 * 
 * @param {{}} body define the body object before to save
 * @param {string} url add the router of the url to post 
 * Exemple : "results" with option "result?surveyId=1"
 */
async function save(url, body) {
    try {
        let response = await fetch(APIURL + url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(body)
        });
        await response.json();
    } catch (error) {
        console.log(error)
    }
}

async function putData(url, body, id) {
    try {
        let response = await fetch(APIURL + url + '/' + id + "&question=" + body.question, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(body)
        });
        await response.json();
    } catch (error) {
        console.log(error);
    }
}

renderSurvey();