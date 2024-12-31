// Firebase configuration object
const firebaseConfig = {
    apiKey: "AIzaSyDIFf7NksmB1taEdBfpNKEeyOmRPJEQSv8",
    authDomain: "aig-1b395.firebaseapp.com",
    databaseURL: "https://aig-1b395-default-rtdb.firebaseio.com",
    projectId: "aig-1b395",
    storageBucket: "aig-1b395.appspot.com",
    messagingSenderId: "425731172688",
    appId: "1:425731172688:web:c2a151a7beb32220d4e455"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Function to sign up a user
function signUpUser() {
    const name = document.getElementById("name").value;
    const phone = document.getElementById("phone").value;
    const invitationCode = document.getElementById("invitationCode").value;
    const password = document.getElementById("signUpPassword").value;
    const confirmPassword = document.querySelectorAll("#signUpPassword")[1].value;
    const withdrawPassword = document.querySelectorAll("#signUpPassword")[2].value;

    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    if (!name || !phone || !password || !withdrawPassword) {
        alert("Please fill in all required fields.");
        return;
    }

    const userId = phone.replace(/\D/g, ""); // Use phone number as a unique ID

    // Save user data to Realtime Database
    database.ref("users/" + userId).set({
        name: name,
        phone: phone,
        invitationCode: invitationCode || "",
        password: password,
        withdrawPassword: withdrawPassword,
    })
    .then(() => {
        alert("Sign-up successful! You can now log in.");
        window.location.href = "./login.html";
    })
    .catch((error) => {
        console.error("Error signing up: ", error);
        alert("Error signing up. Please try again.");
    });
}

// Function to log in a user
function loginUser() {
    const phone = document.getElementById("loginPhone").value;
    const password = document.getElementById("loginPassword").value;

    if (!phone || !password) {
        alert("Please enter your phone number and password.");
        return;
    }

    const userId = phone.replace(/\D/g, "");

    // Fetch user data from Realtime Database
    database.ref("users/" + userId).once("value")
    .then((snapshot) => {
        if (!snapshot.exists()) {
            alert("User not found.");
            return;
        }

        const userData = snapshot.val();
        if (userData.password !== password) {
            alert("Incorrect password.");
            return;
        }

        alert("Login successful!");
        window.location.href = "/home.html";
        // Redirect or proceed to the user's dashboard
    })
    .catch((error) => {
        console.error("Error logging in: ", error);
        alert("Error logging in. Please try again.");
    });
}
