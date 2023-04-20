import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ChatService, User } from '../chat.service';
import { HubConnectionState } from '@microsoft/signalr';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public isAuthenticated: boolean = false;
  constructor( public router: Router,
              public _chat:ChatService) {
    const tempPersonId = localStorage.getItem("personId");
    if (tempPersonId) {
      if(this._chat.hubConnection?.state === HubConnectionState.Connected) {
        this.reLoginListener();
        this.reLoginAsync(tempPersonId);
      }else {
        this._chat.ssObs().subscribe((obj)=> {
          if (obj.type == "HubConnStarted") {
            this.reLoginListener();
            this.reLoginAsync(tempPersonId);
          }
        })
      }
    }

  }

  async loginAsync(username: string,password: string) {
    const user = {userName: username,password: password};
    this._chat.hubConnection.invoke("LoginAsync",user).catch(err=>console.error(err));


  }
  async reLoginAsync(personId: string) {
    await this._chat.hubConnection.invoke("Relogin", personId)
    // .then(() => this.signalrService.toastr.info("Loging in attempt..."))
    .catch(err => console.error(err));
  }

  loginSuccess(): void {
    this._chat.hubConnection.on("LoginSuccess",(user: User)=> {
      console.log(user);
      this._chat.userData = {...user};
      localStorage.setItem("personId", user.id);
      this.isAuthenticated = true;
      this._chat.toastr.success("Login successful!");
      this._chat.router.navigateByUrl("/home");
    });
  }
  reLoginListener(): void {
    this._chat.hubConnection.on("ReLoginResponse",(user: User)=> {
      console.log(user);
      this._chat.userData = {...user};

      this.isAuthenticated = true;

      this._chat.router.navigateByUrl("/home");
    });
  }

  loginFaild() {
    this._chat.hubConnection.on("loginfaild", () => {
        this._chat.toastr.error("Wrong credentials!");
    });
  }
}
