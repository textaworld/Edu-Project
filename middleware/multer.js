// const multer = require('multer');

// const storage = multer.diskStorage({
//     destination: function(req, file, cb) {
//         cb(null, 'images');  // This assumes that 'images' directory is in the same directory as your server script
//     },
//     filename: function(req, file, cb) {
//         cb(null, file.fieldname + '-' + Date.now() + '.jpg');
//     }
// });

// const upload = multer({ storage: storage });

// module.exports = upload;


const multer = require('multer');

const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

module.exports = upload;
