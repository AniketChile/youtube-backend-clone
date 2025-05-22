import { Router } from "express";
import {
  changeCurrentPassword,
  getCurrentUser,
  logOutUser,
  loginUser,
  refreshAccessToken,
  registerUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/register").post(
  /*
        we are adding upload.fileds because the application is designed in such a way that it 
        want the avatar image as well as the coverImage.
    */
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

//secured routes
router.route("/login").post(loginUser);

//secureured routes
router.route("/logout").post(verifyJWT, logOutUser);
router.route("/refresh-token").post(refreshAccessToken);

//changepassword
router.route("/changeCurrentPassword").patch(verifyJWT, changeCurrentPassword);

//getCurrentUser
router.route("/getCurrentUser").get(verifyJWT, getCurrentUser);

//updateData
router.route("/updateNameorEmail").patch(verifyJWT, updateAccountDetails);
router
  .route("/updateThumbnail")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
router
  .route("/updateCoverImage")
  .patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);

//channel
router.route("/channelInfo").get(verifyJWT, updateUserCoverImage);
export default router;
