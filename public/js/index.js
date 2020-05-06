(() => {
  const TOKEN = '2abbf7c3-245b-404f-9473-ade729ed4653'
  const results = document.querySelector('section.results')

  function createBookmarkElement({ id, title, description, url, rating }) {
    const bookmark = document.createElement('div');
    bookmark.className = 'result-item'
    bookmark.innerHTML = `
      <h4>${id} - ${title}</h4>
      <p>
        ${description}
        URL: ${url}
        Rating: ${rating}
      </p>
    `
    return bookmark;
  }

  async function fetchJSON(url, config) {
    const response = await fetch(url, config);
    if(!response.ok) {
      throw new Error(response.statusText);
    }
    return await response.json();
  }

  async function fetchGetEndpoint(url, config) {
    try {
      const json = await fetchJSON(url, config);
      results.innerHTML = ''
      json.forEach((bookmark) => { results.append(createBookmarkElement(bookmark)) })
    } catch (err) {
      results.innerHTML = `${err.message}`
    }
  }

  function fetchAllStudents() {
    const url = '/bookmarks';
    const config = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${TOKEN}`
      }
    }
    fetchGetEndpoint(url, config);
  }

  async function fetchAndModify(url, config) {
    try {
      await fetchJSON(url, config);
      fetchAllStudents();
    } catch (err) {
      results.innerHTML = `${err.message}`
    }
  }

  function createBookmark(data) {
    const url = '/bookmarks';
    const config = {
      method : 'POST',
      headers : {
        Authorization : `Bearer ${TOKEN}`,
        'Content-Type' : 'application/json'
      },
      body : JSON.stringify( data )
    }
    fetchAndModify(url, config);
  }

  async function deleteBookmark({ id }) {
    const url = `/bookmark/${id}`;
    const config = {
      method : 'DELETE',
      headers : {
        Authorization : `Bearer ${TOKEN}`,
      },
    }
    try {
      const response = await fetch(url, config);
      if(!response.ok) {
        throw new Error(response.statusText);
      }
      fetchAllStudents();
    } catch (err) {
      results.innerHTML = `${err.message}`
    }
  }

  function updateBookmark(data) {
    const { id } = data;
    const url = `/bookmark/${id}`;
    const config = {
      method : 'PATCH',
      headers : {
        Authorization : `Bearer ${TOKEN}`,
        'Content-Type' : 'application/json'
      },
      body: JSON.stringify(data),
    }
    fetchAndModify(url, config);
  }

  function getBookmarksByTitle(data) {
    const params = new URLSearchParams(data);
    const url = `/bookmark?${params}`;
    const config = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${TOKEN}`
      }
    }
    fetchGetEndpoint(url, config);
  }

  function getFormInputValues(form) {
    const values = {};
    ['id', 'title', 'description', 'url', 'rating'].forEach((field) => {
      const fieldInput = form.querySelector(`input#${field}`);
      if(!fieldInput || fieldInput.value === '') {
        return;
      }
      values[field] = fieldInput.value
    });
    return values;
  }

  function fetchEndpointWithFields(form, callToFetch) {
    const values = getFormInputValues(form);
    callToFetch(values);
  }

  function addListeners() {
    document.querySelector('form.create-bookmark').addEventListener('submit', function(e) {
      e.preventDefault();
      fetchEndpointWithFields(this, createBookmark);
    });
    document.querySelector('form.delete-bookmark').addEventListener('submit', function(e) {
      e.preventDefault();
      fetchEndpointWithFields(this, deleteBookmark);
    });
    document.querySelector('form.update-bookmark').addEventListener('submit', function(e) {
      e.preventDefault();
      fetchEndpointWithFields(this, updateBookmark);
    });
    document.querySelector('form.get-bookmark').addEventListener('submit', function(e) {
      e.preventDefault();
      fetchEndpointWithFields(this, getBookmarksByTitle);
    });
  }

  function init() {
    fetchAllStudents();
    addListeners();
  }

  init();
})()
