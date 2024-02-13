import { useState } from "react";
import { useLogin } from "../hooks/useLogin";

import { Link, useNavigate, useLocation } from "react-router-dom";
import Spinner from "../components/Spinner";

const SuperAdminLogin = () => {
  const { login, verifyLogin, error, isLoading } = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    login(email, password)
      .then((result) => {
        if (result.success) {
          // Handle successful login
          //setEmail("");
          //setPassword("");
          setOtpSent(true);
        } else {
          // Handle login failure
          setOtpSent(false);
          
        }
      })
      .catch((error) => {
        // Handle any unexpected errors during the login process
        setOtpSent(false);
        
      });

    // navigate(from, { replace: true });
  };

  const handleVerify = async (e) => {
    e.preventDefault();

    await verifyLogin(otp);
    setOtp("");
    //setPassword("");
    // navigate(from, { replace: true });
  };

  return (
    <div>
      {!otpSent ? (
        <div className="create-popup">
          {isLoading && <Spinner />}
          <form onSubmit={handleSubmit}>
            <h2>Super Admin Log In</h2>

            <label>
              Email address :
              <input
                type="email"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                required
                pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
                title="Enter a valid email address"
              />
            </label>
            <label>
              Password :
              <input
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                required
              />
            </label>
            <label>
              <Link to={"/spforgotpass"}>
                <h4>Forgot password</h4>
              </Link>
            </label>
            <div className="errorContainer">
              {error && <div className="error">{error}</div>}
            </div>

            <button className="loginButton" disabled={isLoading}>
              Log in
            </button>
          </form>
        </div>
      ) : (
        <div className="create-popup">
          {isLoading && <Spinner />}
          <form onSubmit={handleVerify}>
            <h2>Verify OTP</h2>

            <p>
              Please enter the OTP sent to your email address to complete the
              verification.
            </p>

            <label>
              OTP:
              <input
                type="text"
                onChange={(e) => setOtp(e.target.value)}
                value={otp}
                required
              />
            </label>

            <div className="errorContainer">
              {error && <div className="error">{error}</div>}
            </div>

            <div className="buttonContainer">
              <button className="loginButton" disabled={isLoading}>
                Verify
              </button>
              <button className="okButton" onClick={() => setOtpSent(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default SuperAdminLogin;
