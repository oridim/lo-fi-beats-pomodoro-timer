import { NgTemplateOutlet } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
  selector: "text-button",
  imports: [NgTemplateOutlet],
  templateUrl: "./text-button.html",
  styleUrl: "./text-button.css",
})
export class TextButton {
  @Output()
  readonly click: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();

  @Input()
  disabled?: boolean;

  @Input()
  href?: string;

  @Input()
  variant?: "red";

  onClick(event: MouseEvent): void {
    event.stopPropagation();

    this.click.emit(event);
  }
}
