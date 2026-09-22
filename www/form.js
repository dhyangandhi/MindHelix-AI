console.log("FORM JS LOADED");

window.registerUser = async function () {
    const fullname = document.getElementById("fullname") ? document.getElementById("fullname").value.trim() : "";
    const username = document.getElementById("username") ? document.getElementById("username").value.trim() : "";
    const email = document.getElementById("email") ? document.getElementById("email").value.trim() : "";
    const phoneElem = document.getElementById("phone") || document.getElementById("mobileNumber");
    const phone = phoneElem ? phoneElem.value.trim() : "";
    const password = document.getElementById("password") ? document.getElementById("password").value : "";
    const confirmPassword = document.getElementById("confirmPassword") ? document.getElementById("confirmPassword").value : "";
    const regBtn = document.getElementById("registerBtn") || document.querySelector("#registerForm button[type='submit']") || document.querySelector("#registerForm button.btn");

    if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
    }

    if (!fullname || !username || !email || !phone || !password) {
        alert("All fields are required");
        return;
    }

    const originalHtml = regBtn ? regBtn.innerHTML : "Register";
    if (regBtn) {
        regBtn.disabled = true;
        regBtn.style.opacity = "0.8";
        regBtn.style.cursor = "wait";
        regBtn.innerHTML = "<i class='bx bx-loader-alt bx-spin' style='font-size: 18px; margin-right: 6px; vertical-align: middle;'></i> Registering...";
    }

    try {
        const response = await fetch("/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fullname, username, email, phone, password })
        });

        let data;
        const text = await response.text();
        try {
            data = JSON.parse(text);
        } catch (e) {
            throw new Error(text || `Server error (${response.status})`);
        }

        if (data.success) {
            if (regBtn) regBtn.innerHTML = "<i class='bx bx-check' style='font-size: 20px; margin-right: 6px; vertical-align: middle;'></i> Success!";
            alert("Registration Successful! Redirecting to login...");
            window.location.replace("login.html");
        } else {
            alert(data.error || "Registration failed");
            if (regBtn) {
                regBtn.disabled = false;
                regBtn.style.opacity = "1";
                regBtn.style.cursor = "pointer";
                regBtn.innerHTML = originalHtml;
            }
        }
    } catch (error) {
        console.error("Register error:", error);
        alert("Registration failed. Please check your connection and try again.");
        if (regBtn) {
            regBtn.disabled = false;
            regBtn.style.opacity = "1";
            regBtn.style.cursor = "pointer";
            regBtn.innerHTML = originalHtml;
        }
    }
};