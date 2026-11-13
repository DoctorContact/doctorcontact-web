self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (err) {
    data = { title: "Doctor Contact", body: event.data ? event.data.text() : "" };
  }

  const title = data.title || "Doctor Contact";
  
  // 🟢 NEW: requireInteraction এবং vibrate যোগ করা হলো
  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.body || "",
      icon: "/logo-icon.png",
      badge: "/logo-icon.png",
      tag: data.tag || undefined,
      requireInteraction: true, // ম্যাকের স্ক্রিনে দাঁড়িয়ে থাকবে যতক্ষণ না ইউজার সরাচ্ছে
      vibrate: [200, 100, 200],  // মোবাইলের জন্য
      data: { url: data.url || "/" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  
  const target = new URL(
    (event.notification.data && event.notification.data.url) || "/",
    self.location.origin
  ).href;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      // যদি আগে থেকেই কোনো ট্যাব খোলা থাকে, সেটাকে ফোকাস করবে
      for (const client of windows) {
        if ("focus" in client) {
          client.navigate(target); // ওই ইউআরএল-এ নিয়ে যাবে
          return client.focus();
        }
      }
      // আর যদি কোনো ট্যাব খোলা না থাকে, তাহলে নতুন উইন্ডো খুলবে
      if (self.clients.openWindow) return self.clients.openWindow(target);
      return undefined;
    })
  );
});