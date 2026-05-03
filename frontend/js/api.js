const API_URL = "http://localhost:3000";

function getToken() {
  return localStorage.getItem("token");
}

function headersAuth() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`
  };
}

async function apiGet(url) {
  const res = await fetch(API_URL + url, {
    headers: headersAuth()
  });
  return res.json();
}

async function apiPost(url, body) {
  const res = await fetch(API_URL + url, {
    method: "POST",
    headers: headersAuth(),
    body: JSON.stringify(body)
  });
  return res.json();
}

async function apiPut(url, body) {
  const res = await fetch(API_URL + url, {
    method: "PUT",
    headers: headersAuth(),
    body: JSON.stringify(body)
  });
  return res.json();
}

async function apiDelete(url) {
  const res = await fetch(API_URL + url, {
    method: "DELETE",
    headers: headersAuth()
  });
  return res.json();
}