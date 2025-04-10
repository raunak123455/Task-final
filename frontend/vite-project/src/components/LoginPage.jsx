import React, { useEffect, useState } from "react";
import styles from "./LoginPage.module.css";
// import { Eye, EyeOff } from "lucide-react";
import astronaut from "../assets/Group.png";
import Back from "../assets/Back.png";
import icon from "../assets/icon.png";
import Lock from "../assets/Lock.png";
import { useNavigate } from "react-router-dom";
import { useUser } from "../UserContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { updateUser } = useUser();
  const { mail, setMail } = useUser();
  const { setLoggedIn, setUserObject, loggedIn } = useUser();

  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Check session storage for logged-in state on component mount
  useEffect(() => {
    const sessionLoggedIn = sessionStorage.getItem("loggedIn");
    const sessionUser = JSON.parse(sessionStorage.getItem("userObject"));

    if (sessionLoggedIn === "true" && sessionUser) {
      setUserObject(sessionUser);
      setMail(sessionUser.email);
      updateUser(sessionUser.name);
      setLoggedIn(true);
      navigate("/dashboard"); // Redirect if already logged in
    }
  }, [setLoggedIn, setUserObject, setMail, updateUser, navigate]);

  useEffect(() => {
    console.log("Mail updated:", mail); // Logs whenever `mail` changes
  }, [mail, loggedIn]);

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(
        "https://task-manager-0yqb.onrender.com/api/user/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        // Login successful, store state in session storage
        setMail(result.user.email);
        setUserObject(result.user);
        updateUser(result.user.name);
        setLoggedIn(true);
        toast.success("Logged in successfully!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });

        setTimeout(() => {
          sessionStorage.setItem("loggedIn", "true");
          sessionStorage.setItem("userObject", JSON.stringify(result.user));
          navigate("/dashboard");
        }, 2000);
      } else {
        setError(
          result.message || "Login failed. Please check your credentials."
        );
      }
    } catch (error) {
      setError("Server error. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupRedirect = () => {
    navigate("/signup"); // Redirect to the signup page
  };

  return (
    <div className={styles.container}>
      <ToastContainer />
      <div className={styles.leftSection}>
        <img src={Back} alt="back" className={styles.backimg} />
        <img
          src={astronaut}
          alt="Astronaut"
          className={styles.astronautImage}
        />
        <h1 className={styles.welcomeText}>Welcome aboard my friend</h1>
        <p className={styles.subText}>Just a couple of clicks and we start</p>
      </div>

      <div className={styles.rightSection}>
        <div className={styles.loginContainer}>
          <h2 className={styles.loginTitle}>Login</h2>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <div className={styles.inputGroup}>
                <div className={styles.formInput}>
                  <img src={icon} alt="" className={styles.inputimg} />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <div className={styles.formGroup}>
              <div className={styles.inputGroup}>
                <div className={styles.formInput}>
                  <img src={Lock} alt="" className={styles.inputimg} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={togglePassword}
                  disabled={isLoading}
                >
                  {/* {showPassword ? <EyeOff size={20} /> : <Eye size={20} />} */}
                </button>
              </div>
            </div>

            {error && <p className={styles.errorText}>{error}</p>}

            <button
              type="submit"
              className={styles.loginButton}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className={styles.spinnerContainer}>
                  <div className={styles.spinner}></div>
                  <span>Logging in...</span>
                </div>
              ) : (
                "Log in"
              )}
            </button>

            <div className={styles.registerContainer}>
              <p className={styles.registerText}>Have no account yet?</p>
              <button
                type="button"
                className={styles.registerLink}
                onClick={handleSignupRedirect}
                disabled={isLoading}
              >
                Register
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
