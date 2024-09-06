export const otpVerification = async (otpTime) => {
  try {
    const cDateTime = new Date();

    var differenceValue = (otpTime - cDateTime.getTime()) / 1000;
    differenceValue /= 60;

    const minutes = Math.abs(differenceValue);

    if (minutes > 2) {
      return true;
    }

    return false;
  } catch (error) {
    console.log(error.message);
  }
};