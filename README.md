# Student Learning Pattern Consistency Tool (SLPCT)

A robust, floating-layout web application designed to track student behavior, display analytical learning trends, and generate beautifully stylized PDF reports on-the-fly. This system provides three unique portal views tailored for Students, Teachers, and Administrators.

## Project Structure
- **/Frontend**: Contains the interactive HTML/CSS UI and frontend routing logic (`app.js`).
- **/Backend**: Node.js backend using Express to serve Mock Database APIs, handle PDF document uploads/parsing, and provide authentication routes.

## Features
- **Dynamic 3-Column Floating Dashboard**: Featuring seamless dark/light mode integration over an immersive background.
- **Role-Based Access**: Specialized data views and widgets for `student`, `teacher`, and `admin` roles.
- **Interactive Visualizations**: Includes timeline schedules, class performance line-graphs, and donut charts via Chart.js.
- **On-the-fly PDF Generation**: Creates stylized reports natively via jsPDF with auto-table integration. Document analysis supported using backend `pdf-parse`.

## Getting Started

### Prerequisites
- Node.js (v14 or higher)

### Installation
1. Clone the repository.
2. Navigate into the Backend directory:
   \`\`\`bash
   cd Backend
   npm install
   \`\`\`

### Running the Application
Spin up the development server which hosts both the API and the static frontend:
\`\`\`bash
npm start
\`\`\`
The application will be universally available at \`http://localhost:5000\`.

### Default Accounts
* **Student:** \`student1\` / \`password123\`
* **Teacher:** \`teacher1\` / \`password123\`
* **Admin:** \`admin\` / \`password123\`
