// Firebase configuration object with credentials
const firebaseConfig = {
    apiKey: "AIzaSyDIFf7NksmB1taEdBfpNKEeyOmRPJEQSv8",
    authDomain: "aig-1b395.firebaseapp.com",
    databaseURL: "https://aig-1b395-default-rtdb.firebaseio.com",
    projectId: "aig-1b395",
    storageBucket: "aig-1b395.appspot.com",
    messagingSenderId: "425731172688",
    appId: "1:425731172688:web:c2a151a7beb32220d4e455"
};

// Initialize Firebase application
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Authentication and Database services
const auth = firebase.auth();
const database = firebase.database();

// Event listener to check localStorage for user data when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
    const userData = JSON.parse(localStorage.getItem("user")); // Retrieve user data from localStorage
    if (userData) {
        showHomeScreen(userData); // If user data exists, display the home screen
    }
});

// Listener to monitor authentication state changes (e.g., login or logout)
auth.onAuthStateChanged(user => {
    if (user) {
        // If user is logged in, fetch user data from Firebase Realtime Database
        database.ref('users/' + user.uid).once('value').then(snapshot => {
            const userData = snapshot.val();
            if (userData) {
                localStorage.setItem("user", JSON.stringify(userData)); // Save user data to localStorage
                showHomeScreen(userData); // Display the home screen with user data
            }
        });
    } else {
        // If no user is logged in, show the login screen
        showLogin();
    }
});

// Function to log in a user with email and password
function loginUser() {
    const email = document.getElementById("email").value; // Get email input
    const password = document.getElementById("password").value; // Get password input

    // Attempt to sign in the user using Firebase Authentication
    auth.signInWithEmailAndPassword(email, password)
        .catch(error => alert(error.message)); // Show error message if login fails
}

// Function to sign up a new user with required details
function signUpUser() {
    const name = document.getElementById("name").value; // User's name
    const email = document.getElementById("signUpEmail").value; // User's email
    const phone = document.getElementById("phone").value; // User's phone number
    const invitationCode = document.getElementById("invitationCode").value; // Optional invitation code
    const password = document.getElementById("signUpPassword").value; // User's password

    // Validate phone number length
    if (phone.length < 10) {
        alert("Invalid phone number. Please provide a valid phone number.");
        return;
    }

    const phoneSuffix = phone.slice(-4); // Extract the last 4 digits of the phone number

    // Attempt to create a new user in Firebase Authentication
    auth.createUserWithEmailAndPassword(email, password).then(userCredential => {
        const userId = userCredential.user.uid; // Firebase user ID
        const userRef = database.ref('users/' + userId); // Reference to user's data in Firebase Database

        // Generate a unique user ID based on phone number suffix
        generateUniqueID(phoneSuffix).then(randomID => {
            // Save the new user's data to Firebase Realtime Database
            const newUserData = {
                name,
                email,
                phone,
                invitationCode,
                userID: randomID, // Unique ID
                balance: 0 // Initial balance
            };

            userRef.set(newUserData);

            // If an invitation code is provided, reward the inviter and update their team
            if (invitationCode) {
                database.ref('users').orderByChild('userID').equalTo(parseInt(invitationCode)).once('value').then(snapshot => {
                    if (snapshot.exists()) {
                        const inviterKey = Object.keys(snapshot.val())[0]; // Get the inviter's database key
                        const inviterRef = database.ref('users/' + inviterKey);

                        // Update inviter's balance
                        inviterRef.child('balance').transaction(balance => (balance || 0) + 10);

                        // Add new user's name and userID to the inviter's team list
                        inviterRef.child('team').push({
                            name: name,
                            userID: randomID // Save only minimal data
                        });
                    }
                });
            }

            alert("Sign-Up Successful!");
            showLogin(); // Show login screen after successful sign-up
        }).catch(error => alert("Error generating unique ID: " + error.message));
    }).catch(error => alert(error.message));
}


// Function to generate a unique ID for the user
function generateUniqueID(phoneSuffix) {
    return new Promise((resolve, reject) => {
        const randomFourDigits = () => Math.floor(1000 + Math.random() * 9000); // Generate 4 random digits
        const checkIDUniqueness = id => database.ref('users').orderByChild('userID').equalTo(id).once('value'); // Check if ID is unique

        const tryGenerateID = () => {
            const randomID = parseInt(phoneSuffix + randomFourDigits()); // Combine phone suffix with random digits
            checkIDUniqueness(randomID).then(snapshot => {
                if (snapshot.exists()) {
                    // If ID is not unique, retry
                    tryGenerateID();
                } else {
                    // ID is unique
                    resolve(randomID);
                }
            }).catch(reject);
        };

        tryGenerateID(); // Start the ID generation process
    });
}

// Function to display the home screen with user data
function showHomeScreen(userData) {
    document.getElementById("userID").textContent = userData.userID; // Display user ID
    document.getElementById("name").textContent = userData.name; // Display user name
    document.getElementById("balance").textContent = userData.balance || 0; // Display user balance
    document.getElementById("loginForm").style.display = "none"; // Hide login form
    document.getElementById("signUpForm").style.display = "none"; // Hide sign-up form
    document.getElementById("homeScreen").style.display = "block"; // Show home screen
}

// Function to show the login screen
function showLogin() {
    localStorage.removeItem("user"); // Clear user data from localStorage
    document.getElementById("homeScreen").style.display = "none"; // Hide home screen
    document.getElementById("navbar").style.display = "none"; // Hide navigation bar
    document.getElementById("signUpForm").style.display = "none"; // Hide sign-up form
    document.getElementById("loginForm").style.display = "block"; // Show login form
}

// Function to show the sign-up screen
function showSignUp() {
    document.getElementById("loginForm").style.display = "none"; // Hide login form
    document.getElementById("signUpForm").style.display = "block"; // Show sign-up form
}
