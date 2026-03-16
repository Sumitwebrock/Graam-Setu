import { Outlet } from "react-router";
import Header from "./Header";

export default function Root() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
