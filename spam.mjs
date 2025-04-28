import fetch from 'node-fetch';

const endpoints = [
  {
    url: 'http://localhost:4900/address/distance',
    payload: {
      lat1: "43.084847",
      lon1: "-77.674194",
      lat2: "40.712776",
      lon2: "-74.005974"
    }
  },
  {
    url: 'http://localhost:4900/address/city',
    payload: {
      zip: "14623"
    }
  },
  {
    url: 'http://localhost:4900/address/request',
    payload: {
      city: "Rochester",
      limit: 2,
      page: 1
    }
  },
  {
    url: 'http://localhost:4900/address/count',
    payload: {
      city: "Rochester"
    }
  }
];

const spamRequests = async () => {
  for (let i = 0; i < 100; i++) {
    // Pick a random endpoint
    const { url, payload } = endpoints[Math.floor(Math.random() * endpoints.length)];

    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
        .then(res => {
          console.log(`Request ${i + 1} to ${url} done with status ${res.status}`);
        })
        .catch(err => {
          console.error(`Request ${i + 1} to ${url} failed:`, err.message);
        });
  }
};

spamRequests();
