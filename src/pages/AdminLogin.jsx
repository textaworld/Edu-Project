import { useState } from "react";
import { useAdminLogin } from "../hooks/useAdminLogin";
import { Navigate, Link } from "react-router-dom";
import "../styles/adminLogin.css";


const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, error, isLoading } = useAdminLogin();

  const handleSubmit = async (e) => {
    e.preventDefault();

    await login(email, password);
  };

  return (
    <div>
    
      <div className="create-popup">
        <form onSubmit={handleSubmit}>
          <h2>Log In</h2>

          <label>
            Email address:
            <input
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
              title="Enter a valid email address"
              required
            />
          </label>
          <label>
            Password:
            <input
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              required
            />
          </label>
          <label>
            <Link to={"/forgotpass"}>
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
   

   

    </div>
  );
};

export default AdminLogin;
