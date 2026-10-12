import { FaInstagram, FaLinkedinIn, FaYoutube } from "react-icons/fa6";

const SocialMediaFooter = () => {
  return (
    <div className="mx-auto max-w-screen-2xl px-5 mt-24 max-[400px]:px-3">
      <div className="bg-exaltPink rounded-3xl flex justify-between items-center py-10 px-10 gap-6 max-md:flex-col max-md:text-center max-sm:px-6">
        <div>
          <h3 className="font-display text-white text-3xl font-bold max-sm:text-2xl">
            Rejoins la communauté eXalt
          </h3>
          <p className="text-white/85 mt-1">Les nouveaux drops sont annoncés en avant-première sur nos réseaux.</p>
        </div>
        <div className="flex gap-3 text-white">
          <a href="https://www.linkedin.com/company/exalt-company/" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="w-11 h-11 rounded-full bg-white/15 hover:bg-white hover:text-exaltPink flex items-center justify-center transition-colors"><FaLinkedinIn /></a>
          <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram" className="w-11 h-11 rounded-full bg-white/15 hover:bg-white hover:text-exaltPink flex items-center justify-center transition-colors"><FaInstagram /></a>
          <a href="https://www.youtube.com/" target="_blank" rel="noreferrer" aria-label="YouTube" className="w-11 h-11 rounded-full bg-white/15 hover:bg-white hover:text-exaltPink flex items-center justify-center transition-colors"><FaYoutube /></a>
        </div>
      </div>
    </div>
  );
};
export default SocialMediaFooter;
