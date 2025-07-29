import { Link } from "react-router";

export default function Forbidden() {
  const baseUrl = import.meta.env.DEV ? "doc-flow.dev" : "doc-flow.com";
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-sky-900 space-y-10">
      <h1 className="text-9xl text-white animate-bounce">403</h1>
      <div className="">
        <span className="text-slate-300 text-xl">Acesso negado</span>
        <span className="text-slate-300 text-xl">
          Voltar para{" "}
          <Link className="text-white" to="/profile">
            {baseUrl}
          </Link>
        </span>
      </div>
    </div>
  );
}
