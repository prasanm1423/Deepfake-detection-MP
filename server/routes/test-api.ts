import { RequestHandler } from "express";

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
