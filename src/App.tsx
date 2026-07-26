import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Footer, Header, Spinner } from "./components";
import { loadUser } from "./store/authSlice";
import { useAppDispatch, useAppSelector } from "./store/hooks";

function App() {
  const dispatch = useAppDispatch();
  const status = useAppSelector((state) => state.auth.status);

  useEffect(() => {
    void dispatch(loadUser());
  }, [dispatch]);

  return (
    <div className="flex min-h-screen flex-col bg-canvas transition-colors dark:bg-canvas-dark">
      <Header />
      <main className="flex flex-1 flex-col">
        {status === "loading" ? <Spinner /> : <Outlet />}
      </main>
      <Footer />
    </div>
  );
}

export default App;
