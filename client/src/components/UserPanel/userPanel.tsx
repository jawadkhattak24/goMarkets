import { FC, useState, useEffect } from "react";
import styles from "./styles/userPanel.module.scss";
import { useAuth } from "../../contexts/authContext";
import cardPlaceholder from "./assets/cardPlaceholder.png";
import axios from "axios";
import { useNotification } from "../../contexts/notificationContext";

interface UserPanelProps {
  setIsUserPanelOpen: (value: boolean) => void;
}

type MenuItem = {
  id: string;
  label: string;
};

const menuItems: MenuItem[] = [
  { id: "billing", label: "Billing Details" },
  { id: "deposit", label: "Deposit" },
  { id: "withdrawal", label: "Withdrawal" },
  { id: "wallet", label: "Wallet" },
  { id: "verification", label: "Real Name Verification" },
  { id: "invite", label: "Invite Friends" },
  { id: "password", label: "Change Password" },
  { id: "complaint", label: "Complaint Email" },
  { id: "announcement", label: "Announcement" },
  { id: "service", label: "Online Service" },
];

const UserPanel: FC<UserPanelProps> = ({ setIsUserPanelOpen }) => {
  const [activeMenuItem, setActiveMenuItem] = useState("billing");
  const { logout, currentUser } = useAuth();
  const { showNotification } = useNotification();

  return (
    <div className={styles.userPanelDialogOverlay}>
      <div className={styles.dialog}>
        <header className={styles.dialogHeader}>
          <span role="heading" aria-level={2} className={styles.dialogTitle}>
            Mine
          </span>
          <button
            aria-label="Close this dialog"
            className={styles.closeButton}
            type="button"
            onClick={() => setIsUserPanelOpen(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
              <path
                fill="currentColor"
                d="M764.288 214.592 512 466.88 259.712 214.592a31.936 31.936 0 0 0-45.12 45.12L466.752 512 214.528 764.224a31.936 31.936 0 1 0 45.12 45.184L512 557.184l252.288 252.288a31.936 31.936 0 0 0 45.12-45.12L557.12 512.064l252.288-252.352a31.936 31.936 0 1 0-45.12-45.184z"
              />
            </svg>
          </button>
        </header>

        <div className={styles.dialogBody}>
          <div className={styles.contentWrapper}>
            <div className={styles.sidebar}>
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className={`${styles.funcOption} ${
                    activeMenuItem === item.id ? styles.active : ""
                  }`}
                  onClick={() => setActiveMenuItem(item.id)}
                >
                  {item.label}
                </div>
              ))}
              <div
                className={styles.logoutButton + " " + styles.funcOption}
                onClick={() => {
                  logout();
                  setIsUserPanelOpen(false);
                  showNotification("Logout successfully", "success");
                }}
              >
                Logout
              </div>
            </div>

            <div className={styles.mainContent}>
              {activeMenuItem === "verification" ? (
                <RealNameVerification />
              ) : activeMenuItem === "deposit" ? (
                <DepositCard />
              ) : activeMenuItem === "withdrawal" ? (
                <WithdrawalCard />
              ) : activeMenuItem === "complaint" ? (
                <ComplaintCard />
              ) : activeMenuItem === "announcement" ? (
                <AnnouncementCard />
              ) : activeMenuItem === "password" ? (
                <ChangePassword />
              ) : activeMenuItem === "invite" ? (
                <InviteFriends />
              ) : activeMenuItem === "wallet" ? (
                <WalletCard />
              ) : activeMenuItem === "service" ? (
                <ServiceCard />
              ) : (
                <>
                  <div className={styles.balanceCard}>
                    <div className={styles.balanceTitle}>USD</div>
                    <div className={styles.balanceInfo}>
                      <div className={styles.balanceItem}>
                        <div className={styles.label}>Available</div>
                        <div className={styles.valuePositive}>0</div>
                      </div>
                      <div className={styles.balanceItem}>
                        <div className={styles.label}>Freeze</div>
                        <div className={styles.value}>0</div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.recordsTitle}>Financial Records</div>

                  <div className={styles.recordsContainer}>
                    <div className={styles.emptyState}>
                      <div className={styles.emptyIcon}>
                        {/* You might want to replace this with a simpler empty state icon */}
                      </div>
                      <p className={styles.emptyText}>No data yet</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ComplaintCard = () => {
  return (
    <div className={styles.complaintCard}>
      <div className={styles.emailInput}>
        <p>contact@gomktsglb.cc</p>
        <button type="button" className={styles.copyButton}>
          Copy
        </button>
      </div>
    </div>
  );
};

const ServiceCard = () => {
  return (
    <div className={styles.serviceCard}>
      <div className={styles.serviceContent}>
        <a href="https://t.me/jerry_maguire_007">
          <button className={styles.serviceButton}>
            Contact Customer Service
          </button>
        </a>
      </div>
    </div>
  );
};

const AnnouncementCard = () => {
  return (
    <div className={styles.announcementCard}>
      <div className={styles.announcementContent}>
        <p>
          Due to policy reasons, services are not provided to North Korea,
          Israel, China, Vanuatu, and Cuba.
        </p>
      </div>
    </div>
  );
};

const DepositCard = () => {
  const [paymentMethod, setPaymentMethod] = useState<"crypto" | "bank">(
    "crypto"
  );
  const [network, setNetwork] = useState("ETH");
  const [coins, setCoins] = useState("");

  return (
    <div className={styles.depositCard}>
      <div className={styles.paymentSelector}>
        <div
          className={`${styles.paymentOption} ${
            paymentMethod === "crypto" ? styles.active : ""
          }`}
          onClick={() => setPaymentMethod("crypto")}
        >
          Digital Currency
        </div>
        <div
          className={`${styles.paymentOption} ${
            paymentMethod === "bank" ? styles.active : ""
          }`}
          onClick={() => setPaymentMethod("bank")}
        >
          Bank Card
        </div>
      </div>

      {paymentMethod === "crypto" ? (
        <form className={styles.depositForm}>
          <div className={styles.formGroup}>
            <label>Select Network</label>
            <select
              value={network}
              onChange={(e) => setNetwork(e.target.value)}
              className={styles.selectNetwork}
            >
              <option value="ETH">ETH</option>
              <option value="BTC">BTC</option>
              <option value="USDT">USDT</option>
            </select>
          </div>

          <div
            className={styles.formGroup + " " + styles.walletAddressContainer}
          >
            <label>Wallet Address</label>
            <div className={styles.walletAddress}>
              <canvas width="100" height="100" />
              <div className={styles.addressCopy}>
                <span>0x138A4E06e73C54A06c9695741b7e5aeA7533B733</span>
                {/* <button className={styles.copyButton}>
                  <svg className={styles.copyIcon}>
                    <use xlinkHref="#icon-copy" />
                  </svg>
                </button> */}
              </div>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Number of coins</label>
            <input
              className={styles.inputNumber}
              type="text"
              value={coins}
              onChange={(e) => setCoins(e.target.value)}
              placeholder="Please enter the number of coins to be charged"
            />
          </div>

          <div className={styles.formGroup + " " + styles.uploadSection}>
            <label>Uploading Certificate</label>
            <div className={styles.uploadArea}>
              <input type="file" accept="image/*" />
              <div className={styles.uploadDragger}>
                <svg viewBox="0 0 1024 1024">
                  <path
                    fill="currentColor"
                    d="M544 864V672h128L512 480 352 672h128v192H320v-1.6c-5.376.32-10.496 1.6-16 1.6A240 240 0 0 1 64 624c0-123.136 93.12-223.488 212.608-237.248A239.808 239.808 0 0 1 512 192a239.872 239.872 0 0 1 235.456 194.752c119.488 13.76 212.48 114.112 212.48 237.248a240 240 0 0 1-240 240c-5.376 0-10.56-1.28-16-1.6v1.6z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <button type="submit" className={styles.submitButton}>
            Submit
          </button>
        </form>
      ) : (
        <form className={styles.depositForm}>
          <div className={styles.formGroup}>
            <label>Receipt Currency</label>
            <select
              value={network}
              onChange={(e) => setNetwork(e.target.value)}
              className={styles.selectNetwork}
            >
              <option value="USD">USD</option>
              <option value="CNY">CNY</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Recharge Amount</label>
            <input
              className={styles.inputNumber}
              type="text"
              value={coins}
              onChange={(e) => setCoins(e.target.value)}
              placeholder="Please enter the recharge amount"
            />
          </div>

          <div className={styles.formGroup + " " + styles.uploadSection}>
            <label>Uploading Certificate</label>
            <div className={styles.uploadArea}>
              <input type="file" accept="image/*" />
              <div className={styles.uploadDragger}>
                <svg viewBox="0 0 1024 1024">
                  <path
                    fill="currentColor"
                    d="M544 864V672h128L512 480 352 672h128v192H320v-1.6c-5.376.32-10.496 1.6-16 1.6A240 240 0 0 1 64 624c0-123.136 93.12-223.488 212.608-237.248A239.808 239.808 0 0 1 512 192a239.872 239.872 0 0 1 235.456 194.752c119.488 13.76 212.48 114.112 212.48 237.248a240 240 0 0 1-240 240c-5.376 0-10.56-1.28-16-1.6v1.6z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <button type="submit" className={styles.submitButton}>
            Submit
          </button>
        </form>
      )}

      {/* <div className={styles.depositHistory}>
        <h3>Deposit record</h3>
        <div className={styles.historyList}></div>
      </div> */}
    </div>
  );
};

const WithdrawalCard = () => {
  const [currency, setCurrency] = useState("BTC");
  const [address, setAddress] = useState("");
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [remark, setRemark] = useState("");
  const [withdrawalMethod, setWithdrawalMethod] = useState("crypto");

  return (
    <div className={styles.depositCard}>
      <div className={styles.paymentSelector}>
        <div
          className={`${styles.paymentOption} ${
            withdrawalMethod === "crypto" ? styles.active : ""
          }`}
          onClick={() => setWithdrawalMethod("crypto")}
        >
          Digital Currency
        </div>
        <div
          className={`${styles.paymentOption} ${
            withdrawalMethod === "bank" ? styles.active : ""
          }`}
          onClick={() => setWithdrawalMethod("bank")}
        >
          Bank Card
        </div>
      </div>

      {withdrawalMethod === "crypto" ? (
        <form className={styles.depositForm}>
          <div className={styles.formGroup}>
            <label>Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className={styles.selectNetwork}
            >
              <option value="BTC">BTC</option>
              <option value="ETH">ETH</option>
              <option value="USDT">USDT</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>Address For Coin</label>
            <select
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={styles.selectNetwork}
            >
              <option value="BTC">
                0x138A4E06e73C54A06c9695741b7e5aeA7533B733
              </option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Withdrawal Amount (USD)</label>
            <input
              className={styles.inputNumber}
              type="text"
              value={withdrawalAmount}
              onChange={(e) => setWithdrawalAmount(e.target.value)}
              placeholder="Amount"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Remark</label>
            <textarea
              className={styles.inputNumber}
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="Remark"
            />
          </div>

          <button type="submit" className={styles.submitButton}>
            Submit
          </button>
        </form>
      ) : (
        <form className={styles.depositForm}>
          <div className={styles.formGroup}>
            <label>Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className={styles.selectNetwork}
            >
              <option value="USD">USD</option>
              <option value="CNY">CNY</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>Payee Account</label>
            <select
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={styles.selectNetwork}
            >
              <option value="BTC">75487361548</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Amount (USD)</label>
            <input
              className={styles.inputNumber}
              type="text"
              value={withdrawalAmount}
              onChange={(e) => setWithdrawalAmount(e.target.value)}
              placeholder="Amount"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Remark</label>
            <textarea
              className={styles.inputNumber}
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="Remark"
            />
          </div>

          <button type="submit" className={styles.submitButton}>
            Submit
          </button>
        </form>
      )}
    </div>
  );
};

const RealNameVerification = () => {
  const { showNotification } = useNotification();
  const [name, setName] = useState("");
  const { currentUser } = useAuth();
  const [idNumber, setIdNumber] = useState("");
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);

  const handleImageUpload = (side: "front" | "back", file: File) => {
    const previewUrl = URL.createObjectURL(file);

    if (side === "front") {
      setFrontImage(file);
      setFrontPreview(previewUrl);
    } else {
      setBackImage(file);
      setBackPreview(previewUrl);
    }
  };
  useEffect(() => {
    return () => {
      if (frontPreview) URL.revokeObjectURL(frontPreview);
      if (backPreview) URL.revokeObjectURL(backPreview);
    };
  }, [frontPreview, backPreview]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("submit");

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:3000/api/user/real-name-verification",
        {
          currentUser,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        showNotification("Verification submitted for auditing", "success");
      } else {
        showNotification("Failed to submit verification", "error");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return currentUser?.verificationStatus === "UNVERIFIED" ? (
    <div className={styles.authPage}>
      <div className={styles.uploadInstruction}>
        Please upload the front and back of your passport/ID
      </div>

      <div className={styles.uploadCard}>
        <div className={styles.uploadSection}>
          <div className={styles.uploadInfo}>
            <div className={styles.uploadTitle}>Front</div>
            <div className={styles.uploadSubtitle}>
              Upload the front of your passport/certificate
            </div>
          </div>
          <div className={styles.uploadBox}>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleImageUpload("front", e.target.files[0]);
                }
              }}
            />
            {frontPreview ? (
              <img
                src={frontPreview}
                alt="Front preview"
                className={styles.previewImage}
              />
            ) : (
              <img src={cardPlaceholder} alt="Upload front" />
            )}
          </div>
        </div>

        <div className={styles.uploadSection}>
          <div className={styles.uploadInfo}>
            <div className={styles.uploadTitle}>Reverse side</div>
            <div className={styles.uploadSubtitle}>
              Upload the reverse side of your passport/certificate
            </div>
          </div>
          <div className={styles.uploadBox}>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleImageUpload("back", e.target.files[0]);
                }
              }}
            />
            {backPreview ? (
              <img
                src={backPreview}
                alt="Back preview"
                className={styles.previewImage}
              />
            ) : (
              <img src={cardPlaceholder} alt="Upload back" />
            )}
          </div>
        </div>
      </div>

      <div className={styles.formCard}>
        <div className={styles.formTitle}>
          Please complete your personal information
        </div>
        <form onSubmit={handleSubmit}>
          <div className={styles.formItem}>
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Please enter your name"
            />
          </div>
          <div className={styles.formItem}>
            <label htmlFor="idNumber">Passport/ID number</label>
            <input
              id="idNumber"
              type="text"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              placeholder="Please enter your passport/ID number"
            />
          </div>
        </form>
      </div>

      <button
        disabled={!frontImage || !backImage || !name || !idNumber}
        onClick={handleSubmit}
        type="button"
        className={styles.submitButton}
      >
        Confirmation
      </button>
    </div>
  ) : (
    <div>
      {currentUser?.verificationStatus === "AUDITING" ? (
        <div
          style={{
            textAlign: "center",
            fontSize: "24px",
            marginTop: "100px",
          }}
        >
          <i style={{ fontSize: "60px", color: "#0166fc" }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1024 1024"
              style={{ width: "60px", height: "60px" }}
            >
              <path
                fill="currentColor"
                d="M160 224a32 32 0 0 0-32 32v512a32 32 0 0 0 32 32h704a32 32 0 0 0 32-32V256a32 32 0 0 0-32-32zm0-64h704a96 96 0 0 1 96 96v512a96 96 0 0 1-96 96H160a96 96 0 0 1-96-96V256a96 96 0 0 1 96-96"
              ></path>
              <path
                fill="currentColor"
                d="M704 320a64 64 0 1 1 0 128 64 64 0 0 1 0-128M288 448h256q32 0 32 32t-32 32H288q-32 0-32-32t32-32m0 128h256q32 0 32 32t-32 32H288q-32 0-32-32t32-32"
              ></path>
            </svg>
          </i>
          <div style={{ fontSize: "32px" }}>Audit</div>
        </div>
      ) : (
        "Verification completed"
      )}
    </div>
  );
};

const ChangePassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
  };

  const handleSendCode = () => {
    // Handle sending verification code
  };

  return (
    <div className={styles.changePasswordCard}>
      <form className={styles.passwordForm} onSubmit={handleSubmit}>
        <div className={styles.formItemChangePassowrd}>
          <label className={styles.labelChangePassword} htmlFor="password">
            Please enter your password
          </label>
          <div className={styles.inputWrapper}>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Please enter your password"
            />
          </div>
        </div>

        <div className={styles.formItemChangePassowrd}>
          <label
            className={styles.labelChangePassword}
            htmlFor="confirmPassword"
          >
            Re-type the password
          </label>
          <div className={styles.inputWrapper}>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-type the password"
            />
          </div>
        </div>

        <div className={styles.formItemChangePassowrd}>
          <label
            className={styles.labelChangePassword}
            htmlFor="verificationCode"
          >
            Please enter the verification code
          </label>
          <div className={styles.inputWrapper}>
            <input
              id="verificationCode"
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Please enter the verification code"
            />
            <button
              type="button"
              className={styles.sendCodeButton}
              onClick={handleSendCode}
            >
              Send
            </button>
          </div>
        </div>

        <button type="submit" className={styles.submitButton}>
          Submit
        </button>
      </form>
    </div>
  );
};

const InviteFriends = () => {
  const inviteCode = "NTWJ40";
  const inviteLink = `https://pc.gomktsglb.cc/#/?invite_code=${inviteCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    // Add toast or notification for successful copy
  };

  return (
    <div className={styles.inviteCard}>
      <div className={styles.inviteCodeSection}>
        <div className={styles.label}>Invitation Code</div>
        <div className={styles.code}>{inviteCode}</div>
      </div>

      <canvas className={styles.qrCode} width="160" height="160" />

      <div className={styles.inviteLink}>{inviteLink}</div>

      <button
        type="button"
        className={styles.copyButtonInviteFriend}
        onClick={handleCopyLink}
      >
        Copy Invitation Link
      </button>
    </div>
  );
};

const WalletCard = () => {
  return (
    <div className={styles.walletList}>
      <div className={styles.balanceSection}>
        <div className={styles.sectionTitle}>Balance</div>
        <div className={styles.balanceAmount}>0</div>
      </div>

      <div>
        <div className={styles.sectionTitle}>Bank Card</div>
        <div className={styles.cardList}>
          <div className={styles.addCard}>
            <i className={styles.addIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
                <path
                  fill="currentColor"
                  d="M480 480V128a32 32 0 0 1 64 0v352h352a32 32 0 1 1 0 64H544v352a32 32 0 1 1-64 0V544H128a32 32 0 0 1 0-64z"
                />
              </svg>
            </i>
          </div>
        </div>

        <div className={styles.sectionTitle}>Digital Currency</div>
        <div className={styles.currencyList}>
          <div className={styles.addCard}>
            <i className={styles.addIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
                <path
                  fill="currentColor"
                  d="M480 480V128a32 32 0 0 1 64 0v352h352a32 32 0 1 1 0 64H544v352a32 32 0 1 1-64 0V544H128a32 32 0 0 1 0-64z"
                />
              </svg>
            </i>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPanel;
