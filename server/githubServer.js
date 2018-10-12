const fetch = require('node-fetch');

function dictToFormattedString(dict, key_value_sep = '=', separator = '&') {
  var str = [];
  for(var p in dict){
      str.push(p + key_value_sep + dict[p]);
  }
  
  return str.join(separator);
}

function dictToURI(dict) {
  return dictToFormattedString(dict)
}

function dictToSearchOption(dict) {
  return dictToFormattedString(dict, ':', '+')
}

class ResponseError extends Error {
  constructor(res, body) {
    super(`${res.status} error requesting ${res.url}: ${res.statusText}`);
    this.status = res.status;
    this.path = res.url;
    this.body = body;
  }
}

class Github {
  constructor(token, baseUrl = 'https://api.github.com') {
    this.token = token;
    this.baseUrl = baseUrl;
  }

  setToken(token) {
    this.token = token;
  }

  request(path, search_opt = {}, opts = {}) {
    let url = `${this.baseUrl}${path}?${dictToURI(search_opt)}`;
    const options = {
      ...opts,
      headers: {
        Accept: 'application/vnd.github.cloak-preview+application/vnd.github.v3+json',
        Authorization: `token ${this.token}`
      },
    };

    return fetch(url, options)
      .then(res => res.json()
        .then((data) => {
          if (!res.ok) {
            throw new ResponseError(res, data);
          }

          return data;
        }));
  }

  users(since) {
    return this.request('/users', {'since':since,'page':1,'per_page':3});
  }

  userInfo(since, info = ['login']) {
    return this.users(since).then((function(infos_users) {
      let infos = [];
      for (let i = 0; i < infos_users.length; i++) {
        let user_info = {}
        for (let j = 0; j < info.length; j++) {
          user_info[info[j]] = infos_users[i][info[j]]
        }
        infos.push(user_info)
      }
      return infos
    }).bind(this))
  }

  usernames(since) {
    return this.userInfo(since)
  }

  followers(since) {
    return this.users(since).then((function(infos_users) {
      let cleaned_infos_users = [];
      let cleaned_user = {}
      let url_followers = ''
      let followers_promises = []
      for (let i = 0; i < infos_users.length; i++) {
        let user = infos_users[i]
        url_followers = user['followers_url'].replace(this.baseUrl,'')
        followers_promises.push(this.request(url_followers))
        cleaned_user = {'login': user['login'],
                        'avatar_url': user['avatar_url']
                      }
        cleaned_infos_users.push(cleaned_user)
      }
      return Promise.all(followers_promises).then(list_followers => {
        for (let i = 0; i < list_followers.length; i++) {
          cleaned_infos_users[i]['nb_followers'] = list_followers[i].length;
        }
        return cleaned_infos_users
      })
    }).bind(this))
    
  }

  nbRepositoriesOf(user) {
    return this.repositoriesOf(user)
      .then(repos => {
        if (repos == '') {
          return 0
        }
        return repos['total_count']
      })
  }

  repositoriesOf(user) {
    return this.request('/search/repositories', {'q':dictToSearchOption({'user':user, 'fork': 'true'})})
  }

  commitsOf(user, page = 1, commit_msg = []) {

    return this.request('/search/commits', {'page':page++, 'per_page': 100, 'q':dictToSearchOption({'author':user})}).catch(err => {console.log(err + 'plop'); return ''})
      .then(commits => {
        if (commits) {
          for (let i = 0; i < commits['items'].length; i++) {
            commit_msg.push(commits['items'][i]['commit']['message'])
          } 
          return this.commitsOf(user, page, commit_msg)
        }
        return commit_msg
      }, error => {return commit_msg})
  }

  nbCommitsOf(user) {
    return this.request('/search/commits', {'q':dictToSearchOption({'author':user})}).catch(err => {console.log(err + 'plop'); return {'total_count': 0}})
      .then(commits => {
        return commits['total_count']
      })
  }

  linesOf(user) {
    return this.repositoriesOf(user)
      .then(repos_data => {
        let per_page = 30
        let nb_repos = repos_data['total_count']
        let repos = repos_data['items']
        let names_repos = []
        if(repos != []) {
          for (let i = 0; i < nb_repos; i++) {
            let page = Math.ceil((i  + 1) / per_page)
            let index_on_page = i - (page - 1) * per_page
            names_repos.push(this.request(`/repos/${repos[index_on_page]['full_name']}/stats/contributors`, {'page':page}))
          }
        }
        return Promise.all(names_repos)
          .then(contributions_data => {
            let nb_lines = 0
            for (let i = 0; i < nb_repos; i++) {
              if (contributions_data[i] !== undefined) {
                for (let j = 0; j < contributions_data[i].length; j++) {
                  if (contributions_data[i][j] !== undefined) {
                    for (let k = 0; k < contributions_data[i][j]['weeks'].length; k++) {
                      nb_lines += contributions_data[i][j]['weeks'][k]['a']
                    }
                  }
                }
              }
            }
            return nb_lines
          }).catch(err => console.log(err))
      })
  }

  stats(since) {
    return this.userInfo(since, ['login', 'avatar_url'])
      .then(name_and_avatar => {
        let statistics = []
        for (let i = 0; i < name_and_avatar.length; i++) {
          let name = name_and_avatar[i]['login']
          let avatar = name_and_avatar[i]['avatar_url']
          statistics.push(Promise.all([this.linesOf(name), this.nbCommitsOf(name), this.nbRepositoriesOf(name)])
          .then(result => {
            return {'username': name,
                      'avatar_url': avatar,
                      'nb_lines': result[0],
                      'nb_commit': result[1],
                      'nb_repos': result[2]
                    }
          
          }))
        }
        return Promise.all(statistics).then(result => {return result})
      }
    )
  }
}
//let git = new Github(token = '9c5550ab04f6316be44a195761a69b475753ec1a')
//git.followers(203).then(result => console.log(result))
//git.repositoriesOf('Blade7fold').then(result => console.log(result))
//git.nbCommitsOf('jimmyVerdasca').then(result => console.log(result))
//git.linesOf('AurelieLevy').then(result => console.log(result))
//git.commitsOf('jimmyVerdasca').then(result => console.log(result))
//git.usernames(200).then(result => console.log(result))
module.exports = Github;