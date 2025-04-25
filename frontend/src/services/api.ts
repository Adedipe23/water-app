import { ApiEndpoint, ReminderResponse } from '../types';

const API_BASE_URL = 'http://localhost:8000';

// Function to send a water reminder
export const sendWaterReminder = async (): Promise<ReminderResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/remind-water`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to send reminder');
    }
    
    const data = await response.json();
    return {
      success: true,
      message: 'Reminder sent successfully',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error sending water reminder:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString(),
    };
  }
};

// API endpoints from the OpenAPI schema
export const apiEndpoints: ApiEndpoint[] = [
  {
    path: '/api/v1/auth/register',
    method: 'POST',
    description: 'Register a new user in the system',
    tag: 'auth',
  },
  {
    path: '/api/v1/auth/login',
    method: 'POST',
    description: 'OAuth2 compatible token login endpoint',
    tag: 'auth',
  },
  {
    path: '/api/v1/water/log',
    method: 'POST',
    description: 'Log a water intake event for the authenticated user',
    tag: 'water',
  },
  {
    path: '/api/v1/water/today',
    method: 'GET',
    description: 'Retrieve all water logs for the current day',
    tag: 'water',
  },
  {
    path: '/api/v1/water/streak',
    method: 'GET',
    description: 'Retrieve the user\'s current streak information',
    tag: 'water',
  },
  {
    path: '/api/v1/water/goal',
    method: 'GET',
    description: 'Retrieve the user\'s current daily water intake goal',
    tag: 'water',
  },
  {
    path: '/api/v1/water/goal',
    method: 'POST',
    description: 'Set or update the user\'s daily water intake goal',
    tag: 'water',
  },
  {
    path: '/api/v1/water/history',
    method: 'GET',
    description: 'Retrieve water logs over a specified date range',
    tag: 'water',
  },
  {
    path: '/api/v1/water/stats',
    method: 'GET',
    description: 'Retrieve aggregated water intake statistics for visualization',
    tag: 'water',
  },
  {
    path: '/',
    method: 'GET',
    description: 'Root endpoint that provides a welcome message',
    tag: 'root',
  },
  {
    path: '/remind-water',
    method: 'POST',
    description: 'Send a water reminder notification',
    tag: 'reminder',
  },
];
