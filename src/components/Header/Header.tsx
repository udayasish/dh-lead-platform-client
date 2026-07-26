import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logout } from "../../store/authSlice";
import { isAdmin } from "../../utils/permissions";
import Button from "../Button";
import ThemeToggle from "../ThemeToggle";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm transition ${
    isActive
      ? "font-semibold text-primary-600 dark:text-primary-400"
      : "text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-100"
  }`;

function Header() {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logout());
    navigate("/login", { replace: true });
  };

  return (
    <header className="w-full border-b border-hairline bg-white transition-colors dark:border-hairline-dark dark:bg-surface-dark">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-3.5">
        <div className="flex items-center gap-7">
          <Link
            to="/"
            className="font-display text-base font-bold text-gray-900 dark:text-slate-100"
          >
            Lead Platform
          </Link>
          {user && (
            <nav className="flex items-center gap-5">
              <NavLink to="/leads" className={navLinkClass}>
                Leads
              </NavLink>
              {isAdmin(user) && (
                <NavLink to="/team" className={navLinkClass}>
                  Team
                </NavLink>
              )}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <span className="hidden items-center gap-2 text-sm text-gray-600 sm:flex dark:text-slate-400">
              {user.name}
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-600 dark:bg-slate-800 dark:text-slate-300">
                {user.role}
              </span>
            </span>
          )}
          <ThemeToggle />
          {user ? (
            <Button variant="secondary" onClick={handleLogout}>
              Log out
            </Button>
          ) : (
            <Link to="/login">
              <Button>Log in</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
