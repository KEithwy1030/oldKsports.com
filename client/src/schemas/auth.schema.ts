// import { z } from 'zod';

// 暂时注释掉zod相关的schema，避免依赖问题
// 提供简单的类型定义作为替代
export const loginSchema = { 
  validate: () => true,
  parse: (data: any) => data
};
export const registerSchema = { 
  validate: () => true,
  parse: (data: any) => data
};
export const forgotPasswordSchema = { 
  validate: () => true,
  parse: (data: any) => data
};
export const resetPasswordSchema = { 
  validate: () => true,
  parse: (data: any) => data
};

export type LoginFormData = { email: string; password: string };
export type RegisterFormData = { username: string; email: string; password: string; confirmPassword: string };
export type ForgotPasswordFormData = { email: string };
export type ResetPasswordFormData = { password: string; confirmPassword: string };
// export const loginSchema = z.object({
//   email: z.string().email({ message: '请输入有效的邮箱地址' }),
//   password: z.string().min(6, { message: '密码至少需要6位' }),
// });

// export const registerSchema = z.object({
//   username: z.string().min(2, { message: '用户名至少需要2位' }),
//   email: z.string().email({ message: '请输入有效的邮箱地址' }),
//   password: z.string()
//     .min(6, { message: '密码至少需要6位' })
//     .regex(/[A-Z]/, { message: '密码必须包含至少一个大写字母' })
//     .regex(/[a-z]/, { message: '密码必须包含至少一个小写字母' })
//     .regex(/\d/, { message: '密码必须包含至少一个数字' }),
//   confirmPassword: z.string(),
// }).refine((data) => data.password === data.confirmPassword, {
//   message: '两次输入的密码不一致',
//   path: ['confirmPassword'],
// });

// export const forgotPasswordSchema = z.object({
//   email: z.string().email({ message: '请输入有效的邮箱地址' }),
// });

// export const resetPasswordSchema = z.object({
//   password: z.string()
//     .min(6, { message: '密码至少需要6位' })
//     .regex(/[A-Z]/, { message: '密码必须包含至少一个大写字母' })
//     .regex(/[a-z]/, { message: '密码必须包含至少一个小写字母' })
//     .regex(/\d/, { message: '密码必须包含至少一个数字' }),
//   confirmPassword: z.string(),
// }).refine((data) => data.password === data.confirmPassword, {
//   message: '两次输入的密码不一致',
//   path: ['confirmPassword'],
// });

// export type LoginFormData = z.infer<typeof loginSchema>;
// export type RegisterFormData = z.infer<typeof registerSchema>;
// export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
// export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;