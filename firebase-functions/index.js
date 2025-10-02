const functions = require('firebase-functions');

// Simple redirect to static hosting
exports.nextApp = functions.https.onRequest((req, res) => {
  res.status(200).send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>FetvaBul</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <script>
        // Static build redirect
        window.location.href = 'https://fetvabul.web.app';
      </script>
    </head>
    <body>
      <p>Yönlendiriliyorsunuz...</p>
      <p><a href="https://fetvabul.web.app">Buraya tıklayın</a></p>
    </body>
    </html>
  `);
});