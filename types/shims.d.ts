declare module "nodemailer"
declare module "web-push"
declare module "qrcode"
declare module "jsqr"

// Allow imports from some JS-only packages used in the project without @types
declare module "*" {
  const v: any
  export default v
}
