console.log('Test started');

try {
  console.log('Loading dotenv...');
  import('dotenv').then(dotenv => {
    console.log('Dotenv loaded');
    dotenv.default.config();
    console.log('Dotenv configured');
    
    console.log('Loading models...');
    import('./models/index.js').then(db => {
      console.log('Models loaded');
      console.log('Available models:', Object.keys(db.default));
      console.log('Test completed successfully');
    }).catch(err => {
      console.error('Error loading models:', err);
    });
  }).catch(err => {
    console.error('Error loading dotenv:', err);
  });
} catch (error) {
  console.error('Error:', error);
}
