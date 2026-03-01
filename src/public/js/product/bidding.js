// ==================== BID FUNCTIONALITY ====================
// Dependencies: window.PRODUCT_CONFIG (currentPrice, stepPrice, isAuthenticated, signinUrl)

(function () {
  const config = window.PRODUCT_CONFIG;
  const bidModalEl = document.getElementById('bidModal');
  if (!bidModalEl) return;

  const bidModal = new bootstrap.Modal(bidModalEl);
  const currentPrice = config.currentPrice;
  const minIncrement = config.stepPrice;

  // Format number with commas
  function formatNumberWithCommas(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  // Remove commas from formatted number
  function removeCommas(str) {
    return str.replace(/,/g, '');
  }

  // Open bid modal
  document.querySelector('.btn-place-bid')?.addEventListener('click', function () {
    if (config.isAuthenticated) {
      const suggestedBid = currentPrice + minIncrement;
      const bidInput = document.getElementById('bidAmount');
      bidInput.value = formatNumberWithCommas(suggestedBid);
      bidInput.setAttribute('data-raw-value', suggestedBid);
      bidModal.show();
    } else {
      window.location.href = config.signinUrl;
    }
  });

  // Long-press functionality
  let pressTimer = null;
  let isLongPress = false;

  function adjustBid(amount) {
    const bidInput = document.getElementById('bidAmount');
    let currentBid = parseInt(bidInput.getAttribute('data-raw-value')) || (currentPrice + minIncrement);
    const minBid = currentPrice + minIncrement;
    const newBid = Math.max(minBid, currentBid + amount);

    bidInput.setAttribute('data-raw-value', newBid);
    bidInput.value = formatNumberWithCommas(newBid);
    bidInput.setCustomValidity('');
  }

  // Named constants for bid button timing
  const BID_HOLD_DELAY_MS = 500;
  const BID_REPEAT_INTERVAL_MS = 100;

  function startPressIncrease() {
    isLongPress = false;
    pressTimer = setTimeout(() => {
      isLongPress = true;
      repeatIncrease();
    }, BID_HOLD_DELAY_MS);
  }

  function startPressDecrease() {
    isLongPress = false;
    pressTimer = setTimeout(() => {
      isLongPress = true;
      repeatDecrease();
    }, BID_HOLD_DELAY_MS);
  }

  function stopPress() {
    clearTimeout(pressTimer);
    clearInterval(repeatInterval);
  }

  let repeatInterval = null;

  function repeatIncrease() {
    adjustBid(minIncrement);
    repeatInterval = setInterval(() => {
      adjustBid(minIncrement);
    }, BID_REPEAT_INTERVAL_MS);
  }

  function repeatDecrease() {
    adjustBid(-minIncrement);
    repeatInterval = setInterval(() => {
      adjustBid(-minIncrement);
    }, BID_REPEAT_INTERVAL_MS);
  }

  // Handle increase bid button
  const increaseBtn = document.getElementById('increaseBid');
  increaseBtn?.addEventListener('mousedown', startPressIncrease);
  increaseBtn?.addEventListener('mouseup', function () {
    stopPress();
    if (!isLongPress) adjustBid(minIncrement);
  });
  increaseBtn?.addEventListener('mouseleave', stopPress);
  increaseBtn?.addEventListener('touchstart', startPressIncrease);
  increaseBtn?.addEventListener('touchend', function () {
    stopPress();
    if (!isLongPress) adjustBid(minIncrement);
  });

  // Handle decrease bid button
  const decreaseBtn = document.getElementById('decreaseBid');
  decreaseBtn?.addEventListener('mousedown', startPressDecrease);
  decreaseBtn?.addEventListener('mouseup', function () {
    stopPress();
    if (!isLongPress) adjustBid(-minIncrement);
  });
  decreaseBtn?.addEventListener('mouseleave', stopPress);
  decreaseBtn?.addEventListener('touchstart', startPressDecrease);
  decreaseBtn?.addEventListener('touchend', function () {
    stopPress();
    if (!isLongPress) adjustBid(-minIncrement);
  });

  // Handle quick increment buttons
  document.querySelectorAll('.quick-increment').forEach(btn => {
    btn.addEventListener('click', function () {
      const multiplier = parseInt(this.getAttribute('data-multiplier'));
      adjustBid(minIncrement * multiplier);
    });
  });

  // Handle quick decrement buttons
  document.querySelectorAll('.quick-decrement').forEach(btn => {
    btn.addEventListener('click', function () {
      const multiplier = parseInt(this.getAttribute('data-multiplier'));
      adjustBid(-minIncrement * multiplier);
    });
  });

  // Format bid input on user input
  document.getElementById('bidAmount')?.addEventListener('input', function () {
    let value = removeCommas(this.value);
    value = value.replace(/[^\d]/g, '');

    if (value === '') {
      this.value = '';
      this.setAttribute('data-raw-value', '0');
      return;
    }

    const numValue = parseInt(value);
    this.setAttribute('data-raw-value', numValue);
    this.value = formatNumberWithCommas(numValue);

    const minBid = currentPrice + minIncrement;
    if (numValue && numValue < minBid) {
      this.setCustomValidity('Giá đấu phải ít nhất ' + formatNumberWithCommas(minBid) + ' VND');
    } else {
      this.setCustomValidity('');
    }
  });

  // Handle confirmation checkbox for bid
  const confirmBidCheckbox = document.getElementById('confirmBidCheckbox');
  const submitBidBtn = document.getElementById('submitBidBtn');

  if (confirmBidCheckbox && submitBidBtn) {
    confirmBidCheckbox.addEventListener('change', function () {
      submitBidBtn.disabled = !this.checked;
      submitBidBtn.style.opacity = this.checked ? '1' : '0.6';
    });

    // Reset checkbox when modal is closed
    bidModalEl.addEventListener('hidden.bs.modal', function () {
      confirmBidCheckbox.checked = false;
      submitBidBtn.disabled = true;
      submitBidBtn.style.opacity = '0.6';
    });
  }

  // Handle bid form submission
  document.getElementById('bidForm')?.addEventListener('submit', function () {
    const bidInput = document.getElementById('bidAmount');
    const rawValue = bidInput.getAttribute('data-raw-value');

    const hiddenInput = document.getElementById('bidAmountRaw');
    if (hiddenInput) {
      hiddenInput.value = rawValue || removeCommas(bidInput.value);
    }

    const submitBtn = document.getElementById('submitBidBtn');
    submitBtn.disabled = true;
    submitBtn.classList.add('processing');
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Processing...';
  });
})();
