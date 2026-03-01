// ==================== SELLER RATINGS MODAL ====================
// No template dependencies — pure JS

function openSellerRatingsModal(sellerId, sellerName) {
  document.getElementById('sellerNameTitle').textContent = sellerName + "'s Ratings";

  const modal = new bootstrap.Modal(document.getElementById('sellerRatingsModal'));
  modal.show();

  document.getElementById('ratingsLoading').style.display = 'block';
  document.getElementById('ratingsError').style.display = 'none';
  document.getElementById('ratingsContent').style.display = 'none';

  fetch(`/products/api/seller-ratings/${sellerId}`)
    .then(response => {
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    })
    .then(data => {
      document.getElementById('ratingsLoading').style.display = 'none';
      document.getElementById('ratingsContent').style.display = 'block';

      const ratingPoint = data.rating_point || 0;
      const ratingPercentage = ratingPoint === 1 ? '100.00%' : (ratingPoint * 100).toFixed(2) + '%';
      document.getElementById('overallRating').textContent = ratingPercentage;
      document.getElementById('totalReviewsCount').textContent = data.totalReviews || 0;
      document.getElementById('positiveCount').textContent = data.positiveReviews || 0;
      document.getElementById('negativeCount').textContent = data.negativeReviews || 0;
      document.getElementById('totalReviewsText').textContent = `Based on ${data.totalReviews || 0} review(s)`;

      const reviewsList = document.getElementById('reviewsList');
      const emptyState = document.getElementById('emptyState');

      if (data.reviews && data.reviews.length > 0) {
        reviewsList.innerHTML = data.reviews.map(review => `
          <div class="card mb-3 border-0" style="background: ${review.rating === 1 ? 'rgba(40, 167, 69, 0.05)' : 'rgba(220, 53, 69, 0.05)'}; border-left: 4px solid ${review.rating === 1 ? '#28a745' : '#dc3545'} !important;">
            <div class="card-body">
              <div class="row align-items-start">
                <div class="col-md-3 mb-2 mb-md-0">
                  <div class="d-flex align-items-center">
                    <div class="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center me-2" style="width: 35px; height: 35px;">
                      <i class="bi bi-person-fill"></i>
                    </div>
                    <div>
                      <div class="fw-bold small">${review.reviewer_name}</div>
                      <small class="text-muted">${new Date(review.created_at).toLocaleDateString()}</small>
                    </div>
                  </div>
                </div>
                <div class="col-md-4 mb-2 mb-md-0">
                  <small class="text-muted d-block mb-1">Product</small>
                  <div class="fw-500 small">
                    <i class="bi bi-box-seam me-1"></i>${review.product_name}
                  </div>
                </div>
                <div class="col-md-2 mb-2 mb-md-0">
                  <span class="badge ${review.rating === 1 ? 'bg-success' : 'bg-danger'} px-2 py-1">
                    <i class="bi bi-hand-thumbs-${review.rating === 1 ? 'up' : 'down'}-fill me-1"></i>
                    ${review.rating === 1 ? 'Positive' : 'Negative'}
                  </span>
                </div>
                <div class="col-md-3">
                  ${review.comment ? `
                    <div class="bg-white p-2 rounded">
                      <small class="text-muted d-block mb-1">
                        <i class="bi bi-chat-left-quote-fill me-1"></i>Comment
                      </small>
                      <p class="mb-0 small">${review.comment}</p>
                    </div>
                  ` : '<small class="text-muted fst-italic">No comment</small>'}
                </div>
              </div>
            </div>
          </div>
        `).join('');
        emptyState.style.display = 'none';
      } else {
        reviewsList.innerHTML = '';
        emptyState.style.display = 'block';
      }
    })
    .catch(error => {
      console.error('Error loading ratings:', error);
      document.getElementById('ratingsLoading').style.display = 'none';
      document.getElementById('ratingsError').style.display = 'block';
    });
}
