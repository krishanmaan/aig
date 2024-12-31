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

// Firebase app initialize karte hain
firebase.initializeApp(firebaseConfig);

// Firebase Authentication aur Database services ko initialize karte hain
const auth = firebase.auth();
const database = firebase.database();

// Jab DOM poora load ho jaaye tab localStorage check karte hain user data ke liye
document.addEventListener("DOMContentLoaded", () => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData) {
        showHomeScreen(userData); // Agar user data milta hai toh home screen dikhate hain
    }
});

// Auth state change ko listen karte hain (login ya logout hone par)
auth.onAuthStateChanged(user => {
    if (user) {
        // Database se user ka data fetch karte hain
        database.ref('users/' + user.uid).once('value').then(snapshot => {
            const userData = snapshot.val();
            if (userData) {
                localStorage.setItem("user", JSON.stringify(userData)); // User data ko localStorage mein save karte hain
                showHomeScreen(userData); // Home screen dikhate hain
            } else {
                console.error("Koi user data nahi mila.");
            }
        }).catch(error => console.error("Error fetching user data:", error));
    } else {
        document.getElementById("loginForm").style.display = "block"; // Login form dikhate hain agar user login nahi hai
    }
});

// Function: User ko login karne ke liye
function loginUser() {
    const email = document.getElementById("email").value; // Email input lete hain
    const password = document.getElementById("password").value; // Password input lete hain

    // Firebase Authentication ka use karke user ko login karte hain
    auth.signInWithEmailAndPassword(email, password)
        .then(userCredential => {
            localStorage.setItem("user", JSON.stringify(userCredential.user)); // User data localStorage mein save karte hain
            window.location.href = "/home.html"; // Home page par redirect karte hain
            alert("login Successful ! ") 
        }).catch(err => alert(err.message)); // Error agar login fail ho
}

// Function: Naya user sign up karne ke liye
function signUpUser() {
    const name = document.getElementById("name").value; // User ka naam lete hain
    const email = document.getElementById("signUpEmail").value; // User ka email lete hain
    const phone = document.getElementById("phone").value; // Phone number lete hain
    const invitationCode = document.getElementById("invitationCode").value; // Invitation code (optional)
    const password = document.getElementById("signUpPassword").value; // Password lete hain

    // Phone number validate karte hain
    if (phone.length < 10) {
        alert("Invalid phone number. Sahi phone number dijiye.");
        return;
    }

    const phoneSuffix = phone.slice(-4); // Phone number ke last 4 digits nikalte hain

    // Firebase ka use karke user create karte hain
    auth.createUserWithEmailAndPassword(email, password).then(userCredential => {
        const userId = userCredential.user.uid; // Firebase user ID
        const userRef = database.ref('users/' + userId); // User ke data ka reference

        // Unique ID generate karte hain phone suffix se
        generateUniqueID(phoneSuffix).then(randomID => {
            // Naye user ka data Firebase Database mein save karte hain
            const newUserData = {
                name,
                email,
                phone,
                team: [],  // Team ko empty array se initialize kar rahe hain
                invitationCode,
                userID: randomID, // Unique ID
                balance: 0 // Initial balance
            };

            userRef.set(newUserData);

            // Agar invitation code hai toh inviter ka balance update karte hain aur team mein naye user ko add karte hain
            if (invitationCode) {
                database.ref('users').orderByChild('userID').equalTo(parseInt(invitationCode)).once('value').then(snapshot => {
                    if (snapshot.exists()) {
                        const inviterKey = Object.keys(snapshot.val())[0]; // Inviter ka database key nikalte hain
                        const inviterRef = database.ref('users/' + inviterKey);

                        // Inviter ka balance update karte hain
                        inviterRef.child('balance').transaction(balance => (balance || 0) + 10);

                        // Fetch inviter's team to add new user
                        inviterRef.child('team').once('value').then(teamSnapshot => {
                            let team = teamSnapshot.val() || []; // Agar team exist karti hai toh use fetch karenge, warna empty array

                            // Inviter ke team list mein naye user ka naam aur ID add karte hain
                            team.push({
                                name: name,
                                userID: randomID
                            });

                            // Updated team ko database me save karte hain
                            inviterRef.child('team').set(team);
                        }).catch(error => console.error("Error fetching inviter's team:", error));
                    }
                }).catch(error => console.error("Error fetching inviter:", error));
            }

            alert("Sign-Up Successful!"); // Signup success ka message dikhate hain

            localStorage.setItem("user", JSON.stringify(userCredential.user));
            window.location.href = "/home.html";

        }).catch(error => alert("Error generating unique ID: " + error.message));
    }).catch(error => alert(error.message));
}


// Function: Unique ID generate karne ke liye
function generateUniqueID(phoneSuffix) {
    return new Promise((resolve, reject) => {
        const randomFourDigits = () => Math.floor(1000 + Math.random() * 9000); // 4 random digits generate karte hain
        const checkIDUniqueness = id => database.ref('users').orderByChild('userID').equalTo(id).once('value'); // ID unique hai ya nahi check karte hain

        const tryGenerateID = () => {
            const randomID = parseInt(phoneSuffix + randomFourDigits()); // Phone suffix aur random digits combine karte hain
            checkIDUniqueness(randomID).then(snapshot => {
                if (snapshot.exists()) {
                    // Agar ID unique nahi hai toh retry karte hain
                    tryGenerateID();
                } else {
                    // Agar ID unique hai toh resolve karte hain
                    resolve(randomID);
                }
            }).catch(reject);
        };

        tryGenerateID(); // ID generation start karte hain
    });
}

// Function: Home screen par user ka data dikhane ke liye
function showHomeScreen(userData) {
    console.log("User data dikhaya jaa raha hai:", userData);
    document.getElementById("userID").textContent = userData.userID || "N/A"; // User ID dikhate hain
    document.getElementById("name").textContent = userData.name || "Guest"; // User name dikhate hain
    document.getElementById("balance").textContent = userData.balance !== undefined ? userData.balance : "0"; // Balance dikhate hain
}
