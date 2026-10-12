import toast from "react-hot-toast";

export const checkLoginFormData = (data: {
  [k: string]: FormDataEntryValue;
}) => {
    if(data?.email === "" || data?.password === "") {
        toast.error("Remplis tous les champs");
        return false;
    }
    return true;
};
