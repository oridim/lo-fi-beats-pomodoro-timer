import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "text-input",
  imports: [FormsModule],
  templateUrl: "./text-input.html",
  styleUrl: "./text-input.css",
})
export class TextInput {
  @Output()
  readonly change = new EventEmitter<Event>();

  @Output()
  readonly input = new EventEmitter<InputEvent>();

  @Output()
  readonly valueChange = new EventEmitter<string>();

  @Input()
  autocomplete: string = "off";

  @Input()
  maxlength: number | string | null = null;

  @Input()
  minlength: number | string | null = null;

  @Input()
  placeholder: string = "";

  @Input()
  value: string = "";

  onChange(event: Event): void {
    event.stopPropagation();

    this.change.emit(event);
  }

  onInput(event: Event): void {
    event.stopPropagation();

    const inputElement = event.target as HTMLInputElement;

    this.input.emit(
      // HACK: For some reason the Angular language server types `$event` as a
      // generic `Event` rather than `InputEvent`.
      event as InputEvent,
    );

    this.valueChange.emit(inputElement.value);
  }
}
