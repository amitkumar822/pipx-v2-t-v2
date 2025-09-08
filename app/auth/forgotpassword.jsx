import { View, Text, StyleSheet } from "react-native";
import React, { useState } from "react";
import { StepOne } from "@/src/components/helper/extra/StepOne";
import { StepFour } from "@/src/components/helper/extra/StepFour";
import { StepFive } from "@/src/components/helper/extra/StepFive";
import { StepTwo } from "@/src/components/helper/extra/StepTwo";
import { AppStatusBar } from "@/src/components/utils/AppStatusBar";

const Forgotpassword = () => {
  const type = "forgotpassword";
  const [step, setStep] = useState(1);

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  return (
    <View style={styles.forgotcontainer}>
      <AppStatusBar backgroundColor="#FFF" barStyle="dark-content" />
      {step === 1 ? (
        <StepOne
          type={type}
          setStep={setStep}
          step={step}
          validateEmail={validateEmail}
        />
      ) : (
        <></>
      )}
      {step === 2 ? (
        <StepTwo type={type} setStep={setStep} step={step} />
      ) : (
        <></>
      )}
      {step === 4 ? (
        <StepFour type={type} setStep={setStep} step={step} loginType="email" />
      ) : (
        <></>
      )}
      {step === 5 ? (
        <StepFive type={type} setStep={setStep} step={step} loginType="email" />
      ) : (
        <></>
      )}
    </View>
  );
};

export default Forgotpassword;

const styles = StyleSheet.create({
  forgotcontainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
  },
});
