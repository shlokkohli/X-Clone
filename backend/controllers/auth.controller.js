import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { User } from '../models/user.model.js'
import bcrypt from 'bcrypt'

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        user.save( {validateBeforeSave: false} )

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh token");
    }
}

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

const loginUser = asyncHandler (async (req, res) => {

    // we will login the user based on email and password
    const {username, password} = req.body;

    if (!username || !password) {
        throw new ApiError(400, "Username and password are required");
    }

    // find the user in the db
    const user = await User.findOne({username});

    if(!user){
        throw new ApiError(400, "No user exists with this username");
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if(!isPasswordCorrect){
        throw new ApiError(400, "Incorrect Password");
    }

    // till now if we have found the user in the db, generate access and refresh token for that user
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

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

const logoutUser = asyncHandler (async (req, res) => {

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse (200, {}, "User logged out successfully") )

})

const getMe = asyncHandler (async (req, res) => {

    const user = await User.findById(req.user._id).select("-password -refreshToken");

    return res
    .status(200)
    .json(new ApiResponse(200, user, "User profile retrieved successfully") )

})


export { signupUser, loginUser, logoutUser, getMe }