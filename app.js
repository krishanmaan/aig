
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

    auth.createUserWithEmailAndPassword(email, password).then(userCredential => {
        const userId = userCredential.user.uid;
        const userRef = database.ref('users/' + userId);
        const randomID = Math.floor(10000000 + Math.random() * 90000000);

        userRef.set({
            name,
            email,
            phone,
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
    }).catch(error => alert(error.message));
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
    document.getElementById("signUpForm").style.display = "none";
    document.getElementById("loginForm").style.display = "block";
}

function showSignUp() {
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("signUpForm").style.display = "block";
}


