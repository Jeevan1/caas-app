import type common from "./messages/en/common.json";
// import type about from "./messages";

declare module "next-intl" {
  interface AppConfig {
    Locale: "en" | "np";
    Messages: {
      common: typeof common;
      // add more namespaces here as you create them
    };
  }
}
