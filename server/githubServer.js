const fetch = require('node-fetch');

function dictToURI(dict) {
    var str = [];
    for(var p in dict){
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(dict[p]));
    }
    return str.join("&");
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
  constructor({ token, baseUrl = 'https://api.github.com' } = {}) {
    this.token = token;
    console.log(this.token)
    this.baseUrl = baseUrl;
  }

  setToken(token) {
    this.token = token;
  }

  request(path, search_opt = {}, opts = {}) {
    let url = `${this.baseUrl}${path}?${dictToURI(search_opt)}`;
    
    console.log(url)
    const options = {
      ...opts,
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `token ${this.token}`
      },
    };
    console.log(url)
    console.log(options)
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
    return this.request('/users', {'since':400,'page':1,'per_page':100});
  }
}
let git = new Github({token:'c5462a0817b827d69f3582419dca4f7aecbbd83a'})
git.users(400).then(result => console.log(result))
module.exports = Github;