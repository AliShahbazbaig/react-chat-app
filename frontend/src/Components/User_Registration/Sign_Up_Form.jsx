import React, { useState } from "react";
import axios from "axios";

function SignUpForm() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({
    email: "",
    first_name: "",
    last_name: "",
    password: "",
  });
  const [loading, setLoading] = useState(false); // loading state

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({ email: "", first_name: "", last_name: "", password: "" });
    setLoading(true); // start loading

    const userData = {
      email: email,
      first_name: firstName,
      last_name: lastName,
      password: password,
    };

    axios
      .post("http://localhost:8000/api/register/", userData, {
        headers: { "Content-Type": "application/json" },
      })
      .then((response) => {
        console.log("User registered successfully:", response.data);
        localStorage.setItem("token", response.data.token);
        // optional: redirect to login page
      })
      .catch((error) => {
        if (error.response && error.response.data) {
          const data = error.response.data;
          setErrors({
            email: data.email ? data.email[0] : "",
            first_name: data.first_name ? data.first_name[0] : "",
            last_name: data.last_name ? data.last_name[0] : "",
            password: data.password ? data.password[0] : "",
          });
        } else {
          console.error("Error registering user:", error);
        }
      })
      .finally(() => {
        setLoading(false); // stop loading
      });
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-800">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col w-full max-w-sm gap-4 p-6 border rounded-xl shadow-md bg-gray-900"
      >
        <h1 className="text-white text-2xl font-semibold text-center mb-4">
          Sign Up
        </h1>

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setErrors((prev) => ({ ...prev, email: "" }));
          }}
          required
          className="text-white bg-gray-800 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}

        {/* First Name */}
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => {
            setFirstName(e.target.value);
            setErrors((prev) => ({ ...prev, first_name: "" }));
          }}
          className="text-white bg-gray-800 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
        />
        {errors.first_name && (
          <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>
        )}

        {/* Last Name */}
        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => {
            setLastName(e.target.value);
            setErrors((prev) => ({ ...prev, last_name: "" }));
          }}
          className="text-white bg-gray-800 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
        />
        {errors.last_name && (
          <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>
        )}

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setErrors((prev) => ({ ...prev, password: "" }));
          }}
          required
          className="text-white bg-gray-800 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
        />
        {errors.password && (
          <p className="text-red-500 text-sm mt-1">{errors.password}</p>
        )}

        <button
          type="submit"
          disabled={loading} // disable button while loading
          className={`bg-blue-600 text-white py-2 rounded-md mt-2 transition hover:bg-blue-700 flex justify-center items-center ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
}

export default SignUpForm;
