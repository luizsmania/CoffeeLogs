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

// Fetch coffee data from Firestore
// Fetch coffee data from Firestore
// Global parseDate function
function parseDate(dateStr) {
    const [day, month, year] = dateStr.split('/').map(num => parseInt(num, 10));
    return new Date(year, month - 1, day); // Month is 0-indexed in JavaScript
}
let allData = {};  // Declare globally so it's accessible in the export function

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

// Function to format the data in a readable way
function formatData(countData) {
    if (Object.keys(countData).length === 0) {
        return "No additional items.";
    }

    return Object.keys(countData)
        .sort()  // Sort keys alphabetically
        .map(key => `${key}: ${countData[key]}`)
        .join('<br>');
}
// Function to format the data in a readable way for CSV
function formatDataForCSV(countData) {
    if (Object.keys(countData).length === 0) {
        return "No additional items.";
    }

    // Replace <br> with actual line breaks for CSV
    return Object.keys(countData)
        .map(key => `${key}: ${countData[key]}`)
        .join("\n"); // Use newline for CSV formatting
}

function exportDataToCSV() {
    const location = document.getElementById("location-dropdown").value;
    const date = document.getElementById("date-dropdown").value;
    const data = allData[date]; // Use the data from the selected date

    if (!data) {
        alert("No data available for export.");
        return;
    }

    // Function to sort keys alphabetically and format as CSV string
    function sortAndFormatData(obj, totalLabel) {
        const sortedEntries = Object.keys(obj).sort().map(key => `${key},${obj[key]}`);
        const totalCount = Object.values(obj).reduce((sum, count) => sum + count, 0);
        return [`${totalLabel},${totalCount}`, ...sortedEntries].join("\n");
    }

    // Prepare the CSV header
    const header = [`Location,${location}`, `Date,${date}`];

    const coffeeData = sortAndFormatData(data.coffeeCount, "Total Coffees");
    const milkData = sortAndFormatData(data.milkCount, "Total Milk");
    const syrupData = sortAndFormatData(data.syrupCount, "Total Syrups");
    const extraData = formatDataForCSV(data.extraCount);

    const rows = [
        ["Coffee Count", coffeeData],
        ["Milk Count", milkData],
        ["Syrup Count", syrupData],
        ["Extra Count", extraData]
    ];

    // Start building the CSV content
    let csvContent = "data:text/csv;charset=utf-8," 
                    + header.join("\n") + "\n\n"; // Adding a line break after header

    // Format the rows for Coffee Count, Milk Count, etc., with a break after each category
    rows.forEach(row => {
        csvContent += row[0] + "\n" + row[1] + "\n\n";  // Add line breaks after each section
    });

    // Create a download link and trigger download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${location}_${date}_coffee_logs.csv`);
    document.body.appendChild(link); // Required for Firefox
    link.click();
    document.body.removeChild(link); // Remove the link after download
}


// Add event listener for the export button
document.getElementById("export-button").addEventListener("click", exportDataToCSV);

// Call the function to fetch and display data initially
getData();
