const API_URL = "https://mynote-app-production-cb61.up.railway.app";

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

async function registrarPushNotifications() {
  try {
    if (!("serviceWorker" in navigator)) return;

    if (!("PushManager" in window)) return;

    const permissao = await Notification.requestPermission();

    if (permissao !== "granted") {
      console.log("Permissão de notificação negada.");
      return;
    }

    const registro = await navigator.serviceWorker.ready;

    let inscricao = await registro.pushManager.getSubscription();

    if (!inscricao) {
      inscricao = await registro.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          "BMK8iAQvIYfGlMnVnz10kC7CjDCt-r8zHFIfAFgesUmjAfbRKd0PkEARkbwAy2-sFsT42xCedVkoVGsjGGENbGg",
        ),
      });
    }

    await fetch(
      "https://mynote-app-production-cb61.up.railway.app/push/subscribe",
      {
        method: "POST",
        headers: {
          ...headersAuth(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(inscricao),
      },
    );

    console.log("Push registrado com sucesso.");
  } catch (erro) {
    console.error("Erro ao registrar push:", erro);
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);

  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);

  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}