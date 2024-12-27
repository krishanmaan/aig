function fetchTeamData() {
    const userData = JSON.parse(localStorage.getItem("user")); // Get current user data
    if (!userData) {
        alert("Please log in first.");
        return;
    }

    const userId = userData.userID;

    // Fetch team data from Firebase
    database.ref('users').orderByChild('userID').equalTo(userId).once('value').then(snapshot => {
        if (snapshot.exists()) {
            const userKey = Object.keys(snapshot.val())[0]; // Get the user's database key
            const teamRef = database.ref('users/' + userKey + '/team');

            teamRef.once('value').then(teamSnapshot => {
                const teamData = teamSnapshot.val();

                // Display the team data on the page
                const teamList = document.getElementById("teamList"); // Assuming you have a UL or DIV with ID 'teamList'
                teamList.innerHTML = ""; // Clear existing content

                if (teamData) {
                    Object.values(teamData).forEach(member => {
                        const listItem = document.createElement("li");
                        listItem.textContent = `Name: ${member.name}, UserID: ${member.userID}`;
                        teamList.appendChild(listItem);
                    });
                } else {
                    teamList.textContent = "No team members yet.";
                }
            });
        }
    }).catch(error => alert("Error fetching team data: " + error.message));
}
