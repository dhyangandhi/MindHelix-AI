console.log("FORM JS LOADED");

window.registerUser = async function () {

    // GET VALUES

    const fullname =
        document.getElementById(
            "fullname"
        ).value;

    const username =
        document.getElementById(
            "username"
        ).value;

    const email =
        document.getElementById(
            "email"
        ).value;

    const phone =
        document.getElementById(
            "phone"
        ).value;

    const password =
        document.getElementById(
            "password"
        ).value;

    const confirmPassword =
        document.getElementById(
            "confirmPassword"
        ).value;


    // PASSWORD CHECK

    if (password !== confirmPassword) {

        alert(
            "Passwords do not match"
        );

        return;
    }


    // EMPTY FIELD CHECK

    if (
        !fullname ||
        !username ||
        !email ||
        !phone ||
        !password
    ) {

        alert(
            "All fields are required"
        );

        return;
    }


    try {

        // SEND DATA

        const response =
            await fetch(
                "/register",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify({

                        fullname,
                        username,
                        email,
                        phone,
                        password,
                    }),
                }
            );


        const data =
            await response.json();

        console.log(data);


        // SUCCESS

        if (data.success) {

            alert(
                "Registration Successful"
            );

            // REDIRECT TO LOGIN
            window.location.href = "login.html";
        }

        // ERROR

        else {

            alert(data.error);
        }

    } catch (error) {

        console.log(error);

        alert(
            "Registration failed"
        );
    }
};