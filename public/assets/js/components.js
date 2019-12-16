const removeFavBtnClick = event => {
    let teamList = document.querySelector('#team-list');
    let favoriteTeamsPlaceholder = document.querySelector('#favorite-teams-placeholder');
    let card = event.currentTarget.parentNode.parentNode.parentNode;
    let team = {
        id: Number(event.currentTarget.getAttribute('data-club-id')),
        name: event.currentTarget.getAttribute('data-club-name'),
        crestUrl: event.currentTarget.getAttribute('data-club-crest')
    };

    dbDeleteFavoriteTeam(team.id)
    .then(success => {
        if (success) {
            if (card.parentNode.childElementCount == 1) {
                favoriteTeamsPlaceholder.innerHTML = 'No favorite team. Add your first favorite team now.';
            }
            card.parentNode.removeChild(card);
            teamList.insertAdjacentHTML('beforeend', clubCard(team));
            M.toast({html: `${team.name} removed from favorite`});
        }
    })
    .catch(error => {
        M.toast({html: `Remove favorite team failed: ${error}`});
        console.error(error);
    });
}

const addFavBtnClick = event => {
    let teamListPlaceholder = document.querySelector('#team-list-placeholder');
    let favoriteTeams = document.querySelector('#favorite-teams');
    let card = event.currentTarget.parentNode.parentNode.parentNode;
    let team = {
        id: Number(event.currentTarget.getAttribute('data-club-id')),
        name: event.currentTarget.getAttribute('data-club-name'),
        crestUrl: event.currentTarget.getAttribute('data-club-crest')
    };

    dbInsertFavoriteTeam(team)
    .then(success => {
        if (success) {
            if (card.parentNode.childElementCount == 1) {
                teamListPlaceholder.innerHTML = 'No teams.';
            }
            card.parentNode.removeChild(card);
            favoriteTeams.insertAdjacentHTML('beforeend', clubCardFav(team));
            M.toast({html: `${team.name} added to favorite`});
        }
    })
    .catch(error => {
        M.toast({html: `Add favorite team failed: ${error}`});
        console.error(error);
    });
}

const fotmatDate = (dateData, breakTime) => {
    let date = dateData.getDate();
    let day = dateData.getDay();
    let month = dateData.getMonth();
    let year = dateData.getFullYear();
    let hours = dateData.getHours();
    let minutes = dateData.getMinutes();

    hours = hours < 10 ? `0${hours}` : hours;
    minutes = minutes < 10 ? `0${minutes}` : minutes;

    let formats = {
        day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec']
    }

    if (breakTime) {
        return `${formats.day[day]}, ${date} ${formats.month[month]} ${year}<br/> ${hours}:${minutes}`;
    }
    return `${formats.day[day]}, ${date} ${formats.month[month]} ${year} ${hours}:${minutes}`;
}

const curDateToUTC = dateData => {
    let year = dateData.getUTCFullYear();
    let month = dateData.getUTCMonth();
    let date = dateData.getUTCDate();
    month++;

    date = date < 10 ? `0${date}` : date;
    month = month < 10 ? `0${month}` : month;

    return `${year}-${month}-${date}`;
}

/**
 * Get age from date of birth
 * @param {Date} dateOfBirth 
 * @returns {Number} age in year
 */
const getAge = (dateOfBirth) => {
    let ageDifMs = Date.now() - dateOfBirth.getTime();
    let ageDate = new Date(ageDifMs); // miliseconds from epoch
    return Math.abs(ageDate.getUTCFullYear() - 1970);
}

/**
 * 
 * @param {JSON} data Data for match summary
 * @returns {String} HTML string
 */
const matchCard = (data) => {
    let status;
    let score = ['', ''];
    let date = fotmatDate(new Date(data.utcDate));

    if (data.score.halfTime.homeTeam != null) {
        status = 'HT';
        score[0] = data.score.halfTime.homeTeam;
        score[1] = data.score.halfTime.awayTeam;
    }
    else if (data.score.fullTime.hometeam != null) {
        status = 'FT';
        score[0] = data.score.fullTime.homeTeam;
        score[1] = data.score.fullTime.awayTeam;
    }
    else if (data.score.extraTime.hometeam != null) {
        status = 'ET';
        score[0] = data.score.extraTime.homeTeam;
        score[1] = data.score.extraTime.awayTeam;
    }
    else if (data.score.penalties.hometeam != null) {
        status = 'P';
        score[0] = data.score.penalties.homeTeam;
        score[1] = data.score.penalties.awayTeam;
    }

    return `<div class="col s12 m6">
        <div class="card match-card valign-wrapper">
            <div class="col s8">
                <div class="row match-club">
                    <div class="club col s10">
                        <img class="responsive-img club-icon club-icon-${data.homeTeam.id}" src="./assets/images/no-club-logo.png" alt="club">
                        <div class="club-name truncate">${data.homeTeam.name}</div>
                    </div>
                    <div class="score col s2">
                        ${score[0]}
                    </div>
                </div>
                
                <div class="row match-club">
                    <div class="club col s10">
                        <img class="responsive-img club-icon club-icon-${data.awayTeam.id}" src="./assets/images/no-club-logo.png" alt="club">
                        <div class="club-name truncate">${data.awayTeam.name}</div>
                    </div>
                    <div class="score col s2">
                        ${score[1]}
                    </div>
                </div>
            </div>
            <div class="col s4 center-align match-time grey-text text-darken-2">
                ${date}
            </div>
        </div>
    </div>`;
}

/**
 * 
 * @param {JSON} clubStandData JSON for club detail in standings
 * @param {String} [color] Color [red, orange, blue]
 * @return {String} HTML string
 */
const standingTableBody = (clubStandData, color, highlight) => {
    let classStr = '';
    let colorClass = '';
    if (color) {
        colorClass = `table-row-${color}`
    }

    if (highlight) {
        colorClass += ' table-row-highlight';
    }

    if (colorClass !== '') {
        classStr = `class="${colorClass}"`
    }
    return `
        <tr ${classStr}>
            <td>${clubStandData.position}</td>
            <td>
                <div class="match-club">
                    <a href="#/team/${clubStandData.team.id}" class="black-text">
                        <div class="club">
                            <img class="responsive-img club-icon" src="${clubStandData.team.crestUrl}" alt="club">
                            <div class="club-name truncate">${clubStandData.team.name}</div>
                        </div>
                    </a>
                </div>
            </td>
            <td>${clubStandData.playedGames}</td>
            <td>${clubStandData.won}</td>
            <td>${clubStandData.draw}</td>
            <td>${clubStandData.lost}</td>
            <td>${clubStandData.goalsFor}</td>
            <td>${clubStandData.goalsAgainst}</td>
            <td>${clubStandData.goalDifference}</td>
            <td>${clubStandData.points}</td>
        </tr>`;
}


/**
 * function for creating favorite club card HTML
 * @param {JSON} clubData JSON for club info
 * @returns {String} HTML string
 */
const clubCardFav = (clubData) => {
    return `<div class="col s12 m4">
        <div class="card">
            <div class="card-image waves-effect waves-block waves-dark">
                <a href="#/team/${clubData.id}">
                    <div class="image-club-card" style="background-image: url('${clubData.crestUrl}')"></div>
                </a>
            </div>

            <div class="card-content">
                <a href="#/team/${clubData.id}" class="black-text">
                    <span class="card-title truncate">${clubData.name}</span>
                </a>
            </div>

            <div class="card-action">
                <a href="#/team/${clubData.id}" class="view-matches-btn"><i class="small material-icons">arrow_forward</i></a>
                <a href="javascript:void(0)" class="remove-fav-btn right" data-club-id="${clubData.id}" data-club-name="${clubData.name}" data-club-crest="${clubData.crestUrl}" onclick="removeFavBtnClick(event)"><i class="small material-icons">star</i></a>
            </div>
        </div>
    </div>`;
}

/**
 * function for creating club card HTML
 * @param {JSON} clubData JSON for club info
 * @returns {String} HTML string
 */
const clubCard = (clubData) => {
    return `<div class="col s12 m4">
        <div class="card waves-effect waves-block waves-dark">
            <a href="#/team/${clubData.id}">
                <div class="card-image">
                    <div class="image-club-card" style="background-image: url('${clubData.crestUrl}')"></div>
                </div>
            </a>

            <div class="card-content">
                <a href="#/team/${clubData.id}" class="black-text">
                    <span class="card-title truncate">${clubData.name}</span>
                </a>
            </div>

            <div class="card-action">
                <a href="#/team/${clubData.id}" class="view-matches-btn"><i class="small material-icons">arrow_forward</i></a>
                <a href="javascript:void(0)" class="add-fav-btn right" data-club-id="${clubData.id}" data-club-name="${clubData.name}" data-club-crest="${clubData.crestUrl}" onclick="addFavBtnClick(event)"><i class="small material-icons">star_border</i></a>
            </div>
        </div>
    </div>`;
}

const squadTableBody = (squadData) => {
    return `<tr>
        <td class="truncate">${squadData.name}</td>
        <td>${squadData.position}</td>
        <td>${squadData.nationality}</td>
        <td>${squadData.shirtNumber || '-'}</td>
        <td>${getAge(new Date(squadData.dateOfBirth))}</td>
    </tr>`;
}

