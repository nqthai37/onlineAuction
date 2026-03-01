// ==================== SMART COUNTDOWN ====================
// Dependencies: window.PRODUCT_CONFIG.productStatus

(function () {
  const RELOAD_DELAY_MS = 1000;
  const THREE_DAYS_IN_MS = 3 * 24 * 60 * 60 * 1000;
  let countdownEnded = false;

  function updateSmartCountdown() {
    const countdownElement = document.querySelector('.countdown-timer');
    if (!countdownElement) return;

    const endDate = new Date(countdownElement.getAttribute('data-end-date'));
    const now = new Date();
    const timeLeft = endDate - now;

    if (timeLeft <= 0) {
      countdownElement.textContent = 'Auction Ended';
      countdownElement.classList.remove('text-danger');
      countdownElement.classList.add('text-muted');

      if (!countdownEnded) {
        countdownEnded = true;
        setTimeout(() => window.location.reload(), RELOAD_DELAY_MS);
      }
      return;
    }

    if (timeLeft > THREE_DAYS_IN_MS) {
      const dateOptions = { year: 'numeric', month: 'short', day: 'numeric' };
      const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };

      const dateStr = endDate.toLocaleDateString('en-US', dateOptions);
      const timeStr = endDate.toLocaleTimeString('en-US', timeOptions);

      countdownElement.innerHTML = `${dateStr}<br>${timeStr}`;
      countdownElement.classList.remove('text-danger');
      countdownElement.classList.add('text-primary');

      const labelElement = countdownElement.closest('.info-box')?.querySelector('small.text-muted');
      if (labelElement) labelElement.textContent = 'Ends at';
    } else {
      const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

      let timeString = '';
      if (days > 0) {
        timeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;
      } else if (hours > 0) {
        timeString = `${hours}h ${minutes}m ${seconds}s`;
      } else if (minutes > 0) {
        timeString = `${minutes}m ${seconds}s`;
      } else {
        timeString = `${seconds}s`;
      }

      countdownElement.textContent = timeString;
      countdownElement.classList.remove('text-primary');
      countdownElement.classList.add('text-danger');

      const labelElement = countdownElement.closest('.info-box')?.querySelector('small.text-muted');
      if (labelElement) labelElement.textContent = 'Time Left';

      if (days === 0 && hours < 1) {
        countdownElement.classList.add('fw-bold');
      }
    }
  }

  // Only start countdown for ACTIVE products
  document.addEventListener('DOMContentLoaded', function () {
    if (window.PRODUCT_CONFIG.productStatus === 'ACTIVE') {
      updateSmartCountdown();
      setInterval(updateSmartCountdown, 1000);
    }
  });
})();
