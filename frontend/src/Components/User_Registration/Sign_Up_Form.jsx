import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function SignUpForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [description, setDescription] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({
    email: "",
    first_name: "",
    last_name: "",
    image_url: "",
    description: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({ email: "", first_name: "", last_name: "", description: "", image_url: "", password: "" });
    setLoading(true);

    const userData = {
      email,
      first_name: firstName,
      last_name: lastName,
      image_url: profilePicture,
      description,
      password,
    };

    axios
      .post("http://localhost:8000/api/register/", userData, {
        headers: { "Content-Type": "application/json" },
      })
      .then((response) => {
        document.cookie = `token=${response.data.token}; path=/`;
        localStorage.setItem("user", JSON.stringify(response.data.user));
        navigate("/chats");
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
        }
      })
      .finally(() => setLoading(false));
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col w-full max-w-md gap-5 p-8 bg-gray-900 border border-gray-700 rounded-2xl shadow-lg"
      >
        <h1 className="text-white text-3xl font-bold text-center">Sign Up</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setErrors((prev) => ({ ...prev, email: "" }));
          }}
          required
          className="text-white bg-gray-800 px-4 py-3 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 transition"
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                setErrors((prev) => ({ ...prev, first_name: "" }));
              }}
              className="text-white bg-gray-800 px-4 py-3 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 w-full transition"
            />
            {errors.first_name && (
              <p className="text-red-500 text-sm">{errors.first_name}</p>
            )}
          </div>

          <div className="flex-1">
            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value);
                setErrors((prev) => ({ ...prev, last_name: "" }));
              }}
              className="text-white bg-gray-800 px-4 py-3 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 w-full transition"
            />
            {errors.last_name && (
              <p className="text-red-500 text-sm">{errors.last_name}</p>
            )}
          </div>
        </div>

        <input
          type="url"
          placeholder="Profile Picture URL"
          value={profilePicture}
          onChange={(e) => {
            setProfilePicture(e.target.value);
            setErrors((prev) => ({ ...prev, image_url: "" }));
          }}
          className="text-white bg-gray-800 px-4 py-3 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 transition"
        />
        {profilePicture && isValidUrl(profilePicture) && (
          <div className="flex justify-center mt-2">
            <img
              src={profilePicture}
              alt="Profile Preview"
              className="w-32 h-32 rounded-full border-2 border-gray-600 object-cover"
              onError={() => setErrors((prev) => ({ ...prev, image_url: "Invalid URL" }))}
            />
          </div>
        )}
        {errors.image_url && <p className="text-red-500 text-sm">{errors.image_url}</p>}

        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            setErrors((prev) => ({ ...prev, description: "" }));
          }}
          className="text-white bg-gray-800 px-4 py-3 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 transition"
        />
        {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setErrors((prev) => ({ ...prev, password: "" }));
          }}
          required
          className="text-white bg-gray-800 px-4 py-3 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 transition"
        />
        {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}

        <button
          type="submit"
          disabled={loading}
          className={`bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold mt-2 transition flex justify-center items-center ${
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
