# StraySafe System: Roles, Modules & Features 🛡️🐾

This document outlines the capabilities, responsibilities, and future potential of the four primary roles within the StraySafe ecosystem.

---

## 1. Resident / Citizen (End User)
The primary reporting layer. Residents provide the raw data needed to identify stray animal hotspots.

### 📍 Current Features
*   **Incident Reporting:** Submit reports with location (via Map), media (photos/videos), animal type, condition, and priority levels.
*   **Geofence Validation:** Reports are strictly validated to ensure they originate within the subdivision boundary (e.g., Selera Homes).
*   **Real-time Tracking:** Follow the status of submitted reports through a visual progress tracker (Pending → Verified → Dispatched → Resolved).
*   **Profile Management:** Manage personal account details and reporting history.

### 🚀 Possible Future Features
*   **Community Awareness Feed:** A local feed showing recent sightings to alert neighbors of aggressive animals.
*   **Lost & Found Module:** A dedicated space for residents to post about missing pets vs. stray sightings.
*   **In-App Notifications:** Receive push alerts when a rescue team is dispatched to a nearby report.

---

## 2. Subdivision Leader (First Responders)
The validation layer. Leaders ensure that reports are legitimate before they reach government resources.

### 📍 Current Features
*   **Report Validation:** Review reports submitted by residents in their specific subdivision.
*   **Escalation Workflow:** Verify and forward critical reports to the Barangay for professional rescue intervention.
*   **Subdivision Dashboard:** View analytics and lists of all reported incidents within their jurisdiction.
*   **Endorsement Letters:** Attach official documentation to escalated reports.

### 🚀 Possible Future Features
*   **Resident Communication:** Direct messaging with the reporter to clarify location or animal behavior details.
*   **Volunteer Coordination:** Assign minor, non-dangerous tasks (like checking a location) to trusted subdivision volunteers.
*   **Hazard Alerts:** Broadcast safety alerts specifically to their subdivision members.

---

## 3. Barangay Staff / Personnel (Operational Layer)
The field operations layer. Personnel handle the physical rescue and management of animals.

### 📍 Current Features
*   **Mission Dispatch:** Receive verified rescue requests and assign specific personnel to handle them.
*   **Immersive Navigation:** Map-based routing from the Barangay Hall or current location to the incident site.
*   **Operational Status Updates:** Update the report through strict stages: *Dispatched → Picked Up → Impounded → Resolved*.
*   **Evidence Documentation:** Upload photos/videos at each stage of the rescue to ensure accountability.
*   **Intelligence Heatmaps:** View high-density areas to identify where stray animal populations are growing.
*   **Report History:** A dedicated archive for all successfully resolved operations (Status ID 6).

### 🚀 Possible Future Features
*   **Shelter Management:** Track available space and health status of animals in the impounding area.
*   **Live Team Tracking:** View the real-time location of field teams during active missions.
*   **AI Risk Analysis:** Integration of image recognition to automatically assess animal health or aggression levels.

---

## 4. Admin (System Oversight)
The governance layer. Admins ensure the system is secure, functional, and data-driven.

### 📍 Current Features
*   **Global Activity Monitor:** High-level Heatmap and Pinpoint views of all reports across all subdivisions.
*   **User Management:** Audit and manage accounts for Residents, Leaders, and Barangay Staff.
*   **Security Settings:** Manage administrative credentials and system-wide security configurations.
*   **Trend Analytics:** Analyze data over time (24h, 7d, 30d) to see if stray populations are decreasing.

### 🚀 Possible Future Features
*   **Geofence Management:** Interface to dynamically draw and update subdivision boundaries on the map.
*   **Audit Logging:** A detailed ledger of every status change and who performed it for transparency.
*   **System Configuration:** Manage animal categories, priority definitions, and automated notification triggers.

---

## Summary of Modules

| Module | Citizen | Subd Leader | Brgy Staff | Admin |
| :--- | :---: | :---: | :---: | :---: |
| **Incident Reporting** | ✅ Create | ✅ Validate | ❌ | ❌ |
| **Rescue Dispatch** | ❌ | ❌ | ✅ Full | ❌ |
| **Heatmap Analytics** | ❌ | ❌ | ✅ Local | ✅ Global |
| **Navigation** | ❌ | ❌ | ✅ Active | ❌ |
| **User Management** | ❌ | ❌ | ❌ | ✅ Full |
| **Report History** | ✅ Personal | ✅ Subd | ✅ Full | ✅ Full |
