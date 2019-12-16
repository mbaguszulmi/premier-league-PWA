var webPush = require('web-push');
const vapidKeys = {
    "publicKey": "BBgWbC-sFeS75V3bnDaa8MkgRe-bjDtuk6POHWQRhgY34OCIE74fkt6y843QCsVvzHv_25TxQNvTf0ZyedLaGGA",
    "privateKey": "sUX5SNF2RuqnNZTZHYvm2a-sglYvLtfDAJa6Agipf_k"
};


webPush.setVapidDetails(
    'mailto:example@yourdomain.org',
    vapidKeys.publicKey,
    vapidKeys.privateKey
)
var pushSubscription = {
    "endpoint": "https://fcm.googleapis.com/fcm/send/dg8HF9cbcKI:APA91bFMKSqFVAsHtcgXwHOkZ0b-28cM1AuujvqMBSYSI2cudZRUeszv7GI_RaOtt8vUoFtqRg0vxdT28z497dwBe84s6dqpDKUDjS5PJh4XJAlZaIw8AtE1Q93qU4tGfPHN_r1hOqbw",
    "keys": {
        "p256dh": "BJOVFhEhZH5LbZQ/VqwdQ8hbScOOlXg08Y6jYXuiY41csEDXKnVYEvVN+1ML4vgFqlyG5HJcPIOTpY3n3UkWmw0=",
        "auth": "YVgWt9JppGExtjl/jOesKA=="
    }
};
var payloadJson = {
    title: "Matchday 17",
    body: "Arsenal FC vs Manchester City FC"
};
var payload = JSON.stringify(payloadJson);
var options = {
    gcmAPIKey: '941779041074',
    TTL: 60
};
webPush.sendNotification(
    pushSubscription,
    payload,
    options
);
