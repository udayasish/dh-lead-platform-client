import { Link } from "react-router-dom";
import { Button } from "../components";
import { useAppSelector } from "../store/hooks";

function Home() {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-7 px-6 py-20 text-center">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Lead Platform</h1>
        <p className="mx-auto mt-3 max-w-md text-gray-500 dark:text-slate-400">
          Capture, assign and track sales leads through their full lifecycle.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Link to={user ? "/leads" : "/login"}>
          <Button>{user ? "Go to leads" : "Sign in"}</Button>
        </Link>
        <Link to="/capture">
          <Button variant="secondary">Public capture form</Button>
        </Link>
      </div>
    </div>
  );
}

export default Home;
