import { Component, HostBinding, Input } from "@angular/core";

@Component({
  selector: "control-group",
  templateUrl: "./control-group.html",
  styleUrl: "./control-group.css",
})
export class ControlGroup {
  @HostBinding("attr.variant")
  @Input()
  variant?: "horizontal";
}
