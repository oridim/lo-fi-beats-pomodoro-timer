import { Component, HostBinding, Input } from "@angular/core";

@Component({
  selector: "page-container",
  templateUrl: "./page-container.html",
  styleUrl: "./page-container.css",
})
export class PageContainer {
  @HostBinding("attr.variant")
  @Input()
  variant?: "flush" | "vertical";
}
