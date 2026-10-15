import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { KonamiEgg, ScrollToTop } from "../components";
import MysteryCheckout from "../components/MysteryCheckout";

const HomeLayout = () => {
  return (
    <>
      <ScrollToTop />
      <KonamiEgg />
      <MysteryCheckout />
      <Header />
      <Outlet />
      <Footer />
    </>
  );
};
export default HomeLayout;
