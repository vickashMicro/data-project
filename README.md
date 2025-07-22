# Micronet Data Processing System

A full-stack system built with **Flask** (Python) for the backend and **React (Vite)** for the frontend.  
It processes member registration files, contribution pay files, merges them by employer, validates data, and generates detailed reports.

---

## 📌 Features

✅ Admin & User login with JWT  
✅ Forgot / Reset Password via email  
✅ Upload fixed-width text files  
✅ Parse, merge, and save employer data to MySQL  
✅ Dynamic per-employer tables  
✅ Mismatch & volume reports (Excel/PDF)  
✅ User activity tracking  
✅ Modern React frontend with reusable components

---

## 📂 Project Structure

Micronet-Data-System/
├── Backend/
│ ├── app.py # Main Flask app
│ ├── requirements.txt # Python dependencies
│ ├── .env # Environment config
│ ├── uploads/ # Uploaded files folder
├── Frontend/
│ ├── data-app/
│ │ ├── src/ # React source code
│ │ ├── package.json # Node dependencies
│ │ ├── vite.config.js
├── README.md # This file


---

## ⚙️ Backend Setup

> ℹ️ **Virtual environment is optional.** If you want isolation, use it.

1️⃣ **Clone & enter backend folder**
```bash
cd Backend

2️⃣ (Optional) Create & activate venv
# Create virtual environment (once)
python -m venv venv

# Activate
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

3️⃣ Install Python dependencies

pip install -r requirements.txt

4️⃣ Configure environment variables

Create .env:

SECRET_KEY=YOUR_SECRET_KEY
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=micronetdata
EMAIL_SENDER=your_email@gmail.com
EMAIL_PASSWORD=your_email_app_password

5️⃣ Start Flask app
python app.py



🗄️ Database Setup
Make sure MySQL is running.

Create a database:

sql

CREATE DATABASE micronetdata;
Tables will be created dynamically as you process files.


| Method | Endpoint                   | Description                    |
| ------ | -------------------------- | ------------------------------ |
| POST   | `/admin-login`             | Admin login                    |
| POST   | `/user-login`              | User login                     |
| POST   | `/create-user`             | Create new user (admin only)   |
| POST   | `/forgot-password`         | Send password reset email      |
| POST   | `/reset-password`          | Reset password with token      |
| POST   | `/upload`                  | Upload employer/member files   |
| POST   | `/create-merged-sheet`     | Merge emp + member files       |
| POST   | `/save-format-one`         | Save Format One (C-file) data  |
| POST   | `/save-format-two`         | Save Format Two (M-file) data  |
| GET    | `/get-mismatches`          | List mismatch data             |
| GET    | `/download-mismatch-pdf`   | Download mismatch report (PDF) |
| GET    | `/download-mismatch-excel` | Download mismatch (Excel)      |
| GET    | `/download-volume-pdf`     | Download volume report (PDF)   |
| GET    | `/download-volume-excel`   | Download volume report (Excel) |


📈 Key Screens
Admin Dashboard: User stats, uploads, reports.

User Home: Upload files, check processed sheets.

Reports: Mismatch reports & volume statistics.

Reset Password: Secure email link for password change.

