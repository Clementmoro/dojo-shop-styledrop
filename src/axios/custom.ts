import axios from "axios";
import { applyMacPricing } from "../utils/macPricing";

const customFetch = axios.create({
    baseURL: "/api",
    headers: {
        Accept: "application/json"
    }
})

// Tarif Mac (gag) : double le prix des produits reçus
customFetch.interceptors.response.use((response) => {
    if (/^\/?products/.test(response.config.url || "")) response.data = applyMacPricing(response.data);
    return response;
});

export default customFetch;