import { useState } from "react";
import styles from "../register/styles/register.module.scss";
import axios from "axios";
import { useAuth } from "../../../contexts/authContext";
import { useNotification } from "../../../contexts/notificationContext";
const Login = ({
  setIsLoginOpen,
}: {
  setIsLoginOpen: (value: boolean) => void;
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { showNotification, isLoading, setIsLoading } = useNotification();

  const { login } = useAuth();

  console.log("Login", login);
  const handleClose = () => {
    setIsLoginOpen(false);
  };

  //   const handleSendVerification = () => {
  //     // Add verification code sending logic here
  //   };

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `http://localhost:3000/api/user/login`,
        {
          email,
          password,
        }
      );
      console.log("User logged in", response.data);
      if (response.status === 200) {
        login(response.data.user, response.data.token);
        setIsLoading(false);
        setIsLoginOpen(false);
        showNotification("Logged in successfully", "success");
      }
    } catch (error) {
      console.error(error);
      showNotification("Login failed", "error");
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.registerDialogOverlay}>
      <div className={styles.loginDialog}>
        <header className={styles.header}>
          <div className={styles.headerText}>Welcome to login</div>
          <button className={styles.closeButton} onClick={handleClose}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
              <path
                fill="currentColor"
                d="M764.288 214.592 512 466.88 259.712 214.592a31.936 31.936 0 0 0-45.12 45.12L466.752 512 214.528 764.224a31.936 31.936 0 1 0 45.12 45.184L512 557.184l252.288 252.288a31.936 31.936 0 0 0 45.12-45.12L557.12 512.064l252.288-252.352a31.936 31.936 0 1 0-45.12-45.184z"
              />
            </svg>
          </button>
        </header>

        <div>
          <div className={styles.inputContainer}>
            <div className={styles.inputLabel}>Email</div>
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
            <div className={styles.inputLabel}>Password</div>
            <div className={styles.baseInput}>
              <input
                type="password"
                placeholder="Please enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* <div className={styles.inputContainer}>
          <div className={styles.inputLabel}>Invitation Code</div>
          <div className={styles.baseInput}>
            <input
              type="text"
              placeholder="Please enter the invitation code"
              value={invitationCode}
              onChange={(e) => setInvitationCode(e.target.value)}
            />
          </div>
        </div> */}

          {/* <div className={styles.inputContainer}>
          <div className={styles.inputLabel}>Verification Code</div>
          <div className={`${styles.baseInput} ${styles.verificationContainer}`}>
            <input
              type="text"
              placeholder="Please enter the verification code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
            />
            <button onClick={handleSendVerification}>Send</button>
          </div>
        </div> */}

          <button
            disabled={isLoading}
            className={`${styles.registerButton} ${
              isLoading ? styles.loadingButton : ""
            }`}
            onClick={handleLogin}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
