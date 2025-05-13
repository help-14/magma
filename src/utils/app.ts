export const IsDev = (): boolean => {
  return process.env.NODE_ENV != "production"
}
