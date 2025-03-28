import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBw9JQhm3bjSn8uu2q0OQfYMH5T_jJiT0A",
    authDomain: "dub21-c4bd6.firebaseapp.com",
    databaseURL: "https://dub21-c4bd6-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "dub21-c4bd6",
    storageBucket: "dub21-c4bd6.appspot.com",
    messagingSenderId: "515778318217",
    appId: "1:515778318217:web:937a7293be912f5628db58",
    measurementId: "G-LPHPQNG58F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Global variable to store all fetched data
let allData = {};

// Function to parse the date string into a Date object
function parseDate(dateStr) {
    const [day, month, year] = dateStr.split('/').map(num => parseInt(num, 10));
    return new Date(year, month - 1, day); // Month is 0-indexed in JavaScript
}

// Function to get and populate data for the selected location and date
async function getData() {
    const locationDropdown = document.getElementById("location-dropdown");
    const dateDropdown = document.getElementById("date-dropdown");
    
    // Fetch data whenever the location or date changes
    async function updateDataBasedOnSelection() {
        const selectedLocation = locationDropdown.value;

        // Set the correct Firestore reference based on the selected location
        let coffeeLogsRef;
        switch (selectedLocation) {
            case "dub19upstairs":
                coffeeLogsRef = doc(db, "coffee_logs", "coffee_logs");
                break;
            case "dub19downstairs":
                coffeeLogsRef = doc(db, "coffee_logs", "dub19downstairs_coffee_logs");
                break;
            case "dub21":
                coffeeLogsRef = doc(db, "coffee_logs", "dub21_coffee_logs");
                break;
            case "dub14upstairs":
                coffeeLogsRef = doc(db, "coffee_logs", "dub14upstairs_coffee_logs");
                break;
            case "dub14downstairs":
                coffeeLogsRef = doc(db, "coffee_logs", "dub14downstairs_coffee_logs");
                break;
        }

        const docSnap = await getDoc(coffeeLogsRef);
        if (docSnap.exists()) {
            allData = docSnap.data().logs;  // Store data in the global variable

            // Sort the dates in descending order (most recent first)
            const sortedDates = Object.keys(allData)
                .map(date => ({ date, timestamp: parseDate(date).getTime() }))
                .sort((a, b) => b.timestamp - a.timestamp)
                .map(item => item.date);

            // Populate the date dropdown with sorted dates
            dateDropdown.innerHTML = ''; // Clear existing options
            sortedDates.forEach((date) => {
                const option = document.createElement("option");
                option.value = date;
                option.textContent = date;
                dateDropdown.appendChild(option);
            });

            // Display data for the first date by default
            if (sortedDates.length > 0) {
                const firstDate = sortedDates[0];
                displayData(allData[firstDate], firstDate, selectedLocation); // Pass selectedLocation here
            }
        } else {
            document.getElementById("data").innerHTML = "No data available!";
        }
    }

    // Event listener to update data when the location is changed
    locationDropdown.addEventListener("change", updateDataBasedOnSelection);

    // Event listener to update data when the date is changed
    dateDropdown.addEventListener("change", () => {
        const selectedDate = dateDropdown.value;
        const selectedLocation = locationDropdown.value;
        fetchDataForDate(selectedLocation, selectedDate);
    });

    // Trigger the location selection change to populate the date dropdown initially
    locationDropdown.dispatchEvent(new Event('change'));
}

// Function to fetch data for the selected date and location
async function fetchDataForDate(location, date) {
    let coffeeLogsRef;

    // Set the correct Firestore reference based on the selected location
    switch (location) {
        case "dub19upstairs":
            coffeeLogsRef = doc(db, "coffee_logs", "coffee_logs");
            break;
        case "dub19downstairs":
            coffeeLogsRef = doc(db, "coffee_logs", "dub19downstairs_coffee_logs");
            break;
        case "dub21":
            coffeeLogsRef = doc(db, "coffee_logs", "dub21_coffee_logs");
            break;
        case "dub14upstairs":
            coffeeLogsRef = doc(db, "coffee_logs", "dub14upstairs_coffee_logs");
            break;
        case "dub14downstairs":
            coffeeLogsRef = doc(db, "coffee_logs", "dub14downstairs_coffee_logs");
            break;
    }

    const docSnap = await getDoc(coffeeLogsRef);
    if (docSnap.exists()) {
        const allData = docSnap.data().logs;
        if (allData[date]) {
            displayData(allData[date], date, location);  // Pass location to displayData
        } else {
            document.getElementById("data").innerHTML = "No data available for this date.";
        }
    }
}

// Function to display data on the page
function displayData(data, date, location) {
    let totalCoffees = Object.values(data.coffeeCount).reduce((sum, value) => sum + value, 0);
    let totalMilk = Object.values(data.milkCount).reduce((sum, value) => sum + value, 0);
    let totalSyrups = Object.values(data.syrupCount).reduce((sum, value) => sum + value, 0);

    const locationNames = {
        dub19upstairs: "Dub19 Upstairs",
        dub19downstairs: "Dub19 Downstairs",
        dub21: "Dub21",
        dub14upstairs: "Dub14 Upstairs",
        dub14downstairs: "Dub14 Downstairs"
    };

    const friendlyLocationName = locationNames[location] || location;

    let dataHtml = `
        <div class="coffee-data-container">
            <h3 class="coffee-date-heading">Coffee Data for ${date} - Location: ${friendlyLocationName}</h3>
            <div class="data-section">
                <p class="total-amount"><strong>Total Coffees:</strong> ${totalCoffees}</p>
                <p class="data-title"><strong>Coffee Count:</strong></p>
                <div class="data-list">${formatData(data.coffeeCount)}</div>
            </div>
            <div class="data-section">
                <p class="total-amount"><strong>Total Milk:</strong> ${totalMilk}</p>
                <p class="data-title"><strong>Milk Count:</strong></p>
                <div class="data-list">${formatData(data.milkCount)}</div>
            </div>
            <div class="data-section">
                <p class="total-amount"><strong>Total Syrups:</strong> ${totalSyrups}</p>
                <p class="data-title"><strong>Syrup Count:</strong></p>
                <div class="data-list">${formatData(data.syrupCount)}</div>
            </div>
            <div class="data-section">
                <p class="data-title"><strong>Extra Count:</strong></p>
                <div class="data-list">${formatData(data.extraCount)}</div>
            </div>
        </div>
    `;

    document.getElementById("data").innerHTML = dataHtml;
}

// Function to format data for display
function formatData(countData) {
    if (Object.keys(countData).length === 0) {
        return "No additional items.";
    }

    return Object.keys(countData)
        .sort()  // Sort keys alphabetically
        .map(key => `${key}: ${countData[key]}`)
        .join('<br>');
}

// Initialize the page when it loads
window.onload = function () {
    getData();  // Fetch and display data initially
};
// Function to get the displayable "Last Updated" time
function getLastUpdatedTime() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Determine which "Last Updated" time to show
    if (currentHour >= 7 && currentHour < 8) {
        return "Last Updated: 7:15 AM";
    } else if (currentHour >= 8 && currentHour < 17) {
        return `Last Updated: ${currentHour}:${currentMinute < 10 ? "0" : ""}${currentMinute}`;
    } else {
        // After 17:15, show 17:15 PM until next day
        return "Last Updated: 17:15 PM (up until next day)";
    }
}

// Function to update the "Last Updated" display
function updateLastUpdated() {
    const lastUpdatedMessage = getLastUpdatedTime();
    const lastUpdatedElement = document.getElementById("last-updated");

    if (lastUpdatedElement) {
        lastUpdatedElement.textContent = lastUpdatedMessage;
    }

    // Update localStorage to keep track of the last updated time
    const now = new Date();
    const lastUpdated = now.toLocaleString();
    localStorage.setItem('lastUpdated', lastUpdated);
    console.log("Last updated time saved:", lastUpdated); // Check if this logs correctly
}

// Function to fetch data initially and then update "Last Updated"
async function fetchAndUpdateData() {
    await getData(); // Fetch the data
    updateLastUpdated(); // Update "Last Updated" after the data is fetched
}

// Function to display the refresh schedule message
function displayRefreshSchedule() {
    const refreshMessage = "The page will refresh every hour.";
    const refreshElement = document.getElementById("refresh-schedule");

    if (refreshElement) {
        refreshElement.textContent = refreshMessage;
    }
}

// Ensure the last updated time is set right away
window.onload = function () {
    fetchAndUpdateData(); // Fetch data and update last updated
    checkAndRefreshPage(); // Check if the page needs refreshing based on the scheduled time
    displayRefreshSchedule(); // Display the refresh schedule message
};
