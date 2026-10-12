import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components";
import { checkLoginFormData } from "../utils/checkLoginFormData";
import customFetch from "../axios/custom";
import toast from "react-hot-toast";
import { useEffect } from "react";
import { setLoginStatus } from "../features/auth/authSlice";
import { store } from "../store";

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Get form data
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);
    // Check if form data is valid
    if (!checkLoginFormData(data)) return;
    
    // Check if user with the email and password exists
    const users = await customFetch.get("/users");
    let userId: number = 0; // Initialize userId with a default value
    const userExists = users.data.some(
      (user: { id: number; email: string; password: string }) => {
        if (user.email === data.email) {
          userId = user.id;
        }
        return user.email === data.email && user.password === data.password;
      }
    );
    
    // if user exists, show success message
    if (userExists) {
      toast.success("Connexion réussie");
      localStorage.setItem("user", JSON.stringify({...data, id: userId}));
      store.dispatch(setLoginStatus(true));
      navigate("/user-profile");
      return;
    } else {
      toast.error("E-mail ou mot de passe incorrect");
    }
  };

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      toast.success("Tu es déjà connecté");
      navigate("/user-profile");
    }
  }, [navigate]);

  return (
    <div className="max-w-screen-2xl mx-auto pt-24 flex items-center justify-center">
      <form
        onSubmit={handleLogin}
        className="max-w-5xl mx-auto flex flex-col gap-5 max-sm:gap-3 items-center justify-center max-sm:px-5"
      >
        <h2 className="font-display text-exaltNavy text-5xl text-center mb-5 font-bold max-md:text-4xl max-sm:text-3xl max-[450px]:text-xl max-[450px]:font-normal">
          Content de te revoir !
        </h2>
        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-col gap-1">
            <label htmlFor="name">E-mail</label>
            <input
              type="email"
              className="bg-white border border-gray-300 rounded-xl text-base h-12 px-4 w-full focus:border-exaltNavy focus:ring-exaltNavy max-[450px]:text-base"
              placeholder="Adresse e-mail"
              name="email"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="name">Mot de passe</label>
            <input
              type="password"
              className="bg-white border border-gray-300 rounded-xl text-base h-12 px-4 w-full focus:border-exaltNavy focus:ring-exaltNavy max-[450px]:text-base"
              placeholder="Mot de passe"
              name="password"
            />
          </div>
        </div>
        <Button type="submit" text="Se connecter" mode="primary" />
        <Link
          to="/register"
          className="text-xl max-md:text-lg max-[450px]:text-sm"
        >
          Pas encore de compte ?{" "}
          <span className="text-exaltNavy">Crée-le maintenant</span>.
        </Link>
      </form>
    </div>
  );
};
export default Login;
