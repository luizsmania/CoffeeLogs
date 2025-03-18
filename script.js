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

async function getData() {
    const locationDropdown = document.getElementById("location-dropdown");
    const dateDropdown = document.getElementById("date-dropdown");
    let coffeeLogsRef;

    // Listen for location selection change
    locationDropdown.addEventListener("change", async (event) => {
        const selectedLocation = event.target.value;

        // Determine which collection to fetch based on the location selected
        if (selectedLocation === "dub19upstairs") {
            coffeeLogsRef = doc(db, "coffee_logs", "coffee_logs");
        } else if (selectedLocation === "dub19downstairs") {
            coffeeLogsRef = doc(db, "coffee_logs", "dub19downstairs_coffee_logs");
        } else if (selectedLocation === "dub21") {
            coffeeLogsRef = doc(db, "coffee_logs", "dub21_coffee_logs");
        } else if (selectedLocation === "dub14upstairs") {
            coffeeLogsRef = doc(db, "coffee_logs", "dub14upstairs_coffee_logs");
        } else if (selectedLocation === "dub14downstairs") {
            coffeeLogsRef = doc(db, "coffee_logs", "dub14downstairs_coffee_logs");
        }

        const docSnap = await getDoc(coffeeLogsRef);

        if (docSnap.exists()) {
            allData = docSnap.data().logs;  // Store data in the global variable

            // Sort the dates in descending order (most recent first)
            const sortedDates = Object.keys(allData)
                    .map(date => ({ date, timestamp: parseDate(date).getTime() })) // Convert to timestamps
                    .sort((a, b) => b.timestamp - a.timestamp) // Sort by timestamp
                    .map(item => item.date); // Return to string format

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
                displayData(allData[firstDate], firstDate);
            }
        } else {
            document.getElementById("data").innerHTML = "No data available!";
        }
    });

    // Listen for date selection change
    dateDropdown.addEventListener("change", (event) => {
        const selectedDate = event.target.value;
        const selectedLocation = locationDropdown.value;

        // Fetch data based on the selected date and location
        fetchDataForDate(selectedLocation, selectedDate);
    });

    // Trigger the location selection change to populate the date dropdown initially
    locationDropdown.dispatchEvent(new Event('change'));
}

// Function to fetch data for the selected date and location
async function fetchDataForDate(location, date) {
    let coffeeLogsRef;

    if (location === "dub19upstairs") {
        coffeeLogsRef = doc(db, "coffee_logs", "coffee_logs");
    } else if (location === "dub19downstairs") {
        coffeeLogsRef = doc(db, "coffee_logs", "dub19downstairs_coffee_logs");
    } else if (location === "dub21") {
        coffeeLogsRef = doc(db, "coffee_logs", "dub21_coffee_logs");
    } else if (location === "dub14upstairs") {
        coffeeLogsRef = doc(db, "coffee_logs", "dub14upstairs_coffee_logs");
    } else if (location === "dub14downstairs") {
        coffeeLogsRef = doc(db, "coffee_logs", "dub14downstairs_coffee_logs");
    }


    const docSnap = await getDoc(coffeeLogsRef);
    
    if (docSnap.exists()) {
        
        const allData = docSnap.data().logs;
        
        if (allData[date]) {
            
            displayData(allData[date], date);
        } else {
            document.getElementById("data").innerHTML = "No data available for this date.";
        }
    }
}

// Function to display coffee data for a specific date
function displayData(data, date) {
    let dataHtml = `<h3>Coffee Data for ${date}</h3>`;

    dataHtml += `
        <p><strong>Coffee Count:</strong><br> ${formatData(data.coffeeCount)}</p>
        <p><strong>Milk Count:</strong><br> ${formatData(data.milkCount)}</p>
        <p><strong>Syrup Count:</strong><br> ${formatData(data.syrupCount)}</p>
        <p><strong>Extra Count:</strong><br> ${formatData(data.extraCount)}</p>
    `;
    document.getElementById("data").innerHTML = dataHtml;
}

// Function to format the data in a readable way
function formatData(countData) {
    if (Object.keys(countData).length === 0) {
        return "No additional items.";
    }

    return Object.keys(countData)
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

    // Prepare the CSV header and data rows
    const header = [`Location,${location}`, `Date,${date}`];
    const rows = [
        ["Coffee Count", formatDataForCSV(data.coffeeCount)],
        ["Milk Count", formatDataForCSV(data.milkCount)],
        ["Syrup Count", formatDataForCSV(data.syrupCount)],
        ["Extra Count", formatDataForCSV(data.extraCount)]
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

