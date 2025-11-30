(async function () {

  // Time gap between showing notifications in seconds (e.g., 15 seconds)
  const NOTIFICATION_GAP_SECONDS = 15;

  // Number of days after the first visitor visit when notifications can start showing
  const NOTIFICATION_START_AFTER_DAYS = 2;

  let notifications = [];

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
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }

  function setCookie(name, value, days = 365) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/`;
  }

  function setFirstVisitCookie() {
    if (!getCookie('first_visit_time')) {
      setCookie('first_visit_time', Date.now().toString(), 365);
    }
  }

  function hasRequiredDelayPassed() {
    const firstVisitStr = getCookie('first_visit_time');
    if (!firstVisitStr) return false;
    const firstVisitTime = parseInt(firstVisitStr, 10);
    const now = Date.now();
    // const delayMs = NOTIFICATION_START_AFTER_DAYS * 24 * 60 * 60 * 1000;
      const delayMs = 500;
    return (now - firstVisitTime) >= delayMs;
  }

  window.checkAndGetNotification = async function () {

    setFirstVisitCookie();

    if (!hasRequiredDelayPassed()) {
      // Do not show notification until required delay after first visit
      return null;
    }

    await loadNotifications();

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

    const validSeenIds = seenIds.filter(id => currentIds.includes(id));
    if (validSeenIds.length !== seenIds.length) {
      setCookie('promo_notification', JSON.stringify(validSeenIds));
      seenIds = validSeenIds;
    }

    const unseenNotification = notifications.find(n => !seenIds.includes(n.notification_id));

    if (unseenNotification) {
      seenIds.push(unseenNotification.notification_id);
      setCookie('promo_notification', JSON.stringify(seenIds));
      setCookie('promo_notification_last_seen', now.toString());
      return unseenNotification.notification_html;
    }

    return null;

  };

})();
