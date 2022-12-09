export const isDevOrTestEnv = (): boolean => ["development", "test"].includes(process.env.NODE_ENV as string);
