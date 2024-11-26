import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { User } from '../models/user.model.js'
import bcrypt from 'bcrypt'

const signupUser = asyncHandler (async (req, res) => {

    // these are the field that will be required when the user registers
    const {username, fullname, email, password} = req.body;

    if (!username || !fullname || !email || !password) {
        throw new ApiError(400, "All fields are required");
    }

    // Trim and validate input fields
    const trimmedUsername = username.trim();
    const trimmedFullname = fullname.trim();
    const trimmedEmail = email.trim();

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if(!emailRegex.test(email)){
        throw new ApiError(400, "Invalid email format")
    }

    // check if the user already exists, because registered users are not required right now
    const existedUsername = await User.findOne({username});

    if(existedUsername){
        throw new ApiError(409, "Username already exists")
    }

    const existedEmail = await User.findOne({email})

    if(existedEmail){
        throw new ApiError(409, "Email already exists")
    }

    if(password.length < 6){
        throw new ApiError(400, "Password must be alteast 6 characters long")
    }

    // has the user password before saving it
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        username,
        fullname,
        email,
        password: hashedPassword
    })

    // take the user's access and refresh token and save it in the user db
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save( {validateBeforeSave: false} )

    // save the access and refresh token in the cookies
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(200,
            {
                user: {
                    _id: user._id,
                    username: user.username,
                    fullname: user.fullname,
                    email: user.email,
                    followers: user.followers,
                    following: user.following,
                    profileImg: user.profileImg,
                    coverImg: user.coverImg,
                }
            }
        )
    )

})

export { signupUser }