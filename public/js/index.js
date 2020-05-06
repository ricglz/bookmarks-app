(() => {
  const TOKEN = '2abbf7c3-245b-404f-9473-ade729ed4653'
  const results = document.querySelector('section.results')

  function createBookmark({ id, title, description, url, rating }) {
    const bookmark = document.createElement('div');
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

  async function fetchAllStudents() {
    const url = '/bookmarks';
    const config = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${TOKEN}`
      }
    }
    try {
      const response = await fetch(url, config);
      if(!response.ok) {
        throw new Error(response.statusText);
      }
      const json = await response.json();
      results.innerHTML = ''
      json.forEach((bookmark) => { results.append(createBookmark(bookmark)) })
    } catch (err) {
      results.innerHTML = `${err.message}`
    }
  }

  function addListeners() {
    document.querySelector('form.create-bookmark')
            .addEventListener('submit', function(e) {
      e.preventDefault();
    });
    document.querySelector('form.delete-bookmark')
            .addEventListener('submit', function(e) {
      e.preventDefault();
    });
    document.querySelector('form.update-bookmark')
            .addEventListener('submit', function(e) {
      e.preventDefault();
    });
    document.querySelector('form.get-bookmark')
            .addEventListener('submit', function(e) {
      e.preventDefault();
    });
  }

  function init() {
    fetchAllStudents();
    addListeners();
  }

  init();
})()
