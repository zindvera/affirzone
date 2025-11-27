(async function () {
  let notifications = [];
  // Set gap here; default 3 days = 3 * 24 * 3600 seconds
  const NOTIFICATION_GAP_SECONDS = 15; 

  async function loadNotifications() {
    try {
      const response = await fetch('promo_notifications.json');
      if (!response.ok) throw new Error('Failed to load notifications');
      notifications = await response.json();
    } catch (err) {
      console.error(err);
      notifications = [];
    }
  }

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2)
      return parts.pop().split(';').shift();
    return null;
  }

  function setCookie(name, value, days = 365) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/`;
  }

  window.checkAndGetNotification = async function () {
    await loadNotifications();

    // Check time gap condition
    const lastSeenStr = getCookie('promo_notification_last_seen');
    const now = Date.now();

    if (lastSeenStr) {
      const lastSeen = parseInt(lastSeenStr, 10);
      const diffSeconds = (now - lastSeen) / 1000;
      if (diffSeconds < NOTIFICATION_GAP_SECONDS) {
        // Gap not met, do not show notification
        return null;
      }
    }

    // Existing logic for seen ids
    let seenIds = [];
    const cookieVal = getCookie('promo_notification');
    if (cookieVal) {
      try {
        seenIds = JSON.parse(cookieVal);
        if (!Array.isArray(seenIds)) seenIds = [];
      } catch {
        seenIds = [];
      }
    }

    const currentIds = notifications.map(n => n.notification_id);

    // Remove stale IDs from cookie
    const validSeenIds = seenIds.filter(id => currentIds.includes(id));
    if (validSeenIds.length !== seenIds.length) {
      setCookie('promo_notification', JSON.stringify(validSeenIds));
      seenIds = validSeenIds;
    }

    // Find first unseen notification
    const unseenNotification = notifications.find(n => !seenIds.includes(n.notification_id));

    if (unseenNotification) {
      // Update seen IDs cookie
      seenIds.push(unseenNotification.notification_id);
      setCookie('promo_notification', JSON.stringify(seenIds));

      // Update last seen time cookie
      setCookie('promo_notification_last_seen', now.toString());

      return unseenNotification.notification_html;
    }
    return null;
  };
})();
