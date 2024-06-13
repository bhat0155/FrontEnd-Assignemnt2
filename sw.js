console.log("service worker registered successfully");
let url = "https://random-data-api.com/api/v2/users?size=10";

const version = "1";
const cacheName = `Ekam-${version}`;

self.addEventListener("install", (ev) => {
  console.log("Service Worker installed");
  console.log(`version ${version} installed`);
  self.skipWaiting();

  //cache static files, if needed
});
self.addEventListener("activate", (ev) => {
  console.log("service worker activated");
  clients.claim().then(() => {
    console.log("new sw claimed");
  });

  //clear old caches, if desired
});
self.addEventListener("fetch", (ev) => {
  if (ev.request.url === url) {
    ev.respondWith(
      caches
        .open(cacheName)
        .then((cache) => {
          return cache.match("user.json");
        })
        .then((data) => {
          console.log(data);
          return (
            data ||
            fetch(url).then((res) => {
              return caches.open(cacheName).then((cache) => {
                cache.put("user.json", res.clone());
                return res;
              });
            })
          );
        })
    );
  }

  //handle all fetch requests
});

async function sendMessageToMain(msg, clientId) {
  console.log(clientId);
  let allClients = [];

  let match = await clients.matchAll();
  console.log(match);
  let excluded = match.filter((item) => {
    return item.id !== clientId;
  });
  console.log(excluded);

  let client = await clients.get(clientId);
  allClients.push(client);
  return Promise.all(
    excluded.map((client) => {
      console.log(`postMessage`, msg, `to`, client.id);
      return client.postMessage(msg);
    })
  );
}

self.addEventListener("message", (ev) => {
  let clientId = ev.source.id;

  let data = ev.data;
  if (ev.data.func === "changeUser") {
    console.log(ev.data.key);
    sendMessageToMain({ type: "changeUser", key: ev.data.key });
  }

  if (ev.data.type === "goBack") {
    console.log("sending go back back to main");
    sendMessageToMain({ type: "goBack" });
  }

  if (ev.data.type === "changeColor") {
    sendMessageToMain({ type: "changeColor", key: ev.data.key }, clientId);
  }
});
