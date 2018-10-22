// $WIN = $(window);
let entryPoint = 'http://localhost:8080'

function request(path, search_opt, opts = {}) {
  let url = `${entryPoint}/${path}?seed=123`;

  let options = {
    ...opts, 
    headers: {
      'Accept': 'application/json'
    }
  }
  return fetch(url, options)
  .then(res => {
    return res.json()
    .then((data) => {
      if (!res.ok) {
        throw new ResponseError(res, data);
      }
      return data;
    })});
}

function getUserFollowers(seed) {
  return request('follower', 'seed=' + seed)
}

function changeFollowersInfo() {
  getUserFollowers(1234).then(followers => {
    document.getElementById("userName").innerHTML = followers[0]['login']
    document.getElementById("git_race_button").innerHTML = followers[0]['avatar_url']
    document.getElementById("twinder_button").innerHTML = followers[0]['nb_followers']
  })
}

function getUserCommits(username) {
  return request('commit', 'user=' + username)
}

function changeCommitsInfo() {

  //let username =  document.getElementById("commit_username").value

  getUserCommits('jimmyVerdasca').then(commits => {
    for (let i = 0; i < Object.keys(commits).length; i++) {
      textNode = document.getElementById("commit_text" + i)
      if (textNode == undefined) {
        textNode = document.createElement('p');
        textNode.setAttribute("id", "commit_text" + i);
        document.getElementById("patata").appendChild(textNode); 
      }
      textNode.innerHTML = commits[i]
    }
  })
}

function getUserStats(seed) {
  return request('stat', 'seed=' + seed)
}

function changeStatsInfo() {
  getUserStats(123).then(stats => {
    document.getElementById("commit_button").innerHTML = stats[0]['username']
    document.getElementById("git_race_button").innerHTML = stats[0]['avatar_url']
    document.getElementById("commit_button").innerHTML = stats[0]['nb_lines']
    document.getElementById("git_race_button").innerHTML = stats[0]['nb_commit']
    document.getElementById("twinder_button").innerHTML = stats[0]['nb_repos']
  })
}