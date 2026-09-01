import FlujoRegistro from "@/components/flujo-registro";

export const metadata = {
  title: "Crear cuenta | ECOMERCA",
};

export default function RegistroPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-10">
      <FlujoRegistro />
    </div>
  );
}
