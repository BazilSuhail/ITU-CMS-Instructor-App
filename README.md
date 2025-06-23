## ITU Instructor App - University Management System
This Instructor App is a role-specific module of the ITU University Management System that allows instructors to efficiently manage their assigned courses, student attendance, assessments, and grading tasks. This app is exclusively accessible to instructors and is designed for seamless academic management.

---

[![Open Source Love svg1](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](#)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat&label=Contributions&colorA=red&colorB=black	)](#)

## Project Overview

- Instructors can securely log in to the system using their unique credentials.
- Instructors can view a list of courses they are currently teaching.
- By selecting a course, instructors can see all enrolled students along with detailed student lists.
- A dedicated tab displays all courses taught by the instructor, each with options to manage attendance and marks.
- Instructors can manage attendance by:
  - Viewing all enrolled students against a selected date.
  - Marking students as present or absent.
  - Updating attendance records at any time.
- Instructors can manage assessments and grading by:
  - Creating assessments (e.g. quizzes, assignments, exams) for each course.
  - Defining and updating grading criteria.
  - Assigning, updating, and deleting marks for individual students.
  - Modifying and deleting assessments if needed.
  - Grading students based on the defined criteria.
- Instructors have access to their personal profile screen:
  - Displays instructor’s full profile information.
  - Allows easy viewing of instructor-specific details.

---

### 🤖 Tech Stack 
<a href="#"> 
<img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-%23F7DF1E.svg?&style=for-the-badge&logo=javascript&logoColor=black"/>
<img alt="React Native" src="https://img.shields.io/badge/React%20Native-%2320232a.svg?&style=for-the-badge&logo=react&logoColor=%2361DAFB"/>
<img alt="React Native Reanimated" src="https://img.shields.io/badge/React%20Native%20Reanimated-%23845EC2.svg?&style=for-the-badge&logo=react&logoColor=%23FFFFFF"/>
<img alt="NativeWind" src="https://img.shields.io/badge/NativeWind-%2306B6D4.svg?&style=for-the-badge&logo=tailwindcss&logoColor=white"/>
<img alt="Firebase Realtime Database" src="https://img.shields.io/badge/Firebase%20Database-%23039BE5.svg?&style=for-the-badge&logo=firebase&logoColor=white"/>
<img alt="Firebase" src="https://img.shields.io/badge/Firebase-%23039BE5.svg?&style=for-the-badge&logo=firebase&logoColor=white"/>
<img alt="Firebase Auth" src="https://img.shields.io/badge/Firebase%20Auth-%23FFCA28.svg?&style=for-the-badge&logo=firebase&logoColor=black"/>
</a>

---
 
#### Check out the latest demo of Project [ITU-Admin-Portal](https://entitysafe.netlify.app/pages/AppDetails/-O4tB8HAlHw2clk3cTlL). 

![App Screenshot](https://github.com/Kharbooza978/EntitySafe/blob/main/Instructor-App/instructor_app1.png)

---

## Run Locally

 Clone the project using following command
```bash
    git clone https://github.com/BazilSuhail/ITU-CMS-Instructor-App.git
```
Go to the project directory
```bash
    cd ITU-CMS-Instructor-App
```
Then **Run** this command in your terminal to install all required dependancies:
```bash
    npm install
```
In the project directory, you can run:
```bash
    npm expo start -c
``` 

Install **Expo GO** from playstore after scanning the QR code given interminal start the app.
Another option is to get Android Studio Installed and type **a** in terminal to open the app in android studio itself

---

## Features

#### Secure Login
- Only instructors can log in to the system.
- Role-based access ensures security and restricts functionalities to instructor-specific tasks.

#### Course Management
- Instructors can view all courses they are currently teaching.
- Clicking on a course displays the list of enrolled students.
- Instructors can see how many students are enrolled in each course.
- Provides detailed student information for each selected course.

#### Attendance Management
- Instructors can access an attendance tab for each course they are teaching.
- Can select a specific date to mark attendance.
- Can mark each student as present or absent.
- Can update attendance records at any time.
- Allows quick and easy attendance tracking for every class session.

#### Assessment and Grading Management
- Instructors can create new assessments for their courses (quizzes, assignments, exams, etc.).
- Can define and update grading criteria for each course.
- Can assign marks to individual students for each assessment.
- Can update or delete assigned marks if needed.
- Can update or delete created assessments.
- Can modify grading criteria anytime.
- Can grade students based on the defined grading scheme.
- Ensures flexible and accurate assessment management.

#### Profile Management
- Instructors can access their personal profile screen.
- Profile displays all relevant instructor information.
- Allows instructors to view their account details easily.
