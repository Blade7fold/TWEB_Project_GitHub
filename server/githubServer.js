const fetch = require('node-fetch');
var utils = require('./utils')
var parse = require('parse-link-header');
let util = new utils()

/**
 * response class sent when a fetch fail
 */
class ResponseError extends Error {
  constructor(res, body) {
    super(`${res.status} error requesting ${res.url}: ${res.statusText}`);
    this.status = res.status;
    this.path = res.url;
    this.body = body;
  }
}

/**
 * class managing the connexion to the github API.
 */
class Github {
  constructor(token, baseUrl = 'https://api.github.com') {
    this.token = token;
    this.baseUrl = baseUrl;
  }

  /**
   * method sending a request to the given path url. and return the body datas.
   * @param {url of the request} path 
   * @param {dictionary used by github to navigate through big data answers} search_opt 
   * @param {dictionnary to add specific headers to the request} opts 
   */
  request(path, search_opt = {}, onlyHeaders = false, opts = {}) {
    let url = `${this.baseUrl}${path}?${util.dictToFormattedString(search_opt)}`;
    const options = {
      ...opts,
      headers: {
        Accept: 'application/vnd.github.cloak-preview+application/vnd.github.v3+json',
        Authorization: `token ${this.token}`
      },
    };
    return fetch(url, options)
      .then(res => {
        return res.json()
          .then((data) => {
            if (!res.ok) {
              throw new ResponseError(res, data);
            }
            if(onlyHeaders) {
              return res.headers
            }
            return data;
          })
      })
  }

  /**
   * method sending a request to get the users informations from github
   * @param {seed of the first user we want} since 
   */
  users(since) {
    return this.request('/users', {'since':since,'page':1,'per_page':5});
  }

  /**
   * method sending a request to get the users informations from github
   * and formatting them to keep only the specified meta informations
   * in the info dictionnary.
   * @param {seed of the first user we want} since 
   * @param {list of the meta informations we want to keep} info 
   */
  userInfo(since, info = ['login']) {
    return this.users(since)
      .then(infos_users => {
        let infos = [];
        for (let i = 0; i < infos_users.length; i++) {
          let user_info = {}
          for (let j = 0; j < info.length; j++) {
            user_info[info[j]] = infos_users[i][info[j]]
          }
          infos.push(user_info)
        }
        return infos
      })
  }

  /**
   * method sending a request to get the users informations and keeping only:
   * the username
   * the avatar
   * the number of followers
   * @param {seed of the first user we want} since 
   */
  followers(since) {
    return this.users(since).then((function(infos_users) {
      let cleaned_infos_users = [];
      let cleaned_user = {}
      let url_followers = ''
      let followers_promises = []
      for (let i = 0; i < infos_users.length; i++) {
        let user = infos_users[i]
        url_followers = user['followers_url'].replace(this.baseUrl,'')
        followers_promises.push(this.request(url_followers, {"per_page": 1}, true))
        cleaned_user = {'login': user['login'],
                        'avatar_url': user['avatar_url']
                      }
        cleaned_infos_users.push(cleaned_user)
      }
      return Promise.all(followers_promises).then(list_followers => {
        for (let i = 0; i < list_followers.length; i++) {
          cleaned_infos_users[i]['nb_followers'] = parse(list_followers[i].get('Link'))['last']['page']
        }
        return cleaned_infos_users
      })
    }).bind(this))
    
  }

  /**
   * request to github the number of repositories of a given user
   * @param {username of the user we want the number of repositories} user 
   */
  nbRepositoriesOf(user) {
    return this.repositoriesOf(user)
      .then(repos => {
        if(repos === undefined) {
          console.log("repos undefined")
          return 0;
        }
        return repos['total_count']
      }).catch(err => {return 0})
  }

  /**
   * request to github the repositories of a given user (fork are considered aswell)
   * @param {username of the user we want the repositories} user 
   */
  repositoriesOf(user) {
    return this.request('/search/repositories', {'q':util.dictToSearchOption({'user':user, 'fork': 'true'})}).catch(err => {console.log("fuck6" + err.status);return undefined})
  }

  /**
   * Use a recursive strategy to request the all the commits message of a given user.
   * @param {username of the user we want the commits} user 
   * @param {number of the page the where the recursive call is} page 
   * @param {list of the commits message currently found} commit_msg 
   */
  commitsOf(user, page = 1, commit_msg = []) {
    return this.request('/search/commits', {'page':page++, 'per_page': 100, 'q':util.dictToSearchOption({'author':user})}).catch(err => {console.log("fuck7"); return ''})
      .then(commits => {
        if (commits) {
          for (let i = 0; i < commits['items'].length; i++) {
            commit_msg.push(commits['items'][i]['commit']['message'])
          } 
          return this.commitsOf(user, page, commit_msg)
        }
        return commit_msg
      }, error => {return commit_msg}).catch(err => {console.log("fuck20"); return ''})
  }

  /**
   * request to github to get the number of commits of a given user
   * @param {username of the user we want the number of commits} user 
   */
  nbCommitsOf(user) {
    return this.request('/search/commits', {'q':util.dictToSearchOption({'author':user})})
      .catch(err => {
        console.log("fuck8" + err);
        return {'total_count': 0}
      })
      .then(commits => {
        return commits['total_count']
      })
  }

  /**
   * request to github the lines code of a user and calculate their total number to return it.
   * @param {username of the user we want the number of line code} user 
   */
  linesOf(user) {
    let nb_lines = 0
    let forbidden = false
    return this.repositoriesOf(user)
      .catch(err => {
        console.log("catch" + err);
        if(err.status === 403) {
          forbidden = true
        }
        return undefined
      })
      .then(repos_data => {
        if(repos_data === undefined || forbidden) {
          console.log("repos pas trouvé")
          return 0;
        }
        let per_page = 30
        let nb_repos = repos_data['total_count']
        let repos = repos_data['items']
        let names_repos = []
        if(repos != []) {
          for (let i = 0; i < nb_repos && !forbidden; i++) {
            let page = Math.ceil((i  + 1) / per_page)
            let index_on_page = i - (page - 1) * per_page
            if(repos[index_on_page] !== undefined) {
               names_repos.push(this.request(`/repos/${repos[index_on_page]['full_name']}/stats/contributors`, {'page':page})
                .catch(err => {
                  console.log("fuck10" + err);
                  if(err.status === 403) {
                    console.log("STOP FORBIDDEN")
                    forbidden = true
                  }
                  return undefined
                })
                .then(contributions_data => {
                  if (contributions_data !== undefined) {
                    for (let i = 0; i < contributions_data.length; i++) {
                      if (contributions_data[i] !== undefined) {
                        for (let k = 0; k < contributions_data[i]['weeks'].length; k++) {
                          nb_lines += contributions_data[i]['weeks'][k]['a']
                        }
                      }
                    }
                  }
                  return nb_lines
                })
                .catch(err =>  {
                  console.log("fuck9");
                  return nb_lines;
                })
              )
            } 
          }
        } 
        return Promise.all(names_repos).then(result => {return nb_lines;}).catch(err => {
          console.log("fuck11" + err);return nb_lines})
          
      }).catch(err => { 
        console.log("fuck10");
        if (nb_lines !== undefined) {
          return nb_lines
        } else {
          return 0
        }
        })
  }

  /**
   * request to github multiple statistics and information of several users.
   * the kept informations are :
   * the username
   * the avatar
   * the number of code lines
   * the number of commit
   * the number of repositories
   * @param {seed of the first user we want the statistics} since 
   */
  stats(since) {
    return this.userInfo(since, ['login', 'avatar_url'])
      .then(name_and_avatar => {

        /*
        if (name_and_avatar === undefined) {
          return {'username': "private",
                  'avatar_url': undefined,
                  'nb_lines': 0,
                  'nb_commit': 0,
                  'nb_repos': 0
                  }
        }*/

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
        return Promise.all(statistics).catch(err => console.log("plop" + err)).then(result => {return result})
      }
    ).catch(err => {
      console.log(err);
      })
  }
}

module.exports = Github;