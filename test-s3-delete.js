// Test script to check S3 delete functionality
async function testS3Delete() {
    try {
        console.log('Testing S3 delete functionality...');
        
        // Test with a fake CloudFront URL to see the response
        const response = await fetch('/api/aws/delete', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                cloudFrontUrl: 'https://dw9tsoyfcyk5k.cloudfront.net/test-image.jpg',
            }),
        });

        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        const result = await response.json();
        console.log('Response data:', result);
        
        if (!response.ok) {
            console.error('Delete test failed:', result);
        } else {
            console.log('Delete test succeeded:', result);
        }
    } catch (error) {
        console.error('Delete test error:', error);
    }
}

// You can run this in browser console to test
testS3Delete();