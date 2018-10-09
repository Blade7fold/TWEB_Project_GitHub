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
    return this.request('/users', {'since':since,'page':1,'per_page':100});
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
    return this.repositoriesOf(user).then(repos => {return repos['total_count']})
  }

  repositoriesOf(user) {
    return this.request('/search/repositories', {'q':dictToSearchOption({'user':user, 'fork': 'true'})})
  }

  commitsOf(user) {
    return this.request('/search/commits', {'q':dictToSearchOption({'author':user})}).then(repos => {return repos['total_count']})
  }
}
let git = new Github(token = '2fa0349cc41aff052d492552125532ffec5c193e')
//git.followers(203).then(result => console.log(result))
//git.repositoriesOf('Blade7fold').then(result => console.log(result))
git.commitsOf('jimmyVerdasca').then(result => console.log(result))
module.exports = Github;