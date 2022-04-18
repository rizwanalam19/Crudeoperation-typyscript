const multer = require("multer");

const storage = multer.diskStorage({
  destination: function(req: any, file: any, cb: any) {
    cb(null, "uploads");
  },
  filename: function(req: any, file: any, cb: any) {
    // console.log(file);

    cb(null, file.originalname);
  },
});

var upload = multer({
  storage: storage,
  fileFilter: function(req: any, file: any, cb: any) {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg" ||
      file.mimetype == "pdf" ||
      file.mimetype == "txt"
    ) {
      cb(null, true);
    } else {
      console.log(file);
      cb(null, false);
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 2,
  },
}).single("file");

module.exports = upload;
