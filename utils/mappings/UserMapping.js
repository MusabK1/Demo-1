export const UserMapping = (user) => {
  return {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    companyName: user.companyName,
    email: user.email,
    phone: user.phone,
    description: user.description,
    profileImg: user.profileImg,
    role: user.role,
  };
};
