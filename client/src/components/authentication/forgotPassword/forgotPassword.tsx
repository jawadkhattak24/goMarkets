import { useState } from "react";
import styles from "../register/styles/register.module.scss";
import { useNotification } from "../../../contexts/notificationContext";

const ForgotPassword = ({
  setIsForgotPasswordOpen,
}: {
  setIsForgotPasswordOpen: (value: boolean) => void;
}) => {
  const { showNotification, isLoading, setIsLoading } = useNotification();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  const handleClose = () => {
    setIsForgotPasswordOpen(false);
  };

  const handleForgotPassword = () => {
    // Add forgot password logic here
  };

  const handleSendVerification = () => {
    // Add verification code sending logic here
  };

  return (
    <div className={styles.registerDialogOverlay}>
      <div className={styles.loginDialog}>
        <header className={styles.header}>
          <div className={styles.headerText}>Forgot Password</div>
          <button className={styles.closeButton} onClick={handleClose}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
              <path
                fill="currentColor"
                d="M764.288 214.592 512 466.88 259.712 214.592a31.936 31.936 0 0 0-45.12 45.12L466.752 512 214.528 764.224a31.936 31.936 0 1 0 45.12 45.184L512 557.184l252.288 252.288a31.936 31.936 0 0 0 45.12-45.12L557.12 512.064l252.288-252.352a31.936 31.936 0 1 0-45.12-45.184z"
              />
            </svg>
          </button>
        </header>

        <div className={styles.registerForm}>
          <div className={styles.inputContainer}>
            <div className={styles.inputLabel}>Enter your Email</div>
            <div className={styles.baseInput}>
              <input
                type="email"
                placeholder="Please enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.inputContainer}>
            <div className={styles.inputLabel}>New Password</div>
            <div className={styles.baseInput}>
              <input
                type="password"
                placeholder="Please enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.inputContainer}>
            <div className={styles.inputLabel}>Re-type the password</div>
            <div className={styles.baseInput}>
              <input
                type="password"
                placeholder="Please enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.inputContainer}>
            <div className={styles.inputLabel}>Verification Code</div>
            <div
              className={`${styles.baseInput} ${styles.verificationContainer}`}
            >
              <input
                className={styles.verificationInput}
                type="text"
                placeholder="Please enter the verification code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
              />
              <button onClick={handleSendVerification}>Send</button>
            </div>
          </div>

          <button
            className={`${styles.registerButton} ${
              isLoading ? styles.loadingButton : ""
            }`}
            onClick={handleForgotPassword}
          >
            {isLoading ? "Resetting Password..." : "Reset Password"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
