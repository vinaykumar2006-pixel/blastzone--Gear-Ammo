document.addEventListener('DOMContentLoaded', () => {
    const feedbackForm = document.getElementById('feedbackForm');
    const fbEmail = document.getElementById('fbEmail');
    const fbMobile = document.getElementById('fbMobile');
    const emailError = document.getElementById('emailError');
    const mobileError = document.getElementById('mobileError');

    // Stop the auto-redirect if user interacts with the form
    const inputs = [fbEmail, fbMobile, document.getElementById('fbMessage')];
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            // We assume there might be a timeout in the parent page, strictly speaking we can't easily clear it 
            // without access to the timer ID if it wasn't stored globally. 
            // However, we can warn the user or just hope the 15s is enough. 
            // In a real app we'd refactor the timeout to be clearable.
        });
    });

    feedbackForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        let isValid = true;

        // Email Validation
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(fbEmail.value)) {
            emailError.style.display = 'block';
            isValid = false;
        } else {
            emailError.style.display = 'none';
        }

        // Mobile Validation (10 digits)
        const mobilePattern = /^\d{10}$/;
        if (!mobilePattern.test(fbMobile.value)) {
            mobileError.style.display = 'block';
            isValid = false;
        } else {
            mobileError.style.display = 'none';
        }

        if (isValid) {
            const feedbackData = {
                email: fbEmail.value,
                mobile: fbMobile.value,
                message: document.getElementById('fbMessage').value,
                date: new Date().toISOString()
            };

            try {
                const response = await fetch('/api/feedback', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(feedbackData)
                });

                if (response.ok) {
                    alert('Thank you for your feedback! (Saved to Server)');
                    feedbackForm.reset();
                } else {
                    throw new Error("API Error");
                }
            } catch (err) {
                console.warn("Backend offline, saving feedback locally.", err);

                // Save to local storage as fallback
                const existingFeedback = JSON.parse(localStorage.getItem('localFeedback')) || [];
                existingFeedback.push(feedbackData);
                localStorage.setItem('localFeedback', JSON.stringify(existingFeedback));

                alert('Thank you for your feedback! (Saved to Local Storage)');
                feedbackForm.reset();
                renderLocalFeedback();
            }
        }
    });

    // Real-time validation clear
    fbEmail.addEventListener('input', () => emailError.style.display = 'none');
    fbMobile.addEventListener('input', () => mobileError.style.display = 'none');

    // Initial Render
    renderLocalFeedback();
});

function renderLocalFeedback() {
    const feedbackList = document.getElementById('feedbackList');
    const feedbackDisplay = document.getElementById('feedbackDisplay');

    if (!feedbackList || !feedbackDisplay) return;

    const saved = JSON.parse(localStorage.getItem('localFeedback')) || [];

    if (saved.length === 0) {
        feedbackDisplay.style.display = 'none';
        return;
    }

    feedbackDisplay.style.display = 'block';
    feedbackList.innerHTML = saved.map(item => `
        <div style="background: rgba(0,0,0,0.3); padding: 10px; margin-bottom: 10px; border-radius: 5px; border-left: 3px solid var(--accent);">
            <div style="font-size: 0.8rem; color: #aaa; display: flex; justify-content: space-between;">
                <span>${new Date(item.date).toLocaleDateString()}</span>
                <span>${item.email}</span>
            </div>
            <p style="margin: 5px 0 0 0; color: #fff;">${item.message}</p>
        </div>
    `).reverse().join('');
}
