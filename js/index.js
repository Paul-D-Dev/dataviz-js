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

renderSurvey();