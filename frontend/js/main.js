// Agent 3 & 4: Master JS logic for fetching data from Node.js backend
const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Reusable fetch function to populate tables
 * @param {string} endpoint - API endpoint (e.g. 'players')
 * @param {string} targetTbodyId - The ID of the tbody to insert rows into
 * @param {function} rowTemplateCallback - Function that returns HTML string for a row
 */
async function fetchData(endpoint, targetTbodyId, rowTemplateCallback) {
    const tbody = document.getElementById(targetTbodyId);

    try {
        const response = await fetch(`${API_BASE_URL}/${endpoint}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="10" style="text-align:center;">No data available in database.</td></tr>`;
            return;
        }

        let htmlContent = '';
        data.forEach((item, index) => {
            htmlContent += rowTemplateCallback(item, index);
        });

        tbody.innerHTML = htmlContent;

    } catch (error) {
        console.error('Error fetching data:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="10" style="text-align:center; color: #ef4444;">
                    Error connecting to Database. <br>
                    Make sure MySQL is running, the database is imported, and Node.js server (port 3000) is started.
                </td>
            </tr>
        `;
    }
}
