import React, { useRef, useEffect, useState } from "react";

const correctOTP = "123456"; // validate from your server

function OtpValidation({ numberOfDigits, setOtpError, setOtp }) {
  const [otp, setOtp1] = useState(new Array(numberOfDigits).fill(""));
  const otpBoxReference = useRef([]);

  function handleChange(value, index) {
    let newArr = [...otp];
    newArr[index] = value;
    setOtp1(newArr);

    if (value && index < numberOfDigits - 1) {
      otpBoxReference.current[index + 1].focus();
    }
  }

  function handleBackspaceAndEnter(e, index) {
    if (e.key === "Backspace" && !e.target.value && index > 0) {
      otpBoxReference.current[index - 1].focus();
    }
    if (e.key === "Enter" && e.target.value && index < numberOfDigits - 1) {
      otpBoxReference.current[index + 1].focus();
    }
  }

  useEffect(() => {
    if (otp.join("").length === 6) {
      setOtpError(true);
    } else {
      setOtpError(false);
    }
    setOtp((prev) => ({ ...prev, otpValue: otp.join("") }));
  }, [otp]);

  return (
    <div className="w-full mb-10 h-full">
      <p className="text-base mt-4 mb-4">One Time Password (OTP)</p>

      <div className="flex items-center justify-between">
        {otp.map((digit, index) => (
          <input
            key={index}
            value={digit}
            type="number"
            maxLength={1}
            onChange={(e) => handleChange(e.target.value, index)}
            onKeyUp={(e) => handleBackspaceAndEnter(e, index)}
            ref={(reference) => (otpBoxReference.current[index] = reference)}
            style={{ borderColor: "lightgray" }}
            className={`text-center font-bold text-2xl border w-40 h-40 p-5 rounded-md block focus:border-2 `}
          />
        ))}
      </div>
    </div>
  );
}

export default OtpValidation;
