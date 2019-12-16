document.addEventListener('DOMContentLoaded', () => {
    let hash = window.location.hash;
    if (hash == "") hash = "#/general";
    let content = document.querySelector('#content');
    let curMatchDay;
    let logoContainer = document.querySelector('#logo-container');
    let docTitle = document.querySelector('title');
    M.AutoInit();

    function isElementInViewport(el, topOffset = 0) {
        var rect = el.getBoundingClientRect();
        return (
            Math.floor(rect.top) >= 0 + topOffset &&
            Math.floor(rect.left) >= 0 &&
            Math.floor(rect.bottom) <= (window.innerHeight || document. documentElement.clientHeight) &&
            Math.floor(rect.right) <= (window.innerWidth || document. documentElement.clientWidth)
        );
    }

    const loadPage = (hash) => {
        let page;
        if (hash == "") {
            page = "general";
        }
        else {
            page = hash.split('/')[1];
        }
        let url = './pages/'+page+'.html';
        fetch(url)
        .then(response => {
            if (response.status != 200) {
                console.error(`Error: ${response.status}`);
            }
            else {
                return response.text();
            }
        })
        .then(data => {
            if (data === undefined) {
                content.innerHTML = 'Error 404';
                return;
            }
            content.innerHTML = data;

            M.AutoInit();

            return data;
        })
        .then(async data => {
            if (data === undefined) return;

            if (page == 'general') {
                logoContainer.innerHTML = 'Premier League';
                docTitle.innerHTML = 'Premier League';

                curMatchDay = (await getCompetitionInfo().catch(error => {
                    M.toast({html: `Getting current matchday failed: ${error}`});
                    console.error(error);
                })).currentSeason.currentMatchday;

                // matches
                let matchData = await getMatches().catch(error => {
                    M.toast({html: `Getting match data failed: ${error}`});
                    console.error(error);
                });

                if (matchData) {
                    let allMatches = document.querySelector('#all-matches');
                    let matchCardStr = '';
                    const bottomPreLoader = document.querySelector("#preload-matches-bottom");

                    if (matchData.matches.length == 0) {
                        allMatches.innerHTML = 'No Data';
                    }
                    else {
                        let matchDay;
                        matchData.matches.forEach(match => {
                            if (matchDay === undefined || matchDay != match.matchday) {
                                matchDay = match.matchday;
                                matchCardStr += `<h6 id="matchday_${matchDay}" class="col s12 section">Matchday ${matchDay}</h6>`;
                            }
                            matchCardStr += matchCard(match);
                        });
                        allMatches.insertAdjacentHTML('beforeend', matchCardStr);

                        window.scrollBy({
                            top: document.querySelector(`#matchday_${curMatchDay}`).getBoundingClientRect().top-120,
                            left: 0
                        });
                        bottomPreLoader.parentNode.removeChild(bottomPreLoader);

                        document.querySelector('#cur-matchday-btn').addEventListener('click', event => {
                            window.scrollBy({
                                top: document.querySelector(`#matchday_${curMatchDay}`).getBoundingClientRect().top-120,
                                left: 0
                            });
                        })
                    }
                }

                // standings
                let standings = await getStandings().catch(error => {
                    M.toast({html: `Getting standings data failed: ${error}`});
                    console.error(error);
                });

                if (standings) {
                    let standingsTableBody = document.querySelector('#standings-table-body');
                    let standingsPreload = document.querySelector('#preload-standings');
                    let teamList = document.querySelector('#team-list');
                    let teamListPlaceholder = document.querySelector('#team-list-placeholder');
                    let favoriteTeams = document.querySelector('#favorite-teams');
                    let favoriteTeamsPlaceholder = document.querySelector('#favorite-teams-placeholder');

                    if (standings.standings[0].table.length == 0) {
                        standingTableBody.innerHTML = `<td class="center-align" colspan="10">No Data</td>`;
                    }
                    else {
                        let favTeams = await dbGetAllFavoriteTeam();
                        teamListPlaceholder.innerHTML = 'No teams.';
                        
                        standings.standings[0].table.forEach((clubStands, index) => {
                            let team = clubStands.team;
                            let color;
                            let found = false;
                            
                            if (index < 4) {
                                color = 'blue';
                            }
                            else if (index == 4) {
                                color = 'orange';
                            }
                            else if (index > 16) {
                                color = 'red';
                            }
                            standingsTableBody.insertAdjacentHTML('beforeend', standingTableBody(clubStands, color));

                            document.querySelectorAll(`.club-icon-${clubStands.team.id}`).forEach(elem => {
                                elem.src = clubStands.team.crestUrl;
                            });

                            for (const index in favTeams) {
                                if (favTeams.hasOwnProperty(index)) {
                                    const favTeam = favTeams[index];
                                    if (favTeam.id == team.id) {
                                        found = true;
                                        break;
                                    }
                                }
                            }

                            if (!found) {
                                teamListPlaceholder.innerHTML = '';
                                teamList.insertAdjacentHTML('beforeend', clubCard(team));
                            }
                        })

                        standingsPreload.parentNode.removeChild(standingsPreload);

                        if (favTeams.length == 0) {
                            favoriteTeamsPlaceholder.innerHTML = 'No favorite team. Add your first favorite team now.'
                        }
                        else {
                            favoriteTeamsPlaceholder.innerHTML = '';
                        }
                        favTeams.forEach(team => {
                            favoriteTeams.insertAdjacentHTML('beforeend', clubCardFav(team));
                        });
                    }
                }
            }
            else if (page == 'team') {
                let urlSegment = hash.split('/');
                let teamId;
                if (urlSegment.length < 3) return;

                teamId = urlSegment[2];

                // team info
                let teamInfo = await getTeam(teamId).catch(error => {
                    M.toast({html: `Getting team info failed: ${error}`});
                    console.error(error);
                });
                logoContainer.innerHTML = teamInfo.name;
                docTitle.innerHTML = `${teamInfo.name} | Premier League`;
                
                // players
                let squadTableContent = document.querySelector('#squad-table-body');
                teamInfo.squad.forEach(squad => {
                    if (squad.role === "PLAYER") {
                        squadTableContent.insertAdjacentHTML('beforeend', squadTableBody(squad));
                    }
                    else if (squad.role === "COACH") {
                        document.querySelector('#coach').innerHTML = squad.name
                    }
                });

                // matches
                let matchData = await getMatches({ competitions: LEAGUE_ID }, teamId).catch(error => {
                    M.toast({html: `Getting match data failed: ${error}`});
                    console.error(error);
                });
                
                if (matchData) {
                    let allMatches = document.querySelector('#all-matches');
                    let matchCardStr = '';
                    const bottomPreLoader = document.querySelector("#preload-matches-bottom");

                    if (matchData.matches.length == 0) {
                        allMatches.innerHTML = 'No Data';
                    }
                    else {
                        matchData.matches.forEach(match => {
                            matchCardStr += matchCard(match);
                        });
                        allMatches.insertAdjacentHTML('beforeend', matchCardStr);
                        bottomPreLoader.parentNode.removeChild(bottomPreLoader);
                    }
                }

                // standings
                let standings = await getStandings().catch(error => {
                    M.toast({html: `Getting standings data failed: ${error}`});
                    console.error(error);
                });

                if (standings) {
                    let standingsTableBody = document.querySelector('#standings-table-body');
                    let standingsPreload = document.querySelector('#preload-standings');

                    if (standings.standings[0].table.length == 0) {
                        standingTableBody.innerHTML = `<td class="center-align" colspan="10">No Data</td>`;
                    }
                    else {
                        standings.standings[0].table.forEach((clubStands, index) => {
                            let color;
                            let highlight;
                            
                            if (index < 4) {
                                color = 'blue';
                            }
                            else if (index == 4) {
                                color = 'orange';
                            }
                            else if (index > 16) {
                                color = 'red';
                            }

                            if (clubStands.team.id == teamId) {
                                highlight = true;
                            }

                            standingsTableBody.insertAdjacentHTML('beforeend', standingTableBody(clubStands, color, highlight));

                            document.querySelectorAll(`.club-icon-${clubStands.team.id}`).forEach(elem => {
                                elem.src = clubStands.team.crestUrl;
                            });
                        });

                        standingsPreload.parentNode.removeChild(standingsPreload);
                    }
                }
            }
        })
        .catch(error => {
            M.toast({html: `Load page failed: ${error}`});
            console.error(error);
        });
    }


    if (hash[1] != '/') {
        let tempHash = "#/general";
        loadPage(tempHash);
        window.location = `${hash}`;
        return;
    }
    else {
        loadPage(hash);
    }

    window.addEventListener('hashchange', event => {
        console.log('Hash change event...');
        hash = window.location.hash;
        if (hash == '#') {
            hash = "#/general";
            loadPage(hash);
            return;
        }
        
        loadPage(hash);
    });
});
