const BASE_URL = 'https://api.football-data.org/v2/';
const LEAGUE_ID = '2021';
const API_KEY = '67bb29280dae4cecab985d2a33b0019a';

const getCompetitionInfo = () => {
    let url = new URL(`${BASE_URL}competitions/${LEAGUE_ID}`);
    
    return new Promise((resolve, reject) => {
        fetch(url, {
            method: 'GET',
            headers: {
                "X-Auth-Token": API_KEY
            }
        })
        .then(response => {
            if (response.status !== 200) {
                reject(new Error(`Error: ${response.status}`));
            }
    
            return response.json();
        })
        .then(data => {
            resolve(data);
        })
        .catch(error => {
            reject(new Error(error));
        });
    })
}

/**
 * List all matches according to filter
 * 
 * @param {JSON} filter {data: true}
 * @param {integer} team_id 
 * @return {JSON} {Return JSON Object from football data API}
 */
const getMatches = (filter, team_id) => {
    let url;
    if (team_id === undefined) {
        url = new URL(`${BASE_URL}competitions/${LEAGUE_ID}/matches`);
    }
    else {
        url = new URL(`${BASE_URL}teams/${team_id}/matches`);
    }

    if (filter !== undefined) {
        Object.keys(filter).forEach(key => url.searchParams.append(key, filter[key]));
    }

    return new Promise((resolve, reject) => {
        fetch(url, {
            method: 'GET',
            headers: {
                "X-Auth-Token": API_KEY
            }
        })
        .then(response => {
            if (response.status !== 200) {
                reject(new Error(`Error: ${response.status}`));
            }
    
            return response.json();
        })
        .then(data => {
            resolve(data);
        })
        .catch(error => {
            reject(new Error(error));
        });
    });
}


/**
 * 
 * @param {JSON} filter 
 * @return {JSON} {Return JSON Object from football data API}
 */
const getStandings = (filter) => {
    url = new URL(`${BASE_URL}competitions/${LEAGUE_ID}/standings`);
    if (filter !== undefined) {
        Object.keys(filter).forEach(key => url.searchParams.append(key, filter[key]));
    }

    return new Promise((resolve, reject) => {
        fetch(url, {
            method: 'GET',
            headers: {
                "X-Auth-Token": API_KEY
            }
        })
        .then(response => {
            if (response.status !== 200) {
                reject(new Error(`Error: ${response.status}`));
            }
    
            return response.json();
        })
        .then(data => {
            resolve(data);
        })
        .catch(error => {
            reject(new Error(error));
        });
    });
}

const getTeam = (team_id) => {
    let url = `${BASE_URL}teams/${team_id}`;

    return new Promise((resolve, reject) => {
        fetch(url, {
            method: 'GET',
            headers: {
                "X-Auth-Token": API_KEY
            }
        })
        .then(response => {
            if (response.status !== 200) {
                reject(new Error(`Error: ${response.status}`));
            }
    
            return response.json();
        })
        .then(data => {
            resolve(data);
        })
        .catch(error => {
            reject(error);
        });
    })
}

const getMatcheDetails = (callback, match_id) => {
    let url = `${BASE_URL}matches/${match_id}`;

    fetch(url, {
        method: 'GET',
        headers: {
            "X-Auth-Token": API_KEY
        }
    })
    .then(response => {
        if (response.status !== 200) {
            console.error(`Error: ${response.status}`);
            return;
        }

        return response.json();
    })
    .then(data => {
        console.log(data);
        callback(data);
    })
    .catch(error => {
        console.error(`Error: ${error}`);
    });
}