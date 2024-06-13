let cardsEl = document.getElementById("cards");
let SW;

document.getElementById("back").addEventListener("click", () => {
  cardsEl.innerHTML = " ";
  getData();
  goBack();
});

document.addEventListener("DOMContentLoaded", () => {
  //register the service worker and add message event listener
  getData();

  //listen for navigation popstate event
  window.addEventListener("hashchange", () => {
    console.log("hash value changed to", location.hash);
    if (location.hash == "" || location.hash === "#") {
      getData();
    } else {
      console.log(location.hash.substring(1));
    }
  });

  //get the data for the page
  //add click listener to #cards
});

function registerSW() {
  navigator.serviceWorker
    .register("/sw.js")
    .then((registeration) => {
      SW =
        registeration.installing ||
        registeration.waiting ||
        registeration.active;
    })
    .catch((err) => console.log(err));

  // listen for latest SW
  navigator.serviceWorker.addEventListener("controllerchange", async () => {
    SW = navigator.serviceWorker.controller;
  });

  // listen for the message from service

  navigator.serviceWorker.addEventListener("message", receiveMessageFromSW);
}
registerSW();

function getData() {
  fetch("https://random-data-api.com/api/v2/users?size=10")
    .then((res) => {
      if (!res.ok) {
        console.log("error retrieving images");
      }
      return res.json();
    })
    .then((data) => {
      showCards(data);
    })
    .catch((err) => {
      console.log(err);
    });
}

function showCards(data) {
  // console.log(data);
  cardsEl.innerHTML = "";
  let df = new DocumentFragment();
  data.forEach((item) => {
    const { uid, first_name, avatar, email } = item;

    let card = document.createElement("li");
    card.className = "card";
    card.setAttribute("data-uid", uid);
    card.style.setProperty("--background-img", `url(${avatar})`);

    // setting the hash value to the uid of the card which was clicked
    card.addEventListener("click", (ev) => {
      location.hash = `#${ev.currentTarget.dataset.uid}`;
      console.log("hashchange");
      sendMessageToSW(location.hash);
      changeColor();
    });

    let nameEl = document.createElement("p");
    nameEl.textContent = first_name;

    let emailEL = document.createElement("p");
    emailEL.textContent = email;

    card.appendChild(nameEl);
    card.appendChild(emailEL);
    df.appendChild(card);
  });
  cardsEl.append(df);
}

function displaySingleCard(uid) {
  console.log("now i have to display single card with uid", uid);

  // I am selecting all the cards, setting display none to all the cards except the one we clicked earlier.

  let allCards = document.querySelectorAll(".card");
  console.log(allCards);

  allCards.forEach((item) => {
    // console.log(item.dataset.uid);
    item.style.display = "none";

    console.log(item.dataset.uid);

    if (item.dataset.uid === uid.substring(1)) {
      console.log("I will show");
      item.style.display = "block";
      return;
    }
  });
}

// taken from stack overflow
function getRandomColor() {
  let letters = "0123456789ABCDEF";
  let color = "#";

  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }

  return color;
}

function changeColor() {
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: "changeColor",
      key: getRandomColor(),
    });
  }
}

function goBack() {
  location.hash = "";
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: "goBack" });
  }
}

function sendMessageToSW(msg) {
  console.log("message", msg);
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      func: "changeUser",
      key: msg,
    });
  }
}

function receiveMessageFromSW(ev) {
  console.log(ev);
  console.log("web page recieving");
  console.log(ev.data);

  if (ev.data.type === "changeUser") {
    location.hash = ev.data.key;
    console.log(location.hash);
    if (ev.data.key == location.hash) {
      displaySingleCard(ev.data.key);
    }
  }

  if (ev.data.type === "goBack") {
    location.hash = "";
    cardsEl.innerHTML = "";
    getData();
  } else if (ev.data.type === "changeColor") {
    document.querySelector("h1").style.color = `${ev.data.key}`;
  }
}
