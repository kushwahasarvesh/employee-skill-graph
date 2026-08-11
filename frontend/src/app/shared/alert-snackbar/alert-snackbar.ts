import { Component, inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';

export type AlertType = 'success' | 'update' | 'delete' | 'error' | 'warning';

export interface AlertData {
  message: string;
  type: AlertType;
}

@Component({
  selector: 'app-alert-snackbar',
  standalone: true,
  imports: [MatIcon, MatIconButton],
  templateUrl: './alert-snackbar.html',
  styleUrl: './alert-snackbar.scss'
})
export class AlertSnackbarComponent {
  data = inject<AlertData>(MAT_SNACK_BAR_DATA);
  private snackBarRef = inject(MatSnackBarRef<AlertSnackbarComponent>);

  readonly icons: Record<AlertType, string> = {
    success: 'check_circle',
    update: 'sync',
    delete: 'delete',
    error: 'error',
    warning: 'warning'
  };

  dismiss(): void {
    this.snackBarRef.dismiss();
  }
}
