import { User } from "../models/Users.model";
import { asyncHandler } from "../utils/asyncHandler";

const registerUser = asyncHandler(async (req, res) => {
    
    // 1. destructure data from body
    // 2. check if data is not empty
    // 3. check if user already exists
    // 4. check for images
    // 5. upload images on cloudinary
    // 6. Create entry in db
    // 7. remove password and refersh token from response
    // 8. Check for user creation
    // 9. return response

});


export { registerUser };
