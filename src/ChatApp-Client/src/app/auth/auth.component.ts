import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from './auth.service';
import { NgForm } from '@angular/forms';
import { ChatService } from '../chat.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit,OnDestroy {
  /**
   *
   */
  constructor( public authService: AuthService,public _chat: ChatService) {


  }
  ngOnInit(): void {
    this.authService.loginSuccess();
    this.authService.loginFaild();
  }
  ngOnDestroy(): void {
    this._chat.hubConnection.off("LoginSuccess");
    this._chat.hubConnection.off("loginfaild");
  }

  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }

    this.authService.loginAsync(form.value.userName, form.value.password);
    form.reset();
  }



}
