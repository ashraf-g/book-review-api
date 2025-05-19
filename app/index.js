/**
 * Main Server File
 */

require("dotenv").config({ path: "./app/.env" });

const app = require("./app");
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
