import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const TeacherDashboard = ({ sessionId, totalStudents, attendanceCode }) => {
  const [attendanceData, setAttendanceData] = useState({
    attendanceMarked: 0,
    attendancePercentage: 0,
    sessionStatus: 'active',
    isActive: true,
    timeRemaining: 0
  });
  const [isPolling, setIsPolling] = useState(true);
  const intervalRef = useRef(null);

  // Function to fetch real-time attendance data
  const fetchAttendanceData = async () => {
    try {
      const response = await axios.get(`/api/attendance/realtime/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('teacherToken')}`
        }
      });

      if (response.data) {
        setAttendanceData(response.data);
        
        // Stop polling if session is no longer active
        if (!response.data.isActive) {
          setIsPolling(false);
          clearInterval(intervalRef.current);
        }
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      // Continue polling even if there's an error, but you might want to handle this differently
    }
  };

  // Start polling when component mounts
  useEffect(() => {
    if (sessionId && isPolling) {
      // Fetch immediately
      fetchAttendanceData();
      
      // Set up polling every 2 seconds
      intervalRef.current = setInterval(fetchAttendanceData, 2000);
    }

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [sessionId, isPolling]);

  // Manual stop polling function
  const stopPolling = () => {
    setIsPolling(false);
    clearInterval(intervalRef.current);
  };

  // Format time remaining
  const formatTimeRemaining = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="teacher-dashboard">
      <div className="attendance-session-card">
        <h2>📊 Real-time Attendance Tracking</h2>
        
        {/* Session Info */}
        <div className="session-info">
          <h3>Session Code: <span className="code">{attendanceCode}</span></h3>
          <div className="status-badge">
            Status: <span className={`status ${attendanceData.sessionStatus}`}>
              {attendanceData.sessionStatus.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Real-time Stats */}
        <div className="attendance-stats">
          <div className="stat-card">
            <div className="stat-number">{attendanceData.attendanceMarked}</div>
            <div className="stat-label">Students Present</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-number">{totalStudents}</div>
            <div className="stat-label">Total Students</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-number">{attendanceData.attendancePercentage}%</div>
            <div className="stat-label">Attendance Rate</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="progress-section">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ 
                width: `${(attendanceData.attendanceMarked / totalStudents) * 100}%` 
              }}
            ></div>
          </div>
          <div className="progress-text">
            {attendanceData.attendanceMarked} of {totalStudents} students have marked attendance
          </div>
        </div>

        {/* Time Remaining */}
        {attendanceData.isActive && (
          <div className="time-remaining">
            ⏰ Time Remaining: {formatTimeRemaining(attendanceData.timeRemaining)}
          </div>
        )}

        {/* Polling Status */}
        <div className="polling-status">
          <div className={`polling-indicator ${isPolling ? 'active' : 'inactive'}`}>
            {isPolling ? '🔄 Live Updates' : '⏸️ Updates Paused'}
          </div>
          {isPolling && <div className="last-updated">
            Last updated: {new Date().toLocaleTimeString()}
          </div>}
        </div>

        {/* Controls */}
        <div className="controls">
          {isPolling ? (
            <button onClick={stopPolling} className="btn btn-secondary">
              ⏸️ Pause Live Updates
            </button>
          ) : (
            <button onClick={() => setIsPolling(true)} className="btn btn-primary">
              ▶️ Resume Live Updates
            </button>
          )}
        </div>

        {/* Session Status Messages */}
        {!attendanceData.isActive && (
          <div className={`session-message ${attendanceData.sessionStatus}`}>
            {attendanceData.sessionStatus === 'completed' && 
              '✅ Session completed! All students have marked attendance.'}
            {attendanceData.sessionStatus === 'expired' && 
              '⏰ Session expired! Attendance window has closed.'}
            {attendanceData.sessionStatus === 'ended' && 
              '🛑 Session ended manually.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;