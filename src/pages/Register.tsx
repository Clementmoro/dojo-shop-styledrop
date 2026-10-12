import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components";
import { checkRegisterFormData } from "../utils/checkRegisterFormData";
import customFetch from "../axios/custom";
import toast from "react-hot-toast";

const Register = () => {
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Get form data
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);
    // Check if form data is valid
    if (!checkRegisterFormData(data)) return;

    // Check if user with this email already exists
    const users = await customFetch.get("/users");
    const userExists = users.data.some(
      (user: { email: string }) => user.email === data.email
    );
    if (userExists) {
      toast.error("Un compte existe déjà avec cet e-mail");
      return;
    }

    // Register user
    const response = await customFetch.post("/users", data);
    if (response.status === 201) {
      toast.success("Compte créé, bienvenue !");
      navigate("/login");
    } else {
      toast.error("Une erreur est survenue, réessaie");
    }
  };

  return (
    <div className="max-w-screen-2xl mx-auto pt-24 flex items-center justify-center">
      <form
        onSubmit={handleRegister}
        className="max-w-5xl mx-auto flex flex-col gap-5 max-sm:gap-3 items-center justify-center max-sm:px-5"
      >
        <h2 className="font-display text-exaltNavy text-5xl text-center mb-5 font-bold max-md:text-4xl max-sm:text-3xl max-[450px]:text-xl max-[450px]:font-normal">
          Bienvenue ! Crée ton compte
        </h2>
        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-col gap-1">
            <label htmlFor="name">Prénom</label>
            <input
              type="text"
              className="bg-white border border-gray-300 rounded-xl text-base h-12 px-4 w-full focus:border-exaltNavy focus:ring-exaltNavy max-[450px]:text-base"
              placeholder="Prénom"
              id="name"
              name="name"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="lastname">Nom</label>
            <input
              type="text"
              className="bg-white border border-gray-300 rounded-xl text-base h-12 px-4 w-full focus:border-exaltNavy focus:ring-exaltNavy max-[450px]:text-base"
              placeholder="Nom"
              id="lastname"
              name="lastname"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="email">E-mail</label>
            <input
              type="email"
              className="bg-white border border-gray-300 rounded-xl text-base h-12 px-4 w-full focus:border-exaltNavy focus:ring-exaltNavy max-[450px]:text-base"
              placeholder="Adresse e-mail"
              id="email"
              name="email"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              className="bg-white border border-gray-300 rounded-xl text-base h-12 px-4 w-full focus:border-exaltNavy focus:ring-exaltNavy max-[450px]:text-base"
              placeholder="Mot de passe"
              id="password"
              name="password"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="confirmPassword">Confirm password</label>
            <input
              type="password"
              className="bg-white border border-gray-300 rounded-xl text-base h-12 px-4 w-full focus:border-exaltNavy focus:ring-exaltNavy max-[450px]:text-base"
              placeholder="Confirme le mot de passe"
              id="confirmPassword"
              name="confirmPassword"
            />
          </div>
        </div>
        <Button type="submit" text="Créer mon compte" mode="primary" />
        <Link
          to="/login"
          className="text-xl max-md:text-lg max-[450px]:text-sm"
        >
          Déjà un compte ?{" "}
          <span className="text-exaltNavy">Connecte-toi</span>.
        </Link>
      </form>
    </div>
  );
};
export default Register;
