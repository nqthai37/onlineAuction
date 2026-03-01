// ==================== REJECT / UNREJECT BIDDER ====================
// Dependencies: window.PRODUCT_CONFIG.id

(function () {
  const productId = window.PRODUCT_CONFIG.id;

  // Reject Bidder
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.reject-bidder-btn').forEach(btn => {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();

        const bidderId = this.getAttribute('data-bidder-id');
        const bidderName = this.getAttribute('data-bidder-name');
        const btnRef = this;

        Swal.fire({
          title: 'Reject Bidder?',
          html: `Are you sure you want to reject bidder <strong>"${bidderName}"</strong>?<br><br>This bidder will not be able to bid on this product anymore.`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#dc3545',
          cancelButtonColor: '#6c757d',
          confirmButtonText: 'Yes, reject',
          cancelButtonText: 'Cancel'
        }).then((result) => {
          if (result.isConfirmed) {
            btnRef.disabled = true;
            btnRef.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';

            fetch('/products/reject-bidder', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ productId, bidderId })
            })
              .then(response => response.json())
              .then(data => {
                if (data.success) {
                  Swal.fire({
                    title: 'Rejected!',
                    text: 'The bidder has been rejected successfully.',
                    icon: 'success',
                    confirmButtonColor: '#72AEC8'
                  }).then(() => window.location.reload());
                } else {
                  Swal.fire({
                    title: 'Error!',
                    text: data.message || 'Unable to reject bidder.',
                    icon: 'error',
                    confirmButtonColor: '#72AEC8'
                  });
                  btnRef.disabled = false;
                  btnRef.innerHTML = '<i class="bi bi-x-circle"></i>';
                }
              })
              .catch(error => {
                console.error('Error:', error);
                Swal.fire({
                  title: 'Error!',
                  text: 'An error occurred while rejecting the bidder.',
                  icon: 'error',
                  confirmButtonColor: '#72AEC8'
                });
                btnRef.disabled = false;
                btnRef.innerHTML = '<i class="bi bi-x-circle"></i>';
              });
          }
        });
      });
    });
  });

  // Unreject Bidder
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.unreject-bidder-btn').forEach(btn => {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();

        const bidderId = this.getAttribute('data-bidder-id');
        const bidderName = this.getAttribute('data-bidder-name');
        const btnRef = this;

        Swal.fire({
          title: 'Unban Bidder?',
          html: `Allow <strong>"${bidderName}"</strong> to bid on this product again?`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#28a745',
          cancelButtonColor: '#6c757d',
          confirmButtonText: 'Yes, allow',
          cancelButtonText: 'Cancel'
        }).then((result) => {
          if (result.isConfirmed) {
            btnRef.disabled = true;
            btnRef.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';

            fetch('/products/unreject-bidder', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ productId, bidderId })
            })
              .then(response => response.json())
              .then(data => {
                if (data.success) {
                  Swal.fire({
                    title: 'Unbanned!',
                    text: 'The bidder can now bid on this product again.',
                    icon: 'success',
                    confirmButtonColor: '#72AEC8'
                  }).then(() => window.location.reload());
                } else {
                  Swal.fire({
                    title: 'Error!',
                    text: data.message || 'Unable to unban bidder.',
                    icon: 'error',
                    confirmButtonColor: '#72AEC8'
                  });
                  btnRef.disabled = false;
                  btnRef.innerHTML = '<i class="bi bi-check-circle"></i>';
                }
              })
              .catch(error => {
                console.error('Error:', error);
                Swal.fire({
                  title: 'Error!',
                  text: 'An error occurred while unbanning the bidder.',
                  icon: 'error',
                  confirmButtonColor: '#72AEC8'
                });
                btnRef.disabled = false;
                btnRef.innerHTML = '<i class="bi bi-check-circle"></i> Unban';
              });
          }
        });
      });
    });
  });
})();
