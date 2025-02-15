import React from "react";
import { useEffect, useState } from "react";

interface User {
  profile: {
    displayName: string;
    photos: { value: string }[];
  };
}

const Login = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch("/api/user", { credentials: "include" }) // Ensure cookies are included
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setUser(data);
        }
      })
      .catch((error) => console.error("Error fetching user:", error));
  }, []);

  const handleLogin = () => {
    window.location.href = "/auth/google"; // Redirect to Google OAuth login
  };

  const handleLogout = () => {
    fetch("/api/logout", { method: "POST", credentials: "include" })
      .then(() => setUser(null))
      .catch((error) => console.error("Logout failed:", error));
  };

  return (
    <div className="p-4">
      {user ? (
        <div>
          <p>Welcome, {user.profile.displayName}!</p>
          <img src={user.profile.photos[0].value} alt="User Avatar" className="w-16 h-16 rounded-full" />
          <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded mt-2">
            Logout
          </button>
        </div>
      ) : (
        <button onClick={handleLogin} className="bg-blue-500 text-white px-4 py-2 rounded">
          Login with Google
        </button>
      )}
    </div>
  );
};

export default Login;
