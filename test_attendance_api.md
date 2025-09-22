# Student Attendance API Documentation

## Endpoints Created

### 1. Comprehensive Attendance (Complex)
```
GET /api/students/attendance/:studentId?branchId=optional
```

**Description**: Fetches comprehensive attendance data from both Period schema (live sessions) and TimeTable schema (historical data).

**Query Parameters**:
- `branchId` (optional) - If not provided, will be auto-detected from student's branch membership

**Response Example**:
```json
{
  "message": "Student attendance fetched successfully",
  "studentId": "64a7b123456789abcdef1234",
  "studentName": "John Doe",
  "branchId": "64a7b123456789abcdef5678",
  "branchInfo": {
    "branchName": "Computer Science",
    "section": "A",
    "year": 3
  },
  "attendance": {
    "liveAttendance": [...],
    "historicalAttendance": [...],
    "totalClasses": 50,
    "attendedClasses": 42,
    "absentClasses": 8,
    "attendancePercentage": 84,
    "subjectWiseAttendance": [...],
    "recentAttendance": [...],
    "attendanceStatus": "Good",
    "lastUpdated": "2024-01-15T10:30:00.000Z"
  }
}
```

### 2. Simple Attendance (Accurate - Recommended)
```
GET /api/students/attendance-simple/:studentId?branchId=optional
```

**Description**: Fetches accurate attendance data based only on Period schema, which contains actual individual student attendance records.

**Response Example**:
```json
{
  "message": "Student attendance fetched successfully",
  "studentId": "64a7b123456789abcdef1234",
  "studentName": "John Doe",
  "studentEmail": "john.doe@example.com",
  "branchId": "64a7b123456789abcdef5678",
  "branchInfo": {
    "branchName": "Computer Science",
    "section": "A",
    "year": 3
  },
  "attendance": {
    "totalSessions": 25,
    "attendedSessions": 20,
    "absentSessions": 5,
    "attendancePercentage": 80,
    "attendanceStatus": "Good",
    "subjectWiseAttendance": [
      {
        "subject": "Database Management",
        "attendedClasses": 8,
        "totalClasses": 10,
        "attendancePercentage": 80,
        "teacherName": "Prof. Smith"
      },
      {
        "subject": "Web Development",
        "attendedClasses": 12,
        "totalClasses": 15,
        "attendancePercentage": 80,
        "teacherName": "Prof. Johnson"
      }
    ],
    "attendanceRecords": [
      {
        "sessionId": "64a7b123456789abcdef9999",
        "date": "2024-01-15T05:30:00.000Z",
        "day": "Monday",
        "periodNumber": 1,
        "subject": "Database Management",
        "teacher": "Prof. Smith",
        "startTime": "09:00",
        "endTime": "10:00",
        "status": "Present",
        "markedAt": "2024-01-15T09:05:00.000Z",
        "sessionStatus": "completed",
        "totalStudentsInClass": 30,
        "attendanceMarkedInClass": 25
      }
    ],
    "recentAttendance": [...],
    "lastUpdated": "2024-01-15T10:30:00.000Z",
    "dataSource": "Period Schema (Live Sessions)"
  }
}
```

## Usage Examples

### JavaScript/Frontend Usage:
```javascript
// Get simple attendance (recommended)
const response = await fetch('/api/students/attendance-simple/64a7b123456789abcdef1234', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
const attendanceData = await response.json();

// With specific branch
const response2 = await fetch('/api/students/attendance-simple/64a7b123456789abcdef1234?branchId=64a7b123456789abcdef5678', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### cURL Examples:
```bash
# Simple attendance
curl -X GET "http://localhost:8000/api/students/attendance-simple/STUDENT_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"

# With branch ID
curl -X GET "http://localhost:8000/api/students/attendance-simple/STUDENT_ID?branchId=BRANCH_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

## Key Features

### ✅ **Data Sources**:
- **Period Schema**: Individual student attendance records from live sessions
- **TimeTable Schema**: Historical attendance statistics (class-level aggregates)
- **Branch Schema**: Student-branch relationship mapping

### ✅ **Automatic Branch Detection**:
- If `branchId` not provided, automatically finds student's branch from Branch.students array

### ✅ **Comprehensive Statistics**:
- Overall attendance percentage
- Subject-wise attendance breakdown
- Recent attendance records
- Attendance status (Good/Warning/Critical)

### ✅ **Real-time Data**:
- Fetches from Period schema which contains actual attendance marking records
- Includes session status, marking timestamp, and class statistics

### ✅ **Error Handling**:
- Student not found
- Branch not assigned
- No timetable found
- Graceful fallbacks with empty data structures

## Recommended Usage

Use the **simple attendance endpoint** (`/attendance-simple/:studentId`) as it provides:
- ✅ Accurate data from actual attendance records
- ✅ Individual student tracking
- ✅ Real attendance marking timestamps
- ✅ Subject-wise breakdowns
- ✅ Better performance

The comprehensive endpoint is available for complex analytics but may include estimated data where individual student records aren't available.