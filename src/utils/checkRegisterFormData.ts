import toast from "react-hot-toast";

export const checkRegisterFormData = (data: {
  [k: string]: FormDataEntryValue;
}): boolean => {
  if (data?.name === "") {
    toast.error("Indique ton prénom");
    return false;
  } else if (data?.lastname === "") {
    toast.error("Indique ton nom");
    return false;
  } else if (data?.email === "") {
    toast.error("Indique ton e-mail");
    return false;
  } else if (data?.password === "") {
    toast.error("Indique un mot de passe");
    return false;
  } else if (data?.password !== data?.confirmPassword) {
    toast.error("Les mots de passe ne correspondent pas");
    return false;
  }
  return true;
};
