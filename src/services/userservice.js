import userRepo  from '../repository/userRepository.js';
import cryptoUtils from '../utils/cryptoUtils.js';
import mailService from "./mailService.js";
import UnauthorizedException from '../exceptions/UnauthorizedException.js';

export const add = async (content)=> {
    const {password,salt}= cryptoUtils.hashPassword(content.password);
    content.password= password;
    content.salt = salt;
    content.registrationToken = cryptoUtils.generateRandomCode(16);
    const user= await userRepo.add(content)
    await mailService.sendRegistrationMail(user);
    return user;
};

export const verifyRegistrationToken = async (id,token)=> {
    return await userRepo.getByIdAndToken(id,token);

}
export const loginUser = async (email,password)=>{
    const user  = await userRepo.findByEmail(email);
    if (user.password !== cryptoUtils.sha256(password, user.salt)) {
        throw new UnauthorizedException("Unauthorized");
    }
    const { accessToken, refreshToken } = cryptoUtils.generateTokens(user);
        return {
        accessToken,
        refreshToken,
        name: user.name,
        id: user._id
    }}
export const updateProfile= async (userId,updateData)=>{
    return await userRepo.updateProfile(userId,updateData);
}