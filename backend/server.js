const express = require('express');
const app = express();
const port = 3107;
app.use(express.json());


app.get('/', (req, res) => {
  res.send('Welcome to BOB!')
});

app.listen(port, () => {
  console.log(`Server is running on  http://localhost:${port}`);
});