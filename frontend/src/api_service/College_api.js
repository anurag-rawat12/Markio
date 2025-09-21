// College API Service
class CollegeAPI {
    constructor(baseURL = 'http://localhost:8000/api') {
        this.baseURL = baseURL;
    }

    // Helper to handle responses
    async handleResponse(response) {
        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch {
                errorData = { message: response.statusText };
            }
            throw new Error(errorData.message || 'API request failed');
        }

        // If no content (204), return a success message
        if (response.status === 204) return { message: 'Success' };

        return await response.json();
    }

    // Create a new college
    async createCollege(collegeData) {
        try {
            const response = await fetch(`${this.baseURL}/college-auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(collegeData)
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Error creating college:', error);
            throw error;
        }
    }

    // Verify OTP
    async verifyOtp(userId, otp) {
        try {
            const response = await fetch(`${this.baseURL}/college-auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, otp })
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Error verifying OTP:', error);
            throw error;
        }
    }

    // Get all colleges
    async getColleges() {
        try {
            const response = await fetch(`${this.baseURL}/colleges`);
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Error fetching colleges:', error);
            throw error;
        }
    }

    // Get college by ID
    async getCollegeById(id) {
        try {
            const response = await fetch(`${this.baseURL}/colleges/${id}`);
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Error fetching college:', error);
            throw error;
        }
    }

    // Update college
    async updateCollege(id, updateData) {
        try {
            const response = await fetch(`${this.baseURL}/colleges/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Error updating college:', error);
            throw error;
        }
    }

    // Delete college
    async deleteCollege(id) {
        try {
            const response = await fetch(`${this.baseURL}/colleges/${id}`, {
                method: 'DELETE'
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Error deleting college:', error);
            throw error;
        }
    }
}

export default new CollegeAPI();
