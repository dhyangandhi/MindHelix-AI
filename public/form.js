console.log("FORM JS LOADED");


window.registerUser = async function () {

    const fullname =
        document.getElementById("fullname").value;

    const username =
        document.getElementById("username").value;

    const email =
        document.getElementById("email").value;

    const phone =
        document.getElementById("phone").value;

    const password =
        document.getElementById("password").value;

    const confirmPassword =
        document.getElementById("confirmPassword").value;


    if (password !== confirmPassword) {

        alert("Passwords do not match");

        return;
    }


    try {

        const response = await fetch("/register", {

            method: "POST",

            headers: {
                "Content-Type": "application/json",
            },

            body: JSON.stringify({
                fullname,
                username,
                email,
                phone,
                password,
            }),
        });


        const data = await response.json();

        alert(data.message);

        console.log(data);

    } catch (error) {

        console.log(error);

        alert("Registration failed");
    }
}