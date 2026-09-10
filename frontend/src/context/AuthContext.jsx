import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContextInstance";
<<<<<<< HEAD
import { getProfile, loginUser, logoutUser, registerUser, getCookie, setCookie, deleteCookie } from "../services/api";
=======
import { getProfile, loginUser, logoutUser, registerUser } from "../services/api";
>>>>>>> 44b3f4f25f8dec5b5792013489c733fe2dfd9440



export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

<<<<<<< HEAD
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
=======
  useEffect(() => { (async () => { try { if (localStorage.getItem("auth_token")) setUser(await getProfile()); } catch { localStorage.removeItem("auth_token"); } finally { setLoading(false); } })(); }, []);

  const completeAuth = (result) => { localStorage.setItem("auth_token", result.token); setUser(result.user); return result.user; };
  const login = async (email, password) => completeAuth(await loginUser({ email, password }));
  const register = async (name, email, password) => completeAuth(await registerUser({ name, email, password }));

  const logout = async () => {
    try { if (localStorage.getItem("auth_token")) await logoutUser(); } catch { /* token is cleared locally regardless */ }
    setUser(null);
    localStorage.removeItem("auth_token");
>>>>>>> 44b3f4f25f8dec5b5792013489c733fe2dfd9440
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
<<<<<<< HEAD
};
=======
};



>>>>>>> 44b3f4f25f8dec5b5792013489c733fe2dfd9440
