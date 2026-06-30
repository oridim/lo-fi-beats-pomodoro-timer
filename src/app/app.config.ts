import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from "@angular/core";
import { provideRouter, withComponentInputBinding } from "@angular/router";
import {
  provideNgxWebstorage,
  withLocalStorage,
  withNgxWebstorageConfig,
} from "ngx-webstorage";

import { routes } from "./app.routes";

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideNgxWebstorage(withNgxWebstorageConfig({}), withLocalStorage()),
  ],
};
