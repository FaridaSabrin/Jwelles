import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContextInstance";
import { getProfile, loginUser, logoutUser, registerUser } from "../services/api";



export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => { try { if (localStorage.getItem("auth_token")) setUser(await getProfile()); } catch { localStorage.removeItem("auth_token"); } finally { setLoading(false); } })(); }, []);

  const completeAuth = (result) => { localStorage.setItem("auth_token", result.token); setUser(result.user); return result.user; };
  const login = async (email, password) => completeAuth(await loginUser({ email, password }));
  const register = async (name, email, password) => completeAuth(await registerUser({ name, email, password }));

  const logout = async () => {
    try { if (localStorage.getItem("auth_token")) await logoutUser(); } catch { /* token is cleared locally regardless */ }
    setUser(null);
    localStorage.removeItem("auth_token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
        register,
        isAuthenticated: Boolean(user),
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};



