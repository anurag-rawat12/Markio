import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StudentAttendance = () => {
  const [attendanceCode, setAttendanceCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  // Function to check attendance status on component mount
  const checkAttendanceStatus = async () => {
    try {
      setIsCheckingStatus(true);
      const studentId = localStorage.getItem('studentId');
      
      if (!studentId) {
        setErrorMessage('Student ID not found. Please log in again.');
        setIsCheckingStatus(false);
        return;
      }

      const response = await axios.get('/api/attendance/student-status', {
        params: { studentId },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('studentToken')}`
        }
      });

      if (response.data) {
        setAttendanceStatus(response.data);
      }
    } catch (error) {
      console.error('Error checking attendance status:', error);
      // Don't show error for status check failure, just proceed normally
    } finally {
      setIsCheckingStatus(false);
    }
  };

  // Check attendance status on component mount
  useEffect(() => {
    checkAttendanceStatus();
  }, []);

  // Function to mark attendance
  const markAttendance = async () => {
    if (!attendanceCode.trim()) {
      setErrorMessage('Please enter the attendance code');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await axios.post('/api/attendance/mark', {
        attendanceCode: attendanceCode.trim(),
        studentId: localStorage.getItem('studentId') // Assuming student ID is stored in localStorage
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('studentToken')}`
        }
      });

      if (response.data.success) {
        // Set success message and session info
        setSuccessMessage(response.data);
        setSessionInfo(response.data.sessionInfo);
        
        // Clear the input
        setAttendanceCode('');
        
        // Refresh attendance status
        await checkAttendanceStatus();
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 5000);
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      
      if (error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('Failed to mark attendance. Please try again.');
      }
      
      // Auto-hide error message after 5 seconds
      setTimeout(() => {
        setErrorMessage(null);
      }, 5000);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      markAttendance();
    }
  };

  // Function to dismiss messages
  const dismissMessage = () => {
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  return (
    <div className="student-attendance">
      <div className="attendance-card">
        <h2>📝 Mark Your Attendance</h2>
        
        {/* Loading Status Check */}
        {isCheckingStatus && (
          <div className="loading-status">
            <div className="loading-spinner">🔄</div>
            <span>Checking attendance status...</span>
          </div>
        )}
        
        {/* Attendance Status Display */}
        {!isCheckingStatus && attendanceStatus && attendanceStatus.hasActiveAttendance && (
          <div className="attendance-status-section">
            <h3>📊 Active Attendance Sessions</h3>
            
            {/* Already Marked Sessions */}
            {attendanceStatus.markedSessions.length > 0 && (
              <div className="marked-sessions">
                <h4>✅ Already Marked</h4>
                {attendanceStatus.markedSessions.map((session) => (
                  <div key={session.sessionId} className="session-card marked">
                    <div className="session-header">
                      <span className="subject">{session.subject}</span>
                      <span className="status-badge marked">✅ Present</span>
                    </div>
                    <div className="session-details">
                      <span>{session.day} - Period {session.periodNumber}</span>
                      <span>Marked at: {new Date(session.markedAt).toLocaleTimeString()}</span>
                    </div>
                    <div className="session-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${session.attendancePercentage}%` }}
                        ></div>
                      </div>
                      <span className="progress-text">
                        {session.attendanceMarked}/{session.totalStudents} students ({session.attendancePercentage}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Pending Sessions */}
            {attendanceStatus.pendingSessions.length > 0 && (
              <div className="pending-sessions">
                <h4>⏳ Pending Attendance</h4>
                {attendanceStatus.pendingSessions.map((session) => (
                  <div key={session.sessionId} className="session-card pending">
                    <div className="session-header">
                      <span className="subject">{session.subject}</span>
                      <span className="status-badge pending">⏳ Pending</span>
                    </div>
                    <div className="session-details">
                      <span>{session.day} - Period {session.periodNumber}</span>
                      <span>Code: <code className="attendance-code">{session.attendanceCode}</code></span>
                      <span>Expires: {new Date(session.expiresAt).toLocaleTimeString()}</span>
                    </div>
                    <button
                      onClick={() => {
                        setAttendanceCode(session.attendanceCode);
                        markAttendance();
                      }}
                      className="btn btn-primary quick-mark"
                      disabled={isLoading}
                    >
                      {isLoading ? '⏳ Marking...' : '✅ Quick Mark'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Manual Input Section */}
        <div className="input-section">
          <div className="section-header">
            <label htmlFor="attendanceCode">
              {attendanceStatus && attendanceStatus.pendingSessions.length > 0 
                ? 'Or Enter Code Manually:' 
                : 'Enter Attendance Code:'}
            </label>
            <button 
              onClick={checkAttendanceStatus}
              className="btn btn-small refresh-btn"
              disabled={isCheckingStatus}
              title="Refresh attendance status"
            >
              {isCheckingStatus ? '🔄' : '🔄 Refresh'}
            </button>
          </div>
          <div className="input-group">
            <input
              id="attendanceCode"
              type="text"
              value={attendanceCode}
              onChange={(e) => setAttendanceCode(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter 6-digit code"
              maxLength="6"
              disabled={isLoading}
              className="attendance-input"
            />
            <button
              onClick={markAttendance}
              disabled={isLoading || !attendanceCode.trim()}
              className="btn btn-primary"
            >
              {isLoading ? '⏳ Marking...' : '✅ Mark Attendance'}
            </button>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="success-message">
            <div className="message-header">
              <span className="message-icon">🎉</span>
              <h3>{successMessage.message}</h3>
              <button 
                className="dismiss-btn" 
                onClick={dismissMessage}
                aria-label="Dismiss"
              >
                ×
              </button>
            </div>
            
            <div className="attendance-details">
              <div className="detail-row">
                <span className="detail-label">Subject:</span>
                <span className="detail-value">{successMessage.details.subject}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Day:</span>
                <span className="detail-value">{successMessage.details.day}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Period:</span>
                <span className="detail-value">Period {successMessage.details.periodNumber}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Time:</span>
                <span className="detail-value">{successMessage.details.markedAt}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status:</span>
                <span className="detail-value status-present">{successMessage.details.status}</span>
              </div>
            </div>

            {/* Session Progress */}
            {sessionInfo && (
              <div className="session-progress">
                <div className="progress-header">
                  <span>Class Attendance Progress</span>
                  <span>{sessionInfo.attendancePercentage}%</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${sessionInfo.attendancePercentage}%` }}
                  ></div>
                </div>
                <div className="progress-text">
                  {sessionInfo.attendanceMarked} of {sessionInfo.totalStudents} students present
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="error-message">
            <div className="message-header">
              <span className="message-icon">❌</span>
              <span>{errorMessage}</span>
              <button 
                className="dismiss-btn" 
                onClick={dismissMessage}
                aria-label="Dismiss"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="instructions">
          <h4>📋 Instructions:</h4>
          <ol>
            <li>Get the 6-digit attendance code from your teacher</li>
            <li>Enter the code in the field above</li>
            <li>Click "Mark Attendance" or press Enter</li>
            <li>You'll see a confirmation once your attendance is marked</li>
          </ol>
          
          <div className="tips">
            <h5>💡 Tips:</h5>
            <ul>
              <li>Make sure you're in the correct class before marking attendance</li>
              <li>Each code can only be used once per student</li>
              <li>Codes expire after the time limit set by your teacher</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAttendance;