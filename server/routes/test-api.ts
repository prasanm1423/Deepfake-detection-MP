import { RequestHandler } from "express";
import axios from "axios";

/**
 * Test Sightengine API with a public image URL
 */
export const testSightengineAPI: RequestHandler = async (req, res) => {
  try {
    const SIGHTENGINE_USER = process.env.SIGHTENGINE_USER;
    const SIGHTENGINE_SECRET = process.env.SIGHTENGINE_SECRET;
    
    if (!SIGHTENGINE_USER || !SIGHTENGINE_SECRET) {
      return res.status(200).json({
        success: true,
        message: 'Sightengine API credentials not configured - running in demo mode',
        credentials_present: false
      });
    }

    // Test with a public image URL and simple GET request
    const testImageUrl = 'https://sightengine.com/assets/img/examples/example-fac-1000.jpg';
    const apiUrl = new URL('https://api.sightengine.com/1.0/check.json');
    
    apiUrl.searchParams.append('models', 'deepfake');
    apiUrl.searchParams.append('api_user', SIGHTENGINE_USER);
    apiUrl.searchParams.append('api_secret', SIGHTENGINE_SECRET);
    apiUrl.searchParams.append('url', testImageUrl);

    console.log('Testing Sightengine API with URL:', apiUrl.toString());

    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
    });

    console.log('Response status:', response.status);
    const responseText = await response.text();
    console.log('Response body:', responseText);

    if (!response.ok) {
      return res.status(500).json({
        success: false,
        error: `Sightengine API error: ${response.status}`,
        details: responseText
      });
    }

    const data = JSON.parse(responseText);
    
    res.json({
      success: true,
      message: 'Sightengine API test successful',
      data: data,
      credentials_valid: data.status === 'success'
    });

  } catch (error) {
    console.error('Sightengine API test error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Test failed'
    });
  }
};

/**
 * Test Resemble AI API credentials
 */
export const testResembleAPI: RequestHandler = async (req, res) => {
  try {
    const RESEMBLE_API_KEY = process.env.RESEMBLE_API_KEY;

    if (!RESEMBLE_API_KEY) {
      return res.status(200).json({
        success: true,
        message: 'Resemble AI API credentials not configured - running in demo mode',
        credentials_present: false
      });
    }

    // Test with a simple API call using a minimal audio sample
    // Create a simple test audio payload (1 second of silence in base64)
    const testAudioData = 'UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
    
    const testPayload = {
      audio_data: testAudioData,
      audio_format: 'wav'
    };

    console.log('Testing Resemble AI API...');

    const testResponse = await axios.post(
      'https://app.resemble.ai/api/v2/detect',
      testPayload,
      {
        headers: {
          'Authorization': `Bearer ${RESEMBLE_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 30000
      }
    );

    console.log('Resemble AI API response status:', testResponse.status);
    console.log('Resemble AI API response data:', testResponse.data);

    res.json({
      success: true,
      message: 'Resemble AI API test successful',
      data: testResponse.data,
      credentials_valid: true
    });

  } catch (error) {
    console.error('Resemble AI API test error:', error);
    
    if (axios.isAxiosError(error)) {
      res.status(500).json({
        success: false,
        error: 'Resemble AI API test failed',
        details: {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Test failed'
      });
    }
  }
};
