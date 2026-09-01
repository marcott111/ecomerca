import bcrypt from "bcryptjs";

const OTP_SALT_ROUNDS = 10;

export function generarCodigo(longitud = 6): string {
  let codigo = "";
  for (let i = 0; i < longitud; i++) {
    codigo += Math.floor(Math.random() * 10).toString();
  }
  return codigo;
}

export async function hashCodigo(codigo: string): Promise<string> {
  return bcrypt.hash(codigo, OTP_SALT_ROUNDS);
}

export async function verificarCodigo(hash: string, codigo: string): Promise<boolean> {
  return bcrypt.compare(codigo, hash);
}
