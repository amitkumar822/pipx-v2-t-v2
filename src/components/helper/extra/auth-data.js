export const getTitle = (step, type, userType) => {
  switch (step) {
    case 1:
      if (type === "signup") {
        if (userType === "SIGNAL_PROVIDER") {
          return "Enter your registered business email address";
        }
        return "Get going with email";
      } else if (type === "login") {
        return "Enter your Username/Email";
      }
      return "Login";
    case 2:
      if (type === "signup") {
        return "Confirm your email address";
      } else if (type === "login") {
        return "Enter your Username/Email";
      }
      return "Signup";
    case 3:
      if (type === "signup") {
        return "Choose a username";
      } else if (type === "login") {
        return "Enter your Username/Email";
      }
      return "Forgot Password";
    case 4:
      if (type === "signup") {
        return "Create a password";
      } else if (type === "login") {
        return "Enter your Username/Email";
      }
      return "Reset Password";
    case 5:
      if (type === "signup") {
        return "Re-enter password";
      } else if (type === "login") {
        return "Enter your Username/Email";
      }
      return "Reset Password";
    default:
      return "";
  }
};

export const getSubtitle = (step, type) => {
  switch (step) {
    case 1:
      if (type === "signup") {
        return "Enter your email address";
      } else if (type === "login") {
        return "Enter your username or email address";
      }
      return "Login";
    case 2:
      if (type === "signup") {
        return "We will send you a verification code to your email address";
      } else if (type === "login") {
        return "Enter your username or email address";
      }
      return "Signup";
    case 3:
      if (type === "signup") {
        return "We will send you a verification code to your email address";
      } else if (type === "login") {
        return "Enter your username or email address";
      }
      return "Enter your registered email address";
    case 4:
      return "Reset your password";
    default:
      return "";
  }
};

export const getIcon = (step, type) => {};
