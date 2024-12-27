
const firebaseConfig = {
    apiKey: "AIzaSyDIFf7NksmB1taEdBfpNKEeyOmRPJEQSv8",
    authDomain: "aig-1b395.firebaseapp.com",
    databaseURL: "https://aig-1b395-default-rtdb.firebaseio.com",
    projectId: "aig-1b395",
    storageBucket: "aig-1b395.appspot.com",
    messagingSenderId: "425731172688",
    appId: "1:425731172688:web:c2a151a7beb32220d4e455"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

document.addEventListener("DOMContentLoaded", () => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData) {
        showHomeScreen(userData);
    }
});

auth.onAuthStateChanged(user => {
    if (user) {
        database.ref('users/' + user.uid).once('value').then(snapshot => {
            const userData = snapshot.val();
            if (userData) {
                localStorage.setItem("user", JSON.stringify(userData));
                showHomeScreen(userData);
            }
        });
    } else {
        showLogin();
    }
});

function loginUser() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    auth.signInWithEmailAndPassword(email, password).catch(error => alert(error.message));
}

function signUpUser() {
    const name = document.getElementById("name").value;
    const email = document.getElementById("signUpEmail").value;
    const phone = document.getElementById("phone").value;
    const invitationCode = document.getElementById("invitationCode").value;
    const password = document.getElementById("signUpPassword").value;

    if (phone.length < 10) {
        alert("Invalid phone number. Please provide a valid phone number.");
        return;
    }

  


    const phoneSuffix = phone.slice(-4); // Last 4 digits of the phone number

    auth.createUserWithEmailAndPassword(email, password).then(userCredential => {
        const userId = userCredential.user.uid;
        const userRef = database.ref('users/' + userId);

        // Generate a unique ID
        generateUniqueID(phoneSuffix).then(randomID => {
            userRef.set({
                name,
                email,
                phone,
                invitationCode,
                userID: randomID,
                balance: 0
            });

            if (invitationCode) {
                database.ref('users').orderByChild('userID').equalTo(parseInt(invitationCode)).once('value').then(snapshot => {
                    if (snapshot.exists()) {
                        const inviterKey = Object.keys(snapshot.val())[0];
                        const inviterRef = database.ref('users/' + inviterKey + '/balance');
                        inviterRef.transaction(balance => (balance || 0) + 10);
                    }
                });
            }

            alert("Sign-Up Successful!");
            showLogin();
        }).catch(error => alert("Error generating unique ID: " + error.message));
    }).catch(error => alert(error.message));
}

function generateUniqueID(phoneSuffix) {
    return new Promise((resolve, reject) => {
        const randomFourDigits = () => Math.floor(1000 + Math.random() * 9000); // Generate 4 random digits
        const checkIDUniqueness = id => database.ref('users').orderByChild('userID').equalTo(id).once('value');

        const tryGenerateID = () => {
            const randomID = parseInt(phoneSuffix + randomFourDigits());
            checkIDUniqueness(randomID).then(snapshot => {
                if (snapshot.exists()) {
                    // ID is not unique; retry
                    tryGenerateID();
                } else {
                    // ID is unique
                    resolve(randomID);
                }
            }).catch(reject);
        };

        tryGenerateID();
    });
}

function showHomeScreen(userData) {
    document.getElementById("userID").textContent = userData.userID;
    document.getElementById("name").textContent = userData.name;
    document.getElementById("balance").textContent = userData.balance || 0;
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("signUpForm").style.display = "none";
    document.getElementById("homeScreen").style.display = "block";
}

function showLogin() {
    localStorage.removeItem("user");
    document.getElementById("homeScreen").style.display = "none";
    document.getElementById("navbar").style.display = "none";
    document.getElementById("signUpForm").style.display = "none";
    document.getElementById("loginForm").style.display = "block";
}

function showSignUp() {
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("signUpForm").style.display = "block";
}


