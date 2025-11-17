// const bcrypt = require('bcryptjs');
// bcrypt.hash("Admin@123", 10).then(hash => console.log(hash));

const bcrypt = require("bcryptjs");
bcrypt.compare("Admin@123", "$2a$10$QUAp0ozXVupYmQ13J7TynOIo9S2t.DODUAOYWCdLVybl2BsZhab6y")
.then(console.log);
