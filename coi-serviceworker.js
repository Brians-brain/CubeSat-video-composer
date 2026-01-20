/*! coi-serviceworker v0.1.7 - Guido Zuidhof, licensed under MIT */
let coepCredentialless = false;
if (typeof window === 'undefined') {
  self.addEventListener("install", () => self.skipWaiting());
  self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

  self.addEventListener("message", (ev) => {
    if (!ev.data) return;
    if (ev.data.type === "deregister") {
      self.registration.unregister().then(() => {
        return self.clients.matchAll();
      }).then(clients => {
        clients.forEach(client => client.navigate(client.url));
      });
    }
  });

  self.addEventListener("fetch", function (event) {
    const r = event.request;
    if (r.cache === "only-if-cached" && r.mode !== "same-origin") return;

    const coep = coepCredentialless ? "credentialless" : "require-corp";
    const headerHooks = {
      "Cross-Origin-Embedder-Policy": coep,
      "Cross-Origin-Opener-Policy": "same-origin",
    };

    event.respondWith(
      fetch(r).then((response) => {
        if (response.status === 0) return response;
        const newHeaders = new Headers(response.headers);
        Object.keys(headerHooks).forEach((key) => newHeaders.set(key, headerHooks[key]));
        return new Response(response.body, { status: response.status, statusText: response.statusText, headers: newHeaders });
      }).catch((e) => console.error(e))
    );
  });
} else {
  (() => {
    const re = window.location.reload.bind(window.location);
    const n = navigator.serviceWorker;
    if (n) {
      n.register(window.document.currentScript.src).then((r) => {
        r.addEventListener("updatefound", () => re());
        if (r.active && !n.controller) re();
      });
    }
    if(window.crossOriginIsolated !== false) return;
    window.location.reload();
  })();
}