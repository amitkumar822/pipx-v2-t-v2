import { createContext, useContext, useState } from "react";

const UserContext = createContext(null);

export const UserContextProvider = ({ children }) => {
  // mobile otp state
  const [otp, setOtp] = useState(null);
  // email otp state
  const [otpEmail, setOtpEmail] = useState(null);
  // mobile and email otp verify state
  const [email_or_mobile, setEmail_or_mobile] = useState(null);
  // username state
  const [username, setUsername] = useState("");
  // password user and agent
  const [userAgentPassword, setUserAgentPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  // user and agent state
  const [userAgentDetails, setUserAgentDetails] = useState("");

  // Role type handle registration time (USER or Agent)
  const [regRoleType, setRegRoleType] = useState("USER");

  // This can be used to store user agent details after fetching from API
  const [profile, setProfile] = useState({});

  // This can be used to share currency or asset details across components
  const [currencyAssetDetails, setCurrencyAssetDetails] = useState({});

  return (
    <UserContext.Provider
      value={{
        otp,
        setOtp,
        otpEmail,
        setOtpEmail,
        email_or_mobile,
        setEmail_or_mobile,
        userAgentDetails,
        setUserAgentDetails,
        username,
        setUsername,
        userAgentPassword,
        setUserAgentPassword,
        confirmPassword,
        setConfirmPassword,
        regRoleType,
        setRegRoleType,
        profile,
        setProfile,
        currencyAssetDetails,
        setCurrencyAssetDetails,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserProvider = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserProvider must be used inside UserProvider");
  }
  return context;
};
