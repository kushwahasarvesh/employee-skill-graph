import { Component, ElementRef, HostListener, forwardRef, inject, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface AppSelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-select',
  standalone: true,
  templateUrl: './app-select.html',
  styleUrl: './app-select.scss',
  host: {
    '[class.is-open]': 'open()'
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AppSelectComponent),
      multi: true
    }
  ]
})
export class AppSelectComponent implements ControlValueAccessor {
  private readonly host = inject(ElementRef<HTMLElement>);

  readonly options = input<AppSelectOption[]>([]);
  readonly placeholder = input('Select');

  readonly open = signal(false);
  readonly value = signal('');

  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  selectedLabel(): string {
    const current = this.value();
    return this.options().find((option) => option.value === current)?.label ?? '';
  }

  toggle(): void {
    this.open.update((isOpen) => !isOpen);
    this.onTouched();
  }

  choose(option: AppSelectOption | null): void {
    const next = option?.value ?? '';
    this.value.set(next);
    this.onChange(next);
    this.open.set(false);
    this.onTouched();
  }

  writeValue(value: string | null): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.open.set(false);
    }
  }
}
