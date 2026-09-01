import LoginAdmin from "@/components/login-admin";

export const metadata = {
  title: "Iniciar sesión | ECOMERCA",
};

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-10">
      <LoginAdmin />
    </div>
  );
}
