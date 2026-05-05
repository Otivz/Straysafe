STRAY-SAFE
Smart Stray Animal Reporting and Rescue System
System Planning Document
DETECT
VALIDATE
RESCUE
MONITOR
PROTECT


1.  System Overview
STRAY-SAFE is a web-based, role-based, AI-assisted reporting and rescue management system designed to improve the reporting, validation, rescue, and monitoring of stray animals within communities.

The system connects citizens, subdivision leaders, barangay staff, and administrators in one coordinated rescue workflow supported by mapping, analytics, and artificial intelligence.

Core Framework

📋
Report
✅
Validate
🚑
Rescue
📊
Monitor


2.  User Roles and Functionalities

A.  Citizen (Reporter)
Citizens serve as the primary reporting source of stray animal incidents.

Citizen — Reporter
Primary source for stray animal incident reports
Features
• Submit stray animal reports with image, GPS, and description
• View and track report status in real time
• Receive notifications and updates
• Choose Public or Private report visibility
• View report location on interactive map
• Contribute to community heatmap data
• Comment section with subdivision leaders and barangay staff
Actions / Status
→ Submitted
→ Under Validation
→ Escalated to Barangay
→ Rescue In Progress
→ Picked Up
→ Resolved


B.  Subdivision Leader (Validation Layer)
Subdivision leaders serve as the validation and filtering layer before reports reach barangay authorities.

Subdivision Leader — Validation Layer
Filters and validates reports before escalation
Features
• Review incoming reports from citizens
• Detect and filter fake or duplicate reports
• Validate legitimacy and verify submitted location
• Monitor reports within assigned subdivision
• Notify citizens once action is initiated
Actions / Status
→ Approve
→ Reject
→ Escalate
→ Request Clarification


C.  Barangay Staff (Action Layer)
Barangay staff handle rescue operations and case management.

Barangay Staff — Action Layer
Manages rescue operations and case lifecycle
Features
• Receive validated rescue requests
• Approve or reject rescue operations
• Generate rescue request and endorsement letters
• Dispatch response team to the field
• Perform field rescue and animal pickup
• Update rescue case status and notify stakeholders
• Provide real-time animal status and location updates using image or video evidence
Actions / Status
→ Pending
→ Approved
→ Team Dispatched
→ Picked Up
→ Under Observation
→ Impounded
→ Resolved / Released


D.  Admin (System Controller)
Admin oversees the entire system, ensuring operational integrity and data accuracy.

Admin — System Controller
Full system oversight, configuration, and management
Features
• Manage users with Role-Based Access Control (RBAC)
• Add, edit, and deactivate accounts
• Monitor all reports and rescue cases system-wide
• View heatmaps and analytics dashboards
• Configure system settings and parameters
• Monitor barangay and subdivision performance
• Access audit logs and complete records




3.  AI-Assisted Features

3.1
Animal TypeIdentification
Detects: Dog / Cat
3.2
ConditionDetection
Injured / Sick / Normal
3.3
AutomaticPrioritization
High / Medium / Regular
3.4
DecisionSupport
Prioritize, identify, accelerate


Priority Levels

HIGH PRIORITY
Injured animal
MEDIUM PRIORITY
Weak or sick animal
REGULAR PRIORITY
Normal condition


4.  System Workflow
The following step-by-step process describes how a stray animal incident moves through the STRAY-SAFE system from initial report to full resolution.

Step 01  Citizen submits report with image, GPS location, and description
Step 02  Report stored in database and assigned a tracking ID
Step 03  AI module analyzes image — identifies animal type, condition, and assigns priority
Step 04  Subdivision leader reviews and validates the report
Step 05  Validated report forwarded to barangay staff
Step 06  Barangay approves the case and dispatches a response team
Step 07  Response team performs field rescue and animal pickup
Step 08  Barangay staff provides real-time status and location updates with image/video evidence
Step 09  Case status updated to Picked Up / Resolved
Step 10  Notifications sent to all stakeholders
Step 11  Heatmaps and analytics dashboards updated automatically


5.  Core System Modules

A  Reporting Module
• Report submission with GPS and image capture
• Category tagging and Public/Private option
• Comment section and real-time map reporting
B  Validation Module
• Report verification and duplicate detection
• Fake report filtering
• Escalation workflow management
C  Rescue Management Module
• Rescue approval and dispatch management
• Case lifecycle tracking
• Real-time status updates with image/video evidence and location tracking
• Rescue documentation and records
D  AI-Assisted Module
• Animal classification (dog/cat)
• Condition detection
• Automatic priority scoring
E  Monitoring & Dashboard Module
• Interactive map visualization
• Heatmaps for stray density
• Analytics charts and hotspot monitoring
F  Notification Module
• Status updates and new report alerts
• Priority alerts for urgent cases
• Rescue and pickup notifications
G  User Management Module
• Role-Based Access Control (RBAC)
• Account administration and role assignment
H  History & Records Module
• Incident logs and rescue history
• Case tracking records and audit trails


6.  Technology Stack

Layer
Technology
Handles
Frontend
React (Vite)
User dashboards, forms, maps, notifications, interactive UI
Backend
FastAPI
APIs, business logic, authentication, workflow processing
Database
MySQL
Users, reports, AI results, rescue records, notifications, analytics
AI Module
TensorFlow.js
Animal image analysis, condition detection, priority scoring
Mapping
Google Maps Platform
Map pinning, heatmaps, location services
Geolocation
Geolocation API
Precise GPS capture for report submissions


7.  UI Color Palette

Swatch
Name
Usage
#F97316
Burnt Orange
Primary — Rescue, urgency, warmth
#FACC15
Soft Amber
Primary — Hope, positivity
#86EFAC
Sage Green
Secondary — Care, healing
#FAFAF9
Off White
Secondary — Clean interface background
#EF4444
Soft Red
Alert — Urgent or injured animal reports


8.  Key Innovations

01  Multi-layer report validation through subdivision leaders ensures accuracy before barangay action
02  AI-assisted animal detection and condition-based prioritization speeds up rescue response
03  Heatmap-based stray monitoring helps authorities identify high-density problem areas
04  Community reporting with Public/Private options protects privacy while enabling broad coverage
05  Real-time rescue workflow with full case lifecycle tracking from report to resolution
06  Decision support for local authorities reduces response time and improves outcomes





System Framework
DETECT
VALIDATE
RESCUE
MONITOR
PROTECT


