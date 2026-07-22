import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import LeagueBar from "./LeagueBar";

export default function PublicLayout() {
  return (
    <>
      <Navbar />
      <LeagueBar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
