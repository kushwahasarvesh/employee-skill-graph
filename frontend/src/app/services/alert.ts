import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Observable, map } from 'rxjs';
import { AlertSnackbarComponent, AlertType } from '../shared/alert-snackbar/alert-snackbar';
import { ConfirmDialogComponent, ConfirmDialogData } from '../shared/confirm-dialog/confirm-dialog';

@Injectable({ providedIn: 'root' })
export class AlertService {
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  success(message: string): void {
    this.show(message, 'success');
  }

  update(message: string): void {
    this.show(message, 'update');
  }

  deleted(message: string): void {
    this.show(message, 'delete');
  }

  error(message: string): void {
    this.show(message, 'error');
  }

  warning(message: string): void {
    this.show(message, 'warning');
  }

  confirmDelete(title: string, message = 'Do you want to delete this record?'): Observable<boolean> {
    return this.dialog.open(ConfirmDialogComponent, {
      width: '380px',
      data: {
        title,
        message,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      } as ConfirmDialogData
    }).afterClosed().pipe(map((result) => !!result));
  }

  private show(message: string, type: AlertType): void {
    this.snackBar.openFromComponent(AlertSnackbarComponent, {
      data: { message, type },
      duration: 3500,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['app-alert-panel', `app-alert-panel--${type}`]
    });
  }
}
