import { html, render } from 'https://unpkg.com/lit-html?module';
import { repeat } from 'https://unpkg.com/lit-html/directives/repeat.js?module';
import { MainPage } from './main-page.js';

const TOKEN_KEY = 'hrprodev:dockerized-ghi-service';

const appUrl = document.querySelector('link[rel="hrprodev:dockerized-app-service"]').href;
const authUrl = document.querySelector('link[rel="hrprodev:dockerized-auth-service"]').href;
const status = {
  appUrl,
  authUrl,
};
const auth = {
  email: '',
  password: '',
};
const data = {
  items: [],
};

let token = JSON.parse(window.localStorage.getItem(TOKEN_KEY));

const renderApp = () => {
  render(App({ token, data, status }), document.querySelector('main'));
}

const update = field => event => {
  auth[field] = event.srcElement.value;
};

const checkUrl = async (url, field) => {
  let good = true;
  try {
    const response = await fetch(url);
    good = response.ok || response.status === 401;
  } catch {
    good = false;
  }
  status[field] = good;
  renderApp();
}

const logIn = async (event) => {
  status.loginError = '';
  renderApp();
  event.preventDefault();
  const response = await fetch(authUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...auth }),
  });
  if (!response.ok) {
    status.loginError = 'Could not log in with those credentials.';
  } else {
    const data = await response.json();
    token = data.token;
    window.localStorage.setItem(TOKEN_KEY, JSON.stringify(token));
  }
  renderApp();
};

const logOut = () => {
  token = null;
  window.localStorage.removeItem(TOKEN_KEY);
  checkUrl(appUrl, 'appUrlGood');
  checkUrl(authUrl, 'authUrlGood');
};

class ItemsRepository {
  constructor(url, token) {
    this._token = token;
    this._url = url;
    this._data = {};
    this.getAll();
    this.createItem = this.create.bind(this);
    this.setText = this.set.bind(this, 'text');
    this.remove = id => this.delete.bind(this, id);
  }

  async delete(id) {
    try {
      const response = await fetch(`${this._url}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this._token}`,
        },
      });
      if (response.ok) {
        const stuff = await response.json();
        data.items = stuff.items;
        data.error = '';
      } else {
        data.error = 'Could not get your items. Please try again, later.';
      }
    } catch (e) {
      data.error = 'The application is currently down. Please try again, later.';
    }
    renderApp();
  }

  async create(event) {
    event.preventDefault();
    try {
      const response = await fetch(this._url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this._token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: this._data.text }),
      });
      if (response.ok) {
        const stuff = await response.json();
        data.items = stuff.items;
        data.error = '';
      } else {
        data.error = 'Could not get your items. Please try again, later.';
      }
    } catch (e) {
      data.error = 'The application is currently down. Please try again, later.';
    }
    if (!data.error) {
      this._data.text = '';
    }
    renderApp();
  }

  async getAll() {
    try {
      const response = await fetch(this._url, {
        headers: { 'Authorization': `Bearer ${this._token}` }
      });
      if (response.ok) {
        const stuff = await response.json();
        data.items = stuff.items;
        data.error = '';
      } else {
        data.error = 'Could not get your items. Please try again, later.';
      }
    } catch (e) {
      data.error = 'The application is currently down. Please try again, later.';
    }
    renderApp();
  }

  set(field, event) {
    this._data[field] = event.srcElement.value;
    renderApp();
  }

  get(field) {
    return this._data[field] || '';
  }
}

const Todos = (logOut, data, repo) => {
  const text = repo.get('text').trim();
  return html`
    <div class="container">
      <div class="row toolbar">
        <button class="button-primary" @click=${logOut}>Log out</button>
      </div>
      <div class="row">
        <div class="nine columns">
          <form id="todo-form" @submit=${repo.createItem}>
            <label for="text">Your to-do item</label>
            <input @keyup=${repo.setText} .value=${text} class="u-full-width" id="text" type="text">
          </form>
        </div>
        <div class="three columns">
          <label>&nbsp;</label>
          <button form="todo-form" ?disabled=${!text}>Create</button>
        </div>
      </div>
      ${data.error ?
        html`<p class="error">${data.error}</p>` :
        data.items.length > 0 ? '' :
          html`<h3>You have no items. Create one. :-)</h3>` }
      ${repeat(data.items, item => item.id, (item, index) => html`
        <div class="row">
          <div @click=${repo.remove(item.id)} class="one column right-align">✖</div>
          <div class="eleven columns">${item.text}</div>
        </div>
      `)}
    </div>
  `;
};

const repo = new ItemsRepository(appUrl, token);

const App = ({ token, data, status }) => {
  if (!token) {
    return MainPage(logIn, update, status);
  } else {
    return Todos(logOut, data, repo);
  }
};

if (!token) {
  checkUrl(appUrl, 'appUrlGood');
  checkUrl(authUrl, 'authUrlGood');
}
