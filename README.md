# Projects CRUD Dashboard

A modern, dual-database CRUD dashboard for managing projects. Switch seamlessly between MySQL and MongoDB with a beautiful, responsive UI featuring dark/light mode toggle.
<br/><br/>
System works locally (Docker.Desktop approach), Link to website: tiqc-internship-week3-guykoff-qjwi-h4r92glq4.vercel.app
## Features

- ✅ **Dual Database Support**: MySQL and MongoDB with the same API
- ✅ **Full CRUD Operations**: Create, Read, Update, Delete projects
- ✅ **Search & Filter**: Search by project name, filter by status
- ✅ **Dark/Light Mode**: Manual theme toggle with localStorage persistence
- ✅ **Real-time Validation**: Server-side input validation with helpful errors
- ✅ **Toast Notifications**: Success and error feedback
- ✅ **Responsive Design**: Mobile-first, works on all devices
- ✅ **Loading States**: Disabled buttons while saving, loading indicators

## Tech Stack

- **Frontend**: Next.js 16, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Databases**: MySQL 8 & MongoDB 7
- **UI Components**: shadcn/ui with Lucide icons
- **State Management**: React hooks with SWR-like patterns

## Quick Start
Download Docker.Desktop

AMD64 DockerDesktop - if you are running on Intel or AMD on Windows<br/>
ARM64 DockerDesktop - if you are running Windows on a ARM processor architecture
<br/><br/>
Check which Windows architecture you have installed on your device

Search About Your PC in your start menu then look for system type.<br/>
If it says x64-based processor, download the AMD6x version of the software.

### Prerequisites

- Node.js 18+
- Docker & Docker Compose (for databases)

### Start Databases

# MySQL
```
docker run -d --name mysql \
  -e MYSQL_ROOT_PASSWORD=root \
  -p 3306:3306 \
  mysql:8
```
# MongoDB
```
docker run -d --name mongo \
  -p 27017:27017 \
  mongo:7
```

### Create the Node.js app
```
npx create-next-app@latest databoard
```
<br/>
Import your completed UI from v0.app

### Make the git repository

```
git init
git add C:\Users\"host name"\databoard
git commit -m "Setup"
git branch -M main
git remote add origin https://github.com/achillekg1-rgb/TIQC-internship-week3-guykoff.git
git push -u origin main
```

### Setup Environment Variables

Create `.env.local`:

```
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=root
MYSQL_DATABASE=projects_db

MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=projects_db
```

### Install Dependencies & Run

```bash
npm install
npm run dev
```

Open http://localhost:3000

### Seed Database (Optional)

# For MySQL
```
npx ts-node scripts/seed-mysql.ts
```
# For MongoDB
```
npx ts-node scripts/seed-mongodb.ts
```

## Database Schema

### MySQL

**Table**: `projects`

```sql
CREATE TABLE projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  owner VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  tags JSON,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status_owner (status, owner),
  INDEX idx_created (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Indexes**:
- `idx_status_owner`: Compound index on (status, owner) for filtering and sorting
- `idx_created`: Index on createdAt for chronological sorting

### MongoDB

**Collection**: `projects`

**Sample Document**:
```json
{
  "_id": ObjectId("..."),
  "name": "Website Redesign",
  "owner": "Alice Johnson",
  "status": "active",
  "tags": ["design", "web", "frontend"],
  "createdAt": "2025-01-15T10:30:00.000Z",
  "updatedAt": "2025-01-15T10:30:00.000Z"
}
```

**Indexes**:
```json
{
  "compound": { "status": 1, "owner": 1 },
  "created": { "createdAt": -1 }
}
```

## API Routes

### Get Projects
- **GET** `/api/projects?db=mysql&search=name&status=active`
- Returns: Array of projects

### Get Single Project
- **GET** `/api/projects/[id]?db=mysql`
- Returns: Project object or 404

### Create Project
- **POST** `/api/projects?db=mysql`
- Body: \`{ name, owner, status, tags }\`
- Returns: Created project with ID

### Update Project
- **PUT** `/api/projects/[id]?db=mysql`
- Body: \`{ name, owner, status, tags }\`
- Returns: Updated project

### Delete Project
- **DELETE** `/api/projects/[id]?db=mysql`
- Returns: \`{ success: true }\`

## Project Data Model

- **id**: Auto-generated (MySQL) or ObjectId (MongoDB)
- **name**: Required, max 255 chars
- **owner**: Required, max 255 chars
- **status**: One of 'active', 'on-hold', 'completed'
- **tags**: Array of strings (e.g., ['design', 'web'])
- **createdAt**: ISO 8601 timestamp
- **updatedAt**: ISO 8601 timestamp

## Validation Rules

- Name and owner are required, non-empty strings
- Status must be one of: active, on-hold, completed
- Tags must be an array of non-empty strings
- Maximum name/owner length: 255 characters

## Seed Data

The application includes 5 sample projects across different statuses and owners. Run seed scripts to populate your databases.

## Database Connection Troubleshooting

### MySQL Connection Issues
- Ensure MySQL is running: \`docker ps | grep mysql\`
- Check credentials in .env.local
- Verify port 3306 is accessible

### MongoDB Connection Issues
- Ensure MongoDB is running: \`docker ps | grep mongo\`
- Check MONGODB_URI in .env.local
- Verify port 27017 is accessible

## Performance Notes

- Database queries use indexes for fast filtering
- Seed includes ≤5k records to avoid performance issues
- Connection pooling configured for MySQL
- MongoDB queries use efficient compound indexes

## Switching Databases

Click "MySQL" or "MongoDB" buttons in the top-left to switch between databases. All data is isolated per database.

## Dark/Light Mode

Click the sun/moon icon in the top-right to toggle theme. Three options:
- Light: Always light mode
- Dark: Always dark mode
- System: Follow system preference

Theme is saved to localStorage and persists between sessions.

## Troubleshooting

**Projects not showing?**
- Check database is running
- Run seed script to add sample data
- Check browser console for errors

**Save button disabled?**
- Wait for current request to complete
- Check browser console for validation errors
- Ensure all required fields are filled

**Theme not changing?**
- Clear localStorage and try again
- Check browser console for errors
- Ensure JavaScript is enabled

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/657cd896-32da-4437-9372-5fb2d0523c04" />

