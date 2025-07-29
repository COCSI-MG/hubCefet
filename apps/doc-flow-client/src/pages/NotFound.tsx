import { Link } from "react-router";

export default function NotFound() {
  const baseUrl = import.meta.env.DEV ? "doc-flow.dev" : "doc-flow.com";
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-sky-900 space-y-10">
      <h1 className="text-9xl text-white animate-bounce">404</h1>
      <div className="">
        <span className="text-slate-300 text-xl">
          Voltar para{" "}
          <Link className="text-white" to="/events">
            {baseUrl}
          </Link>
        </span>
      </div>
    </div>
  );
}
