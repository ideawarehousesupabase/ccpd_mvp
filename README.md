# CCPD MVP

CCPD (Customer Complaint Pattern Detector) – Prototype Development Prompt

Build a modern, responsive frontend prototype for Customer Complaint Pattern Detector (CCPD), strictly following the business plan. This is NOT the full production system. The goal is to demonstrate the product workflow using mock data while keeping the implementation simple and avoiding unnecessary complexity.

General Requirements
Build using a modern React stack (React + TypeScript + Vite).
Use clean, professional UI with a SaaS dashboard appearance.
Use responsive design for desktop, tablet and mobile.
Use reusable components throughout the project.
Use mock/static JSON data for every feature except authentication.
Do not implement any AI, machine learning, NLP or backend analytics.
Focus only on demonstrating the product workflow described in the business plan.
Firebase Requirements

Use Firebase only as a database for authentication CRUD operations.

Do NOT use Firebase Authentication.

Do NOT use:

Firebase Authentication
Google Sign In
OAuth
Firebase Storage
Firebase Functions
Firebase Hosting
Firebase Analytics
Any other Firebase feature

Only use Firestore database.

Firebase Configuration

Create a .env file.

Store the Firebase configuration inside environment variables.

Example:

VITE_FIREBASE_API_KEY=@secret:GOOGLE_API_KEY 
VITE_FIREBASE_AUTH_DOMAIN=echoforge-1ee43.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=echoforge-1ee43
VITE_FIREBASE_STORAGE_BUCKET=echoforge-1ee43.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=338077760916
VITE_FIREBASE_APP_ID=1:338077760916:web:13fb7af57d41c7fa206381
VITE_FIREBASE_MEASUREMENT_ID=G-PGBD2LRKN7

Do not hardcode Firebase credentials anywhere in the project.

Read every value from the .env file.

Example:

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};
Git Ignore

Create a .gitignore file.

Ensure it includes:

node_modules
dist
.env
.env.local

The .env file must never be pushed to GitHub.

Authentication Flow

Use Firestore as a simple CRUD database.

Create a collection:

users

Each document should contain:

name
businessName
industry
email
password
createdAt
Sign Up

When a user signs up:

Validate fields
Check whether email already exists
If not, create a new document inside Firestore
Redirect user to Login
Login

When user logs in:

Read users collection
Compare entered email and password with stored values
If matched:
Login successfully
Store login state locally
Redirect to Dashboard
Otherwise:
Show invalid credentials

This is only a basic CRUD authentication flow.

Do not use JWT.

Do not use sessions.

Do not use Firebase Authentication.

Application Pages
1. Landing Page

Create a professional SaaS landing page.

Include:

Hero section
Product overview
Key benefits
How CCPD works
Industries served
Call-to-action buttons
Login
Sign Up
2. Login

Fields:

Email
Password

Buttons:

Login
Go to Register
3. Register

Fields:

Full Name
Business Name
Industry
Email
Password
Confirm Password

Submit stores data in Firestore.

Dashboard

After login, redirect users to Dashboard.

Dashboard should contain:

Top KPI Cards

Total Complaints
Active Issues
Complaint Reduction
Refund Impact

Charts (mock)

Complaint Trends
Complaint Categories
Operational Health

Sections

Recent Complaints
AI Recommendations
Recent Activity
Business Health Score

Everything uses mock data.

Sidebar Navigation

Include only:

Dashboard
Complaints
Root Cause Analysis
Recommendations
Action Tracker
Packaging Intelligence
Reports
Settings

No Admin panel.

No Partner portal.

No Billing.

Complaints Page

Display complaints in a table.

Columns:

Complaint ID
Customer
Complaint Category
Priority
Status
Source
Date

Actions:

View

Also include:

Upload Complaint button
Manual Entry button

Uploading should only simulate adding mock complaints.

No AI processing.

Complaint Details

Display:

Complaint Text
Complaint Category
Priority
Department
Root Cause
Suggested Action

Example:

Complaint:

My pizza arrived cold.

Category

Food Temperature

Priority

High

Department

Delivery

Possible Root Causes

Poor insulation
Long delivery distance
Peak hour delays

Suggested Actions

Use insulated packaging
Reduce delivery radius during peak hours

Everything is predefined mock data.

Root Cause Analysis

Display operational issue categories.

Examples:

Packaging Issues
Delivery Delays
Kitchen Bottlenecks
Supplier Quality
Staff Communication
Order Accuracy

Selecting one category should show:

Description
Frequency
Trend
Related complaints

Everything uses mock data.

Recommendations

Display recommendation cards.

Each card should include:

Problem
Recommendation
Priority
Expected Impact
Status

Example:

Problem

Cold Food

Recommendation

Switch to insulated packaging.

Expected Impact

Reduce complaints.

Status

Pending

Mock only.

Action Tracker

Allow users to simulate tracking corrective actions.

Columns:

Recommendation
Assigned To
Status
Implementation Date
Expected Impact

Status options:

Pending
In Progress
Completed

Updates are only simulated.

Packaging Intelligence

Create a dedicated page representing CCPD's packaging intelligence module.

Display packaging comparisons.

Examples:

Paper Box
Plastic Box
Eco Box
Insulated Box

Show mock metrics:

Leakage Resistance
Heat Retention
Delivery Durability
Customer Satisfaction
Sustainability
Cost Effectiveness

No calculations.

No AI.

Only visual presentation.

Reports

Create a reporting dashboard.

Include:

Complaint Trend
Top Complaint Categories
Refund Impact
Operational Performance
Branch Comparison

Charts should use mock data.

Include Export button.

Export functionality is not required.

Settings

Include:

Profile Information

Name
Business Name
Industry
Email

Security

Change Password UI

Account

Logout
Mock Data

Use static JSON data throughout the project.

Include approximately:

25 complaints
10 recommendations
6 root cause categories
4 packaging types
Dashboard KPI values
Charts
Reports

Do not connect any of these to Firebase.

UI Design

Create a clean, premium SaaS interface.

Use:

Modern dashboard layout
Professional typography
Rounded cards
Responsive tables
Clean charts
Professional icons
Smooth transitions
Light theme with a professional color palette suitable for a B2B analytics platform
Features to Exclude

Do NOT implement:

AI models
LLM integration
Machine Learning
Sentiment Analysis
Operational Failure Graph logic
Closed-loop learning engine
Google Reviews integration
Trustpilot integration
CRM integration
POS integration
Email notifications
Push notifications
Admin panel
Partner portal
Subscription management
Payment gateway
Multi-user collaboration
Real analytics processing
Real report generation
Backend APIs beyond the simple Firestore CRUD for authentication
Firebase Authentication
Firebase Storage
Firebase Functions
Expected User Flow
Landing Page

↓

Register

↓

Store user in Firestore

↓

Login

↓

Validate credentials from Firestore

↓

Dashboard

↓

Complaints

↓

Complaint Details

↓

Root Cause Analysis

↓

Recommendations

↓

Action Tracker

↓

Packaging Intelligence

↓

Reports

↓

Settings

↓

Logout

The final result should be a polished, frontend-only prototype that accurately demonstrates the CCPD business workflow described in the business plan, with Firestore used exclusively for basic CRUD-based login and registration, while all operational intelligence, analytics, dashboards, and reports are powered by mock data.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/76aaa03c-9c88-44dd-8b66-7dba48b3ae31).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
