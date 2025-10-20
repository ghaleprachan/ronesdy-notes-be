import express from 'express';
import UserController from '../controllers/v1/user.controller';
import multer from 'multer';
const userRouter = express.Router();
const userController = new UserController();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

userRouter.get('/', userController.getUserProfile.bind(userController));
userRouter.patch('/password', userController.updatePassword.bind(userController));
userRouter.patch('/profile', userController.updateProfile.bind(userController));
userRouter.get('/validate-token', userController.validateToken.bind(userController));
userRouter.delete('/', userController.deleteAccount.bind(userController));
userRouter.post('/update-profilepic', upload.single('image'), userController.updateProfilePic.bind(userController));
userRouter.get('/profile-picture', userController.getUserProfilePicture.bind(userController));
userRouter.delete('/profile-picture', userController.DeleteProfilePicture.bind(userController));
userRouter.get('/plan-details', userController.getUserSubscriptionDetails.bind(userController));
userRouter.post('/verify-reciept', userController.verifyReciept.bind(userController));
userRouter.get('/purchase-history', userController.getUserPurchaseHistory.bind(userController));

export default userRouter;
