export const isDevOrTetEnv = (): boolean => ["development", "test"].includes(process.env.NODE_ENV as string);
