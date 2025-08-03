# How to Import Places to Firebase from CSV

### 🔄 Steps to follow each time:

1. Open your Google Sheet and ensure it only contains **new** places (no duplicates).
2. Download it as **CSV** (File → Download → Comma-separated values).
3. Save it as `places.csv` and replace the existing one in this folder.
4. Open terminal in the project folder and run:

node import-csv.cjs



### 🛠 Requirements

- Node.js installed
- `firebase-admin` installed via:
- A valid `serviceAccountKey.json` file present in the root folder

---

### 🧷 Note

- Make sure the CSV matches the column structure in the template.
- Do not commit `serviceAccountKey.json` to GitHub. Add it to `.gitignore`.

