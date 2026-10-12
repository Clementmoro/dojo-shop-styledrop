import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { KonamiEgg, ScrollToTop } from "../components";

const HomeLayout = () => {
  return (
    <>
      <ScrollToTop />
      <KonamiEgg />
      <Header />
      <Outlet />
      <Footer />
    </>
  );
};
export default HomeLayout;
