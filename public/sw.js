self.addEventListener("install", (event) => {
  console.log("Service Worker: install");
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker: activate");
});
