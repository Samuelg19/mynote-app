const webpush = require("web-push");

webpush.setVapidDetails(
  process.env.VAPID_EMAIL,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY,
);

async function enviarPush(subscription, titulo, mensagem, extras = {}) {
  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      },
      JSON.stringify({
        title: titulo,
        body: mensagem,
        ...extras,
      }),
    );
  } catch (erro) {
    console.error("Erro ao enviar push:", erro);
  }
}

module.exports = {
  enviarPush,
};
