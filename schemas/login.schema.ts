import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "ກະລຸນາປ້ອນຊື່ຜູ້ໃຊ້ (Username)"),
  password: z.string().min(1, "ກະລຸນາປ້ອນລະຫັດຜ່ານ (Password)"),
});

export type LoginSchemaInput = z.infer<typeof loginSchema>;
