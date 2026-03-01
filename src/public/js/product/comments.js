// ==================== COMMENTS & REPLY FUNCTIONALITY ====================
// No template dependencies — pure JS

(function () {
  const SUBMIT_RE_ENABLE_DELAY_MS = 3000;

  // Comment form submission protection
  const commentForm = document.querySelector('.comment-form form');
  if (commentForm) {
    commentForm.addEventListener('submit', function (e) {
      const submitBtn = this.querySelector('button[type="submit"]');

      if (submitBtn.disabled) {
        e.preventDefault();
        return false;
      }

      submitBtn.disabled = true;
      const originalHTML = submitBtn.innerHTML;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Posting...';

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalHTML;
      }, SUBMIT_RE_ENABLE_DELAY_MS);
    });
  }

  // Reply buttons
  document.querySelectorAll('.reply-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const commentId = this.getAttribute('data-comment-id');
      const userName = this.getAttribute('data-user-name');
      const replyForm = document.getElementById(`reply-form-${commentId}`);
      const replyInput = replyForm.querySelector('.reply-input');

      if (userName && replyInput) {
        replyInput.innerHTML = `<span class="mention">@${userName}</span>&nbsp;`;
        replyInput.focus();
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(replyInput);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
      }

      replyForm.style.display = 'block';
      this.style.display = 'none';
    });
  });

  // Cancel reply buttons
  document.querySelectorAll('.cancel-reply').forEach(btn => {
    btn.addEventListener('click', function () {
      const commentId = this.getAttribute('data-comment-id');
      const replyForm = document.getElementById(`reply-form-${commentId}`);
      const replyBtn = document.querySelector(`.reply-btn[data-comment-id="${commentId}"]`);
      const replyInput = replyForm.querySelector('.reply-input');

      if (replyInput) {
        replyInput.innerHTML = '';
      }

      replyForm.style.display = 'none';
      replyBtn.style.display = 'inline-block';
    });
  });

  // Sync contenteditable to hidden input
  document.querySelectorAll('.reply-input').forEach(editor => {
    const form = editor.closest('form');
    if (form) {
      form.addEventListener('submit', function (e) {
        const submitBtn = form.querySelector('button[type="submit"]');

        if (submitBtn && submitBtn.disabled) {
          e.preventDefault();
          return false;
        }

        const hiddenInput = form.querySelector('.reply-content-hidden');
        if (hiddenInput) {
          hiddenInput.value = editor.textContent;
        }

        if (submitBtn) {
          submitBtn.disabled = true;
          const originalHTML = submitBtn.innerHTML;
          submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Sending...';

          setTimeout(() => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalHTML;
          }, SUBMIT_RE_ENABLE_DELAY_MS);
        }
      });
    }
  });
})();
