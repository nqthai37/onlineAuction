// ==================== BUY NOW FUNCTIONALITY ====================
// Dependencies: window.PRODUCT_CONFIG (isAuthenticated, signinUrl)

(function () {
  const config = window.PRODUCT_CONFIG;

  document.querySelector('.btn-buy-now')?.addEventListener('click', function () {
    if (!config.isAuthenticated) {
      window.location.href = config.signinUrl;
      return;
    }

    const productId = this.getAttribute('data-product-id');
    const buyNowPrice = parseFloat(this.getAttribute('data-buy-now-price'));
    const formattedPrice = buyNowPrice.toLocaleString('vi-VN');

    Swal.fire({
      title: '<strong>Confirm Buy Now Purchase</strong>',
      icon: 'warning',
      html: `
        <div style="text-align: left; padding: 10px;">
          <p class="mb-3"><strong>Are you sure you want to purchase this product now?</strong></p>
          <div class="alert alert-info" style="font-size: 0.95rem;">
            <i class="bi bi-info-circle-fill"></i> <strong>Important Information:</strong>
            <ul style="margin-top: 10px; margin-bottom: 0;">
              <li>Product will be purchased at <strong>${formattedPrice} VND</strong></li>
              <li>The auction will <strong>end immediately</strong></li>
              <li>Product status will change to <strong>pending payment</strong></li>
              <li>You must complete the payment process</li>
            </ul>
          </div>
          <div class="alert alert-warning" style="font-size: 0.9rem; margin-bottom: 0;">
            <i class="bi bi-exclamation-triangle-fill"></i> <strong>Warning:</strong> 
            If you do not complete payment, the seller may give you a <strong class="text-danger">negative rating</strong>, 
            which could affect your ability to bid in future auctions.
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'Cancel',
      width: '600px',
      buttonsStyling: false,
      customClass: {
        confirmButton: 'swal-btn-confirm',
        cancelButton: 'swal-btn-cancel',
        actions: 'd-flex justify-content-center gap-3'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Processing...',
          html: 'Please wait while we process your purchase.',
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading()
        });

        fetch('/products/buy-now', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId })
        })
          .then(response => response.json())
          .then(data => {
            if (data.success) {
              Swal.fire({
                icon: 'success',
                title: 'Success!',
                html: data.message,
                confirmButtonColor: '#72AEC8',
                confirmButtonText: 'Proceed to Payment'
              }).then(() => {
                if (data.redirectUrl) {
                  window.location.href = data.redirectUrl;
                } else {
                  window.location.reload();
                }
              });
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: data.message || 'Failed to purchase product',
                confirmButtonColor: '#72AEC8'
              });
            }
          })
          .catch(error => {
            console.error('Error:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'An error occurred. Please try again.',
              confirmButtonColor: '#72AEC8'
            });
          });
      }
    });
  });
})();
