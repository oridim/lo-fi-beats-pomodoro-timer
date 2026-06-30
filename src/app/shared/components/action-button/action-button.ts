import { NgTemplateOutlet } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
  selector: "action-button",
  imports: [NgTemplateOutlet],
  templateUrl: "./action-button.html",
  styleUrl: "./action-button.css",
})
export class ActionButton {
  @Output()
  readonly click: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();

  @Input()
  disabled?: boolean;

  @Input()
  href?: string;

  @Input()
  variant?: "primary" | "red";

  onClick(event: MouseEvent): void {
    event.stopPropagation();

    this.click.emit(event);
  }
}
