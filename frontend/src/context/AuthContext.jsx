import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContextInstance";
import { getProfile, loginUser, logoutUser, registerUser, getCookie, setCookie, deleteCookie } from "../services/api";



export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { 
    (async () => { 
      try { 
        const token = getCookie("auth_token");
        if (token) {
          setUser(await getProfile()); 
        }
      } catch { 
        deleteCookie("auth_token"); 
      } finally { 
        setLoading(false); 
      } 
    })(); 
  }, []);

  const completeAuth = (result) => { 
    setCookie("auth_token", result.token, 7); // 7 days expiry
    setUser(result.user); 
    return result.user; 
  };
  
  const login = async (email, password) => completeAuth(await loginUser({ email, password }));
  
  const register = async (name, email, password) => {
    const result = await registerUser({ name, email, password });
    // Registration ke baad token store NAHI karna
    // Sirf result return karo
    return result;
  };

  const logout = async () => {
    try { 
      const token = getCookie("auth_token");
      if (token) {
        await logoutUser(); 
      }
    } catch { 
      /* token is cleared locally regardless */ 
    }
    setUser(null);
    deleteCookie("auth_token");
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