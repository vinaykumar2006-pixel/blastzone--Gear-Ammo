const title = document.getElementById('title');
const toggleText = document.getElementById('toggleText');
const mainBtn = document.getElementById('mainBtn');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');

let isSignup = false;

function toggleMode() {
    isSignup = !isSignup;
    if (isSignup) {
        title.textContent = "Sign Up";
        mainBtn.textContent = "Create Account";
        toggleText.innerHTML = "Already have an account? <a href='#' onclick='toggleMode()' style='color:#ff6a00'>Sign In</a>";
    } else {
        title.textContent = "Sign In";
        mainBtn.textContent = "Sign In";
        toggleText.innerHTML = "Don't have an account? <a href='#' onclick='toggleMode()' style='color:#ff6a00'>Sign Up</a>";
    }
}

mainBtn.addEventListener('click', () => {
    const email = emailInput.value;
    const pass = passwordInput.value;

    if (!email || !pass) {
        alert("Please fill in all fields");
        return;
    }

    if (isSignup) {
        // Mock signup
        alert("Account created! Signing you in...");
        window.location.href = "index.html";
    } else {
        // Mock login
        alert("Welcome back!");
        window.location.href = "index.html";
    }
});
