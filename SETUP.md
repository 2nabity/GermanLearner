# German Vocabulary Study App - GitHub Setup

## Push to GitHub Instructions

### Method 1: Using Git Commands

1. Create a new repository on GitHub.com
2. In your terminal, run these commands (replace YOUR_USERNAME and YOUR_REPO_NAME):

```bash
git init
git add .
git commit -m "Initial commit: German vocabulary study app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

### Method 2: Using GitHub Desktop
1. Download GitHub Desktop
2. Click "Add an Existing Repository from your Hard Drive"
3. Select this project folder
4. Click "Publish repository" to upload to GitHub

### Method 3: Manual Upload
1. Download all files as a ZIP
2. Create new repository on GitHub
3. Upload files through GitHub's web interface

## Project Structure

This is a full-stack German vocabulary learning application with:

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Express.js + TypeScript
- **Storage**: In-memory storage (can be upgraded to database)
- **Features**: 
  - Add German-English word pairs
  - Take 20-question vocabulary tests
  - Automatic retake if >3 answers wrong
  - Dashboard with statistics
  - Word management and search

## Running the App

```bash
npm install
npm run dev
```

The app will run on http://localhost:5000

## Key Files

- `client/src/` - React frontend
- `server/` - Express backend
- `shared/schema.ts` - Shared data types
- `package.json` - Dependencies and scripts