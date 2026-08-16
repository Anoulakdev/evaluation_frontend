import { z } from "zod";

export const createUserSchema = z.object({
  username: z.string().min(1, "ກະລຸນາປ້ອນຊື່ຜູ້ໃຊ້ (Username)"),
  roleId: z.number().int().min(1, "ກະລຸນາເລືອກບົດບາດສິດທິ"),
  departmentId: z.number().optional(),
  divisionId: z.number().optional(),
  officeId: z.number().optional(),
  unitId: z.number().optional(),
  posId: z.number().optional(),
});

export const updateUserSchema = z.object({
  roleId: z.number().int().min(1).optional(),
  posId: z.number().optional(),
  departmentId: z.number().optional(),
  divisionId: z.number().optional(),
  officeId: z.number().optional(),
  unitId: z.number().optional(),
});

export const changePasswordSchema = z
  .object({
    oldpassword: z.string().min(1, "ກະລຸນາປ້ອນລະຫັດຜ່ານເກົ່າ"),
    password1: z.string().min(6, "ລະຫັດຜ່ານໃໝ່ຕ້ອງມີຢ່າງນ້ອຍ 6 ຕົວອັກສອນ"),
    password2: z.string().min(6, "ກະລຸນາຍືນຢັນລະຫັດຜ່ານໃໝ່"),
  })
  .refine((data) => data.password1 === data.password2, {
    message: "ລະຫັດຜ່ານໃໝ່ ແລະ ການຍືນຢັນລະຫັດຜ່ານບໍ່ກົງກັນ",
    path: ["password2"],
  });

export const roleSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export const userItemSchema = z.object({
  id: z.number(),
  username: z.string(),
  first_name: z.string().nullable().optional(),
  last_name: z.string().nullable().optional(),
  emp_code: z.string().nullable().optional(),
  roleId: z.number(),
  status: z.string(),
  gender: z.string().nullable().optional(),
  tel: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  empimg: z.string().nullable().optional(),
  departmentId: z.number().nullable().optional(),
  divisionId: z.number().nullable().optional(),
  officeId: z.number().nullable().optional(),
  unitId: z.number().nullable().optional(),
  posId: z.number().nullable().optional(),
  department: z.object({ id: z.number(), department_name: z.string().optional() }).nullable().optional(),
  division: z.object({ id: z.number(), division_name: z.string().optional() }).nullable().optional(),
  office: z.object({ id: z.number(), office_name: z.string().optional() }).nullable().optional(),
  unit: z.object({ id: z.number(), unit_name: z.string().optional() }).nullable().optional(),
  position: z.object({ id: z.number(), posnameId: z.string().optional(), pos_name: z.string().optional() }).nullable().optional(),
  role: z.object({ id: z.number(), name: z.string().optional() }).nullable().optional(),
  createdAt: z.string().optional(),
});

export type CreateUserData = z.infer<typeof createUserSchema>;
export type UpdateUserData = z.infer<typeof updateUserSchema>;
export type ChangePasswordData = z.infer<typeof changePasswordSchema>;
export type UserItem = z.infer<typeof userItemSchema>;
export type RoleItem = z.infer<typeof roleSchema>;

export interface DepartmentItem {
  id: number;
  department_name?: string;
  department_code?: string;
}

export interface DivisionItem {
  id: number;
  division_name?: string;
  division_code?: string;
  departmentId?: number;
}

export interface OfficeItem {
  id: number;
  office_name?: string;
  office_code?: string;
  divisionId?: number;
}

export interface UnitItem {
  id: number;
  unit_name?: string;
  unit_code?: string;
  divisionId?: number;
  officeId?: number;
}

export interface PositionItem {
  id: number;
  posnameId?: string;
  pos_name?: string;
}
