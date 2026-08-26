import React, { useState } from "react";
import axios from "axios";
import "./SignUp.css";
import { useNavigate, Link } from "react-router-dom";

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!username || !email || !password) {
      setError("Username, email and password are required.");
      return;
    }

    if (password.includes(username)) {
      setError("Password cannot be similar to username.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:5251/api/auth/register",
        {
          username: username,
          email: email,
          password: password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Signup response:", response.data);

      if (response.data?.success && response.data?.token) {
        localStorage.setItem("token", response.data.token);

        if (response.data.user) {
          localStorage.setItem(
            "user",
            JSON.stringify(response.data.user)
          );
        }

        alert("Signed up successfully!");

        navigate("/login");
      } else {
        setError("Signup completed, but no token was returned.");
      }
    } catch (err) {
      console.error("Signup error:", err);

      if (err.response) {
        console.error("Server response:", err.response.data);

        setError(
          err.response.data?.message ||
            err.response.data?.detail ||
            "Failed to sign up. Please try again."
        );
      } else {
        setError(
          "Cannot connect to the backend. Make sure the API is running on port 5251."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-popup">

        <h2>Sign Up</h2>

        <form onSubmit={handleSubmit}>

          <div className="input-group">
            <label>Username</label>

            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>

          <div className="input-group">
            <label>Email</label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>

            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="input-group">
            <label>
              <input
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
              />

              {" "}Show Password
            </label>
          </div>

          {error && (
            <p className="error-text">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="signup-btn"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>

        </form>

        <p className="login-text">
          Already have an account?{" "}
          <Link to="/login">
            Log in here
          </Link>
        </p>

      </div>
    </div>
  );
};

export default SignUp;